/**
 * Slider type definitions for the block editor
 *
 * Note: For frontend runtime configuration, see src/frontend/types.ts
 * which defines SliderConfig used by the slider controller.
 */

import { TransitionEffect, TransitionEasing } from "./common";

// Re-export for convenience
export type { TransitionEffect, TransitionEasing };

/**
 * Editor-side slider state
 * Used for tracking slider state within the block editor
 */
export interface SliderState {
  currentSlide: number;
  isAnimating: boolean;
  autoplayInterval: number | null;
}

export interface Slide {
  element: HTMLElement;
  index: number;
}

export interface SlideChangeEvent {
  from: number;
  to: number;
}

export interface ResponsiveCarouselSettings {
  slidesToShow: number;
  slidesToScroll: number;
  slideSpacing: number;
}

/**
 * Slide data structure for legacy/serialized slides
 */
export interface SlideData {
  id: string;
  content: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundColor?: string;
  textColor?: string;
  link?: string;
  linkTarget?: string;
  linkText?: string;
}

/**
 * Main slider block attributes
 */
export interface SliderAttributes {
  type: string;
  navigationType: "split" | "top" | "bottom";
  navigationPlacement: "overlay" | "outside";
  navigationShape: "circle" | "square";
  navigationSize: "small" | "medium" | "large";
  navigationColor: string;
  navigationBgColor: string;
  navigationOpacity: number;
  navigationVerticalPosition: number;
  navigationHorizontalPosition: number;
  dotColor: string;
  dotActiveColor: string;
  hideDots: boolean;
  hideNavigation: boolean;
  transitionEffect: TransitionEffect;
  transitionDuration: number;
  transitionEasing: TransitionEasing;
  autoplay: boolean;
  autoplaySpeed: number;
  pauseOnHover: boolean;
  slides: SlideData[];
  align?: "wide" | "full" | undefined;
  widthPreset: string;
  customWidth: string;
  widthUnit: string;
  // Carousel properties
  isCarouselMode: boolean;
  slidesToShow: number;
  slidesToScroll: number;
  slideSpacing: number;
  infiniteLoop: boolean;
  // Responsive carousel settings
  tabletSlidesToShow?: number;
  tabletSlidesToScroll?: number;
  tabletSlideSpacing?: number;
  mobileSlidesToShow?: number;
  mobileSlidesToScroll?: number;
  mobileSlideSpacing?: number;
  minHeight: number;
}
