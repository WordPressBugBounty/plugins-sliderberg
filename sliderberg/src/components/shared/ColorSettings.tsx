/**
 * WordPress dependencies
 */
import React from "react";
import { useDispatch, useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import {
  useBlockEditContext,
  __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
  __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from "@wordpress/block-editor";

/**
 * Internal dependencies
 */
import { ColorSettingsProps } from "./types";

/**
 * Color settings component
 * Provides color picker dropdown with multi-origin palette support
 */
const ColorSettings: React.FC<ColorSettingsProps> = ({
  label,
  attrKey,
  onAttributesUpdate = () => null,
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const attributes = useSelect((select) => {
    return select("core/block-editor").getBlockAttributes(clientId);
  }) as Record<string, any>;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
    onAttributesUpdate(newAttributes);
  };

  const colorGradientSettings = useMultipleOriginColorsAndGradients();

  const { defaultColors } = useSelect((select) => {
    return {
      defaultColors:
        select("core/block-editor")?.getSettings()?.__experimentalFeatures
          ?.color?.palette?.default,
    };
  }) as { defaultColors: any };

  // Merge default colors with theme and custom colors
  const mergedColors = [
    ...(colorGradientSettings.colors || []),
    ...(defaultColors
      ? [
          {
            name: "Default",
            slug: "default",
            colors: defaultColors,
          },
        ]
      : []),
  ];

  return (
    <ColorGradientSettingsDropdown
      {...colorGradientSettings}
      colors={mergedColors}
      enableAlpha
      panelId={clientId}
      title={__("Color Settings", "sliderberg")}
      popoverProps={{
        placement: "left start",
      }}
      settings={[
        {
          clearable: true,
          resetAllFilter: () => setAttributes({ [attrKey]: null }),
          colorValue: attributes[attrKey],
          label: label,
          onColorChange: (newValue: any) =>
            setAttributes({ [attrKey]: newValue }),
        },
      ]}
    />
  );
};

export default ColorSettings;
