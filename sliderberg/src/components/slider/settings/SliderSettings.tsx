import React, { useEffect, useState, useMemo } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { RangeControl } from "@wordpress/components";
import { applyFilters } from "@wordpress/hooks";
import { AnimationSettings } from "./AnimationSettings";
import { AutoplaySettings } from "./AutoplaySettings";
import { NavigationSettings } from "./NavigationSettings";
import { SliderAttributes } from "../../../types/slider";
import { WidthControl } from "./WidthControl";
import { CarouselSettings } from "../CarouselSettings";
import { ReviewRequest } from "../../shared/ReviewRequest";
import {
  ToolsPanelWrapper,
  ToolsPanelItemWrapper,
  ColorSettings,
} from "../../shared";
import { useSaveTracking } from "../../../hooks/useSaveTracking";
import { reviewStateManager } from "../../../utils/reviewState";

interface SliderSettingsProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

export const SliderSettings: React.FC<SliderSettingsProps> = ({
  attributes,
  setAttributes,
}) => {
  // Review notification state
  const [showReviewNotice, setShowReviewNotice] = useState(false);

  // Track saves and manage review notification
  useSaveTracking({
    blockName: "sliderberg/sliderberg",
    onSaveComplete: () => {
      reviewStateManager.incrementSaveCount();

      if (reviewStateManager.shouldShowNotice()) {
        setShowReviewNotice(true);
        reviewStateManager.markAsShown();
      }
    },
  });

  const handleReviewDismiss = (permanent: boolean) => {
    setShowReviewNotice(false);
    reviewStateManager.dismiss(permanent);
  };
  // Ensure navigation type and placement are consistent
  useEffect(() => {
    if (
      attributes.navigationType === "top" ||
      attributes.navigationType === "bottom"
    ) {
      if (attributes.navigationPlacement !== "outside") {
        setAttributes({ navigationPlacement: "outside" });
      }
    }
  }, [
    attributes.navigationType,
    attributes.navigationPlacement,
    setAttributes,
  ]);

  // Memoize visible settings based on slider type
  const visibleSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.visibleSettings",
        ["width", "animation", "autoplay", "navigation", "carousel"],
        attributes.type,
      ) as string[],
    [attributes.type],
  );

  // Memoize type-specific settings
  const typeSpecificSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.typeSettings",
        null,
        attributes.type,
        attributes,
        setAttributes,
      ) as React.ReactNode,
    [attributes.type, attributes, setAttributes],
  );

  // Memoize before core settings slot
  const beforeCoreSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.beforeCoreSettings",
        null,
        attributes,
        setAttributes,
      ) as React.ReactNode,
    [attributes, setAttributes],
  );

  // Memoize after core settings slot
  const afterCoreSettings = useMemo(
    () =>
      applyFilters(
        "sliderberg.afterCoreSettings",
        null,
        attributes,
        setAttributes,
      ) as React.ReactNode,
    [attributes, setAttributes],
  );

  return (
    <>
      <InspectorControls group="color">
        <ColorSettings
          attrKey="navigationColor"
          label={__("Arrow Color", "sliderberg")}
        />
        <ColorSettings
          attrKey="navigationBgColor"
          label={__("Background Color", "sliderberg")}
        />
        {!attributes.hideDots && (
          <>
            <ColorSettings
              attrKey="dotColor"
              label={__("Dot Color", "sliderberg")}
            />
            <ColorSettings
              attrKey="dotActiveColor"
              label={__("Active Dot Color", "sliderberg")}
            />
          </>
        )}
      </InspectorControls>
      <InspectorControls>
        {/* Show review notification at the top of sidebar */}
        {showReviewNotice && (
          <div className="sliderberg-sidebar-review-wrapper">
            <ReviewRequest onDismiss={handleReviewDismiss} />
          </div>
        )}

        {beforeCoreSettings}

        {typeSpecificSettings}

        {visibleSettings.includes("width") && (
          <WidthControl attributes={attributes} setAttributes={setAttributes} />
        )}

        {/* Layout Settings with Minimum Height */}
        <ToolsPanelWrapper
          label={__("Layout Settings", "sliderberg")}
          resetAll={() => {
            setAttributes({
              minHeight: 400,
            });
          }}
        >
          <ToolsPanelItemWrapper
            label={__("Minimum Height", "sliderberg")}
            hasValue={() => attributes.minHeight !== 400}
            onDeselect={() => setAttributes({ minHeight: 400 })}
          >
            <RangeControl
              __next40pxDefaultSize
              label={__("Minimum Height", "sliderberg")}
              help={__(
                "Default minimum height for all slides. Individual slides can override this.",
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
          </ToolsPanelItemWrapper>
        </ToolsPanelWrapper>

        {visibleSettings.includes("animation") && (
          <ToolsPanelWrapper
            label={__("Animation Settings", "sliderberg")}
            resetAll={() => {
              setAttributes({
                transitionEffect: "slide",
                transitionDuration: 500,
                transitionEasing: "ease",
              });
            }}
          >
            <AnimationSettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </ToolsPanelWrapper>
        )}

        {visibleSettings.includes("autoplay") && (
          <ToolsPanelWrapper
            label={__("Autoplay Settings", "sliderberg")}
            resetAll={() => {
              setAttributes({
                autoplay: false,
                autoplaySpeed: 5000,
                pauseOnHover: true,
              });
            }}
          >
            <AutoplaySettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </ToolsPanelWrapper>
        )}

        {visibleSettings.includes("navigation") && (
          <ToolsPanelWrapper
            label={__("Navigation Settings", "sliderberg")}
            resetAll={() => {
              setAttributes({
                navigationType: "bottom",
                navigationPlacement: "overlay",
                navigationShape: "circle",
                navigationSize: "medium",
                navigationOpacity: 1,
                navigationVerticalPosition: 20,
                navigationHorizontalPosition: 20,
                hideNavigation: false,
                hideDots: false,
              });
            }}
          >
            <NavigationSettings
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </ToolsPanelWrapper>
        )}

        {visibleSettings.includes("carousel") && (
          <CarouselSettings
            attributes={attributes}
            setAttributes={setAttributes}
          />
        )}

        {afterCoreSettings}
      </InspectorControls>
    </>
  );
};
