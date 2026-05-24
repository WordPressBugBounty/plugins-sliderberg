/**
 * SliderBerg Frontend Entry Point - Rewritten
 *
 * Clean, modern initialization code for frontend sliders
 * Uses modular controller architecture with separate animation and event handlers
 *
 * Features:
 * - Automatic slider detection and initialization
 * - Pro plugin extensibility via WordPress hooks
 * - AJAX content compatibility
 * - jQuery integration for legacy themes
 * - Proper cleanup on page unload
 *
 * @since 1.0.0 Original implementation
 * @since 2.0.0 Rewritten with modular architecture, improved initialization
 */

import { SliderBergController } from './frontend/slider-controller';
import {
	EffectRegistry,
	BaseEffect,
	type Effect,
	type EffectConstructor,
	type Direction,
} from './frontend/animation-handler';

// Global type declarations
declare const jQuery: any;
declare global {
	interface Window {
		SliderBerg: {
			/** Initialize all sliders on the page */
			init: () => void;
			/** Destroy all slider instances */
			destroyAll: () => void;
			/** Get a slider instance by its DOM element */
			getInstance: (element: Element) => SliderBergController | null;
			/** Get all slider instances */
			getInstances: () => Map<string, SliderBergController>;

			// Convenience methods (operate on element directly)
			/** Navigate to a specific slide */
			goTo: (element: Element, index: number) => void;
			/** Navigate to next slide */
			next: (element: Element) => void;
			/** Navigate to previous slide */
			prev: (element: Element) => void;
			/** Pause autoplay */
			pause: (element: Element) => void;
			/** Resume autoplay */
			play: (element: Element) => void;

			/** Effect registry for custom transition effects */
			EffectRegistry: typeof EffectRegistry;
			/** Base class for creating custom effects */
			BaseEffect: typeof BaseEffect;
		};
		wp?: {
			hooks?: {
				applyFilters: (
					filter: string,
					value: any,
					...args: any[]
				) => any;
			};
		};
	}
}

// Export types for TypeScript consumers
export type { Effect, EffectConstructor, Direction };
export { EffectRegistry, BaseEffect };

/**
 * Initialize all SliderBerg sliders on the page
 */
function initializeSliders(): void {
	const sliders: NodeListOf< Element > = document.querySelectorAll(
		'.wp-block-sliderberg-sliderberg'
	);

	if ( ! sliders.length ) {
		return;
	}

	// Allow pro features to extend initialization (only if wp.hooks is available)
	if ( window.wp?.hooks?.applyFilters ) {
		const customInit = window.wp.hooks.applyFilters(
			'sliderberg.frontendInit',
			null,
			sliders
		);

		if ( customInit && typeof customInit === 'function' ) {
			customInit( sliders );
			return;
		}
	}

	sliders.forEach( ( slider: Element ) => {
		// Check if already initialized
		let alreadyInitialized = false;
		SliderBergController.getInstances().forEach( ( instance ) => {
			if ( instance.getElements().wrapper === slider ) {
				alreadyInitialized = true;
			}
		} );

		if ( ! alreadyInitialized ) {
			// Allow pro features to modify slider initialization (only if wp.hooks is available)
			let shouldInit = true;
			if ( window.wp?.hooks?.applyFilters ) {
				shouldInit = window.wp.hooks.applyFilters(
					'sliderberg.beforeSliderInit',
					true,
					slider
				);
			}

			if ( shouldInit ) {
				SliderBergController.createInstance( slider );
			}
		}
	} );
}

// Keep all your existing initialization and event handling code
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		setTimeout( initializeSliders, 50 )
	);
} else {
	setTimeout( initializeSliders, 50 );
}

// Keep all existing event listeners and cleanup
window.addEventListener( 'beforeunload', () => {
	SliderBergController.destroyAll();
} );

// Keep existing jQuery integration and content-updated listeners
document.addEventListener( 'DOMContentLoaded', function () {
	if ( typeof jQuery !== 'undefined' ) {
		jQuery( document ).on(
			'ajaxComplete',
			function ( event: any, xhr: any, settings: any ) {
				// Simple check if the response might contain new blocks
				if (
					settings.data &&
					typeof settings.data === 'string' &&
					settings.data.includes( 'action=load-more' )
				) {
					// Example condition
					setTimeout( initializeSliders, 150 ); // Give a bit more time for content to render
				} else if (
					xhr.responseText &&
					xhr.responseText.includes(
						'wp-block-sliderberg-sliderberg'
					)
				) {
					setTimeout( initializeSliders, 150 );
				}
			}
		);
	}
	document.addEventListener( 'content-updated', () =>
		setTimeout( initializeSliders, 150 )
	); // For custom theme events
} );

/**
 * Public API exposed on window.SliderBerg
 *
 * @example
 * // Initialize all sliders
 * SliderBerg.init();
 *
 * // Get instance and control it
 * const element = document.querySelector('.wp-block-sliderberg-sliderberg');
 * const slider = SliderBerg.getInstance(element);
 * slider?.next();
 * slider?.goTo(2);
 * slider?.pause();
 *
 * // Or use convenience methods directly
 * SliderBerg.next(element);
 * SliderBerg.goTo(element, 2);
 * SliderBerg.pause(element);
 *
 * // Register a custom effect
 * class MyEffect extends SliderBerg.BaseEffect {
 *   setupLayout() { ... }
 *   gotoSlide(index, direction) { ... }
 * }
 * SliderBerg.EffectRegistry.register('myEffect', MyEffect);
 */
window.SliderBerg = {
	// Initialization
	init: initializeSliders,
	destroyAll: SliderBergController.destroyAll,

	// Instance access
	getInstance: SliderBergController.getInstance,
	getInstances: () => SliderBergController.getInstances(),

	// Convenience methods (operate on element directly)
	goTo: ( element: Element, index: number ) => {
		SliderBergController.getInstance( element )?.goTo( index );
	},
	next: ( element: Element ) => {
		SliderBergController.getInstance( element )?.next();
	},
	prev: ( element: Element ) => {
		SliderBergController.getInstance( element )?.prev();
	},
	pause: ( element: Element ) => {
		SliderBergController.getInstance( element )?.pause();
	},
	play: ( element: Element ) => {
		SliderBergController.getInstance( element )?.play();
	},

	// Extensibility
	EffectRegistry,
	BaseEffect,
};
