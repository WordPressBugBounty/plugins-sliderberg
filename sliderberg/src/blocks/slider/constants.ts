/**
 * Slider block constants and Swiper config helpers
 */

import type { SwiperOptions } from "swiper/types";

import { getTransitionEffectConfig } from "./swiper-effects";

/**
 * Slider block attributes interface (mirrors block.json)
 */
export interface SliderAttributes {
  align: string;
  type: string;
  autoplay: boolean;
  autoplaySpeed: number;
  pauseOnHover: boolean;
  transitionEffect: string;
  transitionDuration: number;
  transitionEasing: string;
  navigationType: string;
  navigationPlacement: string;
  navigationShape: string;
  navigationSize: string;
  navigationSizeValue: Record<string, string>;
  navigationColor: string;
  navigationBgColor: string;
  navigationOpacity: number;
  navigationVerticalPosition: number;
  navigationHorizontalPosition: number;
  navHorizontal: string;
  navVertical: string;
  navOutside: boolean;
  navFreePosition: boolean;
  navFreeX: number;
  navFreeY: number;
  prevFreeX: number;
  prevFreeY: number;
  nextFreeX: number;
  nextFreeY: number;
  dotsFreeX: number;
  dotsFreeY: number;
  prevArrowH: string;
  prevArrowV: string;
  nextArrowH: string;
  nextArrowV: string;
  dotsHorizontal: string;
  dotsVertical: string;
  dotColor: string;
  dotActiveColor: string;
  hideDots: boolean;
  hideNavigation: boolean;
  widthPreset: string;
  customWidth: string;
  widthUnit: string;
  /** "" = layout not yet picked (chooser UI), "slider", or "carousel". */
  mode: string;
  slidesToShow: number;
  slidesToScroll: number;
  slideSpacing: number;
  infiniteLoop: boolean;
  tabletSlidesToShow: number;
  tabletSlidesToScroll: number;
  tabletSlideSpacing: number;
  mobileSlidesToShow: number;
  mobileSlidesToScroll: number;
  mobileSlideSpacing: number;
  minHeight: number;
  sliderDirection: string;
}

/**
 * Navigation type options
 */
export const NAVIGATION_TYPES = [
  { label: "Bottom", value: "bottom" },
  { label: "Top", value: "top" },
  { label: "Split", value: "split" },
];

/**
 * Navigation placement options
 */
export const NAVIGATION_PLACEMENTS = [
  { label: "Overlay", value: "overlay" },
  { label: "Outside", value: "outside" },
];

/**
 * Navigation shape options
 */
export const NAVIGATION_SHAPES = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
];

/**
 * Navigation size options
 */
export const NAVIGATION_SIZES = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

/**
 * Transition effect options
 */
export const TRANSITION_EFFECTS = [
  { label: "Slide", value: "slide" },
  { label: "Fade", value: "fade" },
  { label: "Zoom", value: "zoom" },
];

/**
 * Transition easing options
 */
export const TRANSITION_EASINGS = [
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Linear", value: "linear" },
];

/**
 * Width preset options
 */
export const WIDTH_PRESETS = [
  { label: "Default", value: "default" },
  { label: "Full Width", value: "full" },
  { label: "Wide", value: "wide" },
  { label: "Custom", value: "custom" },
];

/**
 * Responsive breakpoints (matches Swiper breakpoints convention)
 */
export const BREAKPOINTS = {
  MOBILE: 0,
  TABLET: 768,
  DESKTOP: 1024,
};

/**
 * Build Swiper configuration from slider block attributes.
 * Used both in editor (React Swiper) and serialized to data-swiper-data on frontend.
 * @param attributes
 */
export function buildSwiperConfig(attributes: SliderAttributes): SwiperOptions {
  const {
    transitionEffect,
    transitionDuration,
    autoplay,
    autoplaySpeed,
    pauseOnHover,
    infiniteLoop,
    mode,
    slidesToShow,
    slidesToScroll,
    slideSpacing,
    hideNavigation,
    hideDots,
    tabletSlidesToShow,
    tabletSlidesToScroll,
    tabletSlideSpacing,
    mobileSlidesToShow,
    mobileSlidesToScroll,
    mobileSlideSpacing,
    sliderDirection,
  } = attributes;

  const isCarouselMode = mode === "carousel";

  const config: SwiperOptions = {
    ...getTransitionEffectConfig(transitionEffect, isCarouselMode),
    speed: transitionDuration,
    loop: infiniteLoop,
    slidesPerView: isCarouselMode ? slidesToShow : 1,
    slidesPerGroup: isCarouselMode ? slidesToScroll : 1,
    spaceBetween: isCarouselMode ? slideSpacing : 0,
    cssMode: false,
    direction: (sliderDirection === "vertical" ? "vertical" : "horizontal") as
      | "horizontal"
      | "vertical",
  };

  // Autoplay
  if (autoplay) {
    config.autoplay = {
      delay: autoplaySpeed,
      disableOnInteraction: false,
      pauseOnMouseEnter: pauseOnHover,
    };
  }

  // Navigation
  if (!hideNavigation) {
    config.navigation = {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    };
  }

  // Pagination
  if (!hideDots) {
    config.pagination = {
      el: ".swiper-pagination",
      clickable: true,
    };
  }

  // Responsive breakpoints (only in carousel mode)
  if (isCarouselMode) {
    config.breakpoints = {
      [BREAKPOINTS.MOBILE]: {
        slidesPerView: mobileSlidesToShow,
        slidesPerGroup: mobileSlidesToScroll,
        spaceBetween: mobileSlideSpacing,
      },
      [BREAKPOINTS.TABLET]: {
        slidesPerView: tabletSlidesToShow,
        slidesPerGroup: tabletSlidesToScroll,
        spaceBetween: tabletSlideSpacing,
      },
      [BREAKPOINTS.DESKTOP]: {
        slidesPerView: slidesToShow,
        slidesPerGroup: slidesToScroll,
        spaceBetween: slideSpacing,
      },
    };
  }

  // A11y
  config.a11y = {
    prevSlideMessage: "Previous slide",
    nextSlideMessage: "Next slide",
    firstSlideMessage: "This is the first slide",
    lastSlideMessage: "This is the last slide",
  };

  return config;
}
