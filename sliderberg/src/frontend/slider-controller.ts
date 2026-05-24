/**
 * Main controller for SliderBerg
 * Coordinates animation and event handlers
 */

import { AnimationHandler } from './animation-handler';
import { EventHandler } from './event-handler';
import { SliderConfig, SliderState, SliderElements } from './types';
import {
	validateTransitionEffect,
	validateTransitionEasing,
	validateNumericRange,
	sanitizeAttributeValue,
	sanitizeDOMId,
	validateDOMNumeric,
} from '../utils/security';
import { BREAKPOINTS } from './constants';

export class SliderBergController {
	private static instances: Map<string, SliderBergController> = new Map();

	private elements: SliderElements;
	private config: SliderConfig;
	private state: SliderState;
	private id: string;

	// Handlers
	private animationHandler!: AnimationHandler;
	private eventHandler!: EventHandler;
	private boundHandleIntersection!: IntersectionObserverCallback;

	// Indicator buttons cache to avoid DOM recreation
	private indicatorButtons: HTMLButtonElement[] = [];
	private lastIndicatorCount: number = 0;

	// Delegated event handlers for indicators (attached to container, not individual buttons)
	private boundIndicatorClick!: (e: MouseEvent) => void;
	private boundIndicatorKeydown!: (e: KeyboardEvent) => void;
	private indicatorListenersAttached: boolean = false;

	// Accessibility: aria-live region for screen reader announcements
	private liveRegion: HTMLDivElement | null = null;

	// Cache for responsive settings to avoid repeated calculations
	private cachedResponsiveSettings: {
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
	} | null = null;
	private lastViewportWidth: number = 0;

	/**
	 * Create a new slider controller instance
	 * @param sliderElement
	 */
	public static createInstance(
		sliderElement: Element
	): SliderBergController | null {
		try {
			// Use crypto API for secure random ID generation
			let id: string;
			if (
				typeof window.crypto !== 'undefined' &&
				window.crypto.getRandomValues
			) {
				const array = new Uint32Array(2);
				window.crypto.getRandomValues(array);
				id = `slider-${array[0].toString(
					36
				)}${array[1].toString(36)}`;
			} else {
				// Fallback for older browsers
				id = `slider-${Date.now().toString(36)}-${Math.random()
					.toString(36)
					.substring(2, 11)}`;
			}

			// Sanitize the ID
			id = sanitizeDOMId(id);

			const instance = new SliderBergController(sliderElement, id);
			SliderBergController.instances.set(id, instance);
			return instance;
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Failed to initialize SliderBerg slider:', error);
			return null;
		}
	}

	/**
	 * Clean up all slider instances
	 */
	public static destroyAll(): void {
		SliderBergController.instances.forEach((instance) => {
			instance.destroy();
		});
		SliderBergController.instances.clear();
	}

	/**
	 * Get all instances
	 */
	public static getInstances(): Map<string, SliderBergController> {
		return SliderBergController.instances;
	}

	/**
	 * Find a controller instance by its DOM element
	 *
	 * @example
	 * const element = document.querySelector('.wp-block-sliderberg-sliderberg');
	 * const slider = SliderBergController.getInstance(element);
	 * slider?.next();
	 *
	 * @param element - The slider wrapper element
	 * @returns The controller instance, or null if not found
	 */
	public static getInstance(element: Element): SliderBergController | null {
		for (const instance of SliderBergController.instances.values()) {
			if (instance.elements?.wrapper === element) {
				return instance;
			}
		}
		return null;
	}

	/**
	 * Private constructor - use createInstance instead
	 * @param sliderElement
	 * @param id
	 */
	private constructor(sliderElement: Element, id: string) {
		this.id = id;

		// Look for the slides container - handle nested structures from old content
		let container = sliderElement.querySelector(
			'.sliderberg-slides-container'
		) as HTMLElement | null;

		// If we have nested slider structure (old content), find the innermost container
		if (container) {
			const nestedContainer = container.querySelector(
				'.sliderberg-slides-container'
			) as HTMLElement | null;
			if (nestedContainer) {
				// Use the nested container instead
				container = nestedContainer;
				// Ensure it has the proper initial styles
				container.style.display = 'flex';
				container.style.width = '100%';
			}
		}

		if (!container) {
			throw new Error('Slider container not found');
		}

		const slides = Array.from(container.children).filter(
			(child) =>
				child.classList.contains('sliderberg-slide') ||
				child.classList.contains('wp-block-sliderberg-slide')
		) as HTMLElement[];

		if (!slides.length) {
			throw new Error('No slides found in slider');
		}

		// For nested structures, look for navigation in the outermost container
		const navContainer = sliderElement.querySelector(
			'.sliderberg-slides-container'
		)
			? sliderElement
			: sliderElement.parentElement;

		const prevButton = navContainer?.querySelector(
			'.sliderberg-prev:not(.sliderberg-slides-container .sliderberg-prev)'
		) as HTMLElement | null;
		const nextButton = navContainer?.querySelector(
			'.sliderberg-next:not(.sliderberg-slides-container .sliderberg-next)'
		) as HTMLElement | null;
		const indicators = navContainer?.querySelector(
			'.sliderberg-slide-indicators:not(.sliderberg-slides-container .sliderberg-slide-indicators)'
		) as HTMLElement | null;

		if (!prevButton || !nextButton) {
			// eslint-disable-next-line no-console
			console.warn(
				`Navigation elements not found for slider ${this.id}, navigation will be disabled`
			);
		}

		this.elements = {
			container,
			slides,
			prevButton,
			nextButton,
			indicators,
			wrapper: sliderElement,
		};

		this.config = this.parseConfig(container);

		this.state = {
			startIndex: 0,
			currentSlide: 0,
			isAnimating: false,
			autoplayInterval: null,
			slideCount: slides.length,
			touchStartX: 0,
			touchStartY: 0,
			swipeThreshold: 50,
			observer: null,
			intersectionObserver: null,
			destroyed: false,
		};

		// Initialize handlers
		this.initializeHandlers();
		this.initialize();
	}

	/**
	 * Initialize animation and event handlers
	 */
	private initializeHandlers(): void {
		this.animationHandler = new AnimationHandler(
			this.config,
			this.state,
			this.elements
		);

		this.eventHandler = new EventHandler(
			this.config,
			this.state,
			this.elements,
			{
				onSlideChange: this.dispatchSlideChangeEvent.bind(this),
				onNextSlide: this.nextSlide.bind(this),
				onPrevSlide: this.prevSlide.bind(this),
				onResize: this.handleResize.bind(this),
			}
		);

		this.boundHandleIntersection = this.handleIntersection.bind(this);

		// Bind delegated indicator handlers (attached once to container, not per-button)
		this.boundIndicatorClick = this.handleDelegatedIndicatorClick.bind(this);
		this.boundIndicatorKeydown = this.handleDelegatedIndicatorKeydown.bind(this);
	}

	/**
	 * Validate that a parsed JSON value is a safe plain object
	 * Prevents prototype pollution and ensures the value is usable as config
	 * 
	 * @param value - The parsed JSON value to validate
	 * @returns true if the value is a safe plain object
	 */
	private isValidConfigObject(value: unknown): value is Record<string, unknown> {
		// Must be an object (not null, not array, not primitive)
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return false;
		}
		
		// Protect against prototype pollution
		// Check that the object doesn't contain dangerous keys as OWN properties
		// (not inherited from prototype chain)
		const obj = value as Record<string, unknown>;
		if (
			Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
			Object.prototype.hasOwnProperty.call(obj, 'constructor') ||
			Object.prototype.hasOwnProperty.call(obj, 'prototype')
		) {
			// eslint-disable-next-line no-console
			console.warn('SliderBerg: Potentially malicious config detected, using defaults');
			return false;
		}
		
		return true;
	}

	/**
	 * Parse configuration from DOM
	 * Validates JSON structure before using values to prevent XSS/injection
	 * 
	 * @param container
	 */
	private parseConfig(container: HTMLElement): SliderConfig {
		// Prefer a single JSON config for simplicity
		const rawConfig = container.getAttribute('data-config');
		if (rawConfig) {
			try {
				const parsed = JSON.parse(rawConfig);
				
				// Validate that parsed value is a safe object
				if (!this.isValidConfigObject(parsed)) {
					throw new Error('Invalid config structure');
				}
				
				const cfg = parsed;
				const isCarouselMode = !!cfg.isCarouselMode;
				const effect = isCarouselMode
					? 'slide'
					: validateTransitionEffect(
						(cfg.transitionEffect as
							| 'slide'
							| 'fade'
							| 'zoom') || 'slide'
					);
				return {
					transitionEffect: effect,
					transitionDuration: validateNumericRange(
						cfg.transitionDuration ?? 500,
						200,
						2000,
						500
					),
					transitionEasing: validateTransitionEasing(
						cfg.transitionEasing || 'ease'
					),
					autoplay: !!cfg.autoplay,
					autoplaySpeed: validateNumericRange(
						cfg.autoplaySpeed ?? 5000,
						1000,
						10000,
						5000
					),
					pauseOnHover: cfg.pauseOnHover !== false,
					// Carousel attributes
					isCarouselMode,
					slidesToShow: validateNumericRange(
						cfg.slidesToShow ?? 1,
						1,
						10,
						1
					),
					slidesToScroll: validateNumericRange(
						cfg.slidesToScroll ?? 1,
						1,
						10,
						1
					),
					slideSpacing: validateNumericRange(
						cfg.slideSpacing ?? 0,
						0,
						100,
						0
					),
					infiniteLoop: !!cfg.infiniteLoop,
					// Responsive carousel attributes
					tabletSlidesToShow: validateNumericRange(
						cfg.tabletSlidesToShow ?? 2,
						1,
						10,
						2
					),
					tabletSlidesToScroll: validateNumericRange(
						cfg.tabletSlidesToScroll ?? 1,
						1,
						10,
						1
					),
					tabletSlideSpacing: validateNumericRange(
						cfg.tabletSlideSpacing ?? 15,
						0,
						100,
						15
					),
					mobileSlidesToShow: validateNumericRange(
						cfg.mobileSlidesToShow ?? 1,
						1,
						10,
						1
					),
					mobileSlidesToScroll: validateNumericRange(
						cfg.mobileSlidesToScroll ?? 1,
						1,
						10,
						1
					),
					mobileSlideSpacing: validateNumericRange(
						cfg.mobileSlideSpacing ?? 10,
						0,
						100,
						10
					),
					// Breakpoints
					breakpointMobile: cfg.breakpointMobile
						? validateNumericRange(
							cfg.breakpointMobile,
							300,
							1000,
							BREAKPOINTS.MOBILE
						)
						: undefined,
					breakpointTablet: cfg.breakpointTablet
						? validateNumericRange(
							cfg.breakpointTablet,
							500,
							1500,
							BREAKPOINTS.TABLET
						)
						: undefined,
				};
			} catch (e) {
				// Fallback to legacy data-* attributes if JSON is invalid
			}
		}

		// If no JSON config, fallback to defaults (should not happen after new build)
		return {
			transitionEffect: 'slide',
			transitionDuration: 500,
			transitionEasing: 'ease',
			autoplay: false,
			autoplaySpeed: 5000,
			pauseOnHover: true,
			isCarouselMode: false,
			slidesToShow: 1,
			slidesToScroll: 1,
			slideSpacing: 0,
			infiniteLoop: false,
			tabletSlidesToShow: 2,
			tabletSlidesToScroll: 1,
			tabletSlideSpacing: 15,
			mobileSlidesToShow: 1,
			mobileSlidesToScroll: 1,
			mobileSlideSpacing: 10,
		};
	}

	/**
	 * Initialize the slider
	 */
	private initialize(): void {
		// Simplify - delegate to handlers
		this.elements.slides.forEach((slide) => {
			slide.style.display = '';
		});

		this.animationHandler.setupSliderLayout();
		this.createIndicators();
		this.createLiveRegion();
		this.eventHandler.attachEventListeners();
		this.eventHandler.setupAutoplay();
		this.eventHandler.setupObservers(this.boundHandleIntersection);
		this.updateAriaAttributes();

		setTimeout(() => {
			if (!this.state.destroyed && this.elements.slides.length > 1) {
				this.goToSlide(0, null);
			}
			// Dispatch initialization complete event
			if (!this.state.destroyed) {
				this.dispatchInitEvent();
			}
		}, 50);
	}

	/**
	 * Create an aria-live region for screen reader announcements
	 * This provides accessible feedback when slides change
	 */
	private createLiveRegion(): void {
		// Check if live region already exists
		if (this.liveRegion) {
			return;
		}

		this.liveRegion = document.createElement('div');
		this.liveRegion.setAttribute('aria-live', 'polite');
		this.liveRegion.setAttribute('aria-atomic', 'true');
		this.liveRegion.className = 'sliderberg-live-region';

		// Visually hidden but accessible to screen readers
		Object.assign(this.liveRegion.style, {
			position: 'absolute',
			width: '1px',
			height: '1px',
			padding: '0',
			margin: '-1px',
			overflow: 'hidden',
			clip: 'rect(0, 0, 0, 0)',
			whiteSpace: 'nowrap',
			border: '0',
		});

		this.elements.wrapper.appendChild(this.liveRegion);
	}

	/**
	 * Announce slide change to screen readers
	 * @param slideNumber - Current slide number (1-based)
	 * @param totalSlides - Total number of slides
	 */
	private announceSlideChange(slideNumber: number, totalSlides: number): void {
		if (!this.liveRegion || this.state.destroyed) {
			return;
		}

		// Clear previous announcement
		this.liveRegion.textContent = '';

		// Use setTimeout to ensure the change is announced
		// Screen readers need the content to change to announce it
		setTimeout(() => {
			if (this.liveRegion && !this.state.destroyed) {
				this.liveRegion.textContent = `Slide ${slideNumber} of ${totalSlides}`;
			}
		}, 100);
	}

	/**
	 * Navigate to specific slide
	 * @param index
	 * @param direction
	 */
	private goToSlide(
		index: number,
		direction: 'next' | 'prev' | null
	): void {
		if (this.state.isAnimating || this.state.destroyed) {
			return;
		}

		this.state.isAnimating = true;
		const previousStartIndex = this.state.startIndex;

		// Add transitioning class for visual feedback
		// This allows CSS to show loading state (e.g., disabled buttons, cursor change)
		this.elements.wrapper.classList.add('sliderberg-transitioning');

		// Calculate indices before transition
		const fromIndex = this.config.isCarouselMode
			? previousStartIndex
			: this.getVisibleSlideIndex();

		// Dispatch transition start event
		this.dispatchTransitionStartEvent(fromIndex, index, direction);

		// Delegate animation to handler
		this.animationHandler.handleSlideTransition(index, direction);

		this.updateIndicators();
		this.updateAriaAttributes();

		// Dispatch events
		const currentIndex = this.config.isCarouselMode
			? this.state.startIndex
			: this.state.currentSlide;
		const previousIndex = this.config.isCarouselMode
			? previousStartIndex
			: this.getVisibleSlideIndex();

		this.dispatchSlideChangeEvent(previousIndex, currentIndex);

		// Schedule transition end event and remove transitioning class
		setTimeout(() => {
			if (!this.state.destroyed) {
				this.elements.wrapper.classList.remove('sliderberg-transitioning');
				this.dispatchTransitionEndEvent(currentIndex);
			}
		}, this.config.transitionDuration + 50);
	}

	/**
	 * Go to next slide
	 */
	private nextSlide(): void {
		if (this.state.isAnimating || this.state.destroyed) {
			return;
		}
		const { isCarouselMode, infiniteLoop, transitionEffect } = this.config;

		// Get responsive settings
		const { slidesToShow, slidesToScroll } = this.getResponsiveSettings();

		const totalSlides = this.elements.slides.length;

		// Don't navigate if there's only one slide
		if (totalSlides <= 1) {
			return;
		}

		if (
			!isCarouselMode &&
			(transitionEffect === 'fade' || transitionEffect === 'zoom')
		) {
			// For fade/zoom NON-carousel mode, use currentSlide instead of startIndex
			let nextIndex = this.state.currentSlide + 1;
			if (nextIndex >= totalSlides) {
				nextIndex = 0; // Loop to first slide
			}
			this.goToSlide(nextIndex, 'next');
		} else {
			// For carousel mode OR slide mode, use startIndex
			let nextIndex =
				this.state.startIndex + (isCarouselMode ? slidesToScroll : 1);
			if (isCarouselMode && infiniteLoop) {
				// Allow overflow for jump logic
			} else if (isCarouselMode) {
				nextIndex = Math.min(nextIndex, totalSlides - slidesToShow);
			}
			this.goToSlide(nextIndex, 'next');
		}
	}

	/**
	 * Go to previous slide
	 */
	private prevSlide(): void {
		if (this.state.isAnimating || this.state.destroyed) {
			return;
		}
		const { isCarouselMode, infiniteLoop, transitionEffect } = this.config;

		const totalSlides = this.elements.slides.length;

		// Don't navigate if there's only one slide
		if (totalSlides <= 1) {
			return;
		}

		// Get responsive settings
		const { slidesToScroll } = this.getResponsiveSettings();

		if (
			!isCarouselMode &&
			(transitionEffect === 'fade' || transitionEffect === 'zoom')
		) {
			// For fade/zoom NON-carousel mode, use currentSlide instead of startIndex
			let prevIndex = this.state.currentSlide - 1;
			if (prevIndex < 0) {
				prevIndex = totalSlides - 1; // Loop to last slide
			}
			this.goToSlide(prevIndex, 'prev');
		} else {
			// For carousel mode OR slide mode, use startIndex
			let prevIndex =
				this.state.startIndex - (isCarouselMode ? slidesToScroll : 1);
			if (isCarouselMode && infiniteLoop) {
				// Allow negative for jump logic
			} else if (isCarouselMode) {
				prevIndex = Math.max(prevIndex, 0);
			}
			this.goToSlide(prevIndex, 'prev');
		}
	}

	/**
	 * Create slide indicators with keyboard navigation
	 * Implements roving tabindex pattern for accessibility
	 * Only recreates DOM when slide count changes
	 *
	 * Uses event delegation: listeners are attached once to the container
	 * rather than to each individual button. This improves memory usage
	 * and simplifies cleanup.
	 */
	private createIndicators(): void {
		const { indicators } = this.elements;
		const { infiniteLoop } = this.config;
		if (!indicators) {
			return;
		}

		// Get responsive settings
		const { slidesToShow } = this.getResponsiveSettings();

		const totalSlides = this.elements.slides.length;
		const dotCount = infiniteLoop
			? totalSlides
			: Math.max(1, totalSlides - slidesToShow + 1);

		// Only recreate if count changed
		if (this.lastIndicatorCount === dotCount && this.indicatorButtons.length === dotCount) {
			// Just update active state
			this.updateIndicatorActiveState();
			return;
		}

		// Clear and recreate
		indicators.innerHTML = '';
		this.indicatorButtons = [];
		this.lastIndicatorCount = dotCount;

		// Set role for the indicator group
		indicators.setAttribute('role', 'tablist');
		indicators.setAttribute('aria-label', 'Slide navigation');

		// Create indicator buttons without individual event listeners
		for (let i = 0; i < dotCount; i++) {
			const isActive = i === this.state.startIndex;
			const dot = document.createElement('button');
			dot.className =
				'sliderberg-slide-indicator' + (isActive ? ' active' : '');
			dot.setAttribute('role', 'tab');
			dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${dotCount}`);
			dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
			dot.setAttribute('data-slide-index', i.toString());
			// Roving tabindex: only active indicator is focusable
			dot.setAttribute('tabindex', isActive ? '0' : '-1');

			indicators.appendChild(dot);
			this.indicatorButtons.push(dot);
		}

		// Attach delegated event listeners to container (only once)
		this.attachIndicatorDelegatedListeners();
	}

	/**
	 * Attach delegated event listeners to the indicators container
	 * Only attaches once, even if indicators are recreated
	 */
	private attachIndicatorDelegatedListeners(): void {
		const { indicators } = this.elements;
		if (!indicators || this.indicatorListenersAttached) {
			return;
		}

		indicators.addEventListener('click', this.boundIndicatorClick);
		indicators.addEventListener('keydown', this.boundIndicatorKeydown);
		this.indicatorListenersAttached = true;
	}

	/**
	 * Handle delegated click events on indicator buttons
	 * @param e - Mouse event from the container
	 */
	private handleDelegatedIndicatorClick(e: MouseEvent): void {
		if (this.state.destroyed) {
			return;
		}

		const target = e.target as HTMLElement;
		if (!target.classList.contains('sliderberg-slide-indicator')) {
			return;
		}

		const indexStr = target.getAttribute('data-slide-index');
		if (indexStr === null) {
			return;
		}

		const index = parseInt(indexStr, 10);
		if (!isNaN(index) && index >= 0 && index < this.indicatorButtons.length) {
			this.goToSlide(index, null);
		}
	}

	/**
	 * Handle delegated keydown events on indicator buttons
	 * Implements roving tabindex pattern for accessibility
	 * @param e - Keyboard event from the container
	 */
	private handleDelegatedIndicatorKeydown(e: KeyboardEvent): void {
		if (this.state.destroyed) {
			return;
		}

		const target = e.target as HTMLElement;
		if (!target.classList.contains('sliderberg-slide-indicator')) {
			return;
		}

		const indexStr = target.getAttribute('data-slide-index');
		if (indexStr === null) {
			return;
		}

		const currentIndex = parseInt(indexStr, 10);
		if (isNaN(currentIndex)) {
			return;
		}

		const totalDots = this.indicatorButtons.length;
		this.handleIndicatorKeydown(e, currentIndex, totalDots);
	}

	/**
	 * Handle keyboard navigation within indicator dots
	 * Implements roving tabindex pattern:
	 * - ArrowLeft/ArrowUp: Move to previous indicator
	 * - ArrowRight/ArrowDown: Move to next indicator
	 * - Home: Move to first indicator
	 * - End: Move to last indicator
	 * 
	 * @param e - Keyboard event
	 * @param currentIndex - Index of the currently focused indicator
	 * @param totalDots - Total number of indicator dots
	 */
	private handleIndicatorKeydown(e: KeyboardEvent, currentIndex: number, totalDots: number): void {
		let newIndex = currentIndex;
		let handled = false;

		switch (e.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				newIndex = currentIndex > 0 ? currentIndex - 1 : totalDots - 1;
				handled = true;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				newIndex = currentIndex < totalDots - 1 ? currentIndex + 1 : 0;
				handled = true;
				break;
			case 'Home':
				newIndex = 0;
				handled = true;
				break;
			case 'End':
				newIndex = totalDots - 1;
				handled = true;
				break;
		}

		if (handled) {
			e.preventDefault();
			// Focus the new indicator
			const newDot = this.indicatorButtons[newIndex];
			if (newDot) {
				// Update tabindex for roving tabindex pattern
				this.indicatorButtons[currentIndex].setAttribute('tabindex', '-1');
				newDot.setAttribute('tabindex', '0');
				newDot.focus();
				// Navigate to the slide
				this.goToSlide(newIndex, null);
			}
		}
	}

	/**
	 * Update slide indicators
	 * Optimized to only update active class instead of recreating DOM
	 */
	private updateIndicators(): void {
		const { indicators } = this.elements;
		if (!indicators) {
			return;
		}

		const totalSlides = this.elements.slides.length;

		// If slide count changed, recreate indicators
		if (this.indicatorButtons.length !== totalSlides || this.lastIndicatorCount !== totalSlides) {
			this.createIndicators();
			return;
		}

		// Otherwise, just update the active state
		this.updateIndicatorActiveState();
	}

	/**
	 * Update only the active class and ARIA attributes on indicator buttons
	 * Maintains roving tabindex pattern for keyboard accessibility
	 * This is much more efficient than recreating the DOM
	 */
	private updateIndicatorActiveState(): void {
		const { isCarouselMode } = this.config;
		const totalSlides = this.elements.slides.length;

		// Determine active index based on mode
		let activeIndex: number;
		if (isCarouselMode) {
			// For carousel mode, always use startIndex
			activeIndex = this.state.startIndex % totalSlides;
		} else {
			// For single slide mode, use the visible slide index
			activeIndex = this.getVisibleSlideIndex();
		}

		// Update classes and ARIA attributes without touching DOM structure
		this.indicatorButtons.forEach((dot, index) => {
			const isActive = index === activeIndex;
			
			// Update active class
			if (isActive) {
				if (!dot.classList.contains('active')) {
					dot.classList.add('active');
				}
			} else {
				dot.classList.remove('active');
			}
			
			// Update ARIA and tabindex for roving tabindex pattern
			dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
			dot.setAttribute('tabindex', isActive ? '0' : '-1');
		});
	}

	/**
	 * Update ARIA attributes for accessibility
	 */
	private updateAriaAttributes(): void {
		const { slides } = this.elements;
		const visibleIndex = this.getVisibleSlideIndex();

		slides.forEach((slide, index) => {
			const isVisible = index === visibleIndex;
			slide.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
			slide.setAttribute('tabindex', isVisible ? '0' : '-1');
		});
	}

	/**
	 * Get the 0-indexed position of the currently visible slide
	 * 
	 * This method converts from the internal clone-aware indexing system
	 * to a simple 0-indexed slide number for external use (indicators, ARIA, events).
	 * 
	 * For SLIDE effect in single-slide mode:
	 * - state.currentSlide uses 1-indexed system with clones at 0 and N+1
	 * - This converts: 0 → N-1 (last), 1-N → 0-(N-1), N+1 → 0 (first)
	 * 
	 * For FADE/ZOOM effects:
	 * - state.currentSlide is already 0-indexed (no clones)
	 * - Returns directly without conversion
	 * 
	 * For CAROUSEL mode:
	 * - Use state.startIndex instead (handled by caller)
	 * 
	 * @returns 0-indexed slide number (0 to slideCount-1)
	 */
	private getVisibleSlideIndex(): number {
		const { transitionEffect } = this.config;
		const slideCount = this.elements.slides.length;
		
		// Slide effect uses clone-aware 1-indexed system
		if (transitionEffect === 'slide' && slideCount > 1) {
			// currentSlide 0 = viewing last clone → actual last slide
			if (this.state.currentSlide === 0) {
				return slideCount - 1;
			}
			// currentSlide N+1 = viewing first clone → actual first slide
			if (this.state.currentSlide === slideCount + 1) {
				return 0;
			}
			// currentSlide 1-N → actual slide 0-(N-1)
			return this.state.currentSlide - 1;
		}
		
		// Fade/Zoom use direct 0-indexed system (no clones)
		return this.state.currentSlide;
	}

	/**
	 * Handle intersection observer
	 * @param entries
	 */
	private handleIntersection(entries: IntersectionObserverEntry[]): void {
		entries.forEach((entry) => {
			if (this.state.destroyed) {
				return;
			}
			if (entry.isIntersecting) {
				if (this.config.autoplay) {
					this.eventHandler.startAutoplay();
				}
			} else {
				this.eventHandler.stopAutoplay();
			}
		});
	}

	/**
	 * Dispatch slide change event
	 * @param fromActualIndex
	 * @param toActualIndex
	 */
	private dispatchSlideChangeEvent(
		fromActualIndex: number,
		toActualIndex: number
	): void {
		const event = new CustomEvent('sliderberg.slidechange', {
			bubbles: true,
			detail: {
				sliderId: this.id,
				from: fromActualIndex,
				to: toActualIndex,
			},
		});
		this.elements.wrapper.dispatchEvent(event);

		// Announce slide change to screen readers
		const totalSlides = this.elements.slides.length;
		const currentSlideNumber = this.config.isCarouselMode
			? (toActualIndex % totalSlides) + 1
			: this.getVisibleSlideIndex() + 1;
		this.announceSlideChange(currentSlideNumber, totalSlides);
	}

	/**
	 * Dispatch transition start event
	 * Called before a slide transition begins
	 * 
	 * @example
	 * slider.addEventListener('sliderberg.transitionstart', (e) => {
	 *   console.log('Transition starting', e.detail);
	 * });
	 */
	private dispatchTransitionStartEvent(
		fromIndex: number,
		toIndex: number,
		direction: 'next' | 'prev' | null
	): void {
		const event = new CustomEvent('sliderberg.transitionstart', {
			bubbles: true,
			detail: {
				sliderId: this.id,
				from: fromIndex,
				to: toIndex,
				direction,
			},
		});
		this.elements.wrapper.dispatchEvent(event);
	}

	/**
	 * Dispatch transition end event
	 * Called after a slide transition completes
	 * 
	 * @example
	 * slider.addEventListener('sliderberg.transitionend', (e) => {
	 *   console.log('Transition ended', e.detail);
	 * });
	 */
	private dispatchTransitionEndEvent(currentIndex: number): void {
		const event = new CustomEvent('sliderberg.transitionend', {
			bubbles: true,
			detail: {
				sliderId: this.id,
				currentIndex,
			},
		});
		this.elements.wrapper.dispatchEvent(event);
	}

	/**
	 * Dispatch initialization complete event
	 * Called after the slider is fully initialized
	 * 
	 * @example
	 * slider.addEventListener('sliderberg.init', (e) => {
	 *   console.log('Slider initialized', e.detail);
	 * });
	 */
	private dispatchInitEvent(): void {
		const event = new CustomEvent('sliderberg.init', {
			bubbles: true,
			detail: {
				sliderId: this.id,
				slideCount: this.elements.slides.length,
				config: {
					transitionEffect: this.config.transitionEffect,
					autoplay: this.config.autoplay,
					isCarouselMode: this.config.isCarouselMode,
				},
			},
		});
		this.elements.wrapper.dispatchEvent(event);
	}

	/**
	 * Dispatch destroy event
	 * Called before the slider is destroyed
	 * 
	 * @example
	 * slider.addEventListener('sliderberg.destroy', (e) => {
	 *   console.log('Slider destroying', e.detail);
	 * });
	 */
	private dispatchDestroyEvent(): void {
		const event = new CustomEvent('sliderberg.destroy', {
			bubbles: true,
			detail: {
				sliderId: this.id,
			},
		});
		this.elements.wrapper.dispatchEvent(event);
	}

	/**
	 * Destroy slider instance
	 */
	public destroy(): void {
		if (this.state.destroyed) {
			return;
		}

		// Dispatch destroy event before cleanup
		this.dispatchDestroyEvent();

		// Mark as destroyed immediately to prevent any further operations
		this.state.destroyed = true;

		// Cleanup handlers
		if (this.eventHandler) {
			this.eventHandler.cleanup();
		}
		if (this.animationHandler && this.animationHandler.cleanup) {
			this.animationHandler.cleanup();
		}

		// Remove from instances map
		SliderBergController.instances.delete(this.id);

		// Null out all references to break circular dependencies
		this.cleanupReferences();

		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log(
				`SliderBerg instance ${this.id} destroyed and cleaned.`
			);
		}
	}

	/**
	 * Cleanup all references to prevent memory leaks
	 */
	private cleanupReferences(): void {
		// Remove delegated indicator listeners before clearing references
		if (this.indicatorListenersAttached && this.elements?.indicators) {
			this.elements.indicators.removeEventListener('click', this.boundIndicatorClick);
			this.elements.indicators.removeEventListener('keydown', this.boundIndicatorKeydown);
			this.indicatorListenersAttached = false;
		}

		// Clear indicator buttons array
		this.indicatorButtons = [];
		this.lastIndicatorCount = 0;

		// Remove live region from DOM
		if (this.liveRegion && this.liveRegion.parentNode) {
			this.liveRegion.parentNode.removeChild(this.liveRegion);
		}
		this.liveRegion = null;

		// Null out all major references
		this.elements = null as any;
		this.config = null as any;
		this.state = null as any;
		this.animationHandler = null as any;
		this.eventHandler = null as any;
		this.boundHandleIntersection = null as any;
		this.boundIndicatorClick = null as any;
		this.boundIndicatorKeydown = null as any;
	}

	/**
	 * Get slider elements (for external access)
	 */
	public getElements(): SliderElements {
		return this.elements;
	}

	// =========================================================================
	// PUBLIC API - Methods for programmatic control
	// =========================================================================

	/**
	 * Navigate to a specific slide by index (0-based)
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * slider?.goTo(2); // Go to third slide
	 *
	 * @param index - 0-based slide index
	 */
	public goTo(index: number): void {
		if (this.state.destroyed) {
			return;
		}
		const maxIndex = this.elements.slides.length - 1;
		const validIndex = Math.max(0, Math.min(index, maxIndex));
		this.goToSlide(validIndex, null);
	}

	/**
	 * Navigate to the next slide
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * slider?.next();
	 */
	public next(): void {
		if (this.state.destroyed) {
			return;
		}
		this.nextSlide();
	}

	/**
	 * Navigate to the previous slide
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * slider?.prev();
	 */
	public prev(): void {
		if (this.state.destroyed) {
			return;
		}
		this.prevSlide();
	}

	/**
	 * Pause autoplay
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * slider?.pause();
	 */
	public pause(): void {
		if (this.state.destroyed) {
			return;
		}
		this.eventHandler.stopAutoplay();
	}

	/**
	 * Resume autoplay (if autoplay is enabled in config)
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * slider?.play();
	 */
	public play(): void {
		if (this.state.destroyed || !this.config.autoplay) {
			return;
		}
		this.eventHandler.startAutoplay();
	}

	/**
	 * Get the current slide index (0-based)
	 *
	 * @example
	 * const slider = SliderBerg.getInstance(element);
	 * console.log('Current slide:', slider?.getCurrentSlide());
	 *
	 * @returns Current visible slide index (0-based), or -1 if destroyed
	 */
	public getCurrentSlide(): number {
		if (this.state.destroyed) {
			return -1;
		}
		return this.getVisibleSlideIndex();
	}

	/**
	 * Get the total number of slides
	 *
	 * @returns Total slide count, or 0 if destroyed
	 */
	public getSlideCount(): number {
		if (this.state.destroyed) {
			return 0;
		}
		return this.elements.slides.length;
	}

	/**
	 * Check if autoplay is currently running
	 *
	 * @returns true if autoplay is active
	 */
	public isAutoplayRunning(): boolean {
		return this.state.autoplayInterval !== null;
	}

	/**
	 * Get the slider's unique ID
	 *
	 * @returns Slider instance ID
	 */
	public getId(): string {
		return this.id;
	}

	// =========================================================================
	// PRIVATE METHODS
	// =========================================================================

	private getResponsiveSettings(): {
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
	} {
		const viewportWidth = window.innerWidth;

		// Return cached settings if viewport width hasn't changed
		if (
			this.cachedResponsiveSettings !== null &&
			this.lastViewportWidth === viewportWidth
		) {
			return this.cachedResponsiveSettings;
		}

		// Update viewport width tracking
		this.lastViewportWidth = viewportWidth;

		const { config } = this;
		const mobileBreakpoint = config.breakpointMobile ?? BREAKPOINTS.MOBILE;
		const tabletBreakpoint = config.breakpointTablet ?? BREAKPOINTS.TABLET;

		let settings: {
			slidesToShow: number;
			slidesToScroll: number;
			slideSpacing: number;
		};

		// Mobile: < mobileBreakpoint
		if (viewportWidth < mobileBreakpoint) {
			settings = {
				slidesToShow: config.mobileSlidesToShow,
				slidesToScroll: config.mobileSlidesToScroll,
				slideSpacing: config.mobileSlideSpacing,
			};
		}
		// Tablet: mobileBreakpoint - tabletBreakpoint
		else if (
			viewportWidth >= mobileBreakpoint &&
			viewportWidth < tabletBreakpoint
		) {
			settings = {
				slidesToShow: config.tabletSlidesToShow,
				slidesToScroll: config.tabletSlidesToScroll,
				slideSpacing: config.tabletSlideSpacing,
			};
		}
		// Desktop: >= tabletBreakpoint
		else {
			settings = {
				slidesToShow: config.slidesToShow,
				slidesToScroll: config.slidesToScroll,
				slideSpacing: config.slideSpacing,
			};
		}

		// Cache the settings
		this.cachedResponsiveSettings = settings;
		return settings;
	}

	/**
	 * Invalidate the responsive settings cache
	 * Called when the viewport is resized
	 */
	private invalidateResponsiveCache(): void {
		this.cachedResponsiveSettings = null;
	}

	// Keep all utility methods as private
	// Legacy parse helpers removed (we now rely on data-config JSON)

	/**
	 * Handle resize events
	 */
	private handleResize(): void {
		if (this.state.destroyed) {
			return;
		}

		// Invalidate responsive settings cache on resize
		this.invalidateResponsiveCache();

		// Recalculate layout with new responsive settings
		if (this.config.isCarouselMode) {
			this.animationHandler.setupSliderLayout();
			this.updateIndicators();

			// Maintain current position but ensure it's valid
			const { slidesToShow } = this.getResponsiveSettings();
			const maxStartIndex = Math.max(
				0,
				this.elements.slides.length - slidesToShow
			);
			if (this.state.startIndex > maxStartIndex) {
				this.goToSlide(maxStartIndex, null);
			}
		}

		if (
			this.config.transitionEffect === 'fade' ||
			this.config.transitionEffect === 'zoom'
		) {
			this.animationHandler.updateContainerHeight();
		}
	}
}
