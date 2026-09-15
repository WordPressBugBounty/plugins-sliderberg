import React from "react";

import {
  __experimentalFontAppearanceControl as WPFontAppearanceControl,
  useBlockEditContext,
} from "@wordpress/block-editor";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";
import { useDispatch, useSelect } from "@wordpress/data";

import type {
  FontAppearanceControlWithToolsPanelProps,
  FontAppearanceValue,
} from "./types";

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

const FontAppearanceControlWithToolsPanel: React.FC<
  FontAppearanceControlWithToolsPanelProps
> = ({
  attrKey,
  label,
  defaultValue = DEFAULT_FONT_APPEARANCE,
  onAttributesUpdate = () => null,
  hasFontStyles = true,
  hasFontWeights = true,
  fontFamilyFaces,
  isShownByDefault = true,
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

  const hasValue = () => {
    const val = attributes[attrKey];
    if (!val) return false;
    return (
      val.fontStyle !== defaultValue.fontStyle ||
      val.fontWeight !== defaultValue.fontWeight
    );
  };

  return (
    <ToolsPanelItem
      panelId={clientId}
      isShownByDefault={isShownByDefault}
      label={label}
      hasValue={hasValue}
      onDeselect={() => setAttributes({ [attrKey]: defaultValue })}
      resetAllFilter={() => setAttributes({ [attrKey]: defaultValue })}
    >
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
    </ToolsPanelItem>
  );
};

export default FontAppearanceControlWithToolsPanel;
