import React from "react";
import { __ } from "@wordpress/i18n";
import { ToggleControl, RangeControl } from "@wordpress/components";
import { validateNumericRange } from "../../../utils/security";
import { SliderAttributes } from "../../../types/slider";
import { ToolsPanelItemWrapper } from "../../shared";

interface AutoplaySettingsProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

export const AutoplaySettings: React.FC<AutoplaySettingsProps> = ({
  attributes,
  setAttributes,
}) => {
  return (
    <>
      <ToolsPanelItemWrapper
        label={__("Enable Autoplay", "sliderberg")}
        hasValue={() => attributes.autoplay}
        onDeselect={() => setAttributes({ autoplay: false })}
        isShownByDefault
      >
        <ToggleControl
          label={__("Enable Autoplay", "sliderberg")}
          checked={attributes.autoplay}
          onChange={(value) => setAttributes({ autoplay: value })}
        />
      </ToolsPanelItemWrapper>
      {attributes.autoplay && (
        <>
          <ToolsPanelItemWrapper
            label={__("Autoplay Speed", "sliderberg")}
            hasValue={() => attributes.autoplaySpeed !== 5000}
            onDeselect={() => setAttributes({ autoplaySpeed: 5000 })}
          >
            <RangeControl
              __next40pxDefaultSize
              label={__("Autoplay Speed (ms)", "sliderberg")}
              value={attributes.autoplaySpeed}
              resetFallbackValue={5000}
              onChange={(value) =>
                setAttributes({
                  autoplaySpeed: validateNumericRange(
                    value ?? 5000,
                    1000,
                    10000,
                    5000
                  ),
                })
              }
              min={1000}
              max={10000}
              step={500}
            />
          </ToolsPanelItemWrapper>
          <ToolsPanelItemWrapper
            label={__("Pause on Hover", "sliderberg")}
            hasValue={() => !attributes.pauseOnHover}
            onDeselect={() => setAttributes({ pauseOnHover: true })}
          >
            <ToggleControl
              label={__("Pause on Hover", "sliderberg")}
              checked={attributes.pauseOnHover}
              onChange={(value) => setAttributes({ pauseOnHover: value })}
            />
          </ToolsPanelItemWrapper>
        </>
      )}
    </>
  );
};
