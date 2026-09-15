/**
 * WordPress dependencies
 */
import React from "react";
import { useBlockEditContext } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  ToggleControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { ToggleControlWithToolsPanelProps } from "./types";

/**
 * Toggle control component with ToolsPanel integration
 * Self-managed via useBlockEditContext, wrapped in ToolsPanelItem
 */
const ToggleControlWithToolsPanel: React.FC<
  ToggleControlWithToolsPanelProps
> = ({
  label,
  attrKey,
  defaultValue = false,
  isShownByDefault = true,
  help = "",
}) => {
  const { clientId } = useBlockEditContext();

  const attributes = useSelect((select) =>
    select("core/block-editor").getBlockAttributes(clientId),
  ) as Record<string, any>;

  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
  };

  const checked = attributes[attrKey];

  return (
    <ToolsPanelItem
      panelId={clientId}
      isShownByDefault={isShownByDefault}
      label={label}
      hasValue={() => checked !== defaultValue}
      onDeselect={() => setAttributes({ [attrKey]: defaultValue })}
      resetAllFilter={() => setAttributes({ [attrKey]: defaultValue })}
    >
      <ToggleControl
        label={label}
        checked={checked}
        onChange={(newValue: boolean) => {
          setAttributes({ [attrKey]: newValue });
        }}
        help={help}
        __nextHasNoMarginBottom
      />
    </ToolsPanelItem>
  );
};

export default ToggleControlWithToolsPanel;
