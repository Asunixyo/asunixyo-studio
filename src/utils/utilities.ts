type Breakpoints = {
  "3xs"?: number;
  "2xs"?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
  "3xl"?: number;
};

interface FetchPostsByCategoryParams {
  categoryId?: number | null;
  categoryName?: string | null;
}

class ResponsiveValue {
  baseValue: number;
  scales: Breakpoints;

  constructor(baseValue: number, scales: Breakpoints) {
    this.baseValue = baseValue;
    this.scales = scales;
  }

  getResponsiveValue(): number {
    const width = window.innerWidth;

    if (width < 360) {
      // 3xs
      return (
        this.baseValue *
        (this.scales["3xs"] !== undefined ? this.scales["3xs"] : 1)
      );
    } else if (width < 480) {
      // 2xs
      return (
        this.baseValue *
        (this.scales["2xs"] !== undefined ? this.scales["2xs"] : 1)
      );
    } else if (width < 640) {
      // xs
      return (
        this.baseValue * (this.scales.xs !== undefined ? this.scales.xs : 1)
      );
    } else if (width < 768) {
      // sm
      return (
        this.baseValue * (this.scales.sm !== undefined ? this.scales.sm : 1)
      );
    } else if (width < 1024) {
      // md
      return (
        this.baseValue * (this.scales.md !== undefined ? this.scales.md : 1)
      );
    } else if (width < 1280) {
      // lg
      return (
        this.baseValue * (this.scales.lg !== undefined ? this.scales.lg : 1)
      );
    } else if (width < 1536) {
      // xl
      return (
        this.baseValue * (this.scales.xl !== undefined ? this.scales.xl : 1)
      );
    } else if (width < 1920) {
      // 2xl
      return (
        this.baseValue *
        (this.scales["2xl"] !== undefined ? this.scales["2xl"] : 1)
      );
    } else {
      // 3xl
      return (
        this.baseValue *
        (this.scales["3xl"] !== undefined ? this.scales["3xl"] : 1)
      );
    }
  }

  setDimensions(className: string, isRadius: boolean): void {
    const responsiveValueInstance = new ResponsiveValue(
      this.baseValue,
      this.scales
    );
    let responsiveValueNumeric = responsiveValueInstance.getResponsiveValue();
    if (isRadius) {
      responsiveValueNumeric *= 2;
    }
    const responsiveValue = responsiveValueNumeric.toString() + "px";
    const element = document.querySelector(`.${className}`);

    if (element && element instanceof HTMLElement) {
      element.style.width = responsiveValue;
      element.style.height = responsiveValue;
    }
  }
}

class WordPressApi {
  wpApiUrl: string;
  postType: string;
  taxonomyCategory: string;
  slug: string;
  res: Promise<any> = Promise.resolve(null);

  constructor(
    wpApiUrl: string,
    postType: string = "",
    taxonomyCategory: string = "",
    slug: string = ""
  ) {
    this.wpApiUrl = wpApiUrl;
    this.postType = postType;
    this.taxonomyCategory = taxonomyCategory;
    this.slug = slug;
  }
  async init() {
    this.res = await this.getRes();
  }

  async getRes(retryCount = 0): Promise<any> {
    try {
      let url = this.wpApiUrl;
      if (this.postType) {
        url += this.postType + "/";
      }
      if (this.slug) {
        url += `?slug=${this.slug}`;
      } else {
        url += "?per_page=100";
      }
      const response = await fetch(url);
      if (!response.ok) {
        console.log(url);
        console.log(response.status);
        if (retryCount < 3) {
          console.log(`Retrying... (${retryCount + 1})`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return this.getRes(retryCount + 1);
        } else {
          throw new Error("Network response was not ok");
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }
  async fetchFeaturedImage(post: any) {
    try {
      if (post._links && post._links["wp:featuredmedia"]) {
        const mediaUrl = post._links["wp:featuredmedia"][0].href;
        const mediaRes = await fetch(mediaUrl);
        if (!mediaRes.ok) {
          console.error(`Error fetching media: ${mediaRes.status}`);
          return "default-image-url1";
        }
        const mediaData = await mediaRes.json();
        return mediaData.source_url || "default-image-url1";
      }
    } catch (error) {
      console.error("Error fetching featured image:", error);
    }
    return "default-image-url2";
  }

  async fetchCategory(post: any) {
    try {
      if (post._links && post._links["wp:term"]) {
        const categoriesLinks = post._links["wp:term"].filter(
          (link: any) => link.taxonomy === this.taxonomyCategory
        );
        const categoriesPromises = categoriesLinks.map(async (link: any) => {
          const categoryRes = await fetch(link.href);
          const categoryData = await categoryRes.json();
          return categoryData[0];
        });
        const categories = await Promise.all(categoriesPromises);
        return categories[0];
      }
    } catch (error) {
      console.error("Error fetching categories from links:", error);
    }
    return [];
  }

  static getCategory(categories, categoryId, returnType = "category") {
    if (!Array.isArray(categories)) {
      console.error("Invalid categories array");
      return null;
    }
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      return null;
    }
    switch (returnType) {
      case "name":
        return category.name;
      case "slug":
        return category.slug;
      case "color":
        return category.categoryColor;
      default:
        return category;
    }
  }

  async fetchCategoryColor(
    categoryId?: number,
    categoryName?: string
  ): Promise<string | null> {
    try {
      let url;
      if (categoryId) {
        url = `${this.wpApiUrl}${this.taxonomyCategory}/${categoryId}`;
      } else if (categoryName) {
        url = `${this.wpApiUrl}${this.postType}?${this.taxonomyCategory}=${categoryName}`;
      } else {
        throw new Error("No category identifier provided");
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const category = Array.isArray(data) ? data[0] : data;
      return category.category_color ? category.category_color : null;
    } catch (error) {
      console.error("Error fetching category color:", error);
      return null;
    }
  }

  async fetchCategoryId(categoryName: string) {
    try {
      const response = await fetch(
        `${this.wpApiUrl}${this.taxonomyCategory}?per_page=100`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const categories = await response.json();
      const category = categories.find(
        (cat: any) => cat.slug.toLowerCase() === categoryName.toLowerCase()
      );
      return category ? category.id : null;
    } catch (error) {
      console.error("Error fetching category ID by name:", error);
      return null;
    }
  }

  async fetchCategories() {
    try {
      const response = await fetch(
        `${this.wpApiUrl}${this.taxonomyCategory}?per_page=100`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const categories = await response.json();
      if (Array.isArray(categories)) {
        categories.sort((a, b) => b.count - a.count);
        return categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category.count,
          categoryColor: category.category_color,
        }));
      } else {
        throw new Error("Response is not an array");
      }
    } catch (error) {
      console.error("Error fetching categories list:", error);
      return [];
    }
  }

  async fetchPosts() {
    try {
      const posts = await this.res;
      return await Promise.all(
        posts.map(async (post: any) => {
          return { ...post };
        })
      );
    } catch (error) {
      console.error("Error in fetchPosts:", error);
      return [];
    }
  }

  async fetchPostsByCategory({
    categoryId,
    categoryName,
  }: FetchPostsByCategoryParams) {
    try {
      let categoryColor: string | null = null;
      let url;
      if ((!categoryId || categoryId == null) && categoryName) {
        categoryId = await this.fetchCategoryId(categoryName);
      }
      if (categoryId) {
        url = `${this.wpApiUrl}${this.postType}?${this.taxonomyCategory}=${categoryId}`;
      } else {
        throw new Error("No valid category identifier provided");
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const posts = await response.json();
      const CategoryPosts = await Promise.all(
        posts.map(async (post: any) => {
          return { ...post };
        })
      );
      return CategoryPosts;
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      return [];
    }
  }
}

class ColorUtils {
  static hexToRgb(hex: string): [number, number, number] {
    if (hex.startsWith("#")) {
      hex = hex.substring(1);
    }

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  }

  static hexToRgba(hex: string, opacity: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}

class MathUtils {
  static calculateTranslation(
    angleDeg: number,
    distance: number
  ): { x: number; y: number } {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = distance * Math.cos(angleRad);
    const y = -distance * Math.sin(angleRad);
    return { x, y };
  }
}

class FormatData {
  static formatDateWithDelimiter(
    targetDate: string,
    delimiter: string
  ): string {
    const date = new Date(targetDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}${delimiter}${month}${delimiter}${day}`;
  }

  static formatDateToDayMonth(targetDate: string): string {
    const date = new Date(targetDate);
    const day = date.getDate().toString();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }
}

class FormatText {
  static toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b(\w)/g, (char) => char.toUpperCase());
  }

  static removeHtmlTags(str: string): string {
    return str.replace(/<[^>]*>/g, "");
  }
}

export type { Breakpoints };
export {
  WordPressApi,
  ResponsiveValue,
  ColorUtils,
  MathUtils,
  FormatData,
  FormatText,
};
