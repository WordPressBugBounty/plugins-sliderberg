import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock, cloneBlock } from '@wordpress/blocks';
import type { BlockInstance } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { SliderAttributes } from '../types/slider';

type BlockEditorSelect = {
	getBlocks: (clientId: string) => BlockInstance[];
	getBlock: (clientId: string) => BlockInstance | null;
	getBlockIndex: (clientId: string, rootClientId: string) => number;
	getSelectedBlockClientId: () => string | null;
};

export const useSliderState = (clientId: string, attributes: SliderAttributes) => {
	const [currentSlideId, setCurrentSlideId] = useState<string | null>(
		null
	);

	// Get the current inner blocks for this slider
	const innerBlocks = useSelect(
		(selectFunc: (store: string) => BlockEditorSelect) =>
			clientId
				? selectFunc(blockEditorStore).getBlocks(clientId)
				: [],
		[clientId]
	) as BlockInstance[];

	const { insertBlock, removeBlock, insertBlocks, selectBlock } =
		useDispatch(blockEditorStore);

	const { getBlock, getBlockIndex, selectedBlockClientId } = useSelect((selectFunc) => {
		const editorSelect = selectFunc(
			blockEditorStore
		) as BlockEditorSelect;
		return {
			getBlock: editorSelect.getBlock,
			getBlockIndex: editorSelect.getBlockIndex,
			selectedBlockClientId: editorSelect.getSelectedBlockClientId(),
		};
	}, []);

	// Sync selection from WP to our state
	useEffect(() => {
		if (
			selectedBlockClientId &&
			innerBlocks.some((b) => b.clientId === selectedBlockClientId)
		) {
			if (currentSlideId !== selectedBlockClientId) {
				setCurrentSlideId(selectedBlockClientId);
			}
		}
	}, [selectedBlockClientId, innerBlocks, currentSlideId]);

	// Handle new block additions
	const prevInnerBlocksLength = useRef(innerBlocks.length);
	useEffect(() => {
		if (innerBlocks.length > prevInnerBlocksLength.current) {
			// A block was added
			const newBlock = innerBlocks[innerBlocks.length - 1];

			if (newBlock) {
				// Smart selection logic
				let targetClientId = newBlock.clientId;

				if (attributes.isCarouselMode && attributes.slidesToShow > 1) {
					// Try to keep the new slide visible but at the end if possible
					// by selecting a slide 'slidesToShow - 1' spots before it
					const firstVisibleIdx = Math.max(
						innerBlocks.length - attributes.slidesToShow,
						0
					);
					const firstVisibleBlock = innerBlocks[firstVisibleIdx];
					if (firstVisibleBlock) {
						targetClientId = firstVisibleBlock.clientId;
					}
				}

				// Select the target block
				selectBlock(targetClientId);

				// Also update our state immediately
				setCurrentSlideId(targetClientId);
			}
		}
		prevInnerBlocksLength.current = innerBlocks.length;
	}, [innerBlocks, attributes.isCarouselMode, attributes.slidesToShow, selectBlock]);

	// Set the first slide as current by default if not set or if current slide no longer exists
	useEffect(() => {
		if (innerBlocks.length > 0) {
			const currentSlideExists =
				currentSlideId &&
				innerBlocks.some((b) => b.clientId === currentSlideId);
			if (!currentSlideExists) {
				setCurrentSlideId(innerBlocks[0].clientId);

				// If this is the first slide being added (going from 0 to 1 slide),
				// select it to show slide options in the sidebar
				if (innerBlocks.length === 1 && !currentSlideId) {
					selectBlock(innerBlocks[0].clientId);
				}
			}
		}
	}, [innerBlocks, currentSlideId, selectBlock]);

	const handleSlideChange = (slideId: string) => {
		setCurrentSlideId(slideId);
	};

	const handleAddSlide = () => {
		const slideBlock = createBlock('sliderberg/slide');
		// insertBlock with updateSelection: false, we handle selection in useEffect
		insertBlock(slideBlock, innerBlocks.length, clientId, false);
	};

	const handleDeleteSlide = () => {
		if (innerBlocks.length <= 1) {
			return;
		}

		const currentIndex = innerBlocks.findIndex(
			(block) => block.clientId === currentSlideId
		);
		const nextIndex = (currentIndex + 1) % innerBlocks.length;
		const nextSlideId = innerBlocks[nextIndex].clientId;

		removeBlock(currentSlideId as string);
		setCurrentSlideId(nextSlideId);
	};

	const handleDuplicateSlide = (slideIdToDuplicate: string) => {
		if (!slideIdToDuplicate) {
			return;
		}

		const originalBlock = getBlock(slideIdToDuplicate);
		if (!originalBlock) {
			return;
		}

		const duplicatedBlock = cloneBlock(originalBlock);
		if (!duplicatedBlock) {
			return;
		}

		const originalSlideIndex = getBlockIndex(
			slideIdToDuplicate,
			clientId
		);
		const insertionPoint =
			originalSlideIndex !== -1
				? originalSlideIndex + 1
				: innerBlocks.length;

		// insertBlocks with updateSelection: false, we handle selection in useEffect
		insertBlocks(duplicatedBlock, insertionPoint, clientId, false);
	};

	return {
		currentSlideId,
		innerBlocks,
		handleSlideChange,
		handleAddSlide,
		handleDeleteSlide,
		handleDuplicateSlide,
	};
};
