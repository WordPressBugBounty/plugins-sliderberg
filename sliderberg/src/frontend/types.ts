/**
 * Shared types for SliderBerg frontend
 *
 * Uses TransitionEffect and TransitionEasing from the shared types module
 * to maintain a single source of truth for these values across editor and frontend.
 */

import { TransitionEffect, TransitionEasing } from '../types/common';

// Re-export for convenience (allows importing from frontend/types)
export type { TransitionEffect, TransitionEasing };

/**
 * Frontend slider configuration
 *
 * This interface represents the configuration parsed from the data-config
 * attribute on slider containers. It includes all settings needed for
 * frontend slider behavior including transitions, autoplay, and responsive carousel settings.
 */
export interface SliderConfig {
	/** Transition effect type */
	transitionEffect: TransitionEffect;
	/** Duration of slide transitions in milliseconds */
	transitionDuration: number;
	/** CSS easing function for transitions */
	transitionEasing: TransitionEasing;
	/** Whether autoplay is enabled */
	autoplay: boolean;
	/** Time between auto-advances in milliseconds */
	autoplaySpeed: number;
	/** Whether to pause autoplay on hover/focus */
	pauseOnHover: boolean;

	// Carousel attributes
	/** True when showing multiple slides at once */
	isCarouselMode: boolean;
	/** Number of slides visible at once (desktop) */
	slidesToShow: number;
	/** Number of slides to advance per navigation action (desktop) */
	slidesToScroll: number;
	/** Gap between slides in pixels (desktop) */
	slideSpacing: number;
	/** Whether carousel wraps around infinitely */
	infiniteLoop: boolean;

	// Responsive carousel attributes
	/** Slides to show on tablet */
	tabletSlidesToShow: number;
	/** Slides to scroll on tablet */
	tabletSlidesToScroll: number;
	/** Slide spacing on tablet */
	tabletSlideSpacing: number;
	/** Slides to show on mobile */
	mobileSlidesToShow: number;
	/** Slides to scroll on mobile */
	mobileSlidesToScroll: number;
	/** Slide spacing on mobile */
	mobileSlideSpacing: number;

	// Breakpoints (optional, defaults applied in controller)
	/** Mobile breakpoint in pixels (default: 768) */
	breakpointMobile?: number;
	/** Tablet breakpoint in pixels (default: 1024) */
	breakpointTablet?: number;
}

/**
 * Slider state tracking
 * 
 * IMPORTANT: This interface tracks two different index systems depending on mode:
 * 
 * ## Single-Slide Mode (isCarouselMode: false)
 * Uses `currentSlide` with clone-aware indexing:
 * - Index 0 = last slide clone (for infinite loop)
 * - Index 1 to N = real slides (1-indexed!)
 * - Index N+1 = first slide clone
 * - Use `getVisibleSlideIndex()` to get the actual 0-indexed slide number
 * 
 * ## Carousel Mode (isCarouselMode: true, slidesToShow > 1)
 * Uses `startIndex` for the leftmost visible slide:
 * - Index 0 to N-1 = real slides (0-indexed)
 * - With infinite loop, clones are prepended/appended but startIndex
 *   always refers to real slide positions
 * 
 * The two systems exist for historical reasons and different animation
 * requirements. Single-slide mode uses CSS transform with clone jumping,
 * while carousel mode uses a simpler positional system.
 */
export interface SliderState {
	/**
	 * Index of the leftmost visible slide in CAROUSEL mode.
	 * 0-indexed, refers to real slide positions.
	 * Only meaningful when isCarouselMode is true.
	 */
	startIndex: number;
	
	/**
	 * Current slide position in SINGLE-SLIDE mode.
	 * Uses clone-aware 1-indexed system where:
	 * - 0 = last slide clone (pre-first)
	 * - 1 to N = real slides
	 * - N+1 = first slide clone (post-last)
	 * Only meaningful when isCarouselMode is false.
	 */
	currentSlide: number;
	
	/** True while a slide transition animation is in progress */
	isAnimating: boolean;
	
	/** Interval ID for autoplay, null when stopped */
	autoplayInterval: number | null;
	
	/** Total number of real slides (excludes clones) */
	slideCount: number;
	
	/** X coordinate where touch/swipe started (0 when reset/invalid) */
	touchStartX: number;
	
	/** Y coordinate where touch/swipe started (0 when reset/invalid) */
	touchStartY: number;
	
	/** Minimum pixels required for a swipe to trigger navigation */
	swipeThreshold: number;
	
	/** ResizeObserver for responsive layout updates */
	observer: ResizeObserver | null;
	
	/** IntersectionObserver for visibility-based autoplay */
	intersectionObserver: IntersectionObserver | null;
	
	/** True after destroy() is called, prevents further operations */
	destroyed: boolean;
}

export interface SliderElements {
	container: HTMLElement;
	slides: HTMLElement[];
	prevButton: HTMLElement | null;
	nextButton: HTMLElement | null;
	indicators: HTMLElement | null;
	wrapper: Element;
}
