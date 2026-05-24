/**
 * Custom hook for slider editor styles
 * Handles CSS custom properties and width presets
 */

import { useMemo } from 'react';
import { SliderAttributes } from '../../../types/slider';

export function useSliderEditorStyles( attributes: SliderAttributes ) {
	return useMemo( () => {
		const styles: React.CSSProperties & Record< string, string > = {
			'--sliderberg-dot-color': attributes.dotColor || 'rgba(255, 255, 255, 0.5)',
			'--sliderberg-dot-active-color': attributes.dotActiveColor || 'rgba(255, 255, 255, 0.95)',
			'--sliderberg-slides-to-show': String( attributes.slidesToShow || 3 ),
			'--sliderberg-slide-spacing': `${ attributes.slideSpacing || 20 }px`,
		};

		// Handle custom width
		if ( attributes.widthPreset === 'custom' && attributes.customWidth ) {
			styles[ '--sliderberg-custom-width' ] = `${ attributes.customWidth }px`;
			styles.width = `${ attributes.customWidth }px`;
			styles.maxWidth = `${ attributes.customWidth }px`;
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		// Handle wide alignment
		if (
			attributes.widthPreset === 'wide' ||
			attributes.align === 'wide'
		) {
			styles.width = '100%';
			styles.maxWidth = '1200px';
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		// Full width handled by CSS via alignfull class

		return styles;
	}, [
		attributes.dotColor,
		attributes.dotActiveColor,
		attributes.slidesToShow,
		attributes.slideSpacing,
		attributes.widthPreset,
		attributes.customWidth,
		attributes.align,
	] );
}
