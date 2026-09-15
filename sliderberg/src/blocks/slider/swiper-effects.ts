import type { CreativeEffectTransform, SwiperOptions } from "swiper/types";

const CAROUSEL_COMPATIBLE_EFFECTS = new Set(["slide", "coverflow"]);

export function isTransitionEffectAllowedInCarousel(transitionEffect: string) {
  return CAROUSEL_COMPATIBLE_EFFECTS.has(transitionEffect);
}

export function getTransitionEffectConfig(
  transitionEffect: string,
  isCarouselMode = false,
): Pick<
  SwiperOptions,
  | "centeredSlides"
  | "creativeEffect"
  | "cubeEffect"
  | "coverflowEffect"
  | "effect"
  | "fadeEffect"
  | "flipEffect"
  | "parallax"
  | "watchSlidesProgress"
> {
  if (
    isCarouselMode &&
    !isTransitionEffectAllowedInCarousel(transitionEffect)
  ) {
    return {
      effect: "slide",
    };
  }

  switch (transitionEffect) {
    case "fade":
      return {
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
      };

    case "zoom":
      return {
        effect: "creative",
        creativeEffect: {
          prev: {
            opacity: 0,
            scale: 0.95,
          } as CreativeEffectTransform,
          next: {
            opacity: 0,
            scale: 1.05,
          } as CreativeEffectTransform,
        },
      };

    case "coverflow":
      return {
        centeredSlides: isCarouselMode,
        effect: "coverflow",
        coverflowEffect: {
          depth: 100,
          modifier: 1,
          rotate: 50,
          scale: 1,
          slideShadows: true,
          stretch: 0,
        },
        watchSlidesProgress: isCarouselMode,
      };

    case "flip":
      return {
        effect: "flip",
        flipEffect: {
          limitRotation: true,
          slideShadows: true,
        },
      };

    case "cube":
      return {
        effect: "cube",
        cubeEffect: {
          shadow: true,
          shadowOffset: 20,
          shadowScale: 0.94,
          slideShadows: true,
        },
      };

    case "parallax":
      return {
        effect: "slide",
        parallax: true,
      };

    default:
      return {
        effect: "slide",
      };
  }
}
