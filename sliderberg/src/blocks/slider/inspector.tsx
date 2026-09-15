/**
 * Slider block inspector controls.
 * Matches the original SliderSettings structure using shared components.
 */

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
  PanelBody,
  RangeControl,
  ToggleControl,
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { applyFilters } from "@wordpress/hooks";
import {
  UBSelectControl,
  ColorSettingsWithToolsPanel,
  TabsPanelControl,
  SpacingControl,
} from "@sliderberg/shared";
import type { SliderAttributes } from "./constants";
import { isTransitionEffectAllowedInCarousel } from "./swiper-effects";
import { deriveMutedColor } from "./color-utils";
import { LockedControl } from "../../components/pro-upsell";

const isPro: boolean = window.sliderbergData?.isPro ?? false;

interface SliderInspectorProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

/**
 * Animation settings panel items
 */
function AnimationSettings({
  attributes,
  setAttributes,
}: SliderInspectorProps) {
  interface TransitionEffectOption {
    label: string;
    value: string;
    isPro?: boolean;
    supportsCarousel?: boolean;
  }

  const isCarouselMode = attributes.mode === "carousel";

  const defaultEffects: TransitionEffectOption[] = [
    {
      label: __("Slide", "sliderberg"),
      value: "slide",
      supportsCarousel: true,
    },
    { label: __("Fade", "sliderberg"), value: "fade" },
    { label: __("Zoom", "sliderberg"), value: "zoom" },
  ];

  const allEffects = applyFilters(
    "sliderberg.transitionEffects",
    defaultEffects,
    isCarouselMode,
  ) as TransitionEffectOption[];

  const availableEffects = isCarouselMode
    ? allEffects.filter(
        (effect) =>
          effect.supportsCarousel ||
          isTransitionEffectAllowedInCarousel(effect.value),
      )
    : allEffects;

  return (
    <>
      <UBSelectControl
        label={__("Transition Effect", "sliderberg")}
        value={attributes.transitionEffect}
        options={availableEffects}
        onChange={(value: string) => setAttributes({ transitionEffect: value })}
      />
      {isCarouselMode && (
        <p
          className="components-base-control__help"
          style={{ display: "block", marginTop: "4px", marginBottom: 0 }}
        >
          {__(
            "Slide and Coverflow effects are available in carousel mode. Coverflow is previewed as Slide in the editor and works on the published page.",
            "sliderberg",
          )}
        </p>
      )}
      {!isCarouselMode &&
        attributes.transitionEffect !== "slide" && (
          <p
            className="components-base-control__help"
            style={{ display: "block", marginTop: "4px", marginBottom: 0 }}
          >
            {__(
              "Advanced transition effects are previewed as Slide in the editor. They will work correctly on the published page.",
              "sliderberg",
            )}
          </p>
        )}
      {!isPro && (
        <LockedControl featureKey="coverflow-effect">
          <UBSelectControl
            label={__("Transition Effect", "sliderberg")}
            value="coverflow"
            options={[
              { label: __("Coverflow", "sliderberg"), value: "coverflow" },
              { label: __("Flip", "sliderberg"), value: "flip" },
              { label: __("Cube", "sliderberg"), value: "cube" },
              { label: __("Parallax", "sliderberg"), value: "parallax" },
            ]}
            onChange={() => {}}
          />
        </LockedControl>
      )}
      <RangeControl
        __next40pxDefaultSize
        label={__("Transition Duration", "sliderberg")}
        value={attributes.transitionDuration}
        resetFallbackValue={500}
        onChange={(value) =>
          setAttributes({
            transitionDuration: value ?? 500,
          })
        }
        min={200}
        max={2000}
        step={100}
        help={__("Duration of the transition in milliseconds", "sliderberg")}
      />
      <UBSelectControl
        label={__("Transition Easing", "sliderberg")}
        value={attributes.transitionEasing}
        options={[
          { label: __("Ease", "sliderberg"), value: "ease" },
          {
            label: __("Ease In", "sliderberg"),
            value: "ease-in",
          },
          {
            label: __("Ease Out", "sliderberg"),
            value: "ease-out",
          },
          {
            label: __("Ease In Out", "sliderberg"),
            value: "ease-in-out",
          },
          {
            label: __("Linear", "sliderberg"),
            value: "linear",
          },
        ]}
        onChange={(value: string) => setAttributes({ transitionEasing: value })}
      />
    </>
  );
}

/**
 * Autoplay settings panel items
 */
function AutoplaySettings({ attributes, setAttributes }: SliderInspectorProps) {
  return (
    <>
      <ToggleControl
        label={__("Enable Autoplay", "sliderberg")}
        checked={attributes.autoplay}
        onChange={(value) => setAttributes({ autoplay: value })}
        help={__(
          "Autoplay is only active on the published page, not in the editor.",
          "sliderberg",
        )}
      />
      {attributes.autoplay && (
        <>
          <RangeControl
            __next40pxDefaultSize
            label={__("Autoplay Speed (ms)", "sliderberg")}
            value={attributes.autoplaySpeed}
            resetFallbackValue={5000}
            onChange={(value) =>
              setAttributes({
                autoplaySpeed: value ?? 5000,
              })
            }
            min={1000}
            max={10000}
            step={500}
          />
          <ToggleControl
            label={__("Pause on Hover", "sliderberg")}
            checked={attributes.pauseOnHover}
            onChange={(value) => setAttributes({ pauseOnHover: value })}
          />
        </>
      )}
    </>
  );
}

/**
 * Navigation settings panel items
 */
function NavigationSettings({
  attributes,
  setAttributes,
}: SliderInspectorProps) {
  const {
    navHorizontal,
    navVertical,
    navOutside,
    navFreePosition,
    dotsHorizontal,
    dotsVertical,
    prevFreeX,
    prevFreeY,
    nextFreeX,
    nextFreeY,
    dotsFreeX,
    dotsFreeY,
    navigationShape,
    navigationOpacity,
    hideNavigation,
  } = attributes;

  type FreeNavElement = "prev-arrow" | "next-arrow" | "dots";
  const [activeNavEl, setActiveNavEl] = useState<FreeNavElement>("prev-arrow");

  return (
    <>
      <ToggleGroupControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        isBlock
        label={__("Shape", "sliderberg")}
        value={navigationShape}
        onChange={(value) =>
          setAttributes({ navigationShape: value as string })
        }
      >
        <ToggleGroupControlOption
          label={__("Circle", "sliderberg")}
          value="circle"
        />
        <ToggleGroupControlOption
          label={__("Square", "sliderberg")}
          value="square"
        />
      </ToggleGroupControl>
      <div style={{ gridColumn: "1 / -1" }}>
        <SpacingControl
          label={__("Size", "sliderberg")}
          attrKey="navigationSizeValue"
          sides={["all"]}
          minimumCustomValue={20}
        />
      </div>

      {navFreePosition ? (
        <div style={{ gridColumn: "1 / -1" }}>
          <ToggleGroupControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            label={__("Element", "sliderberg")}
            value={activeNavEl}
            onChange={(value) => setActiveNavEl(value as FreeNavElement)}
          >
            <ToggleGroupControlOption
              label={__("Prev Arrow", "sliderberg")}
              value="prev-arrow"
            />
            <ToggleGroupControlOption
              label={__("Next Arrow", "sliderberg")}
              value="next-arrow"
            />
            <ToggleGroupControlOption
              label={__("Dots", "sliderberg")}
              value="dots"
            />
          </ToggleGroupControl>
          <div style={{ marginTop: "12px" }}>
            {activeNavEl === "prev-arrow" && (
              <>
                <RangeControl
                  __next40pxDefaultSize
                  __nextHasNoMarginBottom
                  label={__("Horizontal (%)", "sliderberg")}
                  value={prevFreeX}
                  resetFallbackValue={3}
                  onChange={(value) => setAttributes({ prevFreeX: value ?? 3 })}
                  min={0}
                  max={100}
                  step={1}
                />
                <div style={{ marginTop: "12px" }}>
                  <RangeControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={__("Vertical (%)", "sliderberg")}
                    value={prevFreeY}
                    resetFallbackValue={50}
                    onChange={(value) =>
                      setAttributes({ prevFreeY: value ?? 50 })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
            {activeNavEl === "next-arrow" && (
              <>
                <RangeControl
                  __next40pxDefaultSize
                  __nextHasNoMarginBottom
                  label={__("Horizontal (%)", "sliderberg")}
                  value={nextFreeX}
                  resetFallbackValue={97}
                  onChange={(value) =>
                    setAttributes({ nextFreeX: value ?? 97 })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
                <div style={{ marginTop: "12px" }}>
                  <RangeControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={__("Vertical (%)", "sliderberg")}
                    value={nextFreeY}
                    resetFallbackValue={50}
                    onChange={(value) =>
                      setAttributes({ nextFreeY: value ?? 50 })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
            {activeNavEl === "dots" && (
              <>
                <RangeControl
                  __next40pxDefaultSize
                  __nextHasNoMarginBottom
                  label={__("Horizontal (%)", "sliderberg")}
                  value={dotsFreeX}
                  resetFallbackValue={50}
                  onChange={(value) =>
                    setAttributes({ dotsFreeX: value ?? 50 })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
                <div style={{ marginTop: "12px" }}>
                  <RangeControl
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                    label={__("Vertical (%)", "sliderberg")}
                    value={dotsFreeY}
                    resetFallbackValue={90}
                    onChange={(value) =>
                      setAttributes({ dotsFreeY: value ?? 90 })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <ToggleGroupControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            label={__("Arrows Horizontal", "sliderberg")}
            value={navHorizontal}
            onChange={(value) =>
              setAttributes({ navHorizontal: value as string })
            }
          >
            <ToggleGroupControlOption
              label={__("Left", "sliderberg")}
              value="left"
            />
            <ToggleGroupControlOption
              label={__("Center", "sliderberg")}
              value="center"
            />
            <ToggleGroupControlOption
              label={__("Apart", "sliderberg")}
              value="space-between"
            />
            <ToggleGroupControlOption
              label={__("Right", "sliderberg")}
              value="right"
            />
          </ToggleGroupControl>
          <ToggleGroupControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            label={__("Arrows Vertical", "sliderberg")}
            value={navVertical}
            onChange={(value) =>
              setAttributes({ navVertical: value as string })
            }
          >
            <ToggleGroupControlOption
              label={__("Top", "sliderberg")}
              value="top"
            />
            <ToggleGroupControlOption
              label={__("Center", "sliderberg")}
              value="center"
            />
            <ToggleGroupControlOption
              label={__("Bottom", "sliderberg")}
              value="bottom"
            />
          </ToggleGroupControl>
          <ToggleGroupControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            label={__("Dots Horizontal", "sliderberg")}
            value={dotsHorizontal}
            onChange={(value) =>
              setAttributes({ dotsHorizontal: value as string })
            }
          >
            <ToggleGroupControlOption
              label={__("Left", "sliderberg")}
              value="left"
            />
            <ToggleGroupControlOption
              label={__("Center", "sliderberg")}
              value="center"
            />
            <ToggleGroupControlOption
              label={__("Right", "sliderberg")}
              value="right"
            />
          </ToggleGroupControl>
          <ToggleGroupControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            isBlock
            label={__("Dots Vertical", "sliderberg")}
            value={dotsVertical}
            onChange={(value) =>
              setAttributes({ dotsVertical: value as string })
            }
          >
            <ToggleGroupControlOption
              label={__("Top", "sliderberg")}
              value="top"
            />
            <ToggleGroupControlOption
              label={__("Bottom", "sliderberg")}
              value="bottom"
            />
          </ToggleGroupControl>
          <ToggleControl
            label={__("Outside Arrows", "sliderberg")}
            checked={navOutside}
            onChange={(value) => setAttributes({ navOutside: value })}
            help={__(
              "Position arrows outside the slide content area",
              "sliderberg",
            )}
          />
        </>
      )}

      <ToggleControl
        label={__("Free Position", "sliderberg")}
        checked={navFreePosition}
        onChange={(value) => setAttributes({ navFreePosition: value })}
        help={__(
          "Set custom position for each element using percentage values",
          "sliderberg",
        )}
      />

      <RangeControl
        __next40pxDefaultSize
        label={__("Opacity", "sliderberg")}
        value={navigationOpacity}
        resetFallbackValue={1}
        onChange={(value) => setAttributes({ navigationOpacity: value ?? 1 })}
        min={0}
        max={1}
        step={0.1}
      />
      <ToggleControl
        label={__("Hide Navigation Arrows", "sliderberg")}
        checked={hideNavigation}
        onChange={(value) => setAttributes({ hideNavigation: value })}
        help={__("Hide the navigation arrow buttons", "sliderberg")}
      />
    </>
  );
}

function PaginationSettingsControls({
  attributes,
  setAttributes,
}: SliderInspectorProps) {
  return (
    <ToggleControl
      label={__("Pagination Visibility", "sliderberg")}
      checked={attributes.hideDots}
      onChange={(value) => setAttributes({ hideDots: value })}
      help={__("Hide the slide indicator dots", "sliderberg")}
    />
  );
}

/**
 * Width control panel
 */
function WidthControl({ attributes, setAttributes }: SliderInspectorProps) {
  const widthPreset = attributes.widthPreset || "default";
  const { customWidth } = attributes;

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      setAttributes({
        widthPreset: preset,
        align: "",
        widthUnit: "px",
      });
    } else {
      let alignValue: "wide" | "full" | "" = "";
      if (preset === "wide") {
        alignValue = "wide";
      }
      if (preset === "full") {
        alignValue = "full";
      }
      setAttributes({
        widthPreset: preset,
        align: alignValue,
        customWidth: "",
        widthUnit: "px",
      });
    }
  };

  const handleCustomWidthChange = (value?: number) => {
    const width = value ?? 600;
    let alignValue: "wide" | "full" | undefined;
    if (width > 0 && width < 1300) {
      alignValue = "wide";
    } else if (width >= 1300) {
      alignValue = "full";
    }
    setAttributes({
      customWidth: String(width),
      widthUnit: "px",
      align: alignValue,
    });
  };

  return (
    <PanelBody title={__("Width Settings", "sliderberg")} initialOpen={true}>
      <UBSelectControl
        label={__("Width Preset", "sliderberg")}
        value={widthPreset}
        options={[
          {
            label: __("Default", "sliderberg"),
            value: "default",
          },
          {
            label: __("Wide", "sliderberg"),
            value: "wide",
          },
          {
            label: __("Full width", "sliderberg"),
            value: "full",
          },
          {
            label: __("Custom", "sliderberg"),
            value: "custom",
          },
        ]}
        onChange={handlePresetChange}
      />
      {widthPreset === "custom" && (
        <RangeControl
          __next40pxDefaultSize
          label={__("Custom Width (px)", "sliderberg")}
          value={parseInt(customWidth) || 600}
          resetFallbackValue={600}
          onChange={handleCustomWidthChange}
          min={200}
          max={2000}
        />
      )}
    </PanelBody>
  );
}

/**
 * Responsive carousel settings with tabs
 */
function ResponsiveCarouselSettings({
  attributes,
  setAttributes,
}: SliderInspectorProps) {
  const {
    slidesToShow,
    slidesToScroll,
    slideSpacing,
    tabletSlidesToShow = 2,
    tabletSlidesToScroll = 1,
    tabletSlideSpacing = 15,
    mobileSlidesToShow = 1,
    mobileSlidesToScroll = 1,
    mobileSlideSpacing = 10,
  } = attributes;

  const tabs = [
    {
      name: "desktop",
      title: __("Desktop", "sliderberg"),
      component: (
        <>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Show", "sliderberg")}
              value={slidesToShow}
              resetFallbackValue={3}
              onChange={(value) => setAttributes({ slidesToShow: value })}
              min={1}
              max={6}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Scroll", "sliderberg")}
              value={slidesToScroll}
              resetFallbackValue={1}
              onChange={(value) =>
                setAttributes({
                  slidesToScroll: value,
                })
              }
              min={1}
              max={slidesToShow}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slide Spacing", "sliderberg")}
              value={slideSpacing}
              resetFallbackValue={20}
              onChange={(value) => setAttributes({ slideSpacing: value })}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </>
      ),
    },
    {
      name: "tablet",
      title: __("Tablet", "sliderberg"),
      component: (
        <>
          <p
            className="components-base-control__help"
            style={{
              marginTop: 0,
              marginBottom: "12px",
              display: "block",
            }}
          >
            {__("Settings for screens 768px - 1024px", "sliderberg")}
          </p>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Show", "sliderberg")}
              value={tabletSlidesToShow}
              resetFallbackValue={2}
              onChange={(value) =>
                setAttributes({
                  tabletSlidesToShow: value,
                })
              }
              min={1}
              max={4}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Scroll", "sliderberg")}
              value={tabletSlidesToScroll}
              resetFallbackValue={1}
              onChange={(value) =>
                setAttributes({
                  tabletSlidesToScroll: value,
                })
              }
              min={1}
              max={tabletSlidesToShow}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slide Spacing", "sliderberg")}
              value={tabletSlideSpacing}
              resetFallbackValue={15}
              onChange={(value) =>
                setAttributes({
                  tabletSlideSpacing: value,
                })
              }
              min={0}
              max={100}
              step={5}
            />
          </div>
        </>
      ),
    },
    {
      name: "mobile",
      title: __("Mobile", "sliderberg"),
      component: (
        <>
          <p
            className="components-base-control__help"
            style={{
              marginTop: 0,
              marginBottom: "12px",
              display: "block",
            }}
          >
            {__("Settings for screens below 768px", "sliderberg")}
          </p>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Show", "sliderberg")}
              value={mobileSlidesToShow}
              resetFallbackValue={1}
              onChange={(value) =>
                setAttributes({
                  mobileSlidesToShow: value,
                })
              }
              min={1}
              max={3}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slides to Scroll", "sliderberg")}
              value={mobileSlidesToScroll}
              resetFallbackValue={1}
              onChange={(value) =>
                setAttributes({
                  mobileSlidesToScroll: value,
                })
              }
              min={1}
              max={mobileSlidesToShow}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <RangeControl
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__("Slide Spacing", "sliderberg")}
              value={mobileSlideSpacing}
              resetFallbackValue={10}
              onChange={(value) =>
                setAttributes({
                  mobileSlideSpacing: value,
                })
              }
              min={0}
              max={100}
              step={5}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <div
      className="sliderberg-responsive-settings"
      style={{ gridColumn: "1 / -1" }}
    >
      <TabsPanelControl tabs={tabs} />
    </div>
  );
}

interface CarouselSettingsPanelProps extends SliderInspectorProps {
  hideToggle?: boolean;
  panelInitialOpen?: boolean;
}

/**
 * Carousel settings panel
 */
function CarouselSettingsPanel({
  attributes,
  setAttributes,
  hideToggle = false,
  panelInitialOpen = false,
}: CarouselSettingsPanelProps) {
  const { mode, infiniteLoop } = attributes;
  const isCarouselMode = mode === "carousel";

  return (
    <PanelBody
      title={__("Carousel Settings", "sliderberg")}
      initialOpen={panelInitialOpen}
    >
      {!hideToggle && (
        <ToggleControl
          label={__("Enable Carousel Mode", "sliderberg")}
          checked={isCarouselMode}
          onChange={(value) =>
            setAttributes({ mode: value ? "carousel" : "slider" })
          }
        />
      )}
      {isCarouselMode && (
        <>
          <ResponsiveCarouselSettings
            attributes={attributes}
            setAttributes={setAttributes}
          />
          <ToggleControl
            label={__("Infinite Loop", "sliderberg")}
            checked={infiniteLoop}
            onChange={(value) => setAttributes({ infiniteLoop: value })}
            help={__("Enable continuous looping of slides", "sliderberg")}
          />
        </>
      )}
    </PanelBody>
  );
}

export default function SliderInspector({
  attributes,
  setAttributes,
}: SliderInspectorProps) {
  useEffect(() => {
    if (
      attributes.mode === "carousel" &&
      !isTransitionEffectAllowedInCarousel(attributes.transitionEffect)
    ) {
      setAttributes({ transitionEffect: "slide" });
    }
  }, [attributes.mode, attributes.transitionEffect, setAttributes]);

  // Legacy: sync old navigationType/Placement from new attributes for backward compat
  useEffect(() => {
    const { prevArrowH, nextArrowH, prevArrowV, navOutside } = attributes;
    let legacyType = "split";
    // If both arrows are not on opposite sides, derive legacy type from vertical
    if (!(prevArrowH === "left" && nextArrowH === "right")) {
      if (prevArrowV === "top") legacyType = "top";
      else if (prevArrowV === "bottom") legacyType = "bottom";
    }
    const legacyPlacement = navOutside ? "outside" : "overlay";
    if (
      attributes.navigationType !== legacyType ||
      attributes.navigationPlacement !== legacyPlacement
    ) {
      setAttributes({
        navigationType: legacyType,
        navigationPlacement: legacyPlacement,
      });
    }
  }, [
    attributes.prevArrowH,
    attributes.nextArrowH,
    attributes.prevArrowV,
    attributes.navOutside,
    attributes.navigationType,
    attributes.navigationPlacement,
    setAttributes,
  ]);

  // Allow pro plugin to control visible settings
  const visibleSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.visibleSettings",
        ["width", "animation", "autoplay", "navigation", "carousel"],
        attributes.type,
      ) as string[],
    [attributes.type],
  );

  const afterCoreSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.afterCoreSettings",
        null,
        attributes,
        setAttributes,
      ) as ReactNode,
    [attributes, setAttributes],
  );

  const paginationSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.paginationSettings",
        null,
        attributes,
        setAttributes,
      ) as ReactNode,
    [attributes, setAttributes],
  );

  return (
    <>
      <InspectorControls group="color">
        <ColorSettingsWithToolsPanel
          attrKey="navigationColor"
          label={__("Arrow Color", "sliderberg")}
        />
        <ColorSettingsWithToolsPanel
          attrKey="navigationBgColor"
          label={__("Background Color", "sliderberg")}
        />
        {!attributes.hideDots && (
          <>
            <ColorSettingsWithToolsPanel
              attrKey="dotColor"
              label={__("Dot Color", "sliderberg")}
            />
            <ColorSettingsWithToolsPanel
              attrKey="dotActiveColor"
              label={__("Active Dot Color", "sliderberg")}
              onAttributesUpdate={(newAttrs) => {
                // Auto-derive a muted inactive color from the active one so
                // the pair stays visible together on any background. Users
                // who want a custom inactive color can still change the Dot
                // Color control afterward — it just won't re-derive until
                // Active Dot Color is changed again.
                if (newAttrs.dotActiveColor) {
                  setAttributes({
                    dotColor: deriveMutedColor(newAttrs.dotActiveColor),
                  });
                }
              }}
            />
          </>
        )}
        {
          applyFilters(
            "sliderberg.paginationColorControls",
            null,
            attributes,
            setAttributes,
          ) as ReactNode
        }
      </InspectorControls>
      <InspectorControls>
        {/* When carousel variation is active, promote its settings to the top */}
        {attributes.mode === "carousel" &&
          visibleSettings.includes("carousel") && (
            <CarouselSettingsPanel
              attributes={attributes}
              setAttributes={setAttributes}
              hideToggle
              panelInitialOpen
            />
          )}

        {visibleSettings.includes("width") && (
          <WidthControl attributes={attributes} setAttributes={setAttributes} />
        )}

        <PanelBody
          title={__("Layout Settings", "sliderberg")}
          initialOpen={false}
        >
          <RangeControl
            __next40pxDefaultSize
            label={__("Minimum Height", "sliderberg")}
            help={__(
              "Minimum height for all slides. Individual slides can be taller.",
              "sliderberg",
            )}
            value={attributes.minHeight}
            resetFallbackValue={400}
            onChange={(value) =>
              setAttributes({
                minHeight: value ?? 400,
              })
            }
            min={100}
            max={1000}
            step={10}
          />
          {
            applyFilters(
              "sliderberg.layoutSettings",
              null,
              attributes,
              setAttributes,
            ) as ReactNode
          }
          {!isPro && (
            <LockedControl featureKey="vertical-slider">
              <ToggleGroupControl
                __next40pxDefaultSize
                __nextHasNoMarginBottom
                isBlock
                label={__("Slider Direction", "sliderberg")}
                value="horizontal"
                onChange={() => {}}
              >
                <ToggleGroupControlOption
                  label={__("Horizontal", "sliderberg")}
                  value="horizontal"
                />
                <ToggleGroupControlOption
                  label={__("Vertical", "sliderberg")}
                  value="vertical"
                />
              </ToggleGroupControl>
            </LockedControl>
          )}
        </PanelBody>

        {visibleSettings.includes("animation") && (
          <PanelBody
            title={__("Animation Settings", "sliderberg")}
            initialOpen={false}
          >
            <AnimationSettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </PanelBody>
        )}

        {visibleSettings.includes("autoplay") && (
          <PanelBody
            title={__("Autoplay Settings", "sliderberg")}
            initialOpen={false}
          >
            <AutoplaySettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </PanelBody>
        )}

        {visibleSettings.includes("navigation") && (
          <PanelBody
            title={__("Navigation Settings", "sliderberg")}
            initialOpen={false}
          >
            <NavigationSettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
            {
              applyFilters(
                "sliderberg.navigationSettingsExtensions",
                null,
                attributes,
                setAttributes,
              ) as ReactNode
            }
          </PanelBody>
        )}

        <PanelBody
          title={__("Pagination Settings", "sliderberg")}
          initialOpen={false}
        >
          <PaginationSettingsControls
            attributes={attributes}
            setAttributes={setAttributes}
          />
          {paginationSettings}
          {!isPro && (
            <LockedControl featureKey="fraction-pagination">
              <UBSelectControl
                label={__("Pagination Type", "sliderberg")}
                value="fraction"
                options={[
                  { label: __("Bullets", "sliderberg"), value: "bullets" },
                  { label: __("Fraction", "sliderberg"), value: "fraction" },
                  {
                    label: __("Progress Bar", "sliderberg"),
                    value: "progressbar",
                  },
                ]}
                onChange={() => {}}
              />
            </LockedControl>
          )}
        </PanelBody>

        {/* In slider mode, show the carousel toggle at the bottom as before */}
        {attributes.mode !== "carousel" &&
          visibleSettings.includes("carousel") && (
            <CarouselSettingsPanel
              attributes={attributes}
              setAttributes={setAttributes}
            />
          )}
      </InspectorControls>

      {afterCoreSettings}
    </>
  );
}
