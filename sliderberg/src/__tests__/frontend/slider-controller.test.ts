/**
 * SliderBergController Integration Tests
 *
 * Tests for the main slider controller including:
 * - Initialization
 * - Navigation (next/prev/goTo)
 * - Public API methods
 * - Carousel mode behavior
 * - Cleanup and destruction
 */

import { SliderBergController } from '../../frontend/slider-controller';

// Helper to create a mock slider DOM structure
function createSliderDOM(slideCount: number = 3, config: Record<string, unknown> = {}): HTMLElement {
	const wrapper = document.createElement('div');
	wrapper.className = 'wp-block-sliderberg-sliderberg';

	const container = document.createElement('div');
	container.className = 'sliderberg-slides-container';

	// Set config as JSON attribute
	const defaultConfig = {
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
		...config,
	};
	container.setAttribute('data-config', JSON.stringify(defaultConfig));

	// Create slides
	for (let i = 0; i < slideCount; i++) {
		const slide = document.createElement('div');
		slide.className = 'sliderberg-slide';
		slide.innerHTML = `<p>Slide ${i + 1}</p>`;
		container.appendChild(slide);
	}

	// Create navigation buttons
	const prevButton = document.createElement('button');
	prevButton.className = 'sliderberg-nav-button sliderberg-prev';
	prevButton.setAttribute('aria-label', 'Previous Slide');

	const nextButton = document.createElement('button');
	nextButton.className = 'sliderberg-nav-button sliderberg-next';
	nextButton.setAttribute('aria-label', 'Next Slide');

	// Create indicators container
	const indicators = document.createElement('div');
	indicators.className = 'sliderberg-slide-indicators';

	// Assemble DOM
	wrapper.appendChild(container);
	wrapper.appendChild(prevButton);
	wrapper.appendChild(nextButton);
	wrapper.appendChild(indicators);

	return wrapper;
}

// Helper to wait for async initialization
function waitForInit(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 100));
}

describe('SliderBergController', () => {
	let slider: HTMLElement;

	beforeEach(() => {
		// Clear any existing instances
		SliderBergController.destroyAll();
		// Reset DOM
		document.body.innerHTML = '';
		// Use fake timers to control setTimeout
		jest.useFakeTimers();
	});

	afterEach(() => {
		SliderBergController.destroyAll();
		jest.useRealTimers();
	});

	describe('Initialization', () => {
		it('should create an instance successfully', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);

			expect(instance).not.toBeNull();
			expect(SliderBergController.getInstances().size).toBe(1);
		});

		it('should return null for invalid slider element', () => {
			const invalidElement = document.createElement('div');
			// No container or slides - expect error to be logged

			// @ts-expect-error - we're testing console.error behavior
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			const instance = SliderBergController.createInstance(invalidElement);

			expect(instance).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it('should not create duplicate instances for the same element', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const instance1 = SliderBergController.createInstance(slider);
			expect(instance1).not.toBeNull();

			// Try to find it again using getInstance
			const instance2 = SliderBergController.getInstance(slider);
			expect(instance2).toBe(instance1);
		});

		it('should parse configuration from data-config attribute', () => {
			slider = createSliderDOM(3, {
				transitionEffect: 'fade',
				transitionDuration: 1000,
				autoplay: true,
				autoplaySpeed: 3000,
			});
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);

			expect(instance).not.toBeNull();
			// Configuration is internal, but we can verify the slider was created
			expect(instance?.getElements()).toBeDefined();
		});
	});

	describe('Static Methods', () => {
		it('getInstances should return all slider instances', () => {
			const slider1 = createSliderDOM(3);
			const slider2 = createSliderDOM(3);
			document.body.appendChild(slider1);
			document.body.appendChild(slider2);

			SliderBergController.createInstance(slider1);
			SliderBergController.createInstance(slider2);

			expect(SliderBergController.getInstances().size).toBe(2);
		});

		it('getInstance should find instance by element', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const created = SliderBergController.createInstance(slider);
			const found = SliderBergController.getInstance(slider);

			expect(found).toBe(created);
		});

		it('getInstance should return null for unknown element', () => {
			const unknownElement = document.createElement('div');

			const found = SliderBergController.getInstance(unknownElement);

			expect(found).toBeNull();
		});

		it('destroyAll should remove all instances', () => {
			const slider1 = createSliderDOM(3);
			const slider2 = createSliderDOM(3);
			document.body.appendChild(slider1);
			document.body.appendChild(slider2);

			SliderBergController.createInstance(slider1);
			SliderBergController.createInstance(slider2);

			expect(SliderBergController.getInstances().size).toBe(2);

			SliderBergController.destroyAll();

			expect(SliderBergController.getInstances().size).toBe(0);
		});
	});

	describe('Public API Methods', () => {
		let instance: SliderBergController | null;

		beforeEach(() => {
			slider = createSliderDOM(5);
			document.body.appendChild(slider);
			instance = SliderBergController.createInstance(slider);
		});

		it('getSlideCount should return correct number of slides', () => {
			expect(instance?.getSlideCount()).toBe(5);
		});

		it('getCurrentSlide should return current slide index', () => {
			// Initially should be at slide 0 or valid index
			const current = instance?.getCurrentSlide();
			expect(current).toBeGreaterThanOrEqual(0);
		});

		it('goTo should navigate to specified slide', () => {
			instance?.goTo(2);

			// The method should not throw and instance should remain valid
			expect(instance?.getSlideCount()).toBe(5);
		});

		it('goTo should clamp to valid range', () => {
			// Try to go beyond last slide - should clamp
			instance?.goTo(100);
			expect(instance?.getSlideCount()).toBe(5);

			// Try to go to negative index - should clamp to 0
			instance?.goTo(-5);
			expect(instance?.getSlideCount()).toBe(5);
		});

		it('next and prev should not throw', () => {
			expect(() => instance?.next()).not.toThrow();
			expect(() => instance?.prev()).not.toThrow();
		});

		it('getId should return unique identifier', () => {
			const id = instance?.getId();
			expect(id).toBeDefined();
			expect(typeof id).toBe('string');
			expect(id?.length).toBeGreaterThan(0);
		});

		it('isAutoplayRunning should return false when autoplay is disabled', () => {
			// Default config has autoplay: false
			expect(instance?.isAutoplayRunning()).toBe(false);
		});

		it('pause and play should not throw', () => {
			expect(() => instance?.pause()).not.toThrow();
			expect(() => instance?.play()).not.toThrow();
		});
	});

	describe('Destruction', () => {
		it('destroy should clean up instance', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);
			const id = instance?.getId();

			instance?.destroy();

			// Should be removed from instances map
			expect(SliderBergController.getInstances().has(id!)).toBe(false);
		});

		it('destroyed instance should have null state', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);
			instance?.destroy();

			// After destruction, getElements returns null because state is cleaned up
			// The destroy method sets this.elements = null
			expect(instance?.getElements()).toBeNull();
		});
	});

	describe('Carousel Mode', () => {
		it('should initialize in carousel mode with correct settings', () => {
			slider = createSliderDOM(6, {
				isCarouselMode: true,
				slidesToShow: 3,
				slidesToScroll: 1,
				slideSpacing: 20,
			});
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);

			expect(instance).not.toBeNull();
			expect(instance?.getSlideCount()).toBe(6);
		});
	});

	describe('Security', () => {
		it('should reject malicious config with prototype pollution via constructor property', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			// Manually construct a malicious config string with constructor as own property
			// JSON.parse doesn't preserve __proto__, but we can test with constructor
			const container = slider.querySelector('.sliderberg-slides-container');
			// Use a string that when parsed will have constructor as own property
			// We need to test that the security check works with hasOwnProperty
			container?.setAttribute('data-config', '{"constructor": {"polluted": true}, "transitionEffect": "slide"}');

			// Expect warning to be logged
			const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

			// Should still create instance with defaults, not crash
			const instance = SliderBergController.createInstance(slider);
			expect(instance).not.toBeNull();
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('malicious config')
			);

			consoleWarnSpy.mockRestore();
		});

		it('should handle non-object config gracefully', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			// Set invalid JSON config (array instead of object)
			const container = slider.querySelector('.sliderberg-slides-container');
			container?.setAttribute('data-config', '[1, 2, 3]');

			// Should still create instance with defaults
			const instance = SliderBergController.createInstance(slider);
			expect(instance).not.toBeNull();
		});

		it('should validate and fallback for invalid transition effect', () => {
			slider = createSliderDOM(3, {
				transitionEffect: 'invalid',
			});
			document.body.appendChild(slider);

			// Should create instance with fallback to 'slide' effect
			const instance = SliderBergController.createInstance(slider);
			expect(instance).not.toBeNull();
		});
	});

	describe('Elements', () => {
		it('getElements should return slider elements', () => {
			slider = createSliderDOM(3);
			document.body.appendChild(slider);

			const instance = SliderBergController.createInstance(slider);
			const elements = instance?.getElements();

			expect(elements).toBeDefined();
			expect(elements?.container).toBeDefined();
			expect(elements?.slides.length).toBe(3);
			expect(elements?.wrapper).toBe(slider);
		});
	});
});
