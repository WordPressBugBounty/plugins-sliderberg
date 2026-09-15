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
import { ColorSettingsWithToolsPanelProps } from "./types";

/**
 * Color settings component with ToolsPanel integration
 * Passes panelId to ColorGradientSettingsDropdown so it registers as a ToolsPanelItem
 * automatically inside an InspectorControls group="color" slot
 */
const ColorSettingsWithToolsPanel: React.FC<
  ColorSettingsWithToolsPanelProps
> = ({ label, attrKey, onAttributesUpdate = () => null }) => {
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
      title={__("Color Settings", "sliderberg")}
      panelId={clientId}
      popoverProps={{
        placement: "left start",
      }}
      settings={[
        {
          clearable: true,
          colorValue: attributes[attrKey],
          label: label,
          onColorChange: (newValue: any) =>
            setAttributes({ [attrKey]: newValue }),
        },
      ]}
    />
  );
};

export default ColorSettingsWithToolsPanel;
