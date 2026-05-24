import React from "react";
import { __ } from "@wordpress/i18n";
import { RangeControl, ToggleControl } from "@wordpress/components";
import { validateNumericRange } from "../../../utils/security";
import { SliderAttributes } from "../../../types/slider";
import { UBSelectControl, ToolsPanelItemWrapper } from "../../shared";

interface NavigationSettingsProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

export const NavigationSettings: React.FC<NavigationSettingsProps> = ({
  attributes,
  setAttributes,
}) => {
  return (
    <>
      <ToolsPanelItemWrapper
        label={__("Navigation Type", "sliderberg")}
        hasValue={() => attributes.navigationType !== "bottom"}
        onDeselect={() => setAttributes({ navigationType: "bottom" })}
        isShownByDefault
      >
        <UBSelectControl
          label={__("Navigation Type", "sliderberg")}
          value={attributes.navigationType}
          options={[
            {
              label: __("Split Arrows", "sliderberg"),
              value: "split",
            },
            { label: __("Top Arrows", "sliderberg"), value: "top" },
            {
              label: __("Bottom Arrows", "sliderberg"),
              value: "bottom",
            },
          ]}
          onChange={(value) => setAttributes({ navigationType: value })}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Placement", "sliderberg")}
        hasValue={() => attributes.navigationPlacement !== "overlay"}
        onDeselect={() => setAttributes({ navigationPlacement: "overlay" })}
      >
        <UBSelectControl
          label={__("Placement", "sliderberg")}
          value={attributes.navigationPlacement}
          options={[
            { label: __("Overlay", "sliderberg"), value: "overlay" },
            {
              label: __("Outside Content", "sliderberg"),
              value: "outside",
            },
          ]}
          onChange={(value) => setAttributes({ navigationPlacement: value })}
          disabled={
            attributes.navigationType === "top" ||
            attributes.navigationType === "bottom"
          }
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Shape", "sliderberg")}
        hasValue={() => attributes.navigationShape !== "circle"}
        onDeselect={() => setAttributes({ navigationShape: "circle" })}
      >
        <UBSelectControl
          label={__("Shape", "sliderberg")}
          value={attributes.navigationShape}
          options={[
            { label: __("Circle", "sliderberg"), value: "circle" },
            { label: __("Square", "sliderberg"), value: "square" },
          ]}
          onChange={(value) => setAttributes({ navigationShape: value })}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Size", "sliderberg")}
        hasValue={() => attributes.navigationSize !== "medium"}
        onDeselect={() => setAttributes({ navigationSize: "medium" })}
      >
        <UBSelectControl
          label={__("Size", "sliderberg")}
          value={attributes.navigationSize}
          options={[
            { label: __("Small", "sliderberg"), value: "small" },
            { label: __("Medium", "sliderberg"), value: "medium" },
            { label: __("Large", "sliderberg"), value: "large" },
          ]}
          onChange={(value) => setAttributes({ navigationSize: value })}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Opacity", "sliderberg")}
        hasValue={() => attributes.navigationOpacity !== 1}
        onDeselect={() => setAttributes({ navigationOpacity: 1 })}
      >
        <RangeControl
          __next40pxDefaultSize
          label={__("Opacity", "sliderberg")}
          value={attributes.navigationOpacity}
          resetFallbackValue={1}
          onChange={(value) =>
            setAttributes({
              navigationOpacity: validateNumericRange(value ?? 1, 0, 1, 1),
            })
          }
          min={0}
          max={1}
          step={0.1}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Vertical Position", "sliderberg")}
        hasValue={() => attributes.navigationVerticalPosition !== 20}
        onDeselect={() => setAttributes({ navigationVerticalPosition: 20 })}
      >
        <RangeControl
          __next40pxDefaultSize
          label={__("Vertical Position", "sliderberg")}
          value={attributes.navigationVerticalPosition}
          resetFallbackValue={20}
          onChange={(value) =>
            setAttributes({
              navigationVerticalPosition: validateNumericRange(
                value ?? 20,
                0,
                100,
                20
              ),
            })
          }
          min={0}
          max={100}
          step={1}
          help={__(
            "Adjust the vertical position of the navigation arrows (in pixels)",
            "sliderberg"
          )}
          disabled={attributes.navigationType !== "split"}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Horizontal Position", "sliderberg")}
        hasValue={() => attributes.navigationHorizontalPosition !== 20}
        onDeselect={() => setAttributes({ navigationHorizontalPosition: 20 })}
      >
        <RangeControl
          __next40pxDefaultSize
          label={__("Horizontal Position", "sliderberg")}
          value={attributes.navigationHorizontalPosition}
          resetFallbackValue={20}
          onChange={(value) =>
            setAttributes({
              navigationHorizontalPosition: validateNumericRange(
                value ?? 20,
                0,
                100,
                20
              ),
            })
          }
          min={0}
          max={100}
          step={1}
          help={__(
            "Adjust the horizontal position of the navigation arrows (in pixels)",
            "sliderberg"
          )}
          disabled={attributes.navigationType !== "split"}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Hide Navigation Arrows", "sliderberg")}
        hasValue={() => attributes.hideNavigation}
        onDeselect={() => setAttributes({ hideNavigation: false })}
      >
        <ToggleControl
          label={__("Hide Navigation Arrows", "sliderberg")}
          checked={attributes.hideNavigation}
          onChange={(value) => setAttributes({ hideNavigation: value })}
          help={__("Hide the navigation arrow buttons", "sliderberg")}
        />
      </ToolsPanelItemWrapper>
      <ToolsPanelItemWrapper
        label={__("Hide Dots", "sliderberg")}
        hasValue={() => attributes.hideDots}
        onDeselect={() => setAttributes({ hideDots: false })}
      >
        <ToggleControl
          label={__("Hide Dots", "sliderberg")}
          checked={attributes.hideDots}
          onChange={(value) => setAttributes({ hideDots: value })}
          help={__("Hide the slide indicator dots", "sliderberg")}
        />
      </ToolsPanelItemWrapper>
    </>
  );
};
