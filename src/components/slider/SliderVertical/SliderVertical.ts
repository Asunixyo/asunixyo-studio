class SliderVertical {
  private slider: HTMLElement;
  private slideWidth: number;
  private sliderTrack: HTMLElement;
  private lastDirection: number | null = null;
  private autoSlideInterval?: number;
  private autoSlideDuration: number;
  private indicators: NodeListOf<HTMLElement>;
  private currentIndex: number = 0;
  private slideNumberElement: HTMLElement;
  private barAddColorClass: string;

  constructor(
    sliderSelector: string,
    private slideSelector: string = ".slide",
    private trackSelector: string = ".slider-track",
    autoSlideDuration: number = 3000,
    indicatorSelector: string = ".slider-position > div",
    barAddColorClass: string
  ) {
    this.slider = document.querySelector(sliderSelector) as HTMLElement;
    this.slideWidth = (
      this.slider.querySelector(this.slideSelector) as HTMLElement
    ).offsetWidth;
    this.sliderTrack = this.slider.querySelector(
      this.trackSelector
    ) as HTMLElement;
    this.slider.addEventListener("mouseover", () => this.stopAutoSlide());
    this.slider.addEventListener("mouseleave", () => this.startAutoSlide());
    this.autoSlideDuration = autoSlideDuration;
    this.indicators = document.querySelectorAll(indicatorSelector);
    this.updateIndicators(0);
    this.slideNumberElement = document.querySelector(
      ".slide-target-number"
    ) as HTMLElement;
    this.barAddColorClass = barAddColorClass;
  }

  /**
   * Determine the new scroll direction based on the last known direction.
   * @param direction - The current direction.
   * @returns The new direction.
   */
  private setNewDirection(direction: number): number {
    return this.lastDirection === null ? 1 : -this.lastDirection;
  }

  /**
   * Update the current slide index based on the given direction.
   * @param direction - The scroll direction (1 for next, -1 for previous).
   */
  private updateCurrentIndex(direction: number): void {
    if (direction === 1) {
      this.currentIndex = (this.currentIndex + 1) % this.indicators.length;
    } else if (direction === -1) {
      this.currentIndex =
        (this.currentIndex - 1 + this.indicators.length) %
        this.indicators.length;
    }
  }

  /**
   * Move the slide based on the provided direction.
   * @param direction - The scroll direction (1 for next, -1 for previous).
   */
  private moveSlide(direction: number): void {
    if (direction === 1) {
      const firstSlide: HTMLElement = this.sliderTrack.querySelector(
        ".slide"
      ) as HTMLElement;
      this.sliderTrack.appendChild(firstSlide);
      this.slider.scrollLeft -= this.slideWidth;
    } else if (direction === -1) {
      const slides: NodeListOf<HTMLElement> =
        this.sliderTrack.querySelectorAll(".slide");
      const lastSlide: HTMLElement = slides[slides.length - 1];
      this.sliderTrack.insertBefore(lastSlide, slides[0]);
    }
  }

  /**
   * Perform a smooth scroll to the next or previous slide.
   * @param direction - The scroll direction.
   * @param moveAmount - The distance to scroll.
   */
  private smoothScroll(direction: number, moveAmount: number): void {
    this.slider.scrollTo({
      left: this.slider.scrollLeft + direction * moveAmount,
      behavior: "smooth",
    });
  }

  /**
   * Update the visual indicators to reflect the active slide.
   * @param activeIndex - The index of the active slide.
   */
  private updateIndicators(activeIndex: number): void {
    this.indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.remove("bg-slate-400");
        indicator.classList.add(this.barAddColorClass);
      } else {
        indicator.classList.remove(this.barAddColorClass);
        indicator.classList.add("bg-slate-400");
      }
    });
  }

  /**
   * Update the slide number displayed to the user.
   */
  private updateNumber(): void {
    this.slideNumberElement.textContent = String(this.currentIndex + 1);
  }

  /**
   * Handle the scroll operation, moving to the next or previous slide.
   * @param direction - The scroll direction (1 for next, -1 for previous).
   * @param moveAmount - The distance to scroll (default is slide width).
   */
  public scroll(direction: number, moveAmount: number = this.slideWidth): void {
    if (
      this.lastDirection === null ||
      (this.lastDirection === 1 && direction === -1) ||
      (this.lastDirection === -1 && direction === 1)
    ) {
      direction = this.setNewDirection(direction);
    } else {
      this.moveSlide(direction);
    }
    this.smoothScroll(direction, moveAmount);
    this.updateCurrentIndex(direction);
    this.updateIndicators(this.currentIndex);
    this.updateNumber();
    this.lastDirection = direction;
  }

  /**
   * Attach controls (previous and next buttons) to the slider.
   * @param prevSelector - CSS selector for the previous button.
   * @param nextSelector - CSS selector for the next button.
   */
  public attachControls(prevSelector: string, nextSelector: string): void {
    document
      .querySelector(prevSelector)!
      .addEventListener("click", () => this.scroll(-1));
    document
      .querySelector(nextSelector)!
      .addEventListener("click", () => this.scroll(1));
  }

  /**
   * Start the automatic slide transition.
   */
  public startAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.autoSlideInterval = window.setInterval(() => {
      this.scroll(1);
    }, this.autoSlideDuration);
  }

  /**
   * Stop the automatic slide transition.
   */
  public stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = undefined;
    }
  }
}

export default SliderVertical;
