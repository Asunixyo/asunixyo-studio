// src/types/jquery.d.ts
import "slick-carousel";

declare global {
  interface JQuery<TElement = HTMLElement> {
    slick(options?: any): JQuery;
  }
}
