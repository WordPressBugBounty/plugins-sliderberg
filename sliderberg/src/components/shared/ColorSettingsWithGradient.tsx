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
import { ColorSettingsWithGradientProps } from "./types";

/**
 * Color settings with gradient component
 * Provides dual control for solid color AND gradient
 */
const ColorSettingsWithGradient: React.FC<ColorSettingsWithGradientProps> = ({
  label,
  attrBackgroundKey,
  attrGradientKey,
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const attributes = useSelect((select) => {
    return select("core/block-editor").getBlockAttributes(clientId);
  }) as Record<string, any>;

  const setAttributes = (newAttributes: Record<string, any>) =>
    updateBlockAttributes(clientId, newAttributes);

  const colorGradientSettings = useMultipleOriginColorsAndGradients();

  const { defaultColors, defaultGradients } = useSelect((select) => {
    return {
      defaultColors:
        select("core/block-editor")?.getSettings()?.__experimentalFeatures
          ?.color?.palette?.default,

      defaultGradients:
        select("core/block-editor")?.getSettings()?.__experimentalFeatures
          ?.color?.gradients?.default,
    };
  }) as { defaultColors: any; defaultGradients: any };

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

  // Merge default gradients with theme gradients
  const mergedGradients = [
    ...(colorGradientSettings.gradients || []),
    ...(defaultGradients
      ? [
          {
            name: "Default",
            slug: "default",
            gradients: defaultGradients,
          },
        ]
      : []),
  ];

  return (
    <ColorGradientSettingsDropdown
      {...colorGradientSettings}
      colors={mergedColors}
      gradients={mergedGradients}
      enableAlpha
      panelId={clientId}
      title={__("Color Settings", "sliderberg")}
      popoverProps={{
        placement: "left start",
      }}
      settings={[
        {
          clearable: true,
          resetAllFilter: () =>
            setAttributes({
              [attrBackgroundKey]: null,
              [attrGradientKey]: null,
            }),
          colorValue: attributes[attrBackgroundKey],
          gradientValue: attributes[attrGradientKey],
          label: label,
          onColorChange: (newValue: any) =>
            setAttributes({
              [attrBackgroundKey]: newValue,
            }),
          onGradientChange: (newValue: any) =>
            setAttributes({
              [attrGradientKey]: newValue,
            }),
        },
      ]}
    />
  );
};

export default ColorSettingsWithGradient;
