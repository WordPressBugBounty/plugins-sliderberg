import * as React from "react";
// @ts-ignore
import { __ } from "@wordpress/i18n";
import { ToggleControl } from "@wordpress/components";
import { ResponsiveCarouselSettings } from "./ResponsiveCarouselSettings";
import { ToolsPanelWrapper, ToolsPanelItemWrapper } from "../shared";

interface CarouselSettingsProps {
  attributes: {
    isCarouselMode: boolean;
    slidesToShow: number;
    slidesToScroll: number;
    slideSpacing: number;
    infiniteLoop: boolean;
    tabletSlidesToShow?: number;
    tabletSlidesToScroll?: number;
    tabletSlideSpacing?: number;
    mobileSlidesToShow?: number;
    mobileSlidesToScroll?: number;
    mobileSlideSpacing?: number;
  };
  setAttributes: (attrs: Partial<CarouselSettingsProps["attributes"]>) => void;
}

export const CarouselSettings: React.FC<CarouselSettingsProps> = ({
  attributes,
  setAttributes,
}) => {
  const { isCarouselMode, infiniteLoop } = attributes;

  return (
    <ToolsPanelWrapper
      label={__("Carousel Settings", "sliderberg")}
      resetAll={() => {
        setAttributes({
          isCarouselMode: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          slideSpacing: 20,
          infiniteLoop: true,
          tabletSlidesToShow: 2,
          tabletSlidesToScroll: 1,
          tabletSlideSpacing: 15,
          mobileSlidesToShow: 1,
          mobileSlidesToScroll: 1,
          mobileSlideSpacing: 10,
        });
      }}
    >
      <ToolsPanelItemWrapper
        label={__("Enable Carousel Mode", "sliderberg")}
        hasValue={() => isCarouselMode}
        onDeselect={() => setAttributes({ isCarouselMode: false })}
        isShownByDefault
      >
        <ToggleControl
          label={__("Enable Carousel Mode", "sliderberg")}
          checked={isCarouselMode}
          onChange={(value) => setAttributes({ isCarouselMode: value })}
        />
      </ToolsPanelItemWrapper>

      {isCarouselMode && (
        <>
          <ResponsiveCarouselSettings
            attributes={attributes}
            setAttributes={setAttributes}
          />

          <ToolsPanelItemWrapper
            label={__("Infinite Loop", "sliderberg")}
            hasValue={() => !infiniteLoop}
            onDeselect={() => setAttributes({ infiniteLoop: true })}
          >
            <ToggleControl
              label={__("Infinite Loop", "sliderberg")}
              checked={infiniteLoop}
              onChange={(value) => setAttributes({ infiniteLoop: value })}
              help={__("Enable continuous looping of slides", "sliderberg")}
            />
          </ToolsPanelItemWrapper>
        </>
      )}
    </ToolsPanelWrapper>
  );
};
