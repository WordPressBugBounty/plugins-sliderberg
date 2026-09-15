import React from "react";

import { useBlockEditContext } from "@wordpress/block-editor";
import { FontSizePicker as WPFontSizePicker } from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";

import type { CustomFontSizePickerProps } from "./types";

function parseFontSizeToNumber(
  value: string | number | undefined,
  fallbackValue?: number | string,
): number | string | undefined {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
  }

  if (typeof value === "number") {
    return value;
  }

  const trimmedValue = value.trim();

  if (/^-?\d*\.?\d+$/.test(trimmedValue)) {
    return Number(trimmedValue);
  }

  const match = trimmedValue.match(/^(-?\d*\.?\d+)(px|rem|em)?$/i);

  if (!match) {
    return fallbackValue;
  }

  const numericValue = Number.parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();

  if (Number.isNaN(numericValue)) {
    return fallbackValue;
  }

  if (unit === "rem" || unit === "em") {
    return numericValue * 16;
  }

  return numericValue;
}

const CustomFontSizePicker: React.FC<CustomFontSizePickerProps> = ({
  attrKey,
  defaultValue,
  onAttributesUpdate = () => null,
  withSlider = true,
  withReset = false,
  fallbackFontSize,
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const { attributes, fontSizes } = useSelect(
    (select) => {
      const blockEditorStore = select("core/block-editor") as any;
      const settings = blockEditorStore?.getSettings?.();

      return {
        attributes: blockEditorStore?.getBlockAttributes?.(clientId) ?? {},
        fontSizes: settings?.fontSizes ?? [],
      };
    },
    [clientId],
  ) as {
    attributes: Record<string, any>;
    fontSizes: Array<{ name: string; slug: string; size: number | string }>;
  };

  const currentValue = attributes[attrKey] ?? defaultValue;
  const numericMode =
    typeof defaultValue === "number" || typeof attributes[attrKey] === "number";

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
    onAttributesUpdate(newAttributes);
  };

  const normalizeValue = (value?: number | string) => {
    if (value === undefined || value === null || value === "") {
      return defaultValue;
    }

    if (numericMode) {
      return parseFontSizeToNumber(value, defaultValue);
    }

    return value;
  };

  return (
    <WPFontSizePicker
      __next40pxDefaultSize
      withSlider={withSlider}
      withReset={withReset}
      fontSizes={fontSizes}
      value={currentValue}
      fallbackFontSize={fallbackFontSize}
      onChange={(newValue) =>
        setAttributes({
          [attrKey]: normalizeValue(newValue as string | number | undefined),
        })
      }
    />
  );
};

export default CustomFontSizePicker;
