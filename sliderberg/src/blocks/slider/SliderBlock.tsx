/**
 * Slider Block Component - Simplified and Rewritten
 * Clean separation of concerns with custom hooks
 */

import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';

// Import sub-components (already modular)
import { SliderContent } from '../../components/slider/SliderContent';
import { SliderSettings } from '../../components/slider/settings/SliderSettings';
import { SliderToolbar } from '../../components/slider/SliderToolbar';

// Import hooks
import { useSliderState } from '../../hooks/useSliderState';
import { useSliderEditorStyles } from './hooks/useSliderEditorStyles';

// Import types
import { SliderAttributes } from '../../types/slider';
import { isProBlock } from '../../config/blocks';

interface SliderBlockProps {
	attributes: SliderAttributes;
	setAttributes: (attrs: Partial<SliderAttributes>) => void;
	clientId: string;
}

export const SliderBlock: React.FC<SliderBlockProps> = ({
	attributes,
	setAttributes,
	clientId,
}) => {
	// Use custom hooks for logic
	const {
		currentSlideId,
		innerBlocks,
		handleSlideChange,
		handleAddSlide,
		handleDeleteSlide,
		handleDuplicateSlide,
	} = useSliderState(clientId, attributes);

	const editorStyles = useSliderEditorStyles(attributes);

	// Ensure align is set for custom width
	useEffect(() => {
		if (attributes.widthPreset === 'custom' && !attributes.align) {
			setAttributes({ align: 'full' });
		}
	}, [attributes.widthPreset, attributes.align, setAttributes]);


	// Build block props
	const blockProps = useBlockProps({
		style: editorStyles,
		'data-width-preset': attributes.widthPreset,
		'data-type': attributes.type,
		className: [
			'sliderberg-editor-wrapper',
			attributes.widthPreset === 'full' || attributes.align === 'full'
				? 'is-full-width'
				: '',
			attributes.isCarouselMode ? 'is-carousel-mode' : '',
		]
			.filter(Boolean)
			.join(' '),
	} as any);

	// Check for pro blocks
	const hasProChild = innerBlocks.some((block: BlockInstance) =>
		isProBlock(block.name)
	);

	// Render
	return (
		<div {...blockProps}>
			{ /* Toolbar */}
			{(attributes.type || hasProChild) && (
				<SliderToolbar
					onAddSlide={handleAddSlide}
					onDeleteSlide={handleDeleteSlide}
					onDuplicateSlide={handleDuplicateSlide}
					canDelete={innerBlocks.length > 1}
					currentSlideId={currentSlideId}
					isCarouselMode={attributes.isCarouselMode}
					slidesToShow={attributes.slidesToShow}
					innerBlocks={innerBlocks}
				/>
			)}

			{ /* Settings panel */}
			{(attributes.type || hasProChild) && (
				<SliderSettings
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			)}

			{ /* Content area */}
			<SliderContent
				attributes={attributes}
				currentSlideId={currentSlideId}
				innerBlocks={innerBlocks}
				onAddSlide={handleAddSlide}
				onDeleteSlide={handleDeleteSlide}
				onDuplicateSlide={handleDuplicateSlide}
				onSlideChange={handleSlideChange}
				clientId={clientId}
			/>
		</div>
	);
};
