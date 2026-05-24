import React from "react";
import { __ } from "@wordpress/i18n";
import { RangeControl } from "@wordpress/components";
import { SliderAttributes } from "../../../types/slider";
import {
  ToolsPanelWrapper,
  ToolsPanelItemWrapper,
  UBSelectControl,
} from "../../shared";

interface WidthControlProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

const PRESET_WIDTHS = {
  default: __("Default", "sliderberg"),
  wide: __("Wide", "sliderberg"),
  full: __("Full width", "sliderberg"),
  custom: __("Custom", "sliderberg"),
};

export const WidthControl: React.FC<WidthControlProps> = ({
  attributes,
  setAttributes,
}) => {
  // Default to 'full' if widthPreset is not set
  const widthPreset = attributes.widthPreset || "full";
  const { customWidth } = attributes;

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      setAttributes({
        widthPreset: preset,
        align: undefined,
        widthUnit: "px",
      });
    } else {
      let alignValue: "wide" | "full" | undefined;
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

  // Dynamically set align based on custom width
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
    <ToolsPanelWrapper
      label={__("Width Settings", "sliderberg")}
      resetAll={() => {
        setAttributes({
          widthPreset: "full",
          align: "full",
          customWidth: "",
          widthUnit: "px",
        });
      }}
    >
      <ToolsPanelItemWrapper
        label={__("Width Preset", "sliderberg")}
        hasValue={() => widthPreset !== "full"}
        onDeselect={() =>
          setAttributes({
            widthPreset: "full",
            align: "full",
          })
        }
        isShownByDefault
      >
        <UBSelectControl
          label={__("Width Preset", "sliderberg")}
          value={widthPreset}
          options={Object.entries(PRESET_WIDTHS).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={handlePresetChange}
        />
      </ToolsPanelItemWrapper>

      {widthPreset === "custom" && (
        <ToolsPanelItemWrapper
          label={__("Custom Width", "sliderberg")}
          hasValue={() => !!customWidth}
          onDeselect={() => setAttributes({ customWidth: "" })}
        >
          <RangeControl
            __next40pxDefaultSize
            label={__("Custom Width (px)", "sliderberg")}
            value={parseInt(customWidth) || 600}
            resetFallbackValue={600}
            onChange={handleCustomWidthChange}
            min={200}
            max={2000}
          />
        </ToolsPanelItemWrapper>
      )}
    </ToolsPanelWrapper>
  );
};
