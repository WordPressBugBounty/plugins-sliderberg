import * as React from "react";
// @ts-ignore
import { __ } from "@wordpress/i18n";
import {
  RangeControl,
  // eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- Required for UI consistency with WordPress design system
  __experimentalText as Text,
} from "@wordpress/components";
import { TabsPanelControl, ToolsPanelItemWrapper } from "../shared";

interface ResponsiveCarouselSettingsProps {
  attributes: {
    slidesToShow: number;
    slidesToScroll: number;
    slideSpacing: number;
    tabletSlidesToShow?: number;
    tabletSlidesToScroll?: number;
    tabletSlideSpacing?: number;
    mobileSlidesToShow?: number;
    mobileSlidesToScroll?: number;
    mobileSlideSpacing?: number;
  };
  setAttributes: (
    attrs: Partial<ResponsiveCarouselSettingsProps["attributes"]>
  ) => void;
}

export const ResponsiveCarouselSettings: React.FC<
  ResponsiveCarouselSettingsProps
> = ({ attributes, setAttributes }) => {
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
          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => slidesToShow !== 3}
            label={__("Slides to Show", "sliderberg")}
            onDeselect={() => setAttributes({ slidesToShow: 3 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => slidesToScroll !== 1}
            label={__("Slides to Scroll", "sliderberg")}
            onDeselect={() => setAttributes({ slidesToScroll: 1 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => slideSpacing !== 20}
            label={__("Slide Spacing", "sliderberg")}
            onDeselect={() => setAttributes({ slideSpacing: 20 })}
          >
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
          </ToolsPanelItemWrapper>
        </>
      ),
    },
    {
      name: "tablet",
      title: __("Tablet", "sliderberg"),
      component: (
        <>
          <Text
            variant="muted"
            style={{
              marginBottom: "12px",
              display: "block",
            }}
          >
            {__("Settings for screens 768px - 1024px", "sliderberg")}
          </Text>
          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => tabletSlidesToShow !== 2}
            label={__("Slides to Show", "sliderberg")}
            onDeselect={() => setAttributes({ tabletSlidesToShow: 2 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => tabletSlidesToScroll !== 1}
            label={__("Slides to Scroll", "sliderberg")}
            onDeselect={() => setAttributes({ tabletSlidesToScroll: 1 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => tabletSlideSpacing !== 15}
            label={__("Slide Spacing", "sliderberg")}
            onDeselect={() => setAttributes({ tabletSlideSpacing: 15 })}
          >
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
          </ToolsPanelItemWrapper>
        </>
      ),
    },
    {
      name: "mobile",
      title: __("Mobile", "sliderberg"),
      component: (
        <>
          <Text
            variant="muted"
            style={{
              marginBottom: "12px",
              display: "block",
            }}
          >
            {__("Settings for screens below 768px", "sliderberg")}
          </Text>
          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => mobileSlidesToShow !== 1}
            label={__("Slides to Show", "sliderberg")}
            onDeselect={() => setAttributes({ mobileSlidesToShow: 1 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => mobileSlidesToScroll !== 1}
            label={__("Slides to Scroll", "sliderberg")}
            onDeselect={() => setAttributes({ mobileSlidesToScroll: 1 })}
          >
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
          </ToolsPanelItemWrapper>

          <ToolsPanelItemWrapper
            style={{ marginTop: "20px" }}
            hasValue={() => mobileSlideSpacing !== 10}
            label={__("Slide Spacing", "sliderberg")}
            onDeselect={() => setAttributes({ mobileSlideSpacing: 10 })}
          >
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
          </ToolsPanelItemWrapper>
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
};
