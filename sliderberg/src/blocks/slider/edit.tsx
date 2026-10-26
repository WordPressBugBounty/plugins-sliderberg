/**
 * Slider block editor component.
 * Initializes Swiper on a ref, using useInnerBlocksProps as the swiper-wrapper.
 * Each slide block adds 'swiper-slide' class via its own useBlockProps.
 */

import { useRef, useEffect, useMemo } from "@wordpress/element";
import {
  useBlockProps,
  useInnerBlocksProps,
  BlockControls,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { plus } from "@wordpress/icons";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";
import SwiperCore from "swiper";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import SliderInspector from "./inspector";
import LayoutChooser from "./layout-chooser";
import { buildSwiperConfig } from "./constants";
import type { SliderAttributes } from "./constants";
import { getSlidePaddingVars, spacingValueToCSS } from "./slide-padding";

import "./editor.scss";

function getEditorBreakpointParams(
  config: ReturnType<typeof buildSwiperConfig>,
  container: HTMLElement,
) {
  if (!config.breakpoints) {
    return {};
  }

  const viewportWidth =
    container.ownerDocument.defaultView?.innerWidth ?? container.clientWidth;

  return Object.entries(config.breakpoints)
    .map(([breakpoint, params]) => [Number(breakpoint), params] as const)
    .filter(([breakpoint]) => Number.isFinite(breakpoint))
    .sort(([first], [second]) => second - first)
    .find(([breakpoint]) => viewportWidth >= breakpoint)?.[1] ?? {};
}

interface EditProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
  clientId: string;
}

const SWIPER_CONTAINER_STATE_CLASSES = [
  "swiper-initialized",
  "swiper-horizontal",
  "swiper-vertical",
  "swiper-backface-hidden",
  "swiper-css-mode",
  "swiper-autoheight",
] as const;

const SWIPER_SLIDE_STATE_CLASSES = [
  "swiper-slide-active",
  "swiper-slide-next",
  "swiper-slide-prev",
  "swiper-slide-visible",
  "swiper-slide-fully-visible",
  "swiper-slide-duplicate-active",
  "swiper-slide-duplicate-next",
  "swiper-slide-duplicate-prev",
] as const;

const SWIPER_SLIDE_INJECTED_CLASSES = [
  "swiper-slide-duplicate",
  "swiper-slide-blank",
] as const;

const SWIPER_PAGINATION_STATE_CLASSES = [
  "swiper-pagination-horizontal",
  "swiper-pagination-vertical",
  "swiper-pagination-lock",
  "swiper-pagination-clickable",
  "swiper-pagination-bullets",
  "swiper-pagination-bullets-dynamic",
  "swiper-pagination-fraction",
  "swiper-pagination-progressbar",
  "swiper-pagination-progressbar-opposite",
] as const;

const SWIPER_NAV_STATE_CLASSES = [
  "swiper-button-disabled",
  "swiper-button-lock",
  "swiper-button-hidden",
] as const;

function removeSwiperInjectedSlides(container: HTMLElement): void {
  const wrapper = container.querySelector<HTMLElement>(".swiper-wrapper");

  if (!wrapper) {
    return;
  }

  Array.from(wrapper.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) {
      return;
    }

    if (
      SWIPER_SLIDE_INJECTED_CLASSES.some((className) =>
        child.classList.contains(className),
      )
    ) {
      child.remove();
      return;
    }

    child.classList.remove(...SWIPER_SLIDE_STATE_CLASSES);
    child.removeAttribute("data-swiper-slide-index");
  });
}

function resetSwiperEditorDom(
  container: HTMLElement,
  prevButton: HTMLElement | null,
  nextButton: HTMLElement | null,
  pagination: HTMLElement | null,
): void {
  removeSwiperInjectedSlides(container);
  container.classList.remove(...SWIPER_CONTAINER_STATE_CLASSES);

  const wrapper = container.querySelector<HTMLElement>(".swiper-wrapper");
  if (wrapper) {
    wrapper.style.transform = "";
    wrapper.style.transitionDuration = "";
    wrapper.style.transitionDelay = "";
    wrapper.style.width = "";
    wrapper.style.height = "";
    wrapper.style.marginLeft = "";
    wrapper.style.marginRight = "";
    wrapper.style.marginTop = "";
    wrapper.style.willChange = "";
  }

  container.querySelectorAll<HTMLElement>(".swiper-slide").forEach((slide) => {
    slide.classList.remove(...SWIPER_SLIDE_STATE_CLASSES);
    slide.style.height = "";
    slide.style.width = "";
    slide.style.marginRight = "";
    slide.style.marginBottom = "";
    slide.style.marginLeft = "";
    slide.style.transform = "";
    slide.style.transitionDuration = "";
  });

  [prevButton, nextButton].forEach((button) => {
    if (!button) return;
    button.classList.remove(...SWIPER_NAV_STATE_CLASSES);
    button.removeAttribute("aria-disabled");
    button.removeAttribute("aria-label");
    button.removeAttribute("aria-controls");
    button.removeAttribute("tabindex");
  });

  if (pagination) {
    pagination.classList.remove(...SWIPER_PAGINATION_STATE_CLASSES);
    pagination.style.left = "";
    pagination.style.right = "";
    pagination.style.top = "";
    pagination.style.bottom = "";
    pagination.style.width = "";
    pagination.style.height = "";
    pagination.style.marginTop = "";
    pagination.style.transform = "";
    pagination.innerHTML = "";
  }
}

export default function Edit({
  attributes,
  setAttributes,
  clientId,
}: EditProps) {
  const {
    mode,
    minHeight,
    tabletMinHeight,
    mobileMinHeight,
    widthPreset,
    customWidth,
    widthUnit,
    hideNavigation,
    hideDots,
    navigationColor,
    navigationBgColor,
    navigationOpacity,
    navigationShape,
    navigationSize,
    navigationSizeValue,
    navHorizontal,
    navVertical,
    dotsHorizontal,
    dotsVertical,
    navOutside,
    navFreePosition,
    prevFreeX,
    prevFreeY,
    nextFreeX,
    nextFreeY,
    dotsFreeX,
    dotsFreeY,
    transitionEasing,
    dotColor,
    dotActiveColor,
  } = attributes;

  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<SwiperCore | null>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const pendingSlideIndexRef = useRef<number | null>(null);
  const isVerticalDirection = attributes.sliderDirection === "vertical";

  // Track child slide order so add/remove/reorder all trigger the same sync path.
  const slideBlockIds = useSelect(
    (select) => {
      const { getBlockOrder } = select(blockEditorStore) as any;
      return getBlockOrder(clientId) ?? [];
    },
    [clientId],
  );
  const slideCount = slideBlockIds.length;
  const slideBlockOrderKey = slideBlockIds.join(",");

  // Content saved before `mode` existed has real slides but no `mode` (and
  // no `isCarouselMode` either, if it was ever plain Slider mode — see
  // sliderberg_resolve_mode() in slider-renderer.php for why WordPress
  // never serialized that). Real slide content already existing is proof
  // this can't be a fresh, unpicked chooser block, so treat it as Slider
  // immediately — effectiveMode avoids a one-frame chooser flash while the
  // healing effect below persists the real attribute.
  const effectiveMode = mode || (slideCount > 0 ? "slider" : "");

  useEffect(() => {
    if (!mode && slideCount > 0) {
      setAttributes({ mode: "slider" });
    }
  }, [mode, slideCount, setAttributes]);

  const { insertBlock } = useDispatch(blockEditorStore) as any;

  const syncSwiperSlides = () => {
    const container = swiperContainerRef.current;
    const swiper = swiperInstanceRef.current;

    if (!container || !container.isConnected || !swiper) {
      return;
    }

    removeSwiperInjectedSlides(container);

    swiper.updateSize();
    swiper.updateSlides();

    const targetIndex = Math.max(
      0,
      Math.min(
        pendingSlideIndexRef.current ?? swiper.activeIndex ?? 0,
        Math.max(slideCount - 1, 0),
      ),
    );

    swiper.slideTo(targetIndex, 0, false);
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    swiper.update();

    pendingSlideIndexRef.current = null;
  };

  // Build Swiper config from attributes
  const swiperConfig = useMemo(() => {
    const baseConfig = buildSwiperConfig(attributes);

    const config = {
      ...applyFilters("sliderberg.editorSwiperConfig", baseConfig, attributes),
    } as typeof baseConfig;

    // Disable autoplay in editor
    delete config.autoplay;
    // Disable loop in editor — Swiper clones DOM nodes which corrupts
    // Gutenberg's React-managed inner blocks
    config.loop = false;
    // Force slide effect in editor — Fade/Zoom use absolute positioning
    // and pointer-events:none on inactive slides, making them uneditable.
    // The chosen effect is saved in attributes and works on the frontend.
    config.effect = "slide";
    delete config.fadeEffect;
    delete config.creativeEffect;
    delete config.coverflowEffect;
    delete config.flipEffect;
    delete config.cubeEffect;
    delete config.parallax;
    // autoHeight only measures on slide change, and the editor's Swiper
    // doesn't observe DOM changes, so slides would clip while typing. The
    // sliderberg-unequal-height class gives the same layout instead.
    delete config.autoHeight;
    // Disable all drag/swipe interaction in editor so mouse events are not
    // intercepted by Swiper — this allows Gutenberg to handle block selection.
    config.allowTouchMove = false;
    config.simulateTouch = false;
    // Do NOT use Swiper's MutationObserver in the editor — it conflicts with
    // Gutenberg's React-managed DOM and causes double-update races when slides
    // are added. Slide count changes are handled via the slideCount effect below.
    config.observer = false;
    config.observeParents = false;
    config.observeSlideChildren = false;
    // Never lock/hide navigation or pagination in the editor, even when
    // slidesToShow >= slideCount (which is common in carousel mode with few slides).
    config.watchOverflow = false;

    return config;
  }, [attributes]);
  const swiperConfigKey = JSON.stringify(swiperConfig);

  // Initialize Swiper on the container ref
  // Use requestAnimationFrame to ensure DOM is fully painted before init
  useEffect(() => {
    if (!swiperContainerRef.current) return;

    let rafId = 0;
    let initRafId = 0;
    let resizeRafId = 0;
    let resizeObserver: ResizeObserver | null = null;

    // Destroy previous instance (cleanStyles=false to preserve Gutenberg-
    // managed inline styles like background-color on slides)
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.destroy(true, false);
      swiperInstanceRef.current = null;
    }

    const container = swiperContainerRef.current;
    resetSwiperEditorDom(
      container,
      prevRef.current,
      nextRef.current,
      paginationRef.current,
    );

    rafId = requestAnimationFrame(() => {
      initRafId = requestAnimationFrame(() => {
        if (!container.isConnected) {
          return;
        }

        resetSwiperEditorDom(
          container,
          prevRef.current,
          nextRef.current,
          paginationRef.current,
        );

        void container.offsetHeight;

        const editorSwiperConfig = {
          ...swiperConfig,
          ...getEditorBreakpointParams(swiperConfig, container),
        };

        // Swiper's window-based breakpoint resolver sees the parent wp-admin
        // window because the block editor renders into its iframe via a portal.
        // Resolve the iframe breakpoint above and prevent Swiper from replacing
        // it with the parent-window breakpoint during update().
        delete editorSwiperConfig.breakpoints;

        swiperInstanceRef.current = new SwiperCore(container, {
          modules: [Navigation, Pagination, A11y],
          ...editorSwiperConfig,
          navigation: !hideNavigation
            ? {
                nextEl: nextRef.current,
                prevEl: prevRef.current,
              }
            : false,
          pagination:
            !hideDots && paginationRef.current
              ? {
                  ...(typeof swiperConfig.pagination === "object"
                    ? swiperConfig.pagination
                    : {}),
                  el: paginationRef.current,
                }
              : false,
        });

        syncSwiperSlides();

        // Gutenberg changes the editor iframe width when switching between
        // Desktop, Tablet, and Mobile previews. That does not reliably reach
        // Swiper's window resize handler, so observe the actual container and
        // force breakpoint/slide measurements to refresh when its width moves.
        let previousWidth = container.clientWidth;
        resizeObserver = new ResizeObserver((entries) => {
          const nextWidth = entries[0]?.contentRect.width ?? container.clientWidth;

          if (Math.abs(nextWidth - previousWidth) < 0.5) {
            return;
          }

          previousWidth = nextWidth;
          cancelAnimationFrame(resizeRafId);
          resizeRafId = requestAnimationFrame(() => {
            const swiper = swiperInstanceRef.current;
            if (!swiper || swiper.destroyed || !container.isConnected) {
              return;
            }

            Object.assign(
              swiper.params,
              getEditorBreakpointParams(swiperConfig, container),
            );
            swiper.update();
          });
        });
        resizeObserver.observe(container);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(initRafId);
      cancelAnimationFrame(resizeRafId);
      resizeObserver?.disconnect();
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, false);
        swiperInstanceRef.current = null;
      }

      if (swiperContainerRef.current) {
        resetSwiperEditorDom(
          swiperContainerRef.current,
          prevRef.current,
          nextRef.current,
          paginationRef.current,
        );
      }
    };
    // effectiveMode: the Swiper container only exists once a layout is
    // picked, so a fresh block must init when the chooser goes away.
  }, [swiperConfigKey, hideNavigation, hideDots, effectiveMode]);

  useEffect(() => {
    if (!swiperInstanceRef.current) {
      return;
    }

    let syncRafId = 0;
    let syncInitRafId = 0;

    syncRafId = requestAnimationFrame(() => {
      syncInitRafId = requestAnimationFrame(() => {
        syncSwiperSlides();
      });
    });

    return () => {
      cancelAnimationFrame(syncRafId);
      cancelAnimationFrame(syncInitRafId);
    };
  }, [slideBlockOrderKey]);

  // Compute width styles
  const widthStyle: React.CSSProperties = {};
  if (widthPreset === "custom" && customWidth) {
    widthStyle.maxWidth = `${customWidth}${widthUnit}`;
    widthStyle.marginLeft = "auto";
    widthStyle.marginRight = "auto";
  }

  const baseCssVars = {
    "--swiper-navigation-color": navigationColor,
    "--swiper-navigation-background-color": navigationBgColor,
    "--sliderberg-nav-opacity": navigationOpacity,
    "--swiper-pagination-color": dotActiveColor,
    "--swiper-pagination-bullet-inactive-color": dotColor,
    "--swiper-pagination-bullet-inactive-opacity": "1",
    "--sliderberg-min-height-desktop": `${minHeight}px`,
    ...getSlidePaddingVars({
      desktop: attributes.slidePadding,
      tablet: attributes.tabletSlidePadding,
      mobile: attributes.mobileSlidePadding,
    }),
    ...(tabletMinHeight
      ? { "--sliderberg-min-height-tablet": `${tabletMinHeight}px` }
      : {}),
    ...(mobileMinHeight
      ? { "--sliderberg-min-height-mobile": `${mobileMinHeight}px` }
      : {}),
    "--sliderberg-easing": transitionEasing,
    ...(navFreePosition
      ? {
          "--sliderberg-prev-free-x": `${prevFreeX}%`,
          "--sliderberg-prev-free-y": `${prevFreeY}%`,
          "--sliderberg-next-free-x": `${nextFreeX}%`,
          "--sliderberg-next-free-y": `${nextFreeY}%`,
          "--sliderberg-dots-free-x": `${dotsFreeX}%`,
          "--sliderberg-dots-free-y": `${dotsFreeY}%`,
        }
      : {}),
    ...(navigationSizeValue?.all
      ? {
          "--sliderberg-nav-btn-size": spacingValueToCSS(
            navigationSizeValue.all,
          ),
        }
      : {}),
  } as React.CSSProperties;

  const cssVars = applyFilters(
    "sliderberg.editorCssVars",
    baseCssVars,
    attributes,
  ) as React.CSSProperties;

  const navClasses = (
    applyFilters(
      "sliderberg.editorWrapperClasses",
      [
        "sliderberg-editor-wrapper",
        `sliderberg-nav-${navigationShape}`,
        !navigationSizeValue?.all ? `sliderberg-nav-${navigationSize}` : "",
        navigationSizeValue?.all ? "sliderberg-nav-custom-size" : "",
        navFreePosition
          ? "sliderberg-nav-free"
          : isVerticalDirection
          ? ""
          : `sliderberg-nav-h-${navHorizontal} sliderberg-nav-v-${navVertical} sliderberg-dots-h-${dotsHorizontal} sliderberg-dots-v-${dotsVertical}`,
        navOutside && !navFreePosition ? "sliderberg-nav-outside" : "",
        isVerticalDirection ? "sliderberg-vertical" : "",
        attributes.equalHeight === false ? "sliderberg-unequal-height" : "",
      ],
      attributes,
    ) as string[]
  )
    .filter(Boolean)
    .join(" ");

  const blockProps = useBlockProps({
    className: navClasses,
    style: {
      ...widthStyle,
      ...cssVars,
    },
  });

  // Inner blocks rendered inside swiper-wrapper
  const innerBlocksProps = useInnerBlocksProps(
    {
      className: "swiper-wrapper",
    },
    {
      allowedBlocks: ["sliderberg/slide"],
      // No template while a layout hasn't been picked yet — the chooser UI
      // is shown instead of this InnerBlocks area, and slides should only
      // get auto-inserted once the block actually swaps to Slider/Carousel.
      template: effectiveMode
        ? [
            ["sliderberg/slide", {}],
            ["sliderberg/slide", {}],
            ["sliderberg/slide", {}],
          ]
        : undefined,
      orientation: (isVerticalDirection ? "vertical" : "horizontal") as any,
      renderAppender: false,
    },
  );

  const addSlide = () => {
    pendingSlideIndexRef.current = slideCount;
    const newSlide = createBlock("sliderberg/slide", {});
    insertBlock(newSlide, slideCount, clientId);
  };

  // No layout picked yet — show the chooser instead of the Swiper editor.
  // Picking a layout just sets `mode` on this same block instance.
  if (!effectiveMode) {
    return (
      <div {...blockProps}>
        <LayoutChooser
          onSelect={(pickedMode) => setAttributes({ mode: pickedMode })}
        />
      </div>
    );
  }

  return (
    <div {...blockProps}>
      <SliderInspector attributes={attributes} setAttributes={setAttributes} />
      <BlockControls>
        <ToolbarGroup>
          <ToolbarButton
            icon={plus}
            label={__("Add Slide", "sliderberg")}
            onClick={addSlide}
          />
        </ToolbarGroup>
      </BlockControls>

      <div className="sliderberg-swiper-wrap">
        <div
          ref={swiperContainerRef}
          className="swiper sliderberg-swiper-editor"
          style={
            isVerticalDirection
              ? { height: "var(--sliderberg-min-height, 400px)", overflow: "hidden" }
              : undefined
          }
        >
          <div {...innerBlocksProps} />
        </div>
        {!hideNavigation && (
          <>
            <div
              ref={prevRef}
              className="swiper-button-prev"
              style={
                isVerticalDirection
                  ? {
                      left: "50%",
                      right: "auto",
                      top: "2%",
                      bottom: "auto",
                      marginTop: 0,
                    }
                  : undefined
              }
            />
            <div
              ref={nextRef}
              className="swiper-button-next"
              style={
                isVerticalDirection
                  ? {
                      left: "50%",
                      right: "auto",
                      top: "auto",
                      bottom: "2%",
                      marginTop: 0,
                    }
                  : undefined
              }
            />
          </>
        )}
        {!hideDots && <div ref={paginationRef} className="swiper-pagination" />}
      </div>
    </div>
  );
}
