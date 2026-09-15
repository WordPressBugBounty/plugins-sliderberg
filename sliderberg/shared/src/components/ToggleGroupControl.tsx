/**
 * WordPress dependencies
 */
import React from "react";
import { useDispatch, useSelect } from "@wordpress/data";
import { useBlockEditContext } from "@wordpress/block-editor";
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { ToggleGroupControlProps } from "./types";

/**
 * Toggle group control component
 * Provides a toggle group with optional icons
 */
const CustomToggleGroupControl: React.FC<ToggleGroupControlProps> = ({
  label,
  options,
  attributeKey,
  isBlock = false,
  isAdaptiveWidth = false,
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const attributes = useSelect((select) => {
    return select("core/block-editor").getBlockAttributes(clientId);
  }) as Record<string, any>;

  const setAttributes = (newAttributes: Record<string, any>) =>
    updateBlockAttributes(clientId, newAttributes);

  return (
    <ToggleGroupControl
      label={label}
      isBlock={isBlock}
      isAdaptiveWidth={isAdaptiveWidth}
      __next40pxDefaultSize
      __nextHasNoMarginBottom
      value={attributes[attributeKey]}
      onChange={(newValue: any) => {
        setAttributes({
          [attributeKey]: newValue,
        });
      }}
    >
      {options.map(({ value, icon = null, label: optionLabel }) => {
        return icon ? (
          <ToggleGroupControlOptionIcon
            key={value}
            value={value}
            icon={icon}
            label={optionLabel}
          />
        ) : (
          <ToggleGroupControlOption
            key={value}
            value={value}
            label={optionLabel}
          />
        );
      })}
    </ToggleGroupControl>
  );
};

export default CustomToggleGroupControl;
