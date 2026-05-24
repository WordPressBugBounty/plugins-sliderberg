/**
 * Slide Block Component - Rewritten and Modularized
 * Reduced from 786 lines to ~150 lines
 * Uses hooks and sub-components for clean separation of concerns
 */

import React, { useEffect } from "react";
// @ts-ignore
import { isEmpty } from "lodash";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import classnames from "classnames";
import { validateContentPosition } from "../../utils/security";

// Hooks
import { useSliderContext } from "../../context/SliderContext";

// Components
import { SlidePlaceholder } from "./components/SlidePlaceholder";
import { SlideInspector } from "./components/SlideInspector";
import { SlideToolbar } from "./components/SlideToolbar";

// Types - imported from centralized type definitions
import { SlideAttributes } from "../../types/slide";
import { applyFilters } from "@wordpress/hooks";
import {
  getBackgroundColorVar,
  generateStyles,
  getBorderCSS,
  getSingleSideBorderValue,
} from "../../components/shared/utils/styling-helpers";
import { isValidMediaUrl } from "../../utils/security";

interface SlideBlockProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
  clientId: string;
  parentMinHeight?: number;
}

// Default allowed blocks inside slides
const DEFAULT_ALLOWED_BLOCKS = [
  "core/paragraph",
  "core/heading",
  "core/image",
  "core/gallery",
  "core/list",
  "core/list-item",
  "core/quote",
  "core/audio",
  "core/cover",
  "core/file",
  "core/media-text",
  "core/video",
  "core/button",
  "core/buttons",
  "core/code",
  "core/preformatted",
  "core/pullquote",
  "core/separator",
  "core/spacer",
  "core/table",
  "core/columns",
  "core/column",
  "core/group",
  "core/html",
  "core/shortcode",
  "core/embed",
  "core/block",
  "core/more",
  "core/page-break",
  "core/read-more",
  "core/latest-posts",
  "core/categories",
  "core/tag-cloud",
  "core/archives",
  "core/search",
  "core/rss",
  "core/navigation",
  "core/navigation-link",
  "core/social-links",
  "core/social-link",
  "core/site-title",
  "core/site-tagline",
  "core/site-logo",
];

/**
 * Get allowed blocks for slides via filter
 * Allows pro plugins to add custom blocks
 *
 * @example
 * // Add WooCommerce blocks in a pro plugin:
 * wp.hooks.addFilter(
 *   'sliderberg.allowedSlideBlocks',
 *   'my-plugin/add-woo-blocks',
 *   (blocks) => [...blocks, 'woocommerce/product-grid']
 * );
 */
const ALLOWED_BLOCKS = applyFilters(
  "sliderberg.allowedSlideBlocks",
  DEFAULT_ALLOWED_BLOCKS,
) as string[];

export const SlideBlock: React.FC<SlideBlockProps> = ({
  attributes,
  setAttributes,
  clientId,
  parentMinHeight,
}) => {
  const {
    backgroundImage,
    backgroundColor,
    focalPoint,
    overlayColor,
    overlayOpacity,
    minHeight,
    contentPosition,
    isFixed,
    borderWidth,
    borderColor,
    borderStyle,
    border,
    borderRadius,
    slideBorderRadius,
    isBorderControlChanged,
  } = attributes;

  // Migrate old border attributes to new format on first render
  useEffect(() => {
    // Only migrate if user hasn't used the new BorderControl yet
    if (
      !isBorderControlChanged &&
      (borderWidth > 0 || borderColor || borderStyle)
    ) {
      const updates: Partial<SlideAttributes> = {};

      // Migrate border
      if (borderWidth > 0) {
        const borderValue = {
          width: `${borderWidth}px`,
          style: borderStyle || "solid",
          color: borderColor || "#000000",
        };
        updates.border = {
          top: borderValue,
          right: borderValue,
          bottom: borderValue,
          left: borderValue,
        };
      }

      // Migrate borderRadius (was stored as a number)
      if (typeof borderRadius === "number" && borderRadius > 0) {
        updates.slideBorderRadius = {
          topLeft: `${borderRadius}px`,
          topRight: `${borderRadius}px`,
          bottomLeft: `${borderRadius}px`,
          bottomRight: `${borderRadius}px`,
        };
      }

      // Apply migration and mark as migrated
      if (Object.keys(updates).length > 0) {
        setAttributes({
          ...updates,
          isBorderControlChanged: true,
        });
      }
    }
  }, []); // Run only once on mount

  // Compute background color/gradient using helper
  const backgroundColorValue = getBackgroundColorVar(
    attributes,
    "backgroundColor",
    "backgroundGradient",
  );

  // Check if slide has any background
  const hasBackground = backgroundImage || backgroundColorValue;

  // Get slider context (for carousel mode and current slide)
  const { currentSlideId, isCarouselMode } = useSliderContext();

  // Use parent's minHeight from block context
  // Default to 400 if not provided (shouldn't happen, but safety fallback)
  const effectiveParentMinHeight = parentMinHeight ?? 400;

  // Use parent's minHeight if slide's minHeight hasn't been customized
  // Slide's minHeight is considered customized if it's different from default (400)
  const effectiveMinHeight =
    minHeight !== 400 ? minHeight : effectiveParentMinHeight;

  // Apply border styles from new format
  const borderInFourDimensions = !isEmpty(border) ? getBorderCSS(border) : null;

  // Get border radius from new format
  const borderRadiusValue = slideBorderRadius || {};

  // Compute slide styles (background color, gradient, image, and borders)
  const slideStyles = generateStyles({
    background: backgroundColorValue,
    backgroundImage:
      backgroundImage && isValidMediaUrl(backgroundImage)
        ? `url(${backgroundImage.url})`
        : undefined,
    backgroundPosition: backgroundImage
      ? `${Math.max(0, Math.min(100, focalPoint.x * 100))}% ${Math.max(
          0,
          Math.min(100, focalPoint.y * 100),
        )}%`
      : undefined,
    backgroundSize: backgroundImage ? "cover" : undefined,
    backgroundAttachment: backgroundImage
      ? isFixed
        ? "fixed"
        : "scroll"
      : undefined,
    // Border styles
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
    // Border radius
    borderTopLeftRadius: borderRadiusValue?.topLeft,
    borderTopRightRadius: borderRadiusValue?.topRight,
    borderBottomLeftRadius: borderRadiusValue?.bottomLeft,
    borderBottomRightRadius: borderRadiusValue?.bottomRight,
    minHeight: `${effectiveMinHeight}px`,
  });

  // Determine visibility
  // Show if:
  // 1. Carousel mode is active (all slides shown)
  // 2. This slide is the current slide
  // 3. No current slide is set (fallback)
  // 4. Used outside of a slider (context default is null)
  const isVisible =
    isCarouselMode || !currentSlideId || currentSlideId === clientId;

  // Check if slide has border for CSS class
  const hasBorder = !isEmpty(border) || borderWidth > 0;

  // Block props
  const blockProps = useBlockProps({
    className: classnames(
      "sliderberg-slide",
      `sliderberg-content-position-${validateContentPosition(contentPosition)}`,
      {
        "has-border": hasBorder,
        active: currentSlideId === clientId, // Mark active slide
      },
    ),
    style: {
      ...slideStyles,
      display: isVisible ? undefined : "none",
    },
    "data-client-id": clientId,
  });

  // Render placeholder if no background
  if (!hasBackground) {
    return (
      <>
        <SlideToolbar clientId={clientId} />
        <SlideInspector attributes={attributes} setAttributes={setAttributes} />
        <SlidePlaceholder
          clientId={clientId}
          contentPosition={contentPosition}
          backgroundColor={backgroundColor}
          border={border}
          slideBorderRadius={borderRadiusValue}
          minHeight={effectiveMinHeight}
          onUpdate={setAttributes}
        />
      </>
    );
  }

  // Render slide with content
  return (
    <>
      <SlideToolbar clientId={clientId} />
      <SlideInspector attributes={attributes} setAttributes={setAttributes} />

      <div {...blockProps}>
        {overlayOpacity > 0 && (
          <div
            className="sliderberg-overlay"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        )}
        <div className="sliderberg-slide-content">
          <div className="sliderberg-slide-inner">
            <InnerBlocks
              allowedBlocks={ALLOWED_BLOCKS}
              template={[
                [
                  "core/heading",
                  {
                    level: 2,
                    placeholder: "Add a heading…",
                  },
                ],
                [
                  "core/paragraph",
                  {
                    placeholder: "Add your content here…",
                  },
                ],
              ]}
              templateLock={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
