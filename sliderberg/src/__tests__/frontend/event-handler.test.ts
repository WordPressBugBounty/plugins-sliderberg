/**
 * Event Handler Tests
 * Tests for keyboard navigation, autoplay, and reduced motion support
 */

import { SliderConfig, SliderState, SliderElements } from '../../frontend/types';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  mockMatchMedia(false);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('EventHandler', () => {
  const createMockElements = (): SliderElements => {
    const wrapper = document.createElement('div');
    const container = document.createElement('div');
    const slidesContainer = document.createElement('div');
    const slide1 = document.createElement('div');
    const slide2 = document.createElement('div');
    const slide3 = document.createElement('div');
    
    slide1.className = 'sliderberg-slide';
    slide2.className = 'sliderberg-slide';
    slide3.className = 'sliderberg-slide';
    
    slidesContainer.appendChild(slide1);
    slidesContainer.appendChild(slide2);
    slidesContainer.appendChild(slide3);
    container.appendChild(slidesContainer);
    wrapper.appendChild(container);
    
    return {
      wrapper,
      container,
      slidesContainer,
      slides: [slide1, slide2, slide3] as HTMLElement[],
      prevButton: document.createElement('button'),
      nextButton: document.createElement('button'),
      indicators: document.createElement('div'),
    };
  };

  const createMockState = (): SliderState => ({
    currentSlide: 0,
    startIndex: 0,
    isAnimating: false,
    autoplayInterval: null,
    touchStartX: 0,
    touchStartY: 0,
    destroyed: false,
  });

  const createMockConfig = (overrides: Partial<SliderConfig> = {}): SliderConfig => ({
    transitionEffect: 'slide',
    transitionDuration: 500,
    transitionEasing: 'ease',
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    infiniteLoop: true,
    isCarouselMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    slideSpacing: 20,
    breakpointMobile: 768,
    breakpointTablet: 1024,
    tabletSlidesToShow: 2,
    tabletSlidesToScroll: 1,
    tabletSlideSpacing: 15,
    mobileSlidesToShow: 1,
    mobileSlidesToScroll: 1,
    mobileSlideSpacing: 10,
    ...overrides,
  });

  const createMockCallbacks = () => ({
    onSlideChange: jest.fn(),
    onNextSlide: jest.fn(),
    onPrevSlide: jest.fn(),
    onResize: jest.fn(),
  });

  describe('Autoplay', () => {
    it('should start autoplay when enabled', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      const state = createMockState();
      const config = createMockConfig({ autoplay: true, autoplaySpeed: 3000 });
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.setupAutoplay();
      
      // Should not call immediately
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
      
      // Advance time
      jest.advanceTimersByTime(3000);
      
      // Should call onNextSlide
      expect(callbacks.onNextSlide).toHaveBeenCalledTimes(1);
      
      handler.cleanup();
    });

    it('should not start autoplay when user prefers reduced motion', async () => {
      // Set reduced motion preference
      mockMatchMedia(true);
      
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      const state = createMockState();
      const config = createMockConfig({ autoplay: true, autoplaySpeed: 1000 });
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.setupAutoplay();
      
      // Advance time significantly
      jest.advanceTimersByTime(5000);
      
      // Should not call onNextSlide due to reduced motion
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
      
      handler.cleanup();
    });

    it('should stop autoplay on cleanup', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      const state = createMockState();
      const config = createMockConfig({ autoplay: true, autoplaySpeed: 1000 });
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.setupAutoplay();
      
      // Cleanup before interval fires
      handler.cleanup();
      
      // Advance time
      jest.advanceTimersByTime(2000);
      
      // Should not have called onNextSlide after cleanup
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
    });

    it('should not autoplay when disabled in config', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      const state = createMockState();
      const config = createMockConfig({ autoplay: false });
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.setupAutoplay();
      
      jest.advanceTimersByTime(10000);
      
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
      
      handler.cleanup();
    });

    it('should not autoplay with only one slide', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      // Remove slides to have only one
      elements.slides = [elements.slides[0]];
      
      const state = createMockState();
      const config = createMockConfig({ autoplay: true, autoplaySpeed: 1000 });
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.setupAutoplay();
      
      jest.advanceTimersByTime(5000);
      
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
      
      handler.cleanup();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onPrevSlide on ArrowLeft key when slider is focused', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      // Add wrapper to document so focus can work
      document.body.appendChild(elements.wrapper);
      
      const state = createMockState();
      const config = createMockConfig();
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.attachEventListeners();
      
      // Focus on an element within the slider (required for keyboard to work)
      elements.wrapper.setAttribute('tabindex', '0');
      elements.wrapper.focus();
      
      // Simulate ArrowLeft key press on wrapper (keyboard listener is on wrapper)
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      elements.wrapper.dispatchEvent(event);
      
      expect(callbacks.onPrevSlide).toHaveBeenCalled();
      
      handler.cleanup();
      document.body.removeChild(elements.wrapper);
    });

    it('should call onNextSlide on ArrowRight key when slider is focused', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      document.body.appendChild(elements.wrapper);
      
      const state = createMockState();
      const config = createMockConfig();
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.attachEventListeners();
      
      // Focus on an element within the slider
      elements.wrapper.setAttribute('tabindex', '0');
      elements.wrapper.focus();
      
      // Simulate ArrowRight key press on wrapper
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      elements.wrapper.dispatchEvent(event);
      
      expect(callbacks.onNextSlide).toHaveBeenCalled();
      
      handler.cleanup();
      document.body.removeChild(elements.wrapper);
    });

    it('should not navigate when slider is not focused', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      document.body.appendChild(elements.wrapper);
      
      const state = createMockState();
      const config = createMockConfig();
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.attachEventListeners();
      
      // Don't focus on slider - key press should be ignored
      // Event on wrapper but active element is outside
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      elements.wrapper.dispatchEvent(event);
      
      // Should not navigate when slider is not focused
      expect(callbacks.onNextSlide).not.toHaveBeenCalled();
      
      handler.cleanup();
      document.body.removeChild(elements.wrapper);
    });

    it('should call callback during animation (controller handles animation check)', async () => {
      // Note: EventHandler delegates the callback to the controller
      // The controller (SliderBergController.goToSlide) is responsible for 
      // checking isAnimating. EventHandler just passes through keyboard events.
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      document.body.appendChild(elements.wrapper);
      
      const state = createMockState();
      state.isAnimating = true; // Animation in progress
      const config = createMockConfig();
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.attachEventListeners();
      
      // Focus slider
      elements.wrapper.setAttribute('tabindex', '0');
      elements.wrapper.focus();
      
      // Simulate key press during animation on wrapper
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      elements.wrapper.dispatchEvent(event);
      
      // EventHandler WILL call the callback - animation check is controller's job
      expect(callbacks.onNextSlide).toHaveBeenCalled();
      
      handler.cleanup();
      document.body.removeChild(elements.wrapper);
    });
  });

  describe('Touch Navigation', () => {
    it('should reset touch state when animation is in progress', async () => {
      const { EventHandler } = await import('../../frontend/event-handler');
      
      const elements = createMockElements();
      const state = createMockState();
      state.isAnimating = true; // Animation in progress
      const config = createMockConfig();
      const callbacks = createMockCallbacks();
      
      const handler = new EventHandler(config, state, elements, callbacks);
      handler.attachEventListeners();
      
      // Simulate touch start during animation
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      elements.container.dispatchEvent(touchEvent);
      
      // Touch should be ignored/reset during animation
      expect(state.touchStartX).toBe(0);
      expect(state.touchStartY).toBe(0);
      
      handler.cleanup();
    });
  });
});

