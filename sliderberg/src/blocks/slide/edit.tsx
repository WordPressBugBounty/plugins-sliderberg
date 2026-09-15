/**
 * Slide block editor component.
 * Renders a slide with background, overlay, and inner blocks for content.
 */

import type { CSSProperties } from "react";
import {
  BlockControls,
  store as blockEditorStore,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import {
  AlignmentMatrixControl,
  Dropdown,
  ToolbarButton,
  ToolbarGroup,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

import SlideInspector from "./inspector";
import SlidePlaceholder from "./components/SlidePlaceholder";
import type { ContentPosition, SlideAttributes } from "./constants";

import "./editor.scss";

interface EditProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
  clientId: string;
  context: Record<string, any>;
}

// AlignmentMatrixControl uses space-separated values ("top left"); our
// contentPosition attribute uses hyphens ("top-left") to match the CSS
// class / flex-alignment mapping used elsewhere.
const toMatrixValue = (position: string) => position.replace("-", " ");
const toContentPosition = (value: string) =>
  value.replace(" ", "-") as ContentPosition;

export default function Edit({
  attributes,
  setAttributes,
  clientId,
  context,
}: EditProps) {
  const {
    backgroundImage,
    backgroundColor,
    backgroundGradient,
    focalPoint,
    overlayColor,
    overlayOpacity,
    contentPosition,
    isFixed,
    minHeight: slideMinHeight,
    border,
    slideBorderRadius,
  } = attributes;

  const matrixValue = toMatrixValue(contentPosition || "center-center");
  const contentPositionControl = (
    <BlockControls group="block">
      <ToolbarGroup>
        <Dropdown
          popoverProps={{ placement: "bottom-start" }}
          renderToggle={({ isOpen, onToggle }) => (
            <ToolbarButton
              onClick={onToggle}
              aria-expanded={isOpen}
              label={__("Change content position", "sliderberg")}
              icon={<AlignmentMatrixControl.Icon value={matrixValue as any} />}
            />
          )}
          renderContent={() => (
            <AlignmentMatrixControl
              label={__("Content Position", "sliderberg")}
              value={matrixValue as any}
              onChange={(value) =>
                setAttributes({
                  contentPosition: toContentPosition(value as string),
                })
              }
            />
          )}
        />
      </ToolbarGroup>
    </BlockControls>
  );

  const parentMinHeight = context["sliderberg/minHeight"] || 400;
  // The slider minimum height is the floor for every slide. A slide-specific
  // value may make that slide taller, but must not leave it shorter than the
  // Swiper container and expose empty space below it.
  const effectiveMinHeight =
    slideMinHeight !== 400
      ? Math.max(slideMinHeight, parentMinHeight)
      : parentMinHeight;

  // In Carousel mode several empty slides can be visible in the canvas at
  // once — showing each one's full upload/media-library/color placeholder
  // simultaneously is cluttered (matches the Columns block: only the active
  // column shows its inserter). Show the full placeholder only for the
  // slide that's active, or — if nothing in this slider/carousel is active
  // yet — the first slide, so there's always exactly one full placeholder
  // rather than none.
  const hasBackground = !!(
    backgroundImage?.url ||
    backgroundGradient ||
    backgroundColor
  );

  const showFullPlaceholder = useSelect(
    (select) => {
      // Only the placeholder (no background yet) cares about this — skip
      // the selection lookups entirely once a background is set, since the
      // result is never used in that case.
      if (hasBackground) {
        return false;
      }

      const { getBlockRootClientId, getBlockOrder, hasSelectedInnerBlock, isBlockSelected } =
        select(blockEditorStore) as any;

      const isThisSlideActive =
        isBlockSelected(clientId) || hasSelectedInnerBlock(clientId, true);
      if (isThisSlideActive) {
        return true;
      }

      const parentClientId = getBlockRootClientId(clientId);
      if (!parentClientId) {
        return true;
      }

      const siblingOrder: string[] = getBlockOrder(parentClientId);
      if (siblingOrder[0] !== clientId) {
        return false;
      }

      const anySiblingActive = siblingOrder.some(
        (siblingId) =>
          siblingId !== clientId &&
          (isBlockSelected(siblingId) || hasSelectedInnerBlock(siblingId, true)),
      );
      return !anySiblingActive;
    },
    [clientId, hasBackground],
  );

  // Build background styles — infer type from values so backgroundType doesn't need to be kept in sync
  const backgroundStyle: CSSProperties = {};

  if (backgroundImage?.url) {
    backgroundStyle.backgroundImage = `url(${backgroundImage.url})`;
    backgroundStyle.backgroundSize = "cover";
    backgroundStyle.backgroundPosition = focalPoint
      ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
      : "50% 50%";
    backgroundStyle.backgroundAttachment = isFixed ? "fixed" : "scroll";
    backgroundStyle.backgroundRepeat = "no-repeat";
  } else if (backgroundGradient) {
    backgroundStyle.backgroundImage = backgroundGradient;
  } else if (backgroundColor) {
    backgroundStyle.backgroundColor = backgroundColor;
  }

  // Build border styles from new border object
  const borderStyle: CSSProperties = {};
  if (border && typeof border === "object") {
    const sides = ["top", "right", "bottom", "left"] as const;
    for (const side of sides) {
      const b = (border as any)[side];
      if (b) {
        const key = `border${
          side.charAt(0).toUpperCase() + side.slice(1)
        }` as keyof CSSProperties;
        borderStyle[key as any] = `${b.width || "0px"} ${b.style || "solid"} ${
          b.color || "transparent"
        }`;
      }
    }
  }

  // Build border-radius styles
  const radiusStyle: CSSProperties = {};
  if (slideBorderRadius && typeof slideBorderRadius === "object") {
    const r = slideBorderRadius as any;
    if (r.topLeft) {
      radiusStyle.borderTopLeftRadius = r.topLeft;
    }
    if (r.topRight) {
      radiusStyle.borderTopRightRadius = r.topRight;
    }
    if (r.bottomLeft) {
      radiusStyle.borderBottomLeftRadius = r.bottomLeft;
    }
    if (r.bottomRight) {
      radiusStyle.borderBottomRightRadius = r.bottomRight;
    }
  }

  // Map content position to CSS flexbox alignment. The container below uses
  // flex-direction: column, so align-items controls the horizontal axis and
  // justify-content controls the vertical axis.
  const positionToAlign = (pos: string) => {
    const [vertical, horizontal] = pos.split("-");
    const verticalMap: Record<string, string> = {
      top: "flex-start",
      bottom: "flex-end",
    };
    const horizontalMap: Record<string, string> = {
      left: "flex-start",
      right: "flex-end",
    };
    return {
      alignItems: horizontalMap[horizontal] || "center",
      justifyContent: verticalMap[vertical] || "center",
    };
  };

  const { alignItems, justifyContent } = positionToAlign(
    contentPosition || "center-center",
  );

  const blockProps = useBlockProps({
    className: "swiper-slide sliderberg-slide-editor",
    style: {
      ...backgroundStyle,
      ...borderStyle,
      ...radiusStyle,
      minHeight: `${effectiveMinHeight}px`,
    },
  });

  const innerBlocksProps = useInnerBlocksProps(
    {
      className: "sliderberg-slide-content",
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems,
        justifyContent,
        minHeight: `${effectiveMinHeight}px`,
      },
    },
    {
      template: [
        [
          "core/heading",
          {
            placeholder: "Slide Title...",
            level: 2,
          },
        ],
        ["core/paragraph", { placeholder: "Slide content..." }],
      ],
      templateLock: false,
    },
  );

  const showOverlay = !!overlayColor && !!backgroundImage?.url;

  if (!hasBackground) {
    return (
      <div {...blockProps}>
        {contentPositionControl}
        <SlideInspector attributes={attributes} setAttributes={setAttributes} />
        <SlidePlaceholder
          clientId={clientId}
          contentPosition={contentPosition || "center-center"}
          backgroundColor={backgroundColor}
          border={border || {}}
          slideBorderRadius={slideBorderRadius || {}}
          minHeight={effectiveMinHeight}
          onUpdate={setAttributes}
          collapsed={!showFullPlaceholder}
        />
      </div>
    );
  }

  return (
    <div {...blockProps}>
      {contentPositionControl}
      <SlideInspector attributes={attributes} setAttributes={setAttributes} />
      {showOverlay && (
        <div
          className="sliderberg-slide-overlay"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity || 1,
          }}
        />
      )}
      <div {...innerBlocksProps} />
    </div>
  );
}
