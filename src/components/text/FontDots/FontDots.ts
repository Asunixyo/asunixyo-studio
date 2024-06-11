import { ResponsiveValue } from "@utils/utilities.ts";
import type { Breakpoints } from "@utils/utilities.ts";

/**
 * FontDots class is responsible for rendering text on a canvas and animating dots around the text.
 * It provides functionalities to initialize the canvas, set up event listeners, create dots, and animate them.
 */
class FontDots {
  private ctx: CanvasRenderingContext2D;
  private state: { mouseX: number | null; mouseY: number | null };
  private dots: Dot[] = [];

  // Properties related to text and canvas appearance
  private fontSize: number;
  private fontFamily: string;
  private text: string;
  private gradientType: string;
  private gradientStartColor: string;
  private gradientEndColor: string;
  private paddingRight: number;
  private paddingLeft: number;
  private paddingY: number;
  private textAlign: CanvasTextAlign;
  private textBaseline: CanvasTextBaseline;
  private fullScreen: boolean;

  // Responsive design breakpoints
  private breakpointsFont: Breakpoints;
  private breakpointsPaddingX: Breakpoints;

  // Properties related to dot animation and behavior
  private spacing: number;
  private moveDirection: string;
  private moveSpeed: number;
  private minRadius: number;
  private maxRadius: number;
  private hoverDistance: number;
  private hoverOffset: number;
  private vibrationDirection: number;
  private lerpSpeed: number;
  private animationDelay: number;

  /**
   * Constructor for the FontDots class.
   * @param canvas - The canvas element where the text and dots will be rendered.
   * @param fontSize - Size of the text font.
   * @param fontFamily - Family of the text font.
   * @param text - The text to be displayed.
   * @param gradientType - The type of gradient for text color.
   * @param gradientStartColor - The starting color of the gradient.
   * @param gradientEndColor - The ending color of the gradient.
   * @param paddingRight - Horizontal padding.
   * @param paddingLeft - Horizontal padding.
   * @param paddingY - Vertical padding.
   * @param textAlign - Horizontal alignment of the text.
   * @param textBaseline - Vertical alignment of the text.
   * @param fullScreen - Whether the canvas should be displayed in full screen.
   * @param breakpointsFont - The breakpoints for responsive design.
   * @param breakpointsPaddingX - The breakpoints for responsive design.
   * @param spacing - Spacing between the dots.
   * @param moveDirection - Initial direction of the dots.
   * @param moveSpeed - Speed at which the dots move towards their target position.
   * @param minRadius - Minimum radius of the dots.
   * @param maxRadius - Maximum radius of the dots.
   * @param hoverDistance - Distance for dots to respond to mouse hover.
   * @param hoverOffset - Offset of the dots during hover.
   * @param vibrationDirection - Direction of dot vibration.
   * @param lerpSpeed - Linear interpolation speed for dot movement.
   * @param animationDelay - Delay before starting the dot animation.
   */
  constructor(
    private canvas: HTMLCanvasElement,
    fontSize: number,
    fontFamily: string,
    text: string,
    gradientType: string,
    gradientStartColor: string,
    gradientEndColor: string,
    paddingRight: number = 0,
    paddingLeft: number = 0,
    paddingY: number = 0,
    textAlign: CanvasTextAlign,
    textBaseline: CanvasTextBaseline,
    fullScreen: boolean = false,
    breakpointsFont: Breakpoints,
    breakpointsPaddingX: Breakpoints,
    spacing: number,
    moveDirection: string,
    moveSpeed: number,
    minRadius: number,
    maxRadius: number,
    hoverDistance: number,
    hoverOffset: number,
    vibrationDirection: number,
    lerpSpeed: number,
    animationDelay: number
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.state = { mouseX: null, mouseY: null };
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.text = text;
    this.gradientType = gradientType;
    this.gradientStartColor = gradientStartColor;
    this.gradientEndColor = gradientEndColor;
    this.paddingRight = paddingRight;
    this.paddingLeft = paddingLeft;
    this.paddingY = paddingY;
    this.textAlign = textAlign;
    this.textBaseline = textBaseline;
    this.fullScreen = fullScreen;
    this.breakpointsFont = breakpointsFont;
    this.breakpointsPaddingX = breakpointsPaddingX;
    this.spacing = spacing;
    this.moveDirection = moveDirection;
    this.moveSpeed = moveSpeed;
    this.minRadius = minRadius;
    this.maxRadius = maxRadius;
    this.hoverDistance = hoverDistance;
    this.hoverOffset = hoverOffset;
    this.vibrationDirection = vibrationDirection;
    this.lerpSpeed = lerpSpeed;
    this.animationDelay = animationDelay;
  }
  /**
   * Initialize the ThreeCircles.
   * Sets up event listeners to activate movement.
   */
  public launchSetup(): void {
    this.setupCanvasAndDots(this.animationDelay);

    window.onload = () => {
      this.setupCanvasAndDots(this.animationDelay);
    };

    window.addEventListener("resize", () => {
      this.setupCanvasAndDots();
    });

    this.setupEventMouse();
  }

  private setupCanvasAndDots(delay: number = 0): void {
    setTimeout(() => {
      this.initializeCanvas(
        this.fontSize,
        this.fontFamily,
        this.text,
        this.gradientType,
        this.gradientStartColor,
        this.gradientEndColor,
        this.paddingRight,
        this.paddingLeft,
        this.paddingY,
        this.textAlign,
        this.textBaseline,
        this.fullScreen
      );

      this.createDots(
        this.spacing,
        this.moveDirection,
        this.moveSpeed,
        this.minRadius,
        this.maxRadius
      );

      this.animateDots(
        this.text,
        this.hoverDistance,
        this.hoverOffset,
        this.vibrationDirection,
        this.lerpSpeed
      );
    }, delay);
  }

  /**
   * Sets up mouse event listeners for the canvas.
   */
  public setupEventMouse(): void {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.state.mouseX =
        (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.state.mouseY =
        (e.clientY - rect.top) * (this.canvas.height / rect.height);
    });
    this.canvas.addEventListener("mouseout", () => {
      this.state.mouseX = null;
      this.state.mouseY = null;
    });
  }

  /**
   * Initializes the canvas with the given parameters and renders the text.
   * @param fontSize - Font size of the text.
   * @param fontFamily - Font family of the text.
   * @param text - The text to be rendered.
   * @param gradientType - Gradient type for the text color.
   * @param gradientStartColor - Gradient start color.
   * @param gradientEndColor - Gradient end color.
   * @param paddingRight - Horizontal padding on the right side.
   * @param paddingLeft - Horizontal padding on the left side.
   * @param paddingY - Vertical padding.
   * @param textAlign - Horizontal alignment of the text.
   * @param textBaseline - Vertical alignment of the text.
   * @param fullScreen - Whether to make the canvas full screen.
   */
  public initializeCanvas(
    fontSize: number,
    fontFamily: string,
    text: string,
    gradientType: string,
    gradientStartColor: string,
    gradientEndColor: string,
    paddingRight: number = 0,
    paddingLeft: number = 0,
    paddingY: number = 0,
    textAlign: CanvasTextAlign,
    textBaseline: CanvasTextBaseline,
    fullScreen: boolean = false
  ): void {
    const responsiveFontSize = new ResponsiveValue(
      fontSize,
      this.breakpointsFont
    );
    const dynamicFontSize = responsiveFontSize.getResponsiveValue();
    const responsivePaddingRight = new ResponsiveValue(
      paddingRight,
      this.breakpointsPaddingX
    );
    const dynamicPaddingRight = responsivePaddingRight.getResponsiveValue();
    const responsivePaddingLeft = new ResponsiveValue(
      paddingLeft,
      this.breakpointsPaddingX
    );
    const dynamicPaddingLeft = responsivePaddingLeft.getResponsiveValue();
    const vhPaddingY = (paddingY / 100) * window.innerHeight;

    const lineHeight = dynamicFontSize * 1;

    this.ctx.font = `clamp(0rem, ${dynamicFontSize}vw, 3rem) ${fontFamily}`;
    const textMetrics = this.ctx.measureText(text);
    const actualTextWidth =
      textMetrics.width / 2 + (dynamicPaddingLeft + dynamicPaddingRight) / 2;
    const lines = text.split("CRLF");
    const totalTextHeight =
      (lines.length * lineHeight * window.innerWidth) / 100;

    if (fullScreen) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.canvas.style.width = `${this.canvas.width}px`;
      this.canvas.style.height = `${this.canvas.height}px`;
    } else {
      this.canvas.width =
        actualTextWidth + dynamicPaddingLeft + dynamicPaddingRight;
      this.canvas.height = totalTextHeight + vhPaddingY * 2;
      this.canvas.style.width = `${this.canvas.width}px`;
      this.canvas.style.height = `${this.canvas.height}px`;

      const screenWidth = window.innerWidth;
      if (this.canvas.width > screenWidth) {
        this.canvas.width = screenWidth;
        this.canvas.style.width = `${screenWidth}px`;
      }
    }

    if (
      [
        "top",
        "hanging",
        "middle",
        "alphabetic",
        "ideographic",
        "bottom",
      ].includes(textBaseline)
    ) {
      this.ctx.textBaseline = textBaseline as CanvasTextBaseline;
    } else {
      throw new Error("Invalid textBaseline value");
    }

    if (["left", "right", "center"].includes(textAlign)) {
      this.ctx.textAlign = textAlign as CanvasTextAlign;
    } else {
      throw new Error("Invalid textAlign value");
    }

    let startX: number = 0;
    switch (textAlign) {
      case "left":
        startX = dynamicPaddingLeft;
        break;
      case "center":
        startX =
          (this.canvas.width - dynamicPaddingLeft + dynamicPaddingRight) / 2;
        break;
      case "right":
        startX = this.canvas.width - dynamicPaddingRight;
        break;
    }

    this.ctx.font = `${dynamicFontSize}vw ${fontFamily}`;
    if (gradientType === "gradient-vertical") {
      const firstLineColor = gradientStartColor;
      const secondLineColor = gradientEndColor;
      const firstLineEndY = vhPaddingY + lineHeight;
      const gradientPercentage = firstLineEndY / this.canvas.height;

      let gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, firstLineColor);
      gradient.addColorStop(gradientPercentage, firstLineColor);
      gradient.addColorStop(gradientPercentage, secondLineColor);
      gradient.addColorStop(1, secondLineColor);

      this.ctx.fillStyle = gradient;
    } else if (gradientType === "gradient-horizontal") {
      const firstLineColor = gradientStartColor;
      const secondLineColor = gradientEndColor;

      let gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
      gradient.addColorStop(0, firstLineColor);
      gradient.addColorStop(1, secondLineColor);

      this.ctx.fillStyle = gradient;
    }

    for (let i = 0; i < lines.length; i++) {
      let yPosition: number;
      switch (textBaseline) {
        case "top":
          yPosition = vhPaddingY + (i * lineHeight * window.innerWidth) / 100;
          break;
        case "middle":
          yPosition =
            (this.canvas.height - totalTextHeight) / 2 +
            (i * lineHeight * window.innerWidth) / 100;
          break;
        case "bottom":
        case "alphabetic":
          yPosition =
            this.canvas.height -
            vhPaddingY -
            ((lines.length - 1 - i) * lineHeight * window.innerWidth) / 100;
          break;
        default:
          yPosition = vhPaddingY + (i * lineHeight * window.innerWidth) / 100;
          break;
      }
      this.ctx.fillText(lines[i], startX, yPosition);
    }
  }

  /**
   * Creates dots based on the rendered text on the canvas.
   * @param spacing - Spacing between the dots.
   * @param moveDirection - Initial direction of the dots.
   * @param moveSpeed - Speed at which the dots move towards their target position.
   */
  public createDots(
    spacing: number,
    moveDirection: string,
    moveSpeed: number,
    minRadius: number,
    maxRadius: number
  ): void {
    this.dots = [];
    for (let y = 0; y < this.canvas.height; y += spacing) {
      for (let x = 0; x < this.canvas.width; x += spacing) {
        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        if (pixel[3] > 0) {
          const randomRadius =
            minRadius + Math.random() * (maxRadius - minRadius);
          const dot = new Dot(x, y, randomRadius);
          dot.setInitialPosition(
            moveDirection,
            this.canvas.width,
            this.canvas.height
          );
          dot.move(moveSpeed);
          this.dots.push(dot);
        }
      }
    }
  }

  /**
   * Creates dots based on the rendered text on the canvas.
   * @param spacing - Spacing between the dots.
   * @param moveDirection - Initial direction of the dots.
   * @param moveSpeed - Speed at which the dots move towards their target position.
   */
  public createDotsBeforeGetImg(
    spacing: number,
    moveDirection: string,
    moveSpeed: number,
    minRadius: number,
    maxRadius: number
  ): void {
    this.dots = [];
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    for (let y = 0; y < this.canvas.height; y += spacing) {
      for (let x = 0; x < this.canvas.width; x += spacing) {
        const index = (y * this.canvas.width + x) * 4;
        if (data[index + 3] > 0) {
          const randomRadius =
            minRadius + Math.random() * (maxRadius - minRadius);
          const dot = new Dot(x, y, randomRadius);
          dot.setInitialPosition(
            moveDirection,
            this.canvas.width,
            this.canvas.height
          );
          dot.move(moveSpeed);
          this.dots.push(dot);
        }
      }
    }
  }

  /**
   * Animates the dots around the text based on mouse position.
   * @param text - The text around which the dots are animated.
   * @param hoverDistance - Distance from the mouse within which dots are affected.
   * @param hoverOffset - Offset distance for the dots when mouse is within hoverDistance.
   * @param vibrationDirection - Direction of the vibration for the dots.
   * @param lerpSpeed - Speed at which dots move towards their target position.
   */
  public animateDots(
    text: string,
    hoverDistance: number,
    hoverOffset: number,
    vibrationDirection: number,
    lerpSpeed: number
  ): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    for (const dot of this.dots) {
      if (this.state.mouseX !== null && this.state.mouseY !== null) {
        const dx = dot.originalX - this.state.mouseX;
        const dy = dot.originalY - this.state.mouseY;
        const distanceSquared = dx * dx + dy * dy;
        const angle = Math.atan2(dy, dx);

        if (distanceSquared <= Math.pow(hoverDistance, 2)) {
          dot.x =
            dot.originalX +
            Math.cos(angle) * hoverOffset +
            Math.cos(dot.vibrationDirection) * 5;
          dot.y =
            dot.originalY +
            Math.sin(angle) * hoverOffset +
            Math.sin(dot.vibrationDirection) * 5;
          dot.vibrationDirection += vibrationDirection;
        } else {
          dot.x = this.lerp(dot.x, dot.originalX, lerpSpeed);
          dot.y = this.lerp(dot.y, dot.originalY, lerpSpeed);
        }
      } else {
        dot.x = this.lerp(dot.x, dot.originalX, lerpSpeed);
        dot.y = this.lerp(dot.y, dot.originalY, lerpSpeed);
      }

      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    requestAnimationFrame(() =>
      this.animateDots(
        text,
        hoverDistance,
        hoverOffset,
        vibrationDirection,
        lerpSpeed
      )
    );
  }
  /**
   * Lerp function to interpolate between two values.
   * @param start - The start value.
   * @param end - The end value.
   * @param t - The interpolation factor, should be between 0 and 1.
   * @returns The interpolated value.
   */
  private lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
  }
}

/**
 * Dot class represents a single dot that can be animated around the text.
 */
class Dot {
  originalX: number;
  originalY: number;
  x: number;
  y: number;
  radius: number;
  vibrationDirection: number;

  /**
   * Constructor for the Dot class.
   * @param x - Initial x-coordinate of the dot.
   * @param y - Initial y-coordinate of the dot.
   * @param radius - Radius of the dot.
   */
  constructor(x: number, y: number, radius: number) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vibrationDirection = Math.random() * Math.PI * 2;
  }

  /**
   * Sets the initial position of the dot based on the given direction.
   * @param direction - Direction from which the dot will start.
   * @param canvasWidth - Width of the canvas.
   * @param canvasHeight - Height of the canvas.
   */
  setInitialPosition(
    direction: string,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    switch (direction) {
      case "right":
        this.x = canvasWidth + Math.random() * canvasWidth;
        this.y = this.originalY;
        break;
      case "left":
        this.x = -Math.random() * canvasWidth;
        this.y = this.originalY;
        break;
      case "top":
        this.x = this.originalX;
        this.y = -Math.random() * canvasHeight;
        break;
      case "bottom":
        this.x = this.originalX;
        this.y = canvasHeight + Math.random() * canvasHeight;
        break;
      case "rightTop":
        this.x = canvasWidth + Math.random() * canvasWidth;
        this.y = -Math.random() * canvasHeight;
        break;
      case "rightBottom":
        this.x = canvasWidth + Math.random() * canvasWidth;
        this.y = canvasHeight + Math.random() * canvasHeight;
        break;
      case "leftTop":
        this.x = -Math.random() * canvasWidth;
        this.y = -Math.random() * canvasHeight;
        break;
      case "leftBottom":
        this.x = -Math.random() * canvasWidth;
        this.y = canvasHeight + Math.random() * canvasHeight;
        break;
      case "horizontal":
        this.x =
          Math.random() > 0.5
            ? -Math.random() * canvasWidth
            : canvasWidth + Math.random() * canvasWidth;
        this.y = this.originalY;
        break;
      case "vertical":
        this.x = this.originalX;
        this.y =
          Math.random() > 0.5
            ? -Math.random() * canvasHeight
            : canvasHeight + Math.random() * canvasHeight;
        break;
      case "allDirections":
        const randomAngle = Math.random() * Math.PI * 2;
        const distance = Math.random() * Math.max(canvasWidth, canvasHeight);
        this.x = this.originalX + Math.cos(randomAngle) * distance;
        this.y = this.originalY + Math.sin(randomAngle) * distance;
        break;
      default:
        break;
    }
  }

  move(lerpSpeed: number): void {
    const distanceToTargetX = this.originalX - this.x;
    const distanceToTargetY = this.originalY - this.y;
    const threshold = 0.1;

    if (
      Math.abs(distanceToTargetX) > threshold ||
      Math.abs(distanceToTargetY) > threshold
    ) {
      this.x += (this.originalX - this.x) * lerpSpeed;
      this.y += (this.originalY - this.y) * lerpSpeed;
    } else {
      this.x = this.originalX;
      this.y = this.originalY;
    }
  }
}

export default FontDots;
