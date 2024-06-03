import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const deviceWidth = 430;
const deviceHeight = 808;

const remBase = 16;

const vhInPixels = deviceHeight * 0.01;
const vwInPixels = deviceWidth * 0.01;

const vhInRem = vhInPixels / remBase;
const vwInRem = vwInPixels / remBase;

function formatNumber(num) {
  return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, "");
}

function generateClampStyle(min, max, step, unit, remFactor) {
  const clampStyle = {};
  for (let i = min; i <= max; i = Math.round((i + step) * 100) / 100) {
    const formattedKey = formatNumber(i);
    const key = `clamp-${formattedKey}${unit}`;
    const value = `clamp(0rem, ${i.toFixed(2).replace(/\.?0+$/, "")}${unit}, ${(
      i * remFactor
    )
      .toFixed(3)
      .replace(/\.?0+$/, "")}rem)`;
    clampStyle[key] = value;
  }
  return clampStyle;
}

function generateSingleMediaQuery(vw, vwInRem, vhInRem) {
  let mediaQueries = "";
  const properties = {
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    text: "font-size",
    w: "width",
    mt: "margin-top",
    ml: "margin-left",
    leading: "line-height",
    tracking: "letter-spacing",
  };

  const vwFormatted = formatNumber(vw);
  const remValueVW = (vw * vwInRem).toFixed(3);
  const correspondingVH = (remValueVW / vhInRem).toFixed(1);

  Object.entries(properties).forEach(([propClass, propCSS]) => {
    const className = `${propClass}-clamp-${vwFormatted.replace(
      ".",
      "\\."
    )}vw-${correspondingVH.replace(".", "\\.")}vh`;
    const mediaQuery = `
@media (min-width: ${vwFormatted}vw) and (min-height: ${correspondingVH}vh) {
  .${className} {
    ${propCSS}: clamp(0rem, ${correspondingVH}vh, ${remValueVW}rem);
  }
  .-${className} {
    ${propCSS}: calc(clamp(0rem, ${correspondingVH}vh, ${remValueVW}rem) * -1);
  }
}
@media (max-width: ${vwFormatted}vw) and (max-height: ${correspondingVH}vh) {
  .${className} {
    ${propCSS}: clamp(0rem, ${vwFormatted}vw, ${remValueVW}rem);
  }
  .-${className} {
    ${propCSS}: calc(clamp(0rem, ${vwFormatted}vw, ${remValueVW}rem) * -1);
  }
}`;
    mediaQueries += mediaQuery;
  });

  return mediaQueries;
}

function generateMediaQueriesForValues(values, vwInRem, vhInRem) {
  let mediaQueries = "";
  values.forEach((vw) => {
    mediaQueries += generateSingleMediaQuery(vw, vwInRem, vhInRem);
  });
  return mediaQueries;
}

const values = [
  2, 4, 6, 7, 8, 9, 12, 17, 20, 21, 22, 23, 26, 28, 30, 31, 33, 42, 51, 56, 60,
  62, 69, 80,
];
const vhSpacing = generateClampStyle(0, 200, 0.1, "vh", vhInRem);
const vwSpacing1 = generateClampStyle(2.92, 2.92, 0.1, "vw", vwInRem);
const vwSpacing2 = generateClampStyle(0, 200, 0.1, "vw", vwInRem);
const vwSpacing3 = generateClampStyle(3.33, 3.33, 0.1, "vw", vwInRem);

const spacing = { ...vhSpacing, ...vwSpacing1, ...vwSpacing2, ...vwSpacing3 };

const tailwindConfig = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      spacing: spacing,
      fontSize: spacing,
      letterSpacing: spacing,
      margin: spacing,
      padding: spacing,
      gap: spacing,
      width: spacing,
      height: spacing,
      borderWidth: spacing,
      lineHeight: spacing,
      borderRadius: spacing,
      fontFamily: {
        "gothic-mb101-l": ['"Gothic MB101 L"', "sans-serif"],
        "gothic-mb101-r": ['"Gothic MB101 R"', "sans-serif"],
        "gothic-mb101-m": ['"Gothic MB101 M"', "sans-serif"],
        "gothic-mb101-db": ['"Gothic MB101 DB"', "sans-serif"],
        "gothic-mb101-b": ['"Gothic MB101 B"', "sans-serif"],
        "gothic-mb101-h": ['"Gothic MB101 H"', "sans-serif"],
        "gothic-mb101-u": ['"Gothic MB101 U"', "sans-serif"],
        notoSerifJP: ['"Noto Serif JP"', "serif"],
        NotoSansJPBlack: ['"NotoSansJP Black"'],
        NotoSansJPBold: ['"NotoSansJP Bold"'],
        NotoSansJPExtraBold: ['"NotoSansJP ExtraBold"'],
        NotoSansJPExtraLight: ['"NotoSansJPExtraLight"'],
        NotoSansJPLight: ['"NotoSansJP Light"'],
        NotoSansJPMedium: ['"NotoSansJP Medium"'],
        NotoSansJPRegular: ['"NotoSansJP Regular"'],
        NotoSansJPSemiBold: ['"NotoSansJP SemiBold"'],
        NotoSansJPThin: ['"NotoSansJP Thin"'],
        "07lightnovelpop": ['"07LightNovelPOP"'],
        AbhayaLibreBold: ['"AbhayaLibre Bold"'],
        AbhayaLibreExtraBold: ['"AbhayaLibre ExtraBold"'],
        AbhayaLibreMedium: ['"AbhayaLibre Medium"'],
        AbhayaLibreRegular: ['"AbhayaLibre Regular"'],
        AbhayaLibreSemiBold: ['"AbhayaLibre SemiBold"'],
        CorporateLogoMedium: ['"Corporate Logo Medium ver3"'],
        KumarOneRegular: ['"KumarOne Regular"'],
      },
      backgroundImage: {
        "dashed-line":
          "repeating-linear-gradient(to right,black,black clamp(0rem, 6vw, 1.612rem),transparent clamp(0rem, 6vw, 1.612rem),transparent clamp(0rem, 10vw, 2.688rem))",
      },
      animation: {
        "slide-in-tl":
          "slide-in-tl 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
      },
      keyframes: {
        "slide-in-tl": {
          "0%": {
            transform: "translateY(1000px) translateX(1000px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0) translateX(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

const configString = `/** @type {import('tailwindcss').Config} */\n\nexport default ${JSON.stringify(
  tailwindConfig,
  null,
  2
)};`;

writeFileSync(join(__dirname, "tailwind.config.mjs"), configString, "utf8");

console.log("tailwind.config.mjs has been generated!");

const mediaQueriesForValues = generateMediaQueriesForValues(
  values,
  vwInRem,
  vhInRem
);
const combinedMediaQueries = mediaQueriesForValues;

writeFileSync(
  join(__dirname, "/src/styles/clamps.css"),
  combinedMediaQueries,
  "utf8"
);

console.log("clamps.css has been generated!");
