import React from "react";
import { __ } from "@wordpress/i18n";
import { BlockControls } from "@wordpress/block-editor";
import { ToolbarGroup, ToolbarButton } from "@wordpress/components";
import { plus, copy, trash } from "@wordpress/icons";
import { useDispatch, useSelect } from "@wordpress/data";
import { createBlock, cloneBlock } from "@wordpress/blocks";
import type { BlockInstance } from "@wordpress/blocks";

interface SlideToolbarProps {
  clientId: string;
}

export const SlideToolbar: React.FC<SlideToolbarProps> = ({ clientId }) => {
  const { insertBlock, removeBlock } = useDispatch("core/block-editor");

  // Get parent block and siblings info
  const { parentClientId, blockIndex, totalSlides, canDelete } = useSelect(
    (select: any) => {
      const { getBlockRootClientId, getBlockIndex, getBlocks } =
        select("core/block-editor");
      const parentId = getBlockRootClientId(clientId);
      const siblings = parentId ? getBlocks(parentId) : [];
      const slideBlocks = siblings.filter(
        (block: BlockInstance) => block.name === "sliderberg/slide"
      );

      return {
        parentClientId: parentId,
        blockIndex: getBlockIndex(clientId),
        totalSlides: slideBlocks.length,
        canDelete: slideBlocks.length > 1,
      };
    },
    [clientId]
  );

  // Get current block for duplication
  const currentBlock = useSelect(
    (select: any) => {
      const { getBlock } = select("core/block-editor");
      return getBlock(clientId);
    },
    [clientId]
  );

  const handleAddSlide = () => {
    if (parentClientId) {
      const newBlock = createBlock("sliderberg/slide");
      insertBlock(newBlock, blockIndex + 1, parentClientId);
    }
  };
  const handleDuplicateSlide = () => {
    if (parentClientId && currentBlock) {
      // @ts-ignore - cloneBlock is available in @wordpress/blocks but types might be missing in some setups
      const duplicatedBlock = cloneBlock(currentBlock);
      insertBlock(duplicatedBlock, blockIndex + 1, parentClientId);
    }
  };

  const handleDeleteSlide = () => {
    if (canDelete) {
      removeBlock(clientId);
    }
  };

  return (
    <BlockControls>
      <ToolbarGroup>
        <ToolbarButton
          icon={plus}
          label={__("Add Slide", "sliderberg")}
          onClick={handleAddSlide}
        />
        <ToolbarButton
          icon={copy}
          label={__("Duplicate Slide", "sliderberg")}
          onClick={handleDuplicateSlide}
        />
        <ToolbarButton
          icon={trash}
          label={__("Delete Slide", "sliderberg")}
          onClick={handleDeleteSlide}
          disabled={!canDelete}
        />
      </ToolbarGroup>
    </BlockControls>
  );
};
