import React from "react";

import {
  __experimentalFontAppearanceControl as WPFontAppearanceControl,
  useBlockEditContext,
} from "@wordpress/block-editor";
import { useDispatch, useSelect } from "@wordpress/data";

import type { FontAppearanceControlProps, FontAppearanceValue } from "./types";

const DEFAULT_FONT_APPEARANCE: FontAppearanceValue = {
  fontStyle: "normal",
  fontWeight: "400",
};

function normalizeFontAppearance(
  value: unknown,
  defaultValue: FontAppearanceValue,
): FontAppearanceValue {
  if (value && typeof value === "object") {
    const appearance = value as FontAppearanceValue;

    return {
      fontStyle: appearance.fontStyle || defaultValue.fontStyle,
      fontWeight: appearance.fontWeight || defaultValue.fontWeight,
    };
  }

  return defaultValue;
}

const FontAppearanceControl: React.FC<FontAppearanceControlProps> = ({
  attrKey,
  label,
  defaultValue = DEFAULT_FONT_APPEARANCE,
  onAttributesUpdate = () => null,
  hasFontStyles = true,
  hasFontWeights = true,
  fontFamilyFaces,
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const attributes = useSelect(
    (select) => {
      const blockEditorStore = select("core/block-editor") as any;

      return blockEditorStore?.getBlockAttributes?.(clientId) ?? {};
    },
    [clientId],
  ) as Record<string, any>;

  const currentValue = normalizeFontAppearance(
    attributes[attrKey],
    defaultValue,
  );

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
    onAttributesUpdate(newAttributes);
  };

  return (
    <WPFontAppearanceControl
      __next40pxDefaultSize
      label={label}
      value={currentValue}
      onChange={(newValue) =>
        setAttributes({
          [attrKey]:
            normalizeFontAppearance(newValue, defaultValue) ?? defaultValue,
        })
      }
      hasFontStyles={hasFontStyles}
      hasFontWeights={hasFontWeights}
      fontFamilyFaces={fontFamilyFaces}
    />
  );
};

export default FontAppearanceControl;
