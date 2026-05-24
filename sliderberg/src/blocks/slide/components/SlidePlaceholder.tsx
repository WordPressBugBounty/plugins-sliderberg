/**
 * Placeholder component for slide block
 * Shows when no background is set
 */

import React from "react";
// @ts-ignore
import { isEmpty } from "lodash";
// @ts-ignore
import { __ } from "@wordpress/i18n";
import { MediaPlaceholder, useSetting } from "@wordpress/block-editor";
import { ColorPalette } from "@wordpress/components";
import classnames from "classnames";
import {
  getBorderCSS,
  getSingleSideBorderValue,
} from "../../../components/shared/utils/styling-helpers";
import type { MediaObject } from "../../../types";

interface SlidePlaceholderProps {
  clientId: string;
  contentPosition: string;
  backgroundColor: string;
  border: Record<string, any>;
  slideBorderRadius: Record<string, any>;
  minHeight: number;
  onUpdate: (attrs: Record<string, unknown>) => void;
}

export const SlidePlaceholder: React.FC<SlidePlaceholderProps> = ({
  clientId,
  contentPosition,
  backgroundColor,
  border,
  slideBorderRadius,
  minHeight,
  onUpdate,
}) => {
  const colorSettings = useSetting("color.palette") || [];

  // Apply border styles
  const borderInFourDimensions = !isEmpty(border) ? getBorderCSS(border) : null;

  return (
    <div
      className={classnames(
        "sliderberg-slide",
        "sliderberg-slide-placeholder",
        `sliderberg-content-position-${contentPosition}`,
        {
          "has-border": !isEmpty(border),
        },
      )}
      data-client-id={clientId}
      style={{
        minHeight: `${minHeight}px`,
        borderTop: borderInFourDimensions
          ? getSingleSideBorderValue(borderInFourDimensions, "top")
          : undefined,
        borderRight: borderInFourDimensions
          ? getSingleSideBorderValue(borderInFourDimensions, "right")
          : undefined,
        borderBottom: borderInFourDimensions
          ? getSingleSideBorderValue(borderInFourDimensions, "bottom")
          : undefined,
        borderLeft: borderInFourDimensions
          ? getSingleSideBorderValue(borderInFourDimensions, "left")
          : undefined,
        borderTopLeftRadius: slideBorderRadius?.topLeft,
        borderTopRightRadius: slideBorderRadius?.topRight,
        borderBottomLeftRadius: slideBorderRadius?.bottomLeft,
        borderBottomRightRadius: slideBorderRadius?.bottomRight,
      }}
    >
      <MediaPlaceholder
        icon="format-image"
        labels={{
          title: __("Slide Background", "sliderberg"),
          instructions: __(
            "Drag and drop an image, upload, or choose from your library.",
            "sliderberg",
          ),
        }}
        onSelect={(media: MediaObject) =>
          onUpdate({
            backgroundImage: {
              id: media.id,
              url: media.url,
              alt: media.alt || "",
            },
            focalPoint: { x: 0.5, y: 0.5 },
          })
        }
        accept="image/*"
        allowedTypes={["image"]}
      >
        <div className="sliderberg-placeholder-colors">
          <ColorPalette
            colors={colorSettings}
            value={backgroundColor}
            onChange={(color) =>
              onUpdate({
                backgroundColor: color || "",
              })
            }
            asButtons
            clearable={false}
            disableCustomColors
          />
        </div>
      </MediaPlaceholder>
    </div>
  );
};
