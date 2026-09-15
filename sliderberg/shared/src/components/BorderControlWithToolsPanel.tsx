/**
 * WordPress dependencies
 */
import React from "react";
import {
  useBlockEditContext,
  __experimentalBorderRadiusControl as BorderRadiusControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  BaseControl,
  __experimentalBorderBoxControl as BorderBoxControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { BorderControlWithToolsPanelProps } from "./types";
import { splitBorderRadius } from "./utils/styling-helpers";

/**
 * Border control component with ToolsPanel integration
 * Each sub-control (border + border radius) is wrapped in its own ToolsPanelItem
 */
const BorderControlWithToolsPanel: React.FC<
  BorderControlWithToolsPanelProps
> = ({
  borderLabel,
  attrBorderKey,
  borderRadiusLabel,
  attrBorderRadiusKey,
  isShowBorder = true,
  isShowBorderRadius = true,
  showDefaultBorder = false,
  showDefaultBorderRadius = false,
}) => {
  const { clientId } = useBlockEditContext();

  const attributes = useSelect((select) =>
    select("core/block-editor").getBlockAttributes(clientId),
  ) as Record<string, any>;

  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;

  const setAttributes = (newAttributes: Record<string, any>) => {
    updateBlockAttributes(clientId, newAttributes);
  };

  const { defaultColors } = useSelect((select) => {
    return {
      defaultColors:
        select("core/block-editor")?.getSettings()?.__experimentalFeatures
          ?.color?.palette?.default,
    };
  }) as { defaultColors: any };

  return (
    <>
      {isShowBorder && (
        <ToolsPanelItem
          panelId={clientId}
          isShownByDefault={showDefaultBorder}
          label={borderLabel}
          hasValue={() =>
            attributes[attrBorderKey] != null &&
            Object.keys(attributes[attrBorderKey] || {}).length > 0
          }
          onDeselect={() => setAttributes({ [attrBorderKey]: {} })}
          resetAllFilter={() => setAttributes({ [attrBorderKey]: {} })}
        >
          <BorderBoxControl
            enableAlpha
            size={"__unstable-large"}
            colors={defaultColors}
            label={borderLabel}
            onChange={(newBorder: any) => {
              setAttributes({ [attrBorderKey]: newBorder });
            }}
            value={attributes[attrBorderKey]}
          />
        </ToolsPanelItem>
      )}

      {isShowBorderRadius && (
        <ToolsPanelItem
          panelId={clientId}
          isShownByDefault={showDefaultBorderRadius}
          label={borderRadiusLabel}
          hasValue={() =>
            attributes[attrBorderRadiusKey] != null &&
            Object.keys(attributes[attrBorderRadiusKey] || {}).length > 0
          }
          onDeselect={() => setAttributes({ [attrBorderRadiusKey]: {} })}
          resetAllFilter={() => setAttributes({ [attrBorderRadiusKey]: {} })}
        >
          <BaseControl.VisualLabel as="legend">
            {borderRadiusLabel}
          </BaseControl.VisualLabel>
          <div className="sliderberg-border-radius-control">
            <BorderRadiusControl
              values={attributes[attrBorderRadiusKey]}
              onChange={(newBorderRadius: any) => {
                const splitted = splitBorderRadius(newBorderRadius);
                setAttributes({ [attrBorderRadiusKey]: splitted });
              }}
            />
          </div>
        </ToolsPanelItem>
      )}
    </>
  );
};

export default BorderControlWithToolsPanel;
