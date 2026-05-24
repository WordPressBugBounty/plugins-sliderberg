/**
 * Animation Handler Tests
 * Tests for BaseEffect and animation effects
 */

import { SliderConfig, SliderState, SliderElements } from '../../frontend/types';

// Mock matchMedia for reduced motion tests
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

// Reset matchMedia mock before importing modules
beforeEach(() => {
  jest.resetModules();
  mockMatchMedia(false);
});

describe('Animation Handler', () => {
  describe('Reduced Motion Support', () => {
    it('should detect when user prefers reduced motion', async () => {
      mockMatchMedia(true);
      
      // Re-import to get fresh module with new matchMedia
      const { BaseEffect } = await import('../../frontend/animation-handler');
      
      // Access through public method by creating a concrete implementation
      class TestEffect extends BaseEffect {
        setupLayout(): void {}
        gotoSlide(): void {}
        getTransitionStringPublic(): string {
          return this.getTransitionString();
        }
      }
      
      const config: SliderConfig = {
        transitionEffect: 'slide',
        transitionDuration: 500,
        transitionEasing: 'ease',
        autoplay: false,
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
      };
      
      const state: SliderState = {
        currentSlide: 0,
        startIndex: 0,
        isAnimating: false,
        autoplayInterval: null,
        touchStartX: 0,
        touchStartY: 0,
        destroyed: false,
      };
      
      const elements: SliderElements = {
        wrapper: document.createElement('div'),
        container: document.createElement('div'),
        slidesContainer: document.createElement('div'),
        slides: [],
        prevButton: null,
        nextButton: null,
        indicators: null,
      };
      
      const effect = new TestEffect(config, state, elements);
      const transitionString = effect.getTransitionStringPublic();
      
      // When reduced motion is preferred, transition should be instant
      expect(transitionString).toBe('0ms linear');
    });

    it('should use configured transition when user does not prefer reduced motion', async () => {
      mockMatchMedia(false);
      
      const { BaseEffect } = await import('../../frontend/animation-handler');
      
      class TestEffect extends BaseEffect {
        setupLayout(): void {}
        gotoSlide(): void {}
        getTransitionStringPublic(): string {
          return this.getTransitionString();
        }
      }
      
      const config: SliderConfig = {
        transitionEffect: 'slide',
        transitionDuration: 500,
        transitionEasing: 'ease-in-out',
        autoplay: false,
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
      };
      
      const state: SliderState = {
        currentSlide: 0,
        startIndex: 0,
        isAnimating: false,
        autoplayInterval: null,
        touchStartX: 0,
        touchStartY: 0,
        destroyed: false,
      };
      
      const elements: SliderElements = {
        wrapper: document.createElement('div'),
        container: document.createElement('div'),
        slidesContainer: document.createElement('div'),
        slides: [],
        prevButton: null,
        nextButton: null,
        indicators: null,
      };
      
      const effect = new TestEffect(config, state, elements);
      const transitionString = effect.getTransitionStringPublic();
      
      // When reduced motion is not preferred, use configured values
      expect(transitionString).toBe('500ms ease-in-out');
    });
  });

  describe('Responsive Settings', () => {
    it('should use mobile settings for small viewport', async () => {
      mockMatchMedia(false);
      
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500, // Mobile viewport
      });
      
      const { BaseEffect } = await import('../../frontend/animation-handler');
      
      class TestEffect extends BaseEffect {
        setupLayout(): void {}
        gotoSlide(): void {}
        getResponsiveSettingsPublic() {
          return this.getResponsiveSettings();
        }
      }
      
      const config: SliderConfig = {
        transitionEffect: 'slide',
        transitionDuration: 500,
        transitionEasing: 'ease',
        autoplay: false,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        infiniteLoop: true,
        isCarouselMode: true,
        slidesToShow: 4,
        slidesToScroll: 2,
        slideSpacing: 30,
        breakpointMobile: 768,
        breakpointTablet: 1024,
        tabletSlidesToShow: 2,
        tabletSlidesToScroll: 1,
        tabletSlideSpacing: 20,
        mobileSlidesToShow: 1,
        mobileSlidesToScroll: 1,
        mobileSlideSpacing: 10,
      };
      
      const state: SliderState = {
        currentSlide: 0,
        startIndex: 0,
        isAnimating: false,
        autoplayInterval: null,
        touchStartX: 0,
        touchStartY: 0,
        destroyed: false,
      };
      
      const elements: SliderElements = {
        wrapper: document.createElement('div'),
        container: document.createElement('div'),
        slidesContainer: document.createElement('div'),
        slides: [],
        prevButton: null,
        nextButton: null,
        indicators: null,
      };
      
      const effect = new TestEffect(config, state, elements);
      const settings = effect.getResponsiveSettingsPublic();
      
      // Should use mobile settings
      expect(settings.slidesToShow).toBe(1);
      expect(settings.slidesToScroll).toBe(1);
      expect(settings.slideSpacing).toBe(10);
    });

    it('should use tablet settings for medium viewport', async () => {
      mockMatchMedia(false);
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 900, // Tablet viewport
      });
      
      const { BaseEffect } = await import('../../frontend/animation-handler');
      
      class TestEffect extends BaseEffect {
        setupLayout(): void {}
        gotoSlide(): void {}
        getResponsiveSettingsPublic() {
          return this.getResponsiveSettings();
        }
      }
      
      const config: SliderConfig = {
        transitionEffect: 'slide',
        transitionDuration: 500,
        transitionEasing: 'ease',
        autoplay: false,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        infiniteLoop: true,
        isCarouselMode: true,
        slidesToShow: 4,
        slidesToScroll: 2,
        slideSpacing: 30,
        breakpointMobile: 768,
        breakpointTablet: 1024,
        tabletSlidesToShow: 2,
        tabletSlidesToScroll: 1,
        tabletSlideSpacing: 20,
        mobileSlidesToShow: 1,
        mobileSlidesToScroll: 1,
        mobileSlideSpacing: 10,
      };
      
      const state: SliderState = {
        currentSlide: 0,
        startIndex: 0,
        isAnimating: false,
        autoplayInterval: null,
        touchStartX: 0,
        touchStartY: 0,
        destroyed: false,
      };
      
      const elements: SliderElements = {
        wrapper: document.createElement('div'),
        container: document.createElement('div'),
        slidesContainer: document.createElement('div'),
        slides: [],
        prevButton: null,
        nextButton: null,
        indicators: null,
      };
      
      const effect = new TestEffect(config, state, elements);
      const settings = effect.getResponsiveSettingsPublic();
      
      // Should use tablet settings
      expect(settings.slidesToShow).toBe(2);
      expect(settings.slidesToScroll).toBe(1);
      expect(settings.slideSpacing).toBe(20);
    });

    it('should use desktop settings for large viewport', async () => {
      mockMatchMedia(false);
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200, // Desktop viewport
      });
      
      const { BaseEffect } = await import('../../frontend/animation-handler');
      
      class TestEffect extends BaseEffect {
        setupLayout(): void {}
        gotoSlide(): void {}
        getResponsiveSettingsPublic() {
          return this.getResponsiveSettings();
        }
      }
      
      const config: SliderConfig = {
        transitionEffect: 'slide',
        transitionDuration: 500,
        transitionEasing: 'ease',
        autoplay: false,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        infiniteLoop: true,
        isCarouselMode: true,
        slidesToShow: 4,
        slidesToScroll: 2,
        slideSpacing: 30,
        breakpointMobile: 768,
        breakpointTablet: 1024,
        tabletSlidesToShow: 2,
        tabletSlidesToScroll: 1,
        tabletSlideSpacing: 20,
        mobileSlidesToShow: 1,
        mobileSlidesToScroll: 1,
        mobileSlideSpacing: 10,
      };
      
      const state: SliderState = {
        currentSlide: 0,
        startIndex: 0,
        isAnimating: false,
        autoplayInterval: null,
        touchStartX: 0,
        touchStartY: 0,
        destroyed: false,
      };
      
      const elements: SliderElements = {
        wrapper: document.createElement('div'),
        container: document.createElement('div'),
        slidesContainer: document.createElement('div'),
        slides: [],
        prevButton: null,
        nextButton: null,
        indicators: null,
      };
      
      const effect = new TestEffect(config, state, elements);
      const settings = effect.getResponsiveSettingsPublic();
      
      // Should use desktop settings
      expect(settings.slidesToShow).toBe(4);
      expect(settings.slidesToScroll).toBe(2);
      expect(settings.slideSpacing).toBe(30);
    });
  });
});

