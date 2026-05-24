import React from 'react';
import { __ } from '@wordpress/i18n';
import type { BlockInstance } from '@wordpress/blocks';

interface SlideIndicatorsProps {
	innerBlocks: BlockInstance[];
	currentSlideId: string | null;
	onSlideChange: ( slideId: string ) => void;
	dotColor: string;
	dotActiveColor: string;
	hideDots: boolean;
}

export const SlideIndicators: React.FC< SlideIndicatorsProps > = ( {
	innerBlocks,
	currentSlideId,
	onSlideChange,
	dotColor,
	dotActiveColor,
	hideDots,
} ) => {
	if ( hideDots ) {
		return null;
	}

	return (
		<div className="sliderberg-slide-indicators">
			{ innerBlocks.map( ( block, index ) => (
				<button
					key={ block.clientId }
					className={ `sliderberg-slide-indicator ${
						block.clientId === currentSlideId ? 'active' : ''
					}` }
					onClick={ () => onSlideChange( block.clientId ) }
					aria-label={
						__( 'Go to slide', 'sliderberg' ) + ' ' + ( index + 1 )
					}
					style={ {
						backgroundColor:
							block.clientId === currentSlideId
								? dotActiveColor
								: dotColor,
					} }
				/>
			) ) }
		</div>
	);
};
