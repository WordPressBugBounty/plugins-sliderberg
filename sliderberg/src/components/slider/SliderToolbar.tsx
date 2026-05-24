import React from "react";
import { __ } from "@wordpress/i18n";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { plus, copy, trash } from "@wordpress/icons";
import type { BlockInstance } from "@wordpress/blocks";

interface SliderToolbarProps {
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide?: (slideId?: string) => void;
  canDelete: boolean;
  currentSlideId: string | null;
  isCarouselMode?: boolean;
  slidesToShow?: number;
  innerBlocks?: BlockInstance[];
}

export const SliderToolbar: React.FC<SliderToolbarProps> = ({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  canDelete,
  currentSlideId,
  isCarouselMode = false,
  slidesToShow = 1,
  innerBlocks = [],
}) => {
  // Get the current slide index for better button text
  const currentSlideIndex = innerBlocks.findIndex(
    (block) => block.clientId === currentSlideId
  );
  const slideNumber = currentSlideIndex >= 0 ? currentSlideIndex + 1 : 0;

  // Determine duplicate button text based on mode
  const getDuplicateButtonText = () => {
    if (!isCarouselMode || slidesToShow <= 1) {
      return __("Duplicate Slide", "sliderberg");
    }

    return __("Duplicate Slide", "sliderberg") + " " + slideNumber;
  };

  // Handle duplicate with optional slide ID
  const handleDuplicate = (slideId?: string) => {
    const targetSlideId = slideId || currentSlideId;
    if (targetSlideId && onDuplicateSlide) {
      onDuplicateSlide(targetSlideId);
    }
  };

  return (
    <BlockControls>
      <ToolbarGroup>
        <ToolbarButton
          icon={plus}
          label={__("Add Slide", "sliderberg")}
          onClick={onAddSlide}
        />
        {onDuplicateSlide && (
          <ToolbarButton
            icon={copy}
            label={getDuplicateButtonText()}
            onClick={() => handleDuplicate()}
            disabled={!currentSlideId}
            title={
              isCarouselMode && slidesToShow > 1
                ? __("Will duplicate slide", "sliderberg") +
                  " " +
                  slideNumber +
                  " " +
                  __("of", "sliderberg") +
                  " " +
                  innerBlocks.length
                : __("Duplicate the current slide", "sliderberg")
            }
          />
        )}
        <ToolbarButton
          icon={trash}
          label={__("Delete Slide", "sliderberg")}
          onClick={onDeleteSlide}
          disabled={!canDelete}
        />
      </ToolbarGroup>
    </BlockControls>
  );
};
