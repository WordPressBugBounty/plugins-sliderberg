import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { SlideIndicators } from './SlideIndicators';
import { SliderAttributes } from '../../../types/slider';

interface InnerBlock {
	clientId: string;
	name: string;
	attributes: Record< string, any >;
}

interface SliderNavigationProps {
	attributes: SliderAttributes;
	currentSlideId: string | null;
	innerBlocks: InnerBlock[];
	onSlideChange: ( slideId: string ) => void;
	position: 'top' | 'bottom' | 'split';
	sliderId: string;
}

export const SliderNavigation: React.FC< SliderNavigationProps > = ( {
	attributes,
	currentSlideId,
	innerBlocks,
	onSlideChange,
	position,
	sliderId,
} ) => {
	// Detect if we're in the block editor context using WordPress APIs
	const isEditor = useSelect( ( select ) => {
		// Use WordPress's block editor store to detect editor context
		const blockEditorSelect = select( 'core/block-editor' );
		if ( ! blockEditorSelect ) {
			// Fallback: check if we're in WordPress admin
			return (
				typeof window !== 'undefined' &&
				window.location.pathname.includes( '/wp-admin/' )
			);
		}

		// If block editor store exists, we're in the editor
		return true;
	}, [] );
	const handlePrevSlide = () => {
		if ( ! currentSlideId || innerBlocks.length === 0 ) {
			return;
		}
		const idx = innerBlocks.findIndex(
			( block: InnerBlock ) => block.clientId === currentSlideId
		);

		// For carousel mode, use slidesToScroll
		if ( attributes.isCarouselMode ) {
			const totalSlides = innerBlocks.length;
			const slidesToScroll = attributes.slidesToScroll || 1;
			let prevIdx = idx - slidesToScroll;

			if ( attributes.infiniteLoop ) {
				// Allow negative for infinite loop
				if ( prevIdx < 0 ) {
					prevIdx = totalSlides + prevIdx;
				}
			} else {
				// Don't go below 0 for non-infinite
				prevIdx = Math.max( 0, prevIdx );
			}
			onSlideChange( innerBlocks[ prevIdx ].clientId );
		} else {
			// Regular single slide navigation
			const prevIdx = idx > 0 ? idx - 1 : innerBlocks.length - 1;
			onSlideChange( innerBlocks[ prevIdx ].clientId );
		}
	};

	const handleNextSlide = () => {
		if ( ! currentSlideId || innerBlocks.length === 0 ) {
			return;
		}
		const idx = innerBlocks.findIndex(
			( block: InnerBlock ) => block.clientId === currentSlideId
		);

		// For carousel mode, use slidesToScroll
		if ( attributes.isCarouselMode ) {
			const totalSlides = innerBlocks.length;
			const slidesToScroll = attributes.slidesToScroll || 1;
			const slidesToShow = attributes.slidesToShow || 1;
			let nextIdx = idx + slidesToScroll;

			if ( attributes.infiniteLoop ) {
				// Allow overflow for infinite loop
				if ( nextIdx >= totalSlides ) {
					nextIdx = nextIdx - totalSlides;
				}
			} else {
				// Don't go beyond what can be shown
				const maxStartIndex = Math.max( 0, totalSlides - slidesToShow );
				nextIdx = Math.min( nextIdx, maxStartIndex );
			}
			onSlideChange( innerBlocks[ nextIdx ].clientId );
		} else {
			// Regular single slide navigation
			const nextIdx = idx < innerBlocks.length - 1 ? idx + 1 : 0;
			onSlideChange( innerBlocks[ nextIdx ].clientId );
		}
	};

	if ( position === 'split' ) {
		// Direct positioning mode: render buttons directly without overlay container
		// This applies to both editor and frontend when overlay placement is used
		if ( attributes.navigationPlacement === 'overlay' ) {
			const directClass = isEditor
				? 'sliderberg-editor-direct'
				: 'sliderberg-frontend-direct';

			return (
				<>
					{ ! attributes.hideNavigation && (
						<>
							<Button
								className={ `sliderberg-nav-button sliderberg-prev ${ directClass }` }
								onClick={ handlePrevSlide }
								icon={ chevronLeft }
								label={ __( 'Previous Slide', 'sliderberg' ) }
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								data-slider-id={ sliderId }
								style={
									{
										color: attributes.navigationColor,
										backgroundColor:
											attributes.navigationBgColor,
										opacity: attributes.navigationOpacity,
										'--sliderberg-nav-horizontal-position': `${ attributes.navigationHorizontalPosition }px`,
										'--sliderberg-nav-vertical-position': `${ attributes.navigationVerticalPosition }px`,
									} as React.CSSProperties
								}
							/>
							<Button
								className={ `sliderberg-nav-button sliderberg-next ${ directClass }` }
								onClick={ handleNextSlide }
								icon={ chevronRight }
								label={ __( 'Next Slide', 'sliderberg' ) }
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								data-slider-id={ sliderId }
								style={
									{
										color: attributes.navigationColor,
										backgroundColor:
											attributes.navigationBgColor,
										opacity: attributes.navigationOpacity,
										'--sliderberg-nav-horizontal-position': `${ attributes.navigationHorizontalPosition }px`,
										'--sliderberg-nav-vertical-position': `${ attributes.navigationVerticalPosition }px`,
									} as React.CSSProperties
								}
							/>
						</>
					) }
					<SlideIndicators
						innerBlocks={ innerBlocks }
						currentSlideId={ currentSlideId }
						onSlideChange={ onSlideChange }
						dotColor={ attributes.dotColor }
						dotActiveColor={ attributes.dotActiveColor }
						hideDots={ attributes.hideDots }
					/>
				</>
			);
		}

		// Standard mode: use overlay container (frontend or non-overlay placement)
		return (
			<>
				{ ! attributes.hideNavigation && (
					<div
						className="sliderberg-navigation"
						data-type={ attributes.navigationType }
						data-placement={ attributes.navigationPlacement }
						data-slider-id={ sliderId }
						data-editor-context={ isEditor ? 'true' : 'false' }
						style={ { opacity: attributes.navigationOpacity } }
					>
						<div className="sliderberg-nav-controls">
							<Button
								className="sliderberg-nav-button sliderberg-prev"
								onClick={ handlePrevSlide }
								icon={ chevronLeft }
								label={ __( 'Previous Slide', 'sliderberg' ) }
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
									...( attributes.navigationType ===
										'split' && {
										transform: `translateY(calc(-50% + ${ attributes.navigationVerticalPosition }px))`,
										left: `${ attributes.navigationHorizontalPosition }px`,
									} ),
								} }
							/>
							<Button
								className="sliderberg-nav-button sliderberg-next"
								onClick={ handleNextSlide }
								icon={ chevronRight }
								label={ __( 'Next Slide', 'sliderberg' ) }
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
									...( attributes.navigationType ===
										'split' && {
										transform: `translateY(calc(-50% + ${ attributes.navigationVerticalPosition }px))`,
										right: `${ attributes.navigationHorizontalPosition }px`,
									} ),
								} }
							/>
						</div>
					</div>
				) }
				<SlideIndicators
					innerBlocks={ innerBlocks }
					currentSlideId={ currentSlideId }
					onSlideChange={ onSlideChange }
					dotColor={ attributes.dotColor }
					dotActiveColor={ attributes.dotActiveColor }
					hideDots={ attributes.hideDots }
				/>
			</>
		);
	}

	// Top or Bottom Navigation
	return (
		<div
			className={ `sliderberg-navigation-bar sliderberg-navigation-bar-${ position }` }
			data-slider-id={ sliderId }
			data-editor-context={ isEditor ? 'true' : 'false' }
			style={ { opacity: attributes.navigationOpacity } }
		>
			<div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
				{ ! attributes.hideNavigation && (
					<Button
						className="sliderberg-nav-button sliderberg-prev"
						onClick={ handlePrevSlide }
						icon={ chevronLeft }
						label={ __( 'Previous Slide', 'sliderberg' ) }
						data-shape={ attributes.navigationShape }
						data-size={ attributes.navigationSize }
						style={ {
							color: attributes.navigationColor,
							backgroundColor: attributes.navigationBgColor,
						} }
					/>
				) }
				<SlideIndicators
					innerBlocks={ innerBlocks }
					currentSlideId={ currentSlideId }
					onSlideChange={ onSlideChange }
					dotColor={ attributes.dotColor }
					dotActiveColor={ attributes.dotActiveColor }
					hideDots={ attributes.hideDots }
				/>
				{ ! attributes.hideNavigation && (
					<Button
						className="sliderberg-nav-button sliderberg-next"
						onClick={ handleNextSlide }
						icon={ chevronRight }
						label={ __( 'Next Slide', 'sliderberg' ) }
						data-shape={ attributes.navigationShape }
						data-size={ attributes.navigationSize }
						style={ {
							color: attributes.navigationColor,
							backgroundColor: attributes.navigationBgColor,
						} }
					/>
				) }
			</div>
		</div>
	);
};
