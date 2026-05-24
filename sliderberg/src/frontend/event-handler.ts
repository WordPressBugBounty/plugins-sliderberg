/**
 * Event handler for SliderBerg
 * Manages all user interactions and events
 */

import { SliderConfig, SliderState, SliderElements } from './types';
import { debounce } from './utils';
import { TIMING } from './constants';

export class EventHandler {
	private config: SliderConfig;
	private state: SliderState;
	private elements: SliderElements;
	private onSlideChange: ( fromIndex: number, toIndex: number ) => void;
	private onNextSlide: () => void;
	private onPrevSlide: () => void;
	private onResize?: () => void;

	// Bound event handlers
	private boundHandleTouchStart!: ( e: TouchEvent ) => void;
	private boundHandleTouchMove!: ( e: TouchEvent ) => void;
	private boundHandleTouchEnd!: ( e: TouchEvent ) => void;
	private boundHandleKeyboard!: ( e: Event ) => void;
	private boundStopAutoplay!: () => void;
	private boundStartAutoplay!: () => void;
	private boundHandleResize!: ( () => void ) & { cancel: () => void };
	private boundHandleFocusIn!: () => void;
	private boundHandleFocusOut!: ( e: Event ) => void;

	constructor(
		config: SliderConfig,
		state: SliderState,
		elements: SliderElements,
		callbacks: {
			onSlideChange: ( fromIndex: number, toIndex: number ) => void;
			onNextSlide: () => void;
			onPrevSlide: () => void;
			onResize?: () => void;
		}
	) {
		this.config = config;
		this.state = state;
		this.elements = elements;
		this.onSlideChange = callbacks.onSlideChange;
		this.onNextSlide = callbacks.onNextSlide;
		this.onPrevSlide = callbacks.onPrevSlide;
		this.onResize = callbacks.onResize;

		this.initializeBoundHandlers();
	}

	/**
	 * Initialize all bound event handlers
	 */
	private initializeBoundHandlers(): void {
		this.boundHandleTouchStart = this.handleTouchStart.bind( this );
		this.boundHandleTouchMove = this.handleTouchMove.bind( this );
		this.boundHandleTouchEnd = this.handleTouchEnd.bind( this );
		this.boundHandleKeyboard = this.handleKeyboard.bind( this );
		this.boundStopAutoplay = this.stopAutoplay.bind( this );
		this.boundStartAutoplay = this.startAutoplay.bind( this );
		// Debounce resize handler to prevent DOM thrashing
		this.boundHandleResize = debounce(
			this.handleResize.bind( this ),
			TIMING.RESIZE_DEBOUNCE_MS
		);
		this.boundHandleFocusIn = this.handleFocusIn.bind( this );
		this.boundHandleFocusOut = this.handleFocusOut.bind( this );
	}

	/**
	 * Attach all event listeners
	 */
	attachEventListeners(): void {
		this.attachNavigationListeners();
		this.attachTouchListeners();
		this.attachKeyboardListeners();
		this.attachFocusListenersForAutoplay();
	}

	/**
	 * Attach navigation button listeners
	 */
	private attachNavigationListeners(): void {
		const { prevButton, nextButton } = this.elements;
		if ( prevButton ) {
			prevButton.addEventListener( 'click', this.onPrevSlide );
		}
		if ( nextButton ) {
			nextButton.addEventListener( 'click', this.onNextSlide );
		}
	}

	/**
	 * Attach touch/swipe listeners
	 */
	private attachTouchListeners(): void {
		const { container } = this.elements;
		container.addEventListener( 'touchstart', this.boundHandleTouchStart, {
			passive: true,
		} );
		container.addEventListener( 'touchmove', this.boundHandleTouchMove, {
			passive: true,
		} );
		container.addEventListener( 'touchend', this.boundHandleTouchEnd, {
			passive: true,
		} );
	}

	/**
	 * Attach keyboard navigation listeners
	 */
	private attachKeyboardListeners(): void {
		this.elements.wrapper.addEventListener(
			'keydown',
			this.boundHandleKeyboard
		);
	}

	/**
	 * Attach focus listeners for autoplay
	 */
	private attachFocusListenersForAutoplay(): void {
		this.elements.wrapper.addEventListener(
			'focusin',
			this.boundHandleFocusIn
		);
		this.elements.wrapper.addEventListener(
			'focusout',
			this.boundHandleFocusOut
		);
	}

	/**
	 * Handle touch start events
	 * 
	 * IMPORTANT: We reset touch coordinates when animation is in progress
	 * to prevent stale coordinates from triggering navigation if the
	 * animation completes mid-swipe.
	 * 
	 * @param e
	 */
	private handleTouchStart( e: TouchEvent ): void {
		if ( this.state.destroyed ) {
			return;
		}
		
		// Reset touch coordinates if animation is in progress
		// This prevents stale values from causing unexpected navigation
		if ( this.state.isAnimating ) {
			this.state.touchStartX = 0;
			this.state.touchStartY = 0;
			return;
		}
		
		if ( e.touches.length === 0 ) {
			return;
		}
		this.state.touchStartX = e.touches[ 0 ].clientX;
		this.state.touchStartY = e.touches[ 0 ].clientY;
	}

	/**
	 * Handle touch move events
	 */
	private handleTouchMove(): void {
		// Logic is primarily in handleTouchEnd for basic swipe
	}

	/**
	 * Handle touch end events
	 * 
	 * Calculates swipe direction and triggers navigation if threshold is met.
	 * Skips navigation if touch coordinates were reset (due to animation starting
	 * during the touch) to prevent unexpected behavior.
	 * 
	 * @param e
	 */
	private handleTouchEnd( e: TouchEvent ): void {
		if ( this.state.isAnimating || this.state.destroyed ) {
			return;
		}
		if ( e.changedTouches.length === 0 ) {
			return;
		}

		// Don't handle swipe if there's only one slide
		if ( this.elements.slides.length <= 1 ) {
			return;
		}

		// Skip if touch coordinates were reset (touch started during animation)
		// This prevents unexpected navigation from stale coordinates
		if ( this.state.touchStartX === 0 && this.state.touchStartY === 0 ) {
			return;
		}

		const touchEndX = e.changedTouches[ 0 ].clientX;
		const touchEndY = e.changedTouches[ 0 ].clientY;
		const diffX = this.state.touchStartX - touchEndX;
		const diffY = this.state.touchStartY - touchEndY;

		if (
			Math.abs( diffX ) > Math.abs( diffY ) &&
			Math.abs( diffX ) > this.state.swipeThreshold
		) {
			if ( diffX > 0 ) {
				this.onNextSlide();
			} else {
				this.onPrevSlide();
			}
		}

		// Reset touch coordinates after handling
		this.state.touchStartX = 0;
		this.state.touchStartY = 0;
	}

	/**
	 * Handle keyboard navigation
	 * @param e
	 */
	private handleKeyboard( e: Event ): void {
		if ( this.state.destroyed ) {
			return;
		}
		const keyboardEvent = e as KeyboardEvent;
		const doc = this.elements.wrapper.ownerDocument || document;
		const activeElement = doc.activeElement;

		// Only process if slider or its children have focus
		if ( ! this.elements.wrapper.contains( activeElement ) ) {
			return;
		}

		// Don't handle keyboard navigation if there's only one slide
		if ( this.elements.slides.length <= 1 ) {
			return;
		}

		switch ( keyboardEvent.key ) {
			case 'ArrowLeft':
				this.onPrevSlide();
				e.preventDefault();
				break;
			case 'ArrowRight':
				this.onNextSlide();
				e.preventDefault();
				break;
		}
	}

	/**
	 * Handle focus in events
	 */
	private handleFocusIn(): void {
		if ( this.config.pauseOnHover ) {
			this.stopAutoplay();
		}
	}

	/**
	 * Handle focus out events
	 * @param e
	 */
	private handleFocusOut( e: Event ): void {
		if (
			this.config.pauseOnHover &&
			! this.elements.wrapper.contains(
				( e as FocusEvent ).relatedTarget as Node | null
			)
		) {
			this.startAutoplay();
		}
	}

	/**
	 * Handle resize events
	 */
	private handleResize(): void {
		if ( this.state.destroyed ) {
			return;
		}

		// Call parent resize handler if provided
		if ( this.onResize ) {
			this.onResize();
		}

		if (
			this.config.transitionEffect === 'slide' &&
			! this.config.isCarouselMode
		) {
			const { container } = this.elements;
			// No transition during resize adjustment
			const originalTransition = container.style.transition;
			container.style.transition = 'none';
			container.style.transform = `translateX(-${
				this.state.currentSlide * 100
			}%)`;
			// Force reflow
			// eslint-disable-next-line no-unused-expressions
			container.offsetHeight;
			container.style.transition = originalTransition;
		}
	}

	/**
	 * Setup autoplay functionality
	 */
	setupAutoplay(): void {
		if ( ! this.config.autoplay || this.elements.slides.length <= 1 ) {
			return;
		}
		this.startAutoplay(); // Start initial autoplay
		if ( this.config.pauseOnHover ) {
			const { container } = this.elements;
			container.addEventListener( 'mouseenter', this.boundStopAutoplay );
			container.addEventListener( 'mouseleave', this.boundStartAutoplay );
			// Also pause on touch interactions if desired
			container.addEventListener( 'touchstart', this.boundStopAutoplay, {
				passive: true,
			} );
			container.addEventListener( 'touchend', this.boundStartAutoplay, {
				passive: true,
			} );
		}
	}

	/**
	 * Check if user prefers reduced motion
	 * When true, autoplay should be disabled to respect user preference
	 */
	private prefersReducedMotion(): boolean {
		return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	}

	/**
	 * Start autoplay
	 * Respects user preference for reduced motion (disables autoplay)
	 */
	startAutoplay(): void {
		if (
			! this.config.autoplay ||
			this.state.autoplayInterval ||
			this.state.destroyed ||
			this.elements.slides.length <= 1
		) {
			return;
		}
		
		// Respect reduced motion preference - don't autoplay
		if ( this.prefersReducedMotion() ) {
			return;
		}
		
		this.state.autoplayInterval = window.setInterval( () => {
			if ( ! this.state.isAnimating && ! this.state.destroyed ) {
				this.onNextSlide();
			}
		}, this.config.autoplaySpeed );
	}

	/**
	 * Stop autoplay
	 */
	stopAutoplay(): void {
		if ( this.state.autoplayInterval ) {
			clearInterval( this.state.autoplayInterval );
			this.state.autoplayInterval = null;
		}
	}

	/**
	 * Setup intersection and resize observers
	 * @param boundHandleIntersection
	 */
	setupObservers(
		boundHandleIntersection: IntersectionObserverCallback
	): void {
		if ( 'ResizeObserver' in window ) {
			this.state.observer = new ResizeObserver( this.boundHandleResize );
			this.state.observer.observe( this.elements.wrapper );
			if (
				this.config.transitionEffect === 'fade' ||
				this.config.transitionEffect === 'zoom'
			) {
				this.elements.slides.forEach(
					( slide ) => this.state.observer?.observe( slide )
				);
			}
		}
		if ( 'IntersectionObserver' in window ) {
			this.state.intersectionObserver = new IntersectionObserver(
				boundHandleIntersection,
				{ threshold: 0.1 }
			);
			this.state.intersectionObserver.observe( this.elements.wrapper );
		}
	}

	/**
	 * Cleanup all event listeners
	 */
	cleanup(): void {
		// Stop all ongoing operations
		this.stopAutoplay();

		// Cancel debounced resize handler
		if ( this.boundHandleResize?.cancel ) {
			this.boundHandleResize.cancel();
		}

		// Cleanup observers with error handling
		this.cleanupObservers();

		// Remove all event listeners
		this.cleanupEventListeners();

		// Null out all references to prevent memory leaks
		this.cleanupReferences();
	}

	/**
	 * Cleanup observers safely
	 */
	private cleanupObservers(): void {
		if ( this.state.observer ) {
			try {
				this.state.observer.disconnect();
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn( 'Observer cleanup error:', e );
			}
			this.state.observer = null;
		}

		if ( this.state.intersectionObserver ) {
			try {
				this.state.intersectionObserver.disconnect();
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn( 'Intersection observer cleanup error:', e );
			}
			this.state.intersectionObserver = null;
		}
	}

	/**
	 * Remove all event listeners safely
	 */
	private cleanupEventListeners(): void {
		const { container, prevButton, nextButton, wrapper, indicators } =
			this.elements;

		// Remove container listeners with existence check
		if ( container && container.parentNode ) {
			container.removeEventListener(
				'touchstart',
				this.boundHandleTouchStart
			);
			container.removeEventListener(
				'touchmove',
				this.boundHandleTouchMove
			);
			container.removeEventListener(
				'touchend',
				this.boundHandleTouchEnd
			);

			if ( this.config.pauseOnHover ) {
				container.removeEventListener(
					'mouseenter',
					this.boundStopAutoplay
				);
				container.removeEventListener(
					'mouseleave',
					this.boundStartAutoplay
				);
				container.removeEventListener(
					'touchstart',
					this.boundStopAutoplay
				);
				container.removeEventListener(
					'touchend',
					this.boundStartAutoplay
				);
			}
		}

		// Remove navigation listeners
		if ( prevButton && prevButton.parentNode ) {
			prevButton.removeEventListener( 'click', this.onPrevSlide );
		}
		if ( nextButton && nextButton.parentNode ) {
			nextButton.removeEventListener( 'click', this.onNextSlide );
		}

		// Remove wrapper listeners
		if ( wrapper && wrapper.parentNode ) {
			wrapper.removeEventListener( 'keydown', this.boundHandleKeyboard );
			wrapper.removeEventListener( 'focusin', this.boundHandleFocusIn );
			wrapper.removeEventListener( 'focusout', this.boundHandleFocusOut );
		}

		// Clean indicators more aggressively
		if ( indicators ) {
			// Clear innerHTML first to remove all child elements
			indicators.innerHTML = '';
		}
	}

	/**
	 * Null out all references to break circular dependencies
	 */
	private cleanupReferences(): void {
		// Null out all bound handlers
		this.boundHandleTouchStart = null as any;
		this.boundHandleTouchMove = null as any;
		this.boundHandleTouchEnd = null as any;
		this.boundHandleKeyboard = null as any;
		this.boundStopAutoplay = null as any;
		this.boundStartAutoplay = null as any;
		this.boundHandleResize = null as any;
		this.boundHandleFocusIn = null as any;
		this.boundHandleFocusOut = null as any;

		// Clear callback references
		this.onSlideChange = null as any;
		this.onNextSlide = null as any;
		this.onPrevSlide = null as any;
		this.onResize = null as any;
	}

	/**
	 * Get bound handlers for external use
	 */
	getBoundHandlers() {
		return {
			handleResize: this.boundHandleResize,
			startAutoplay: this.boundStartAutoplay,
			stopAutoplay: this.boundStopAutoplay,
		};
	}
}
