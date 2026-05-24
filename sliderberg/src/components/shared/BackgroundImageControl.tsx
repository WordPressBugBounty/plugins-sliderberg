/**
 * Background Image Control Component
 * WordPress Gutenberg-style background image control with media upload,
 * focal point picker, and fixed background toggle
 *
 * Follows WordPress patterns from:
 * packages/block-editor/src/hooks/background.js
 * packages/block-editor/src/components/background-image-control/index.js
 */

import React, { useState, useRef } from "react";
// @ts-ignore - WordPress i18n package
import { __ } from "@wordpress/i18n";
// @ts-ignore - WordPress i18n package
import { sprintf } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import {
  useBlockEditContext,
  store as blockEditorStore,
} from "@wordpress/block-editor";
import {
  Button,
  FocalPointPicker,
  ToggleControl,
  DropZone,
  Spinner,
  VisuallyHidden,
  Dropdown,
  __experimentalVStack as VStack,
} from "@wordpress/components";
import { reset as resetIcon } from "@wordpress/icons";
import { isBlobURL } from "@wordpress/blob";
import { store as noticesStore } from "@wordpress/notices";
import { focus } from "@wordpress/dom";
import { getFilename } from "@wordpress/url";
import type { MediaObject, FocalPoint } from "../../types/common";
import ToolsPanelItemWrapper from "./ToolsPanelItemWrapper";

// MediaReplaceFlow component - access from global wp object
const MediaReplaceFlow =
  (window as any).wp.blockEditor?.MediaReplaceFlow || (() => null);

// Default values matching WordPress BACKGROUND_BLOCK_DEFAULT_VALUES

/**
 * Focuses the toggle button for accessibility after modal/dropdown closes
 * Uses requestAnimationFrame to ensure DOM updates are complete
 */
const focusToggleButton = (containerRef: React.RefObject<HTMLDivElement>) => {
  window.requestAnimationFrame(() => {
    if (containerRef.current) {
      const [toggleButton] = focus.tabbable.find(containerRef.current);
      toggleButton?.focus();
    }
  });
};

/**
 * Background Image Control Component
 * Provides media upload, focal point picker, and fixed background toggle
 * following WordPress Gutenberg patterns from the Cover block
 */
const BackgroundImageControl: React.FC<BackgroundImageControlProps> = ({
  label = __("Background Image", "sliderberg"),
}) => {
  const { clientId } = useBlockEditContext();
  const { updateBlockAttributes } = useDispatch("core/block-editor") as any;
  const { createErrorNotice } = useDispatch(noticesStore) as any;

  // State for upload tracking and UI feedback
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popover props for consistent positioning
  const BACKGROUND_POPOVER_PROPS = {
    placement: "left-start" as const,
    offset: 36,
    shift: true,
  };

  const { backgroundImage, focalPoint, isFixed, mediaUpload } = useSelect(
    (select: any) => {
      const blockEditor = select(blockEditorStore);
      const attributes = blockEditor.getBlockAttributes(clientId) as Record<
        string,
        any
      >;
      const settings = blockEditor.getSettings();
      return {
        backgroundImage: attributes.backgroundImage as MediaObject | null,
        focalPoint: attributes.focalPoint as FocalPoint,
        isFixed: attributes.isFixed as boolean,
        mediaUpload: settings.mediaUpload,
      };
    },
    [clientId]
  ) as {
    backgroundImage: MediaObject | null;
    focalPoint: FocalPoint;
    isFixed: boolean;
    mediaUpload: any;
  };

  const setAttributes = (newAttributes: Record<string, any>) =>
    updateBlockAttributes(clientId, newAttributes);

  /**
   * Handle upload errors with WordPress-native error notices
   */
  const onUploadError = (message: string) => {
    createErrorNotice(message, { type: "snackbar" });
    setIsUploading(false);
  };

  /**
   * Handle media selection from media library
   * Validates file types, handles blob URLs, and sets default position
   */
  const onSelectMedia = (media: MediaObject) => {
    if (!media || !media.url) {
      onRemoveImage();
      setIsUploading(false);
      return;
    }

    // Check if upload is still in progress (blob URL)
    if (isBlobURL(media.url)) {
      setIsUploading(true);
      return;
    }

    // Validate file type - only allow images
    const mediaType = (media as any).media_type || (media as any).type;
    if (mediaType && mediaType !== "image") {
      onUploadError(
        __("Only images can be used as a background image.", "sliderberg")
      );
      return;
    }

    setAttributes({
      backgroundImage: {
        id: media.id,
        url: media.url,
        alt: media.alt || "",
      },
      // Set default position '50% 0' to increase chance focus point is visible
      focalPoint: focalPoint || { x: 0.5, y: 0 },
    });

    setIsUploading(false);
    // Return focus to toggle button after selection
    focusToggleButton(containerRef);
  };

  /**
   * Clear/remove background image
   */
  const onRemoveImage = () => {
    setAttributes({
      backgroundImage: null,
      focalPoint: { x: 0.5, y: 0.5 },
      isFixed: false,
    });
    // Return focus to toggle button after removal
    focusToggleButton(containerRef);
  };

  /**
   * Handle drag-and-drop file uploads
   * Restricts to single image file
   */
  const onFilesDrop = (filesList: File[]) => {
    if (!mediaUpload) {
      return;
    }

    mediaUpload({
      allowedTypes: ["image"],
      filesList,
      onFileChange([image]: MediaObject[]) {
        onSelectMedia(image);
      },
      onError: onUploadError,
      multiple: false,
    });
  };

  /**
   * Update focal point - converts picker coords to CSS background-position
   */
  const onChangeFocalPoint = (newFocalPoint: FocalPoint) => {
    setAttributes({
      focalPoint: newFocalPoint,
    });
  };

  /**
   * Toggle fixed background
   */
  const onToggleFixed = (value: boolean) => {
    setAttributes({ isFixed: value });
  };

  const imageLabel =
    backgroundImage?.alt ||
    getFilename(backgroundImage?.url || "") ||
    __("Add background image", "sliderberg");

  return (
    <ToolsPanelItemWrapper
      hasValue={() => !!backgroundImage}
      label={label}
      onDeselect={onRemoveImage}
      isShownByDefault
    >
      <div
        ref={containerRef}
        className="sliderberg-background-image-control"
        style={{ position: "relative" }}
      >
        {isUploading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 1,
              borderRadius: "2px",
            }}
          >
            <Spinner />
          </div>
        )}

        {!backgroundImage ? (
          <>
            <MediaReplaceFlow
              mediaId={backgroundImage?.id}
              mediaURL={backgroundImage?.url}
              allowedTypes={["image"]}
              accept="image/*"
              onSelect={onSelectMedia}
              onError={onUploadError}
              name={__("Add background image", "sliderberg")}
              renderToggle={(props: any) => (
                <Button
                  {...props}
                  __next40pxDefaultSize
                  variant="secondary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    height: "40px",
                  }}
                >
                  {isUploading ? <Spinner /> : props.children}
                </Button>
              )}
            />
            <DropZone
              onFilesDrop={onFilesDrop}
              label={__("Drop to upload", "sliderberg")}
            />
          </>
        ) : (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "2px",
              position: "relative",
            }}
          >
            <Dropdown
              popoverProps={BACKGROUND_POPOVER_PROPS}
              renderToggle={({ onToggle, isOpen }) => (
                <>
                  <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    aria-label={__("Background image options", "sliderberg")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      padding: "12px",
                      background: isOpen ? "#f0f0f0" : "#fff",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.1s ease",
                      gap: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isOpen) {
                        e.currentTarget.style.background = "#f9f9f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpen) {
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundImage: `url(${backgroundImage.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: `${(focalPoint?.x || 0.5) * 100}% ${
                          (focalPoint?.y || 0.5) * 100
                        }%`,
                        border: "1px solid #ddd",
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        color: "#2271b1",
                        fontSize: "13px",
                        overflow: "hidden",
                      }}
                    >
                      {imageLabel}
                    </span>
                  </button>
                  <Button
                    __next40pxDefaultSize
                    label={__("Reset", "sliderberg")}
                    icon={resetIcon}
                    size="small"
                    onClick={() => {
                      onRemoveImage();
                      focusToggleButton(containerRef);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      minWidth: "auto",
                      padding: "4px",
                      zIndex: 1,
                    }}
                  />
                </>
              )}
              renderContent={() => (
                <div
                  style={{
                    padding: "16px",
                    minWidth: "320px",
                    maxWidth: "400px",
                  }}
                >
                  <VStack spacing={5}>
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          color: "#1e1e1e",
                          marginBottom: "8px",
                          letterSpacing: "0.4px",
                        }}
                      >
                        {__("Focal Point", "sliderberg")}
                      </div>
                      <FocalPointPicker
                        url={backgroundImage.url}
                        value={focalPoint || { x: 0.5, y: 0.5 }}
                        onChange={onChangeFocalPoint}
                      />
                    </div>
                    <ToggleControl
                      label={__("Fixed background", "sliderberg")}
                      checked={isFixed}
                      onChange={onToggleFixed}
                    />
                  </VStack>
                </div>
              )}
            />
            <DropZone
              onFilesDrop={onFilesDrop}
              label={__("Drop to upload", "sliderberg")}
            />
          </div>
        )}

        <VisuallyHidden as="span">
          {backgroundImage
            ? sprintf(__("Background image: %s", "sliderberg"), imageLabel)
            : __("No background image selected", "sliderberg")}
        </VisuallyHidden>
      </div>
    </ToolsPanelItemWrapper>
  );
};

export default BackgroundImageControl;
