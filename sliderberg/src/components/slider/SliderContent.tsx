// src/components/slider/SliderContent.tsx
import React, { useEffect, useMemo, useCallback } from "react";
import { InnerBlocks } from "@wordpress/block-editor";
import { applyFilters } from "@wordpress/hooks";
import type { BlockInstance } from "@wordpress/blocks";
import { SliderNavigation } from "./navigation/SliderNavigation";
import classnames from "classnames";
import { SliderContext } from "../../context/SliderContext";
import { SliderAttributes } from "../../types/slider";

// Default allowed blocks for the slider container
const DEFAULT_SLIDER_BLOCKS = ["sliderberg/slide"];

/**
 * Get allowed blocks for the slider container via filter
 * Allows pro plugins to add custom slide types
 *
 * @example
 * // Add a custom slide block type in a pro plugin:
 * wp.hooks.addFilter(
 *   'sliderberg.allowedSliderBlocks',
 *   'my-plugin/add-custom-slides',
 *   (blocks) => [...blocks, 'sliderberg-pro/video-slide']
 * );
 */
const ALLOWED_BLOCKS = applyFilters(
  "sliderberg.allowedSliderBlocks",
  DEFAULT_SLIDER_BLOCKS,
) as string[];

interface SliderContentProps {
  attributes: SliderAttributes;
  currentSlideId: string | null;
  innerBlocks: BlockInstance[];
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onSlideChange: (slideId: string) => void;
  clientId: string;
}

export const SliderContent: React.FC<SliderContentProps> = ({
  attributes,
  currentSlideId,
  innerBlocks,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onSlideChange,
  clientId,
}) => {
  const { isCarouselMode, slidesToShow, slidesToScroll, slideSpacing } =
    attributes;

  // Memoize hasRegularSlides check
  const hasRegularSlides = useMemo(
    () => innerBlocks.some((block) => block.name === "sliderberg/slide"),
    [innerBlocks],
  );

  // Determine what navigation to show
  const showRegularNavigation = hasRegularSlides;

  // Determine the template based on the type
  const template = useMemo(() => {
    if (attributes.type === "blocks" && innerBlocks.length === 0) {
      return [["sliderberg/slide", {}]];
    }
    return undefined;
  }, [attributes.type, innerBlocks.length]);

  const templateLock: string | false = false;

  // Calculate start index for carousel mode (memoized)
  const startIndex = useMemo(() => {
    if (!isCarouselMode) {
      return 0;
    }
    const currentIndex = innerBlocks.findIndex(
      (block) => block.clientId === currentSlideId,
    );
    return currentIndex >= 0 ? currentIndex : 0;
  }, [isCarouselMode, innerBlocks, currentSlideId]);

  // Update slide visibility
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.updateSliderbergSlidesVisibility
    ) {
      window.updateSliderbergSlidesVisibility();
    }
  }, [currentSlideId, isCarouselMode, slidesToShow, slidesToScroll]);

  // Memoize slider track style calculation
  const sliderTrackStyle = useMemo((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      "--sliderberg-slides-to-show": slidesToShow,
      "--sliderberg-slide-spacing": `${slideSpacing}px`,
    } as React.CSSProperties;

    if (!isCarouselMode) {
      return baseStyles;
    }

    // Calculate offset percentage based on start index like frontend
    const offset = startIndex > -1 ? -(startIndex * (100 / slidesToShow)) : 0;

    return {
      ...baseStyles,
      transform: `translateX(${offset}%)`,
      transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
      display: "flex",
      flexWrap: "nowrap",
    };
  }, [slidesToShow, slideSpacing, isCarouselMode, startIndex]);

  // Memoize the duplicate slide handler
  const handleDuplicateSlide = useCallback(
    (slideId?: string) => {
      const targetSlideId = slideId || currentSlideId;
      if (targetSlideId) {
        onDuplicateSlide(targetSlideId);
      }
    },
    [currentSlideId, onDuplicateSlide],
  );

  // Memoize slider context value to prevent unnecessary re-renders
  const sliderContextValue = useMemo(
    () => ({
      currentSlideId,
      isCarouselMode,
      slidesToShow,
    }),
    [currentSlideId, isCarouselMode, slidesToShow],
  );

  // Memoize filtered inner blocks for navigation
  const slideBlocks = useMemo(
    () => innerBlocks.filter((block) => block.name === "sliderberg/slide"),
    [innerBlocks],
  );

  return (
    <>
      <div className="sliderberg-content">
        {attributes.navigationType === "top" && showRegularNavigation && (
          <SliderNavigation
            attributes={attributes}
            currentSlideId={currentSlideId}
            innerBlocks={slideBlocks}
            onSlideChange={onSlideChange}
            position="top"
            sliderId={clientId}
          />
        )}

        {/* Pro navigation removed - can be extended via hooks/filters in pro version */}

        <div
          className={classnames("sliderberg-slides", {
            "sliderberg-carousel-mode": isCarouselMode,
          })}
        >
          <div
            className="sliderberg-slides-container"
            data-current-slide-id={currentSlideId || ""}
            data-slider-id={clientId}
            style={sliderTrackStyle}
          >
            <SliderContext.Provider value={sliderContextValue}>
              <InnerBlocks
                allowedBlocks={ALLOWED_BLOCKS}
                template={template}
                templateLock={templateLock}
                orientation={isCarouselMode ? "horizontal" : "vertical"}
              />
            </SliderContext.Provider>
          </div>
        </div>

        {attributes.navigationType === "split" && showRegularNavigation && (
          <SliderNavigation
            attributes={attributes}
            currentSlideId={currentSlideId}
            innerBlocks={slideBlocks}
            onSlideChange={onSlideChange}
            position="split"
            sliderId={clientId}
          />
        )}

        {/* Pro navigation removed - can be extended via hooks/filters in pro version */}

        {attributes.navigationType === "bottom" && showRegularNavigation && (
          <SliderNavigation
            attributes={attributes}
            currentSlideId={currentSlideId}
            innerBlocks={slideBlocks}
            onSlideChange={onSlideChange}
            position="bottom"
            sliderId={clientId}
          />
        )}

        {/* Pro navigation removed - can be extended via hooks/filters in pro version */}
      </div>
    </>
  );
};
