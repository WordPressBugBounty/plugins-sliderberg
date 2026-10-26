/**
 * Slide Inspector Controls Component
 * Matches the original SlideInspector using shared components.
 */

import { InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import {
  PanelBody,
  RangeControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import {
  ColorSettingsWithGradientWithToolsPanel,
  ColorSettingsWithToolsPanel,
  BackgroundImageControl,
  BorderControlWithToolsPanel,
} from "@sliderberg/shared";
import type { SlideAttributes } from "./constants";
import ResponsiveMinHeightControl from "../../components/responsive-min-height-control";
import ResponsivePaddingControl from "../../components/responsive-padding-control";

interface SlideInspectorProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
}

export default function SlideInspector({
  attributes,
  setAttributes,
}: SlideInspectorProps) {
  const {
    overlayOpacity,
    minHeight,
    tabletMinHeight,
    mobileMinHeight,
    slideLink,
    slideLinkNewTab,
  } = attributes;

  return (
    <>
      <InspectorControls group="color">
        <ColorSettingsWithGradientWithToolsPanel
          attrBackgroundKey="backgroundColor"
          attrGradientKey="backgroundGradient"
          label={__("Background Color", "sliderberg")}
        />
        <ColorSettingsWithToolsPanel
          attrKey="overlayColor"
          label={__("Overlay Color", "sliderberg")}
        />
      </InspectorControls>
      <InspectorControls group="styles">
        <PanelBody title={__("Background", "sliderberg")} initialOpen={false}>
          <BackgroundImageControl
            label={__("Background Image", "sliderberg")}
          />
          <RangeControl
            __next40pxDefaultSize
            label={__("Overlay Opacity", "sliderberg")}
            resetFallbackValue={0}
            value={overlayOpacity}
            onChange={(value) =>
              setAttributes({
                overlayOpacity: value ?? 0.5,
              })
            }
            min={0}
            max={1}
            step={0.1}
          />
        </PanelBody>
      </InspectorControls>
      <ResponsivePaddingControl
        label={__("Padding", "sliderberg")}
        attrKeys={{
          desktop: "contentPadding",
          tablet: "tabletContentPadding",
          mobile: "mobileContentPadding",
        }}
        attributes={attributes}
        setAttributes={setAttributes}
        desktopHelp={__(
          "Space around this slide's content. Empty sides use the slider's Slide Padding.",
          "sliderberg",
        )}
      />
      <InspectorControls group="border">
        <BorderControlWithToolsPanel
          showDefaultBorder
          showDefaultBorderRadius
          attrBorderKey="border"
          attrBorderRadiusKey="slideBorderRadius"
          borderLabel={__("Border", "sliderberg")}
          borderRadiusLabel={__("Border Radius", "sliderberg")}
        />
      </InspectorControls>
      <InspectorControls>
        <PanelBody
          title={__("Link Settings", "sliderberg")}
          initialOpen={false}
        >
          <TextControl
            __next40pxDefaultSize
            __nextHasNoMarginBottom
            label={__("Slide Link URL", "sliderberg")}
            value={slideLink || ""}
            placeholder="https://"
            type="url"
            onChange={(value) => setAttributes({ slideLink: value })}
            help={__(
              "Clicking the slide background opens this URL. Interactive elements inside the slide are unaffected.",
              "sliderberg",
            )}
          />
          {slideLink && (
            <ToggleControl
              label={__("Open in new tab", "sliderberg")}
              checked={slideLinkNewTab}
              onChange={(value) => setAttributes({ slideLinkNewTab: value })}
            />
          )}
        </PanelBody>
        <PanelBody
          title={__("Layout Settings", "sliderberg")}
          initialOpen={false}
        >
          <ResponsiveMinHeightControl
            desktop={minHeight}
            tablet={tabletMinHeight}
            mobile={mobileMinHeight}
            desktopDefault={400}
            desktopHelp={__(
              "Makes this slide taller than the slider's minimum height.",
              "sliderberg",
            )}
            onChange={(device, value) =>
              setAttributes({
                [device === "desktop" ? "minHeight" : `${device}MinHeight`]:
                  value,
              })
            }
          />
        </PanelBody>
      </InspectorControls>
    </>
  );
}
