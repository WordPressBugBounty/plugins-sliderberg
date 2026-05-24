/**
 * WordPress dependencies
 */
import React from "react";
import { isEmpty } from "lodash";
import {
  useBlockEditContext,
  __experimentalSpacingSizesControl as SpacingSizesControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";

/**
 * Internal dependencies
 */
import { SpacingControlWithToolsPanelProps } from "./types";

/**
 * Spacing control with ToolsPanel component
 * Provides spacing control wrapped in ToolsPanel for reset functionality
 */
const SpacingControlWithToolsPanel: React.FC<
  SpacingControlWithToolsPanelProps
> = ({ label, attrKey, showByDefault = false, minimumCustomValue = 0 }) => {
  const { clientId } = useBlockEditContext();

  const attributes = useSelect((select) =>
    select("core/block-editor").getBlockAttributes(clientId)
  ) as Record<string, any>;

  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
  };

  return (
    <>
      <ToolsPanelItem
        panelId={clientId}
        isShownByDefault={showByDefault}
        resetAllFilter={() => {
          setAttributes({
            [attrKey]: {},
          });
        }}
        className={"tools-panel-item-spacing"}
        label={label}
        onDeselect={() => setAttributes({ [attrKey]: {} })}
        hasValue={() => !isEmpty(attributes[attrKey])}
      >
        <SpacingSizesControl
          minimumCustomValue={minimumCustomValue}
          allowReset={true}
          label={label}
          values={attributes[attrKey]}
          sides={["top", "right", "bottom", "left"]}
          onChange={(newValue: any) => {
            setAttributes({
              [attrKey]: newValue,
            });
          }}
        />
      </ToolsPanelItem>
    </>
  );
};

export default SpacingControlWithToolsPanel;
