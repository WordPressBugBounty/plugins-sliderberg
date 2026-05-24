/**
 * WordPress dependencies
 */
import React from "react";
import { isEmpty } from "lodash";
import {
  useBlockEditContext,
  __experimentalBorderRadiusControl as BorderRadiusControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
  BaseControl,
  __experimentalToolsPanelItem as ToolsPanelItem,
  __experimentalBorderBoxControl as BorderBoxControl,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import { BorderControlProps } from "./types";
import { splitBorderRadius } from "./utils/styling-helpers";

/**
 * Border control component
 * Provides dual control for border and border radius with ToolsPanel integration
 */
const BorderControl: React.FC<BorderControlProps> = ({
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
    select("core/block-editor").getBlockAttributes(clientId)
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
          resetAllFilter={() =>
            setAttributes({
              [attrBorderKey]: {},
            })
          }
          hasValue={() => !isEmpty(attributes[attrBorderKey])}
          label={borderLabel}
          onDeselect={() => {
            setAttributes({ [attrBorderKey]: {} });
          }}
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
          resetAllFilter={() =>
            setAttributes({
              [attrBorderRadiusKey]: {},
            })
          }
          label={borderRadiusLabel}
          hasValue={() => !isEmpty(attributes[attrBorderRadiusKey])}
          onDeselect={() => {
            setAttributes({ [attrBorderRadiusKey]: {} });
          }}
        >
          <BaseControl.VisualLabel as="legend">
            {borderRadiusLabel}
          </BaseControl.VisualLabel>
          <div className="sliderberg-border-radius-control">
            <BorderRadiusControl
              values={attributes[attrBorderRadiusKey]}
              onChange={(newBorderRadius: any) => {
                const splitted = splitBorderRadius(newBorderRadius);

                setAttributes({
                  [attrBorderRadiusKey]: splitted,
                });
              }}
            />
          </div>
        </ToolsPanelItem>
      )}
    </>
  );
};

export default BorderControl;
