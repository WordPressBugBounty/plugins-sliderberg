import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';

// Import sub-components
import { TypeSelector } from './TypeSelector';
import { SliderContent } from './SliderContent';
import { SliderSettings } from './settings/SliderSettings';
import { useSliderState } from '../../hooks/useSliderState';
import { SliderAttributes } from '../../types/slider';
import { isProBlock } from '../../config/blocks';

interface EditProps {
	attributes: SliderAttributes;
	setAttributes: (attrs: Partial<SliderAttributes>) => void;
	clientId: string;
}

export const Edit: React.FC<EditProps> = ({
	attributes,
	setAttributes,
	clientId,
}) => {
	const {
		currentSlideId,
		innerBlocks,
		handleSlideChange,
		handleAddSlide,
		handleDeleteSlide,
		handleDuplicateSlide,
	} = useSliderState(clientId, attributes);

	// Ensure align is always set for custom width to avoid validation errors
	React.useEffect(() => {
		if (attributes.widthPreset === 'custom' && !attributes.align) {
			setAttributes({ align: 'full' });
		}
	}, [attributes.widthPreset, attributes.align, setAttributes]);

	// Pro block auto-insertion removed - can be extended via hooks/filters in pro version
	useEffect(() => {
		// Type change handling can be extended in pro version
	}, [attributes.type, innerBlocks, clientId]);

	// Build editor styles - this is the key fix!
	const getEditorStyles = () => {
		const styles: React.CSSProperties & Record<string, string> = {
			'--sliderberg-dot-color': attributes.dotColor,
			'--sliderberg-dot-active-color': attributes.dotActiveColor,
			'--sliderberg-slides-to-show': String(attributes.slidesToShow || 3),
			'--sliderberg-slide-spacing': `${attributes.slideSpacing || 20
				}px`,
		};

		// Handle custom width in editor
		if (attributes.widthPreset === 'custom' && attributes.customWidth) {
			styles[
				'--sliderberg-custom-width'
			] = `${attributes.customWidth}px`;
			// Apply the width directly in editor
			styles.width = `${attributes.customWidth}px`;
			styles.maxWidth = `${attributes.customWidth}px`;
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		// Handle full width in editor - let WordPress handle alignment via CSS
		if (
			attributes.widthPreset === 'full' ||
			attributes.align === 'full'
		) {
			// Remove inline styles - let CSS handle full-width via alignfull class
			// WordPress's useBlockProps() will add the appropriate alignment classes
		}

		// Handle wide alignment
		if (
			attributes.widthPreset === 'wide' ||
			attributes.align === 'wide'
		) {
			styles.width = '100%';
			styles.maxWidth = '1200px'; // Adjust based on your theme
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		return styles;
	};

	const blockProps = useBlockProps({
		style: getEditorStyles(),
		'data-width-preset': attributes.widthPreset,
		'data-type': attributes.type,
		className: `sliderberg-editor-wrapper ${attributes.widthPreset === 'full' || attributes.align === 'full'
			? 'is-full-width'
			: ''
			} ${attributes.isCarouselMode ? 'is-carousel-mode' : ''}`,
	} as any);

	const handleTypeSelect = (typeId: string) => {
		// Set the type for any slider type (including pro types)
		setAttributes({ type: typeId });
	};

	// Check if we have pro blocks as children
	const hasProChild = innerBlocks.some((block: BlockInstance) =>
		isProBlock(block.name)
	);

	return (
		<div {...blockProps}>
			{ /* Only show settings after a type has been selected */}
			{(attributes.type || hasProChild) && (
				<SliderSettings
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			)}

			{(() => {
				// Show type selector if no type is set and no pro child
				if (!attributes.type && !hasProChild) {
					return <TypeSelector onTypeSelect={handleTypeSelect} />;
				}

				// Render slider content (same for both pro and regular types)
				return (
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
				);
			})()}
		</div>
	);
};
