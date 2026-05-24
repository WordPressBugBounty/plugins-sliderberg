/**
 * Slide Inspector Controls Component
 * Contains all inspector control panels for the slide block
 */

import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
// @ts-ignore
import { __ } from "@wordpress/i18n";
import { RangeControl } from "@wordpress/components";
import {
  ColorSettingsWithGradient,
  ColorSettings,
  BackgroundImageControl,
  ToolsPanelWrapper,
  ToolsPanelItemWrapper,
  UBSelectControl,
  BorderControl,
} from "../../../components/shared";
import { validateNumericRange } from "../../../utils/security";
import { SlideAttributes } from "../../../types/slide";

interface SlideInspectorProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
}

export const SlideInspector: React.FC<SlideInspectorProps> = ({
  attributes,
  setAttributes,
}) => {
  const { overlayOpacity, contentPosition, minHeight } = attributes;

  const CONTENT_POSITIONS = [
    { label: __("Top Left", "sliderberg"), value: "top-left" },
    { label: __("Top Center", "sliderberg"), value: "top-center" },
    { label: __("Top Right", "sliderberg"), value: "top-right" },
    { label: __("Center Left", "sliderberg"), value: "center-left" },
    { label: __("Center Center", "sliderberg"), value: "center-center" },
    { label: __("Center Right", "sliderberg"), value: "center-right" },
    { label: __("Bottom Left", "sliderberg"), value: "bottom-left" },
    { label: __("Bottom Center", "sliderberg"), value: "bottom-center" },
    { label: __("Bottom Right", "sliderberg"), value: "bottom-right" },
  ];
  return (
    <>
      <InspectorControls group="color">
        <ColorSettingsWithGradient
          attrBackgroundKey="backgroundColor"
          attrGradientKey="backgroundGradient"
          label={__("Background Color", "sliderberg")}
        />
        <ColorSettings
          attrKey="overlayColor"
          label={__("Overlay Color", "sliderberg")}
          onAttributesUpdate={setAttributes}
        />
      </InspectorControls>
      <InspectorControls group="styles">
        <ToolsPanelWrapper
          label={__("Background", "sliderberg")}
          resetAll={() => {
            setAttributes({
              backgroundImage: null,
              focalPoint: { x: 0.5, y: 0.5 },
              isFixed: false,
              overlayOpacity: 0,
            });
          }}
        >
          <BackgroundImageControl
            label={__("Background Image", "sliderberg")}
          />
          <ToolsPanelItemWrapper
            label={__("Overlay Opacity", "sliderberg")}
            hasValue={() => overlayOpacity > 0}
            onDeselect={() =>
              setAttributes({
                overlayOpacity: 0,
              })
            }
          >
            <RangeControl
              __next40pxDefaultSize
              label={__("Overlay Opacity", "sliderberg")}
              resetFallbackValue={0}
              value={overlayOpacity}
              onChange={(value) =>
                setAttributes({
                  overlayOpacity: validateNumericRange(value ?? 0.5, 0, 1, 0.5),
                })
              }
              min={0}
              max={1}
              step={0.1}
            />
          </ToolsPanelItemWrapper>
        </ToolsPanelWrapper>
      </InspectorControls>
      <InspectorControls group="border">
        <BorderControl
          showDefaultBorder
          showDefaultBorderRadius
          attrBorderKey="border"
          attrBorderRadiusKey="slideBorderRadius"
          borderLabel={__("Border", "sliderberg")}
          borderRadiusLabel={__("Border Radius", "sliderberg")}
        />
      </InspectorControls>
      <InspectorControls>
        <ToolsPanelWrapper
          label={__("Layout Settings", "sliderberg")}
          resetAll={() => {
            setAttributes({ contentPosition: "center-center" });
          }}
        >
          <ToolsPanelItemWrapper
            label={__("Content Position", "sliderberg")}
            hasValue={() => contentPosition !== "center-center"}
            onDeselect={() =>
              setAttributes({
                contentPosition: "center-center",
                minHeight: 400,
              })
            }
          >
            <UBSelectControl
              label={__("Content Position", "sliderberg")}
              value={contentPosition}
              options={CONTENT_POSITIONS}
              onChange={(value) => setAttributes({ contentPosition: value })}
            />
          </ToolsPanelItemWrapper>
          <ToolsPanelItemWrapper
            label={__("Minimum Height", "sliderberg")}
            hasValue={() => minHeight !== 400}
            onDeselect={() =>
              setAttributes({
                minHeight: 400,
              })
            }
          >
            <RangeControl
              __next40pxDefaultSize
              value={minHeight}
              allowReset
              resetFallbackValue={400}
              label={__("Minimum Height", "sliderberg")}
              onChange={(value) =>
                setAttributes({
                  minHeight: validateNumericRange(value ?? 400, 100, 1000, 400),
                })
              }
              min={100}
              max={1000}
              step={10}
            />
          </ToolsPanelItemWrapper>
        </ToolsPanelWrapper>
      </InspectorControls>
    </>
  );
};
