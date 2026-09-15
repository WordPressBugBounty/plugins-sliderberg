/**
 * WordPress dependencies
 */
import React from "react";
import { useBlockEditContext } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  SelectControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { SelectControlWithToolsPanelProps } from "./types";

/**
 * Select control component with ToolsPanel integration
 * Self-managed via useBlockEditContext, wrapped in ToolsPanelItem
 */
const SelectControlWithToolsPanel: React.FC<
  SelectControlWithToolsPanelProps
> = ({
  label,
  attrKey,
  options,
  defaultValue = "",
  help,
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
      <SelectControl
        label={label}
        value={value}
        options={options}
        onChange={(newValue: any) => {
          setAttributes({ [attrKey]: newValue });
        }}
        help={help}
        size={"__unstable-large"}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
    </ToolsPanelItem>
  );
};

export default SelectControlWithToolsPanel;
