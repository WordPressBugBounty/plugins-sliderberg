/**
 * Tests for the EffectRegistry
 */

import { EffectRegistry, BaseEffect, Effect, Direction } from '../../frontend/animation-handler';
import { SliderConfig, SliderState, SliderElements } from '../../frontend/types';

// Mock configuration for tests
const createMockConfig = (): SliderConfig => ({
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
  infiniteLoop: true,
  breakpointMobile: 768,
  breakpointTablet: 1024,
  tabletSlidesToShow: 2,
  tabletSlidesToScroll: 1,
  tabletSlideSpacing: 15,
  mobileSlidesToShow: 1,
  mobileSlidesToScroll: 1,
  mobileSlideSpacing: 10,
});

const createMockState = (): SliderState => ({
  currentSlide: 0,
  startIndex: 0,
  isAnimating: false,
  autoplayPaused: false,
  destroyed: false,
});

const createMockElements = (): SliderElements => {
  const wrapper = document.createElement('div');
  const track = document.createElement('div');
  const slides = [
    document.createElement('div'),
    document.createElement('div'),
    document.createElement('div'),
  ];
  
  slides.forEach(slide => track.appendChild(slide));
  wrapper.appendChild(track);
  
  return {
    wrapper,
    container: wrapper,
    track,
    slides,
    indicators: null,
    prevButton: null,
    nextButton: null,
  };
};

describe('EffectRegistry', () => {
  describe('built-in effects', () => {
    it('should have slide effect registered', () => {
      expect(EffectRegistry.has('slide')).toBe(true);
    });

    it('should have fade effect registered', () => {
      expect(EffectRegistry.has('fade')).toBe(true);
    });

    it('should have zoom effect registered', () => {
      expect(EffectRegistry.has('zoom')).toBe(true);
    });

    it('should return undefined for unregistered effect', () => {
      expect(EffectRegistry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('custom effect registration', () => {
    // Create a mock custom effect class
    class CustomEffect extends BaseEffect {
      setupLayout(): void {
        // Custom layout setup
      }

      gotoSlide(index: number, direction: Direction): void {
        this.state.currentSlide = index;
      }

      cleanup(): void {
        // Custom cleanup
      }
    }

    it('should allow registering custom effects', () => {
      // Use a unique name to avoid conflicts with other tests
      EffectRegistry.register('test-custom', CustomEffect);
      expect(EffectRegistry.has('test-custom')).toBe(true);
    });

    it('should create instances of custom effects', () => {
      // Use a unique name and expect warning since we're re-registering
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      EffectRegistry.register('test-custom-instance', CustomEffect);
      consoleSpy.mockRestore();
      
      const config = createMockConfig();
      const state = createMockState();
      const elements = createMockElements();
      
      const effect = EffectRegistry.create('test-custom-instance', config, state, elements);
      expect(effect).toBeInstanceOf(CustomEffect);
    });

    it('should warn when overwriting an existing effect', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Register twice to trigger warning
      EffectRegistry.register('test-overwrite', CustomEffect);
      EffectRegistry.register('test-overwrite', CustomEffect);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'SliderBerg: Effect "test-overwrite" is already registered. Overwriting.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('effect creation', () => {
    it('should create slide effect instance', () => {
      const config = createMockConfig();
      const state = createMockState();
      const elements = createMockElements();
      
      const effect = EffectRegistry.create('slide', config, state, elements);
      expect(effect).toBeDefined();
    });

    it('should return null for unknown effect', () => {
      const config = createMockConfig();
      const state = createMockState();
      const elements = createMockElements();
      
      const effect = EffectRegistry.create('unknown', config, state, elements);
      expect(effect).toBeNull();
    });
  });
});

