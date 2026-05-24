/**
 * Animation handler for SliderBerg
 * Effect registry pattern: delegates behavior to effect classes
 *
 * Pro plugins can register custom effects using:
 * @example
 * import { EffectRegistry, BaseEffect } from 'sliderberg/frontend';
 *
 * class FlipEffect extends BaseEffect {
 *   setupLayout() { ... }
 *   gotoSlide(index, direction) { ... }
 * }
 *
 * EffectRegistry.register('flip', FlipEffect);
 */

import { SliderConfig, SliderState, SliderElements } from './types';

export type Direction = 'next' | 'prev' | null;

/**
 * Interface for transition effects
 * Implement this to create custom slide transition effects
 */
export interface Effect {
  setupLayout(): void;
  gotoSlide(index: number, direction: Direction): void;
  updateContainerHeight(): void;
  cleanup(): void;
  getVisibleSlideIndex(): number;
}

/**
 * Constructor type for effect classes
 */
export type EffectConstructor = new (
  config: SliderConfig,
  state: SliderState,
  elements: SliderElements
) => Effect;

/**
 * Effect Registry - allows pro plugins to register custom transition effects
 *
 * @example
 * // Register a custom effect
 * EffectRegistry.register('flip', FlipEffect);
 *
 * // Check if an effect exists
 * EffectRegistry.has('flip'); // true
 *
 * // Get all registered effect names
 * EffectRegistry.getRegisteredEffects(); // ['slide', 'fade', 'zoom', 'flip']
 */
export class EffectRegistry {
  private static effects: Map<string, EffectConstructor> = new Map();

  /**
   * Register a custom effect
   * @param name - Unique name for the effect (e.g., 'flip', 'cube')
   * @param effectClass - Class that implements the Effect interface
   */
  static register(name: string, effectClass: EffectConstructor): void {
    if (EffectRegistry.effects.has(name)) {
      // eslint-disable-next-line no-console
      console.warn(`SliderBerg: Effect "${name}" is already registered. Overwriting.`);
    }
    EffectRegistry.effects.set(name, effectClass);
  }

  /**
   * Get an effect class by name
   * @param name - Name of the effect
   * @returns The effect class or undefined
   */
  static get(name: string): EffectConstructor | undefined {
    return EffectRegistry.effects.get(name);
  }

  /**
   * Check if an effect is registered
   * @param name - Name of the effect
   */
  static has(name: string): boolean {
    return EffectRegistry.effects.has(name);
  }

  /**
   * Get all registered effect names
   */
  static getRegisteredEffects(): string[] {
    return Array.from(EffectRegistry.effects.keys());
  }

  /**
   * Create an effect instance
   * @param name - Name of the effect
   * @param config - Slider configuration
   * @param state - Slider state
   * @param elements - Slider DOM elements
   * @returns Effect instance or null if not found
   */
  static create(
    name: string,
    config: SliderConfig,
    state: SliderState,
    elements: SliderElements
  ): Effect | null {
    const EffectClass = EffectRegistry.effects.get(name);
    if (!EffectClass) {
      return null;
    }
    return new EffectClass(config, state, elements);
  }
}

/**
 * Base class for transition effects
 * Extend this class to create custom effects
 *
 * @example
 * class MyCustomEffect extends BaseEffect {
 *   setupLayout(): void {
 *     // Setup slide layout
 *   }
 *
 *   gotoSlide(index: number, direction: Direction): void {
 *     // Animate to slide
 *   }
 * }
 */
export abstract class BaseEffect implements Effect {
  protected config: SliderConfig;
  protected state: SliderState;
  protected elements: SliderElements;
  private activeTimeouts: Set<number> = new Set();
  /** Cache key for layout configuration to avoid unnecessary DOM operations */
  protected lastLayoutKey: string | null = null;
  /** Cached responsive settings */
  private cachedResponsiveSettings: {
    slidesToShow: number;
    slidesToScroll: number;
    slideSpacing: number;
  } | null = null;
  private lastViewportWidth: number = 0;

  constructor(config: SliderConfig, state: SliderState, elements: SliderElements) {
    this.config = config;
    this.state = state;
    this.elements = elements;
  }

  /**
   * Generate a unique key for the current layout configuration
   * Used to detect when layout actually needs to be recalculated
   */
  protected getLayoutKey(): string {
    const { slidesToShow, slideSpacing } = this.getResponsiveSettings();
    return `${this.config.isCarouselMode}-${this.config.infiniteLoop}-${slidesToShow}-${slideSpacing}-${this.elements.slides.length}`;
  }

  /**
   * Check if layout needs to be updated
   * Returns true if layout configuration has changed
   */
  protected layoutNeedsUpdate(): boolean {
    const currentKey = this.getLayoutKey();
    if (this.lastLayoutKey === currentKey) {
      return false;
    }
    this.lastLayoutKey = currentKey;
    return true;
  }

  // Default no-ops to satisfy interface; subclasses override as needed
  setupLayout(): void { }
  gotoSlide(_index: number, _direction: Direction): void { }
  updateContainerHeight(): void { }

  cleanup(): void {
    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts.clear();
  }

  protected safeSetTimeout(callback: () => void, delay: number): number {
    const timeoutId = window.setTimeout(() => {
      this.activeTimeouts.delete(timeoutId);
      if (!this.state.destroyed) callback();
    }, delay);
    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  }

  protected scheduleAnimationReset(): void {
    this.safeSetTimeout(() => {
      this.state.isAnimating = false;
    }, this.config.transitionDuration + 50);
  }

  /**
   * Check if user prefers reduced motion
   * Caches the result for performance
   */
  private static prefersReducedMotion: boolean | null = null;
  
  protected static checkReducedMotion(): boolean {
    if (BaseEffect.prefersReducedMotion === null) {
      BaseEffect.prefersReducedMotion = 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return BaseEffect.prefersReducedMotion;
  }

  /**
   * Get CSS transition string
   * Respects user preference for reduced motion
   */
  protected getTransitionString(): string {
    // Respect reduced motion preference
    if (BaseEffect.checkReducedMotion()) {
      return '0ms linear';
    }
    const { transitionDuration, transitionEasing } = this.config;
    return `${transitionDuration}ms ${transitionEasing}`;
  }

  protected getResponsiveSettings(): { slidesToShow: number; slidesToScroll: number; slideSpacing: number } {
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

    const c = this.config;
    
    // Use configurable breakpoints with fallback to defaults
    // This ensures consistency with the controller's responsive logic
    const mobileBreakpoint = c.breakpointMobile ?? 768;
    const tabletBreakpoint = c.breakpointTablet ?? 1024;
    
    let settings: { slidesToShow: number; slidesToScroll: number; slideSpacing: number };

    // Mobile: < mobileBreakpoint
    if (viewportWidth < mobileBreakpoint) {
      settings = {
        slidesToShow: c.mobileSlidesToShow,
        slidesToScroll: c.mobileSlidesToScroll,
        slideSpacing: c.mobileSlideSpacing,
      };
    }
    // Tablet: mobileBreakpoint to tabletBreakpoint
    else if (viewportWidth >= mobileBreakpoint && viewportWidth < tabletBreakpoint) {
      settings = {
        slidesToShow: c.tabletSlidesToShow,
        slidesToScroll: c.tabletSlidesToScroll,
        slideSpacing: c.tabletSlideSpacing,
      };
    }
    // Desktop: >= tabletBreakpoint
    else {
      settings = {
        slidesToShow: c.slidesToShow,
        slidesToScroll: c.slidesToScroll,
        slideSpacing: c.slideSpacing,
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
  protected invalidateResponsiveCache(): void {
    this.cachedResponsiveSettings = null;
  }

  getVisibleSlideIndex(): number {
    return this.state.currentSlide;
  }
}

class SlideEffect extends BaseEffect {
  /**
   * Track pending transitionend callback for cleanup
   * This prevents memory leaks and race conditions when transitions are interrupted
   */
  private pendingTransitionCallback: ((e: TransitionEvent) => void) | null = null;
  private pendingTransitionFallbackId: number | null = null;

  /**
   * Track current clone configuration to avoid unnecessary recreation
   * Format: "mode-cloneCount" (e.g., "carousel-3" or "single-2")
   */
  private lastCloneConfig: string | null = null;

  /**
   * Cancel any pending transition callback and fallback timeout
   * Called before starting a new transition or during cleanup
   */
  private cancelPendingTransition(): void {
    if (this.pendingTransitionCallback) {
      this.elements.container.removeEventListener('transitionend', this.pendingTransitionCallback);
      this.pendingTransitionCallback = null;
    }
    if (this.pendingTransitionFallbackId !== null) {
      clearTimeout(this.pendingTransitionFallbackId);
      this.pendingTransitionFallbackId = null;
    }
  }

  /**
   * Check if clone configuration needs to be updated
   * Prevents unnecessary clone recreation which can cause memory leaks
   * if external code attaches listeners to clones
   * 
   * @param mode - 'carousel' or 'single'
   * @param cloneCount - Number of clones needed on each side
   * @returns true if clones need to be recreated
   */
  private clonesNeedUpdate(mode: 'carousel' | 'single', cloneCount: number): boolean {
    const currentConfig = `${mode}-${cloneCount}`;
    if (this.lastCloneConfig === currentConfig) {
      return false;
    }
    this.lastCloneConfig = currentConfig;
    return true;
  }

  /**
   * Override cleanup to cancel pending transitions and reset clone tracking
   */
  cleanup(): void {
    this.cancelPendingTransition();
    this.lastCloneConfig = null;
    super.cleanup();
  }

  setupLayout(): void {
    // Skip if layout hasn't changed
    if (!this.layoutNeedsUpdate()) {
      return;
    }

    const { container, slides } = this.elements;
    const { isCarouselMode, infiniteLoop } = this.config;
    const { slidesToShow, slideSpacing } = this.getResponsiveSettings();

    if (isCarouselMode && slidesToShow > 1 && infiniteLoop) {
      // Only recreate clones if the clone configuration changed
      // This prevents memory leaks and preserves any external event listeners
      if (this.clonesNeedUpdate('carousel', slidesToShow)) {
        // Remove existing clones
        Array.from(container.querySelectorAll('.sliderberg-clone')).forEach((clone) => clone.remove());
        
        // Create clones at the beginning (last N slides)
        for (let i = slides.length - slidesToShow; i < slides.length; i++) {
          const clone = slides[i].cloneNode(true) as HTMLElement;
          clone.classList.add('sliderberg-clone');
          clone.setAttribute('aria-hidden', 'true');
          container.insertBefore(clone, container.firstChild);
        }
        
        // Create clones at the end (first N slides)
        for (let i = 0; i < slidesToShow; i++) {
          const clone = slides[i].cloneNode(true) as HTMLElement;
          clone.classList.add('sliderberg-clone');
          clone.setAttribute('aria-hidden', 'true');
          container.appendChild(clone);
        }
      }
      
      // Always update styles (they may have changed even if clone count hasn't)
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.gap = `${slideSpacing}px`;
      const allSlides = Array.from(container.children) as HTMLElement[];
      allSlides.forEach((slide) => {
        slide.style.flex = `0 0 calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.width = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.minWidth = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
      });
      container.style.transform = `translateX(-${slidesToShow * (100 / slidesToShow)}%)`;
      this.state.startIndex = 0;
    } else if (isCarouselMode && slidesToShow > 1) {
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = 'translateX(0)';
      container.style.gap = `${slideSpacing}px`;
      slides.forEach((slide) => {
        slide.style.flex = `0 0 calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.width = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.minWidth = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
      });
    } else {
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = 'translateX(0)';
      slides.forEach((slide) => {
        slide.style.flex = '0 0 100%';
        slide.style.width = '100%';
        slide.style.minWidth = '100%';
      });
      if (slides.length > 1) {
        this.setupCloneSlides();
      }
    }
  }

  gotoSlide(index: number, direction: Direction): void {
    const { isCarouselMode, infiniteLoop, transitionDuration } = this.config;
    const { slidesToShow } = this.getResponsiveSettings();
    const { container } = this.elements;
    const realSlides = this.elements.slides.length;
    let targetIndex = index;

    if (isCarouselMode && slidesToShow > 1 && infiniteLoop) {
      // Cancel any pending transition before starting a new one
      // This prevents race conditions if user clicks rapidly
      this.cancelPendingTransition();

      const totalSlides = realSlides;
      const cloneCount = slidesToShow;
      const visualIndex = targetIndex + cloneCount;
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = `translateX(-${visualIndex * (100 / slidesToShow)}%)`;
      this.state.startIndex = targetIndex;

      /**
       * Handler for transition completion
       * Handles the infinite loop jump back to real slides
       */
      const handleTransitionComplete = () => {
        // Clear references
        this.pendingTransitionCallback = null;
        this.pendingTransitionFallbackId = null;

        if (targetIndex < 0) {
          this.state.startIndex = totalSlides - slidesToShow;
          container.style.transition = 'none';
          container.style.transform = `translateX(-${(this.state.startIndex + cloneCount) * (100 / slidesToShow)}%)`;
          // Force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (container as any).offsetHeight;
          container.style.transition = `transform ${this.getTransitionString()}`;
        } else if (targetIndex >= totalSlides) {
          this.state.startIndex = 0;
          container.style.transition = 'none';
          container.style.transform = `translateX(-${cloneCount * (100 / slidesToShow)}%)`;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (container as any).offsetHeight;
          container.style.transition = `transform ${this.getTransitionString()}`;
        }
        this.state.isAnimating = false;
      };

      const onTransitionEnd = (e: TransitionEvent) => {
        // Only handle transform property to avoid multiple fires
        if (e.propertyName !== 'transform') {
          return;
        }
        container.removeEventListener('transitionend', onTransitionEnd);
        // Clear fallback timeout since transition completed normally
        if (this.pendingTransitionFallbackId !== null) {
          clearTimeout(this.pendingTransitionFallbackId);
          this.pendingTransitionFallbackId = null;
        }
        handleTransitionComplete();
      };

      // Store callback reference for cleanup
      this.pendingTransitionCallback = onTransitionEnd;
      container.addEventListener('transitionend', onTransitionEnd);

      // Fallback timeout in case transitionend doesn't fire
      // (browser bugs, element removed, transition interrupted, etc.)
      this.pendingTransitionFallbackId = window.setTimeout(() => {
        if (this.pendingTransitionCallback === onTransitionEnd) {
          container.removeEventListener('transitionend', onTransitionEnd);
          handleTransitionComplete();
        }
      }, transitionDuration + 100);
    } else if (isCarouselMode && slidesToShow > 1) {
      const totalSlides = realSlides;
      targetIndex = Math.max(0, Math.min(index, totalSlides - slidesToShow));
      this.state.startIndex = targetIndex;
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = `translateX(-${targetIndex * (100 / slidesToShow)}%)`;
      this.state.isAnimating = false;
    } else {
      if (direction === null) {
        this.state.currentSlide = index + 1; // Adjust for clones
        container.style.transition = `transform ${this.getTransitionString()}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        this.scheduleAnimationReset();
      } else if (direction === 'next') {
        this.handleNextSlideTransition();
      } else if (direction === 'prev') {
        this.handlePrevSlideTransition();
      }
    }
  }

  private handleNextSlideTransition(): void {
    const { container, slides } = this.elements;
    const { transitionDuration } = this.config;
    this.state.currentSlide++;
    container.style.transition = `transform ${this.getTransitionString()}`;
    container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
    if (this.state.currentSlide === slides.length + 1) {
      this.safeSetTimeout(() => {
        container.style.transition = 'none';
        this.state.currentSlide = 1;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (container as any).offsetHeight;
        this.safeSetTimeout(() => {
          container.style.transition = `transform ${this.getTransitionString()}`;
          this.state.isAnimating = false;
        }, 10);
      }, transitionDuration);
    } else {
      this.scheduleAnimationReset();
    }
  }

  private handlePrevSlideTransition(): void {
    const { container, slides } = this.elements;
    const { transitionDuration } = this.config;
    this.state.currentSlide--;
    container.style.transition = `transform ${this.getTransitionString()}`;
    container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
    if (this.state.currentSlide === 0) {
      this.safeSetTimeout(() => {
        container.style.transition = 'none';
        this.state.currentSlide = slides.length;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (container as any).offsetHeight;
        this.safeSetTimeout(() => {
          container.style.transition = `transform ${this.getTransitionString()}`;
          this.state.isAnimating = false;
        }, 10);
      }, transitionDuration);
    } else {
      this.scheduleAnimationReset();
    }
  }

  /**
   * Setup clone slides for single-slide infinite loop mode
   * Creates one clone at the beginning (last slide) and one at the end (first slide)
   * Only recreates clones if they don't exist or configuration changed
   */
  private setupCloneSlides(): void {
    const { container, slides } = this.elements;
    if (slides.length <= 1) return;
    
    // Check if clones need to be created (2 clones for single-slide mode)
    if (!this.clonesNeedUpdate('single', 2)) {
      // Clones already exist with correct configuration, just ensure position
      container.style.transform = 'translateX(-100%)';
      return;
    }
    
    // Remove any existing clones first (in case we're switching modes)
    Array.from(container.querySelectorAll('.sliderberg-clone')).forEach((clone) => clone.remove());
    
    // Clone first slide (will be appended at end)
    const firstSlideClone = slides[0].cloneNode(true) as HTMLElement;
    firstSlideClone.setAttribute('aria-hidden', 'true');
    firstSlideClone.classList.add('sliderberg-clone');
    firstSlideClone.setAttribute('data-clone-of', '0');
    
    // Clone last slide (will be prepended at beginning)
    const lastSlideClone = slides[slides.length - 1].cloneNode(true) as HTMLElement;
    lastSlideClone.setAttribute('aria-hidden', 'true');
    lastSlideClone.classList.add('sliderberg-clone');
    lastSlideClone.setAttribute('data-clone-of', (slides.length - 1).toString());
    
    // Insert clones
    container.appendChild(firstSlideClone);
    container.insertBefore(lastSlideClone, slides[0]);
    
    // Set initial position to show first real slide (index 1 after prepended clone)
    container.style.transform = 'translateX(-100%)';
    this.state.currentSlide = 1;
  }

  getVisibleSlideIndex(): number {
    const slideCount = this.elements.slides.length;
    if (slideCount > 1) {
      if (this.state.currentSlide === 0) return slideCount - 1;
      if (this.state.currentSlide === slideCount + 1) return 0;
      return this.state.currentSlide - 1;
    }
    return this.state.currentSlide;
  }
}

class FadeEffect extends BaseEffect {
  setupLayout(): void {
    const { container, slides } = this.elements;
    container.style.display = 'block';
    container.style.position = 'relative';
    container.style.transition = 'none';
    if (slides[0]) this.updateContainerHeight();
    slides.forEach((slide, index) => {
      slide.style.position = 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';

      slide.style.height = '100%';
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
      slide.style.zIndex = index === 0 ? '1' : '0';
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      slide.style.visibility = 'visible';
    });
  }

  gotoSlide(index: number, direction: Direction): void {
    const { slides } = this.elements;
    const prevIndex = this.getVisibleSlideIndex();
    this.state.currentSlide = index;
    const current = slides[this.state.currentSlide];
    const previous = slides[prevIndex];
    if (!current || !previous) {
      this.state.isAnimating = false;
      return;
    }
    previous.style.zIndex = '0';
    current.style.zIndex = '1';
    previous.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    current.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    previous.style.opacity = '0';
    current.style.opacity = '0';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (current as any).offsetHeight;
    current.style.opacity = '1';
    this.updateContainerHeight();
    this.scheduleAnimationReset();
  }

  updateContainerHeight(): void {
    const { container, slides } = this.elements;
    const currentActiveSlide = slides[this.getVisibleSlideIndex()];
    if (!currentActiveSlide) return;
    const slideHeight = currentActiveSlide.offsetHeight;
    if (slideHeight > 0) {
      container.style.height = `${slideHeight}px`;
    } else {
      const slideMinHeight = getComputedStyle(currentActiveSlide).minHeight;
      container.style.height = slideMinHeight && slideMinHeight !== '0px' ? slideMinHeight : '400px';
    }
  }
}

class ZoomEffect extends FadeEffect {
  // Override only parts that differ
  gotoSlide(index: number, direction: Direction): void {
    const { slides } = this.elements;
    const prevIndex = this.getVisibleSlideIndex();
    this.state.currentSlide = index;
    const current = slides[this.state.currentSlide];
    const previous = slides[prevIndex];
    if (!current || !previous) {
      this.state.isAnimating = false;
      return;
    }
    previous.style.zIndex = '0';
    current.style.zIndex = '1';
    previous.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    current.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    previous.style.opacity = '0';
    previous.style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
    current.style.opacity = '0';
    current.style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (current as any).offsetHeight;
    current.style.opacity = '1';
    current.style.transform = 'scale(1)';
    this.updateContainerHeight();
    this.scheduleAnimationReset();
  }
}

// Register built-in effects
EffectRegistry.register('slide', SlideEffect);
EffectRegistry.register('fade', FadeEffect);
EffectRegistry.register('zoom', ZoomEffect);

/**
 * Animation Handler - manages slide transitions
 * Uses the EffectRegistry to support both built-in and custom effects
 */
export class AnimationHandler {
  private effect: Effect;

  constructor(private config: SliderConfig, private state: SliderState, private elements: SliderElements) {
    // Try to get effect from registry first (allows pro plugins to override)
    const registeredEffect = EffectRegistry.create(
      config.transitionEffect,
      config,
      state,
      elements
    );

    if (registeredEffect) {
      this.effect = registeredEffect;
    } else {
      // Fallback to slide effect if the requested effect isn't registered
      // eslint-disable-next-line no-console
      console.warn(
        `SliderBerg: Effect "${config.transitionEffect}" not found. Using "slide" effect.`
      );
      this.effect = new SlideEffect(config, state, elements);
    }
  }

  setupSliderLayout(): void {
    this.effect.setupLayout();
  }

  handleSlideTransition(index: number, direction: Direction): void {
    this.effect.gotoSlide(index, direction);
  }

  updateContainerHeight(): void {
    this.effect.updateContainerHeight();
  }

  cleanup(): void {
    this.effect.cleanup();
  }

  getVisibleSlideIndex(): number {
    return this.effect.getVisibleSlideIndex();
  }
}
