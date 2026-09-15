/**
 * WordPress dependencies
 */
import React from "react";
import { useBlockEditContext } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  RangeControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { RangeControlWithToolsPanelProps } from "./types";

/**
 * Range control component with ToolsPanel integration
 * Self-managed via useBlockEditContext, wrapped in ToolsPanelItem
 */
const RangeControlWithToolsPanel: React.FC<RangeControlWithToolsPanelProps> = ({
  label,
  attrKey,
  min,
  max,
  step,
  defaultValue = 0,
  required = false,
  isShownByDefault = true,
}) => {
  const { clientId } = useBlockEditContext();

  const attributes = useSelect((select) =>
    select("core/block-editor").getBlockAttributes(clientId),
  ) as Record<string, any>;

  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
  };

  const value = attributes[attrKey];

  return (
    <ToolsPanelItem
      panelId={clientId}
      isShownByDefault={isShownByDefault}
      label={label}
      hasValue={() => value !== defaultValue}
      onDeselect={() => setAttributes({ [attrKey]: defaultValue })}
      resetAllFilter={() => setAttributes({ [attrKey]: defaultValue })}
    >
      <RangeControl
        label={label}
        value={value}
        onChange={(newValue: any) => {
          setAttributes({ [attrKey]: newValue });
        }}
        min={min}
        max={max}
        step={step}
        required={required}
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      />
    </ToolsPanelItem>
  );
};

export default RangeControlWithToolsPanel;
