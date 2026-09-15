/**
 * WordPress dependencies
 */
import React from "react";
import { useBlockEditContext } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
  __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { ToggleGroupControlWithToolsPanelProps } from "./types";

/**
 * Toggle group control component with ToolsPanel integration
 * Self-managed via useBlockEditContext, wrapped in ToolsPanelItem
 * Supports both icon and text options (consistent with CustomToggleGroupControl)
 */
const ToggleGroupControlWithToolsPanel: React.FC<
  ToggleGroupControlWithToolsPanelProps
> = ({
  label,
  attrKey,
  options,
  defaultValue = "",
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
      <ToggleGroupControl
        label={label}
        isBlock
        value={value}
        onChange={(newValue: any) => {
          setAttributes({ [attrKey]: newValue });
        }}
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      >
        {options.map(
          ({ value: optionValue, icon = null, label: optionLabel }) =>
            icon ? (
              <ToggleGroupControlOptionIcon
                key={optionValue}
                value={optionValue}
                icon={icon}
                label={optionLabel}
              />
            ) : (
              <ToggleGroupControlOption
                key={optionValue}
                value={optionValue}
                label={optionLabel}
              />
            ),
        )}
      </ToggleGroupControl>
    </ToolsPanelItem>
  );
};

export default ToggleGroupControlWithToolsPanel;
