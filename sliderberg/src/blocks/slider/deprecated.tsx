// src/blocks/slider/deprecated.tsx - Block deprecations

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import * as React from 'react';

// Deprecation for v1.0.1 - full HTML save version
// eslint-disable-next-line camelcase
const deprecatedV1_0_1 = {
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
		type: {
			type: 'string',
			default: '',
		},
		autoplay: {
			type: 'boolean',
			default: false,
		},
		autoplaySpeed: {
			type: 'number',
			default: 5000,
		},
		pauseOnHover: {
			type: 'boolean',
			default: true,
		},
		transitionEffect: {
			type: 'string',
			default: 'slide',
		},
		transitionDuration: {
			type: 'number',
			default: 500,
		},
		transitionEasing: {
			type: 'string',
			default: 'ease',
		},
		navigationType: {
			type: 'string',
			default: 'bottom',
		},
		navigationPlacement: {
			type: 'string',
			default: 'overlay',
		},
		navigationShape: {
			type: 'string',
			default: 'circle',
		},
		navigationSize: {
			type: 'string',
			default: 'medium',
		},
		navigationColor: {
			type: 'string',
			default: '#ffffff',
		},
		navigationBgColor: {
			type: 'string',
			default: 'rgba(0, 0, 0, 0.5)',
		},
		navigationOpacity: {
			type: 'number',
			default: 1,
		},
		navigationVerticalPosition: {
			type: 'number',
			default: 20,
		},
		navigationHorizontalPosition: {
			type: 'number',
			default: 20,
		},
		dotColor: {
			type: 'string',
			default: '#6c757d',
		},
		dotActiveColor: {
			type: 'string',
			default: '#ffffff',
		},
		hideDots: {
			type: 'boolean',
			default: false,
		},
		widthPreset: {
			type: 'string',
			default: 'full',
		},
		customWidth: {
			type: 'string',
			default: '',
		},
		widthUnit: {
			type: 'string',
			default: 'px',
		},
	},
	save: ( { attributes }: any ) => {
		const customStyles =
			attributes.widthPreset === 'custom' && attributes.customWidth
				? {
						'--sliderberg-custom-width': `${ attributes.customWidth }px`,
				  }
				: {};

		const blockProps = useBlockProps.save( {
			style: {
				'--sliderberg-dot-color': attributes.dotColor,
				'--sliderberg-dot-active-color': attributes.dotActiveColor,
				...customStyles,
			},
			'data-width-preset': attributes.widthPreset,
		} );

		const slideIndicators = () => {
			if ( attributes.hideDots ) {
				return null;
			}
			return <div className="sliderberg-slide-indicators"></div>;
		};

		return (
			<div { ...blockProps }>
				{ attributes.navigationType === 'top' && (
					<div className="sliderberg-navigation-bar sliderberg-navigation-bar-top">
						<div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
							<button
								className="sliderberg-nav-button sliderberg-prev"
								aria-label="Previous Slide"
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
								} }
							>
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z" />
								</svg>
							</button>
							{ slideIndicators() }
							<button
								className="sliderberg-nav-button sliderberg-next"
								aria-label="Next Slide"
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
								} }
							>
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z" />
								</svg>
							</button>
						</div>
					</div>
				) }

				<div className="sliderberg-container">
					<div className="sliderberg-slides">
						<div
							className="sliderberg-slides-container"
							data-transition-effect={
								attributes.transitionEffect
							}
							data-transition-duration={
								attributes.transitionDuration
							}
							data-transition-easing={
								attributes.transitionEasing
							}
							data-autoplay={ attributes.autoplay }
							data-autoplay-speed={ attributes.autoplaySpeed }
							data-pause-on-hover={ attributes.pauseOnHover }
						>
							<InnerBlocks.Content />
						</div>
						{ attributes.navigationType === 'split' && (
							<>
								<div
									className="sliderberg-navigation"
									data-type={ attributes.navigationType }
									data-placement={
										attributes.navigationPlacement
									}
									style={ {
										opacity: attributes.navigationOpacity,
									} }
								>
									<div className="sliderberg-nav-controls">
										<button
											className="sliderberg-nav-button sliderberg-prev"
											aria-label="Previous Slide"
											data-shape={
												attributes.navigationShape
											}
											data-size={
												attributes.navigationSize
											}
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
										>
											<svg
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z" />
											</svg>
										</button>
										<button
											className="sliderberg-nav-button sliderberg-next"
											aria-label="Next Slide"
											data-shape={
												attributes.navigationShape
											}
											data-size={
												attributes.navigationSize
											}
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
										>
											<svg
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z" />
											</svg>
										</button>
									</div>
								</div>
								{ slideIndicators() }
							</>
						) }
					</div>
				</div>

				{ attributes.navigationType === 'bottom' && (
					<div className="sliderberg-navigation-bar sliderberg-navigation-bar-bottom">
						<div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
							<button
								className="sliderberg-nav-button sliderberg-prev"
								aria-label="Previous Slide"
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
								} }
							>
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z" />
								</svg>
							</button>
							{ slideIndicators() }
							<button
								className="sliderberg-nav-button sliderberg-next"
								aria-label="Next Slide"
								data-shape={ attributes.navigationShape }
								data-size={ attributes.navigationSize }
								style={ {
									color: attributes.navigationColor,
									backgroundColor:
										attributes.navigationBgColor,
								} }
							>
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z" />
								</svg>
							</button>
						</div>
					</div>
				) }
			</div>
		);
	},
	migrate: ( attributes: any, innerBlocks: any ) => {
		// Return all attributes as-is since they match the new structure
		// The inner blocks (slides) will be preserved automatically
		return [ attributes, innerBlocks ];
	},
	isEligible: () => {
		// This deprecation is eligible if we detect the old save structure
		return true;
	},
};

// Deprecation for v1.0.0 - minimal attributes version
// eslint-disable-next-line camelcase
const deprecatedV1 = {
	attributes: {
		customWidth: {
			type: 'string',
			default: '',
		},
		widthUnit: {
			type: 'string',
			default: 'px',
		},
		widthPreset: {
			type: 'string',
			default: 'full',
		},
		isCarouselMode: {
			type: 'boolean',
			default: false,
		},
		slidesToShow: {
			type: 'number',
			default: 3,
		},
		slidesToScroll: {
			type: 'number',
			default: 1,
		},
		slideSpacing: {
			type: 'number',
			default: 20,
		},
		infiniteLoop: {
			type: 'boolean',
			default: true,
		},
	},
	save: () => {
		return <InnerBlocks.Content />;
	},
	migrate: ( attributes: any ) => {
		// Migrate old attributes to new structure
		return {
			// Keep existing attributes
			...attributes,
			// Add new attributes with defaults
			align: 'full',
			type: '',
			autoplay: false,
			autoplaySpeed: 5000,
			pauseOnHover: true,
			transitionEffect: 'slide',
			transitionDuration: 500,
			transitionEasing: 'ease',
			navigationType: 'bottom',
			navigationPlacement: 'overlay',
			navigationShape: 'circle',
			navigationSize: 'medium',
			navigationColor: '#ffffff',
			navigationBgColor: 'rgba(0, 0, 0, 0.5)',
			navigationOpacity: 1,
			navigationVerticalPosition: 20,
			navigationHorizontalPosition: 20,
			dotColor: '#6c757d',
			dotActiveColor: '#ffffff',
			hideDots: false,
			// Add responsive carousel attributes
			tabletSlidesToShow: 2,
			tabletSlidesToScroll: 1,
			tabletSlideSpacing: 15,
			mobileSlidesToShow: 1,
			mobileSlidesToScroll: 1,
			mobileSlideSpacing: 10,
		};
	},
};

// Deprecation for v1.0.3 - before hideNavigation attribute
// eslint-disable-next-line camelcase
const deprecatedV1_0_3 = {
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
		type: {
			type: 'string',
			default: '',
		},
		autoplay: {
			type: 'boolean',
			default: false,
		},
		autoplaySpeed: {
			type: 'number',
			default: 5000,
		},
		pauseOnHover: {
			type: 'boolean',
			default: true,
		},
		transitionEffect: {
			type: 'string',
			default: 'slide',
		},
		transitionDuration: {
			type: 'number',
			default: 500,
		},
		transitionEasing: {
			type: 'string',
			default: 'ease',
		},
		navigationType: {
			type: 'string',
			default: 'bottom',
		},
		navigationPlacement: {
			type: 'string',
			default: 'overlay',
		},
		navigationShape: {
			type: 'string',
			default: 'circle',
		},
		navigationSize: {
			type: 'string',
			default: 'medium',
		},
		navigationColor: {
			type: 'string',
			default: '#ffffff',
		},
		navigationBgColor: {
			type: 'string',
			default: 'rgba(0, 0, 0, 0.5)',
		},
		navigationOpacity: {
			type: 'number',
			default: 1,
		},
		navigationVerticalPosition: {
			type: 'number',
			default: 20,
		},
		navigationHorizontalPosition: {
			type: 'number',
			default: 20,
		},
		dotColor: {
			type: 'string',
			default: '#6c757d',
		},
		dotActiveColor: {
			type: 'string',
			default: '#ffffff',
		},
		hideDots: {
			type: 'boolean',
			default: false,
		},
		widthPreset: {
			type: 'string',
			default: 'full',
		},
		customWidth: {
			type: 'string',
			default: '',
		},
		widthUnit: {
			type: 'string',
			default: 'px',
		},
		isCarouselMode: {
			type: 'boolean',
			default: false,
		},
		slidesToShow: {
			type: 'number',
			default: 3,
		},
		slidesToScroll: {
			type: 'number',
			default: 1,
		},
		slideSpacing: {
			type: 'number',
			default: 20,
		},
		infiniteLoop: {
			type: 'boolean',
			default: true,
		},
		tabletSlidesToShow: {
			type: 'number',
			default: 2,
		},
		tabletSlidesToScroll: {
			type: 'number',
			default: 1,
		},
		tabletSlideSpacing: {
			type: 'number',
			default: 15,
		},
		mobileSlidesToShow: {
			type: 'number',
			default: 1,
		},
		mobileSlidesToScroll: {
			type: 'number',
			default: 1,
		},
		mobileSlideSpacing: {
			type: 'number',
			default: 10,
		},
	},
	save: () => {
		return <InnerBlocks.Content />;
	},
	migrate: ( attributes: any ) => {
		// Add the new hideNavigation attribute
		return {
			...attributes,
			hideNavigation: false,
		};
	},
};

// Export all deprecations - add more as needed
// eslint-disable-next-line camelcase
export default [ deprecatedV1_0_3, deprecatedV1_0_1, deprecatedV1 ];
