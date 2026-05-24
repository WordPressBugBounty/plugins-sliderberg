/**
 * WordPress dependencies
 */
import React from "react";
import {
  useBlockEditContext,
  __experimentalSpacingSizesControl as SpacingSizesControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";

/**
 * Internal dependencies
 */
import { SpacingControlProps } from "./types";

/**
 * Spacing control component
 * Provides control for padding/margin spacing
 */
const SpacingControl: React.FC<SpacingControlProps> = ({
  label,
  attrKey,
  minimumCustomValue = 0,
  sides = ["top", "right", "bottom", "left"],
}) => {
  const { clientId } = useBlockEditContext();

  const attributes = useSelect(
    (select) => select("core/block-editor").getSelectedBlock()?.attributes
  ) as Record<string, any>;

  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
  };

  return (
    <>
      <SpacingSizesControl
        minimumCustomValue={minimumCustomValue}
        allowReset={true}
        label={label}
        values={attributes[attrKey]}
        sides={sides}
        onChange={(newValue: any) => {
          setAttributes({
            [attrKey]: newValue,
          });
        }}
      />
    </>
  );
};

export default SpacingControl;
