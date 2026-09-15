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

interface SlideInspectorProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
}

export default function SlideInspector({
  attributes,
  setAttributes,
}: SlideInspectorProps) {
  const { overlayOpacity, minHeight, slideLink, slideLinkNewTab } = attributes;

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
          <RangeControl
            __next40pxDefaultSize
            value={minHeight}
            allowReset
            resetFallbackValue={400}
            label={__("Minimum Height", "sliderberg")}
            onChange={(value) =>
              setAttributes({
                minHeight: value ?? 400,
              })
            }
            min={100}
            max={1000}
            step={10}
          />
        </PanelBody>
      </InspectorControls>
    </>
  );
}
