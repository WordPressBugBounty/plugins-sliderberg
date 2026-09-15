/**
 * SliderBerg Frontend Entry Point
 *
 * Initializes Swiper instances from data-swiper-data attributes
 * rendered by the PHP slider-renderer.
 */

import Swiper from "swiper";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  EffectCreative,
  Keyboard,
  A11y,
} from "swiper/modules";
import type { SwiperModule, SwiperOptions } from "swiper/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-creative";

// Extend Window interface for public API and WP hooks
declare const jQuery: any;
declare global {
  interface Window {
    SliderBerg: {
      init: () => void;
      destroyAll: () => void;
      getInstance: (element: Element) => Swiper | undefined;
      getInstances: () => Map<Element, Swiper>;
      next: (element: Element) => void;
      prev: (element: Element) => void;
      goTo: (element: Element, index: number) => void;
      pause: (element: Element) => void;
      play: (element: Element) => void;
    };
    wp?: {
      hooks?: {
        applyFilters: (filter: string, value: any, ...args: any[]) => any;
      };
    };
  }
}

/** All active Swiper instances keyed by their container element */
const instances = new Map<Element, Swiper>();

/**
 * AbortControllers for slide-link DOM listeners, keyed by container.
 * Aborting removes all associated click/keydown handlers in one call,
 * preventing duplicate listeners when the slider is reinitialized after
 * a bfcache restore (back/forward navigation).
 */
const slideControllers = new Map<Element, AbortController>();

const defaultModules: SwiperModule[] = [
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  EffectCreative,
  Keyboard,
  A11y,
];

function applySliderbergFilter<T>(filter: string, value: T, ...args: any[]): T {
  if (!window.wp?.hooks?.applyFilters) {
    return value;
  }

  return window.wp.hooks.applyFilters(filter, value, ...args) as T;
}

function getSwiperModules(
  container: HTMLElement,
  config: SwiperOptions,
): SwiperModule[] {
  const modules = applySliderbergFilter(
    "sliderberg.swiperModules",
    defaultModules.slice(),
    container,
    config,
  );

  return Array.isArray(modules) ? modules : defaultModules;
}

/**
 * Initialize all SliderBerg sliders on the page.
 */
function initializeSliders(): void {
  const containers =
    document.querySelectorAll<HTMLElement>(".sliderberg-swiper");

  if (!containers.length) {
    return;
  }

  // Allow pro features to override initialization entirely
  if (window.wp?.hooks?.applyFilters) {
    const customInit = window.wp.hooks.applyFilters(
      "sliderberg.frontendInit",
      null,
      containers,
    );
    if (customInit && typeof customInit === "function") {
      customInit(containers);
      return;
    }
  }

  containers.forEach((container) => {
    // Skip already-initialized containers
    if (instances.has(container)) {
      return;
    }

    // Allow pro features to veto individual slider init
    if (window.wp?.hooks?.applyFilters) {
      const shouldInit = window.wp.hooks.applyFilters(
        "sliderberg.beforeSliderInit",
        true,
        container,
      );
      if (!shouldInit) {
        return;
      }
    }

    // Parse Swiper config from data attribute
    const dataAttr = container.getAttribute("data-swiper-data");
    if (!dataAttr) {
      return;
    }

    let config: SwiperOptions;
    try {
      config = JSON.parse(dataAttr) as SwiperOptions;
    } catch {
      return;
    }

    // Scope navigation/pagination selectors to this container instance.
    // Both nav buttons and pagination live OUTSIDE the swiper container as
    // siblings inside .sliderberg-swiper-wrap, so query from the parent.
    if (config.navigation) {
      const prevEl =
        container.parentElement?.querySelector(".swiper-button-prev") ??
        container.querySelector(".swiper-button-prev");
      const nextEl =
        container.parentElement?.querySelector(".swiper-button-next") ??
        container.querySelector(".swiper-button-next");
      if (prevEl && nextEl) {
        config.navigation = { prevEl, nextEl };
      }
    }
    if (config.pagination) {
      // Pagination is a sibling of the swiper container inside
      // .sliderberg-swiper-wrap, so query from the parent element.
      const paginationEl =
        container.parentElement?.querySelector(".swiper-pagination") ??
        container.querySelector(".swiper-pagination");
      if (paginationEl) {
        config.pagination = {
          ...config.pagination,
          el: paginationEl,
        };
      }
    }

    const swiperConfig = applySliderbergFilter(
      "sliderberg.swiperConfig",
      config,
      container,
    );
    const modules = getSwiperModules(container, swiperConfig);

    // Create Swiper instance
    const swiper = new Swiper(container, {
      modules,
      ...swiperConfig,
    });

    instances.set(container, swiper);
    initSlideLinkHandlers(container, swiper);
  });
}

/**
 * Wire up click-to-navigate behaviour for slides that have data-slide-link.
 * Uses a JS handler rather than wrapping in <a> so nested interactive
 * elements (buttons, links) continue to work normally.
 *
 * Listeners are tied to an AbortController stored in slideControllers so they
 * can be cancelled cleanly on reinit without leaving orphaned handlers on the
 * DOM nodes.
 */
function initSlideLinkHandlers(container: HTMLElement, swiper: Swiper): void {
  const linkedSlides = Array.from(
    container.querySelectorAll<HTMLElement>(".sliderberg-slide[data-slide-link]"),
  );
  if (!linkedSlides.length) return;

  const ac = new AbortController();
  const { signal } = ac;
  slideControllers.set(container, ac);

  // Prevent navigation when the user drags to the next slide
  let isDragging = false;
  swiper.on("touchStart", () => {
    isDragging = false;
  });
  swiper.on("touchMove", () => {
    isDragging = true;
  });

  // Only the active slide should be reachable via Tab
  const updateTabindex = () => {
    linkedSlides.forEach((slide) => {
      slide.tabIndex = slide.classList.contains("swiper-slide-active") ? 0 : -1;
    });
  };
  updateTabindex();
  swiper.on("slideChange", updateTabindex);

  linkedSlides.forEach((slide) => {
    const url = slide.dataset.slideLink!;
    const linkTarget = slide.dataset.slideLinkTarget ?? "_self";

    const navigate = () => {
      if (linkTarget === "_blank") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    };

    slide.addEventListener(
      "click",
      (e) => {
        if (isDragging) {
          isDragging = false;
          return;
        }
        // Let clicks on interactive elements through unchanged
        const clickedEl = e.target as Element;
        if (
          clickedEl.closest(
            "a, button, input, select, textarea, [role='button'], [role='link']",
          )
        ) {
          return;
        }
        navigate();
      },
      { signal },
    );

    slide.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate();
        }
      },
      { signal },
    );
  });
}

/**
 * Destroy all Swiper instances and clear the maps.
 */
function destroyAll(): void {
  slideControllers.forEach((ac) => ac.abort());
  slideControllers.clear();
  instances.forEach((swiper) => {
    swiper.destroy(true, true);
  });
  instances.clear();
}

// --- Initialization ---

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSliders);
} else {
  initializeSliders();
}

// On bfcache restore (back/forward navigation on desktop), the entire JS heap
// is preserved — instances Map, Swiper objects, and DOM event listeners all
// survive the freeze intact. DOMContentLoaded does NOT re-fire, but we do not
// need to destroy/reinitialize. We only need to restart autoplay (setInterval
// timers are paused during the freeze) and recalculate layout in case the
// viewport changed. Destroying and reinitializing would strip inline styles
// (background-image etc.) and cause a visible flash.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    instances.forEach((swiper) => {
      swiper.update();
      if (swiper.params.autoplay) {
        swiper.autoplay.start();
      }
    });
  }
});

// Re-initialize for AJAX / dynamic content
document.addEventListener("DOMContentLoaded", () => {
  // jQuery AJAX support for legacy themes
  if (typeof jQuery !== "undefined") {
    jQuery(document).on("ajaxComplete", (_event: any, xhr: any) => {
      if (xhr?.responseText?.includes("sliderberg-swiper")) {
        setTimeout(initializeSliders, 150);
      }
    });
  }
  // Custom theme event
  document.addEventListener("content-updated", () =>
    setTimeout(initializeSliders, 150),
  );
});

// --- Public API ---

window.SliderBerg = {
  init: initializeSliders,
  destroyAll,
  getInstance: (element: Element) => instances.get(element),
  getInstances: () => instances,
  next: (element: Element) => instances.get(element)?.slideNext(),
  prev: (element: Element) => instances.get(element)?.slidePrev(),
  goTo: (element: Element, index: number) =>
    instances.get(element)?.slideTo(index),
  pause: (element: Element) => instances.get(element)?.autoplay?.stop(),
  play: (element: Element) => instances.get(element)?.autoplay?.start(),
};
