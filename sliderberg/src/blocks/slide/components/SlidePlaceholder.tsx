/**
 * Placeholder component for slide block.
 * Shows when no background is set, allowing image upload or color selection.
 */

// @ts-ignore
import { isEmpty } from 'lodash';
// @ts-ignore
import { __ } from '@wordpress/i18n';
import { MediaPlaceholder, useSetting } from '@wordpress/block-editor';
import { ColorPalette, Icon } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import classnames from 'classnames';
import { getBorderCSS, getSingleSideBorderValue } from '@sliderberg/shared';
import type { MediaObject } from '../constants';

interface SlidePlaceholderProps {
	clientId: string;
	contentPosition: string;
	backgroundColor: string | null;
	border: Record< string, any >;
	slideBorderRadius: Record< string, any >;
	minHeight: number;
	onUpdate: ( attrs: Record< string, unknown > ) => void;
	/**
	 * When true, renders a minimal "+" prompt instead of the full
	 * upload/media-library/color picker — used for every empty slide except
	 * the one that's active, so a multi-slide Carousel doesn't show several
	 * full placeholders side by side. Clicking it selects the slide (normal
	 * block selection), which flips this back to false.
	 */
	collapsed?: boolean;
}

export default function SlidePlaceholder( {
	clientId,
	contentPosition,
	backgroundColor,
	border,
	slideBorderRadius,
	minHeight,
	onUpdate,
	collapsed = false,
}: SlidePlaceholderProps ) {
	const colorSettings = useSetting( 'color.palette' ) || [];

	const borderInFourDimensions = ! isEmpty( border )
		? getBorderCSS( border )
		: null;

	return (
		<div
			className={ classnames(
				'sliderberg-slide',
				'sliderberg-slide-placeholder',
				`sliderberg-content-position-${ contentPosition }`,
				{
					'has-border': ! isEmpty( border ),
					'sliderberg-slide-placeholder--collapsed': collapsed,
				}
			) }
			data-client-id={ clientId }
			style={ {
				minHeight: `${ minHeight }px`,
				borderTop: borderInFourDimensions
					? getSingleSideBorderValue( borderInFourDimensions, 'top' )
					: undefined,
				borderRight: borderInFourDimensions
					? getSingleSideBorderValue(
							borderInFourDimensions,
							'right'
					  )
					: undefined,
				borderBottom: borderInFourDimensions
					? getSingleSideBorderValue(
							borderInFourDimensions,
							'bottom'
					  )
					: undefined,
				borderLeft: borderInFourDimensions
					? getSingleSideBorderValue( borderInFourDimensions, 'left' )
					: undefined,
				borderTopLeftRadius: slideBorderRadius?.topLeft,
				borderTopRightRadius: slideBorderRadius?.topRight,
				borderBottomLeftRadius: slideBorderRadius?.bottomLeft,
				borderBottomRightRadius: slideBorderRadius?.bottomRight,
			} }
		>
			{ collapsed ? (
				<div className="sliderberg-slide-placeholder__collapsed-prompt">
					<Icon icon={ plus } size={ 24 } />
				</div>
			) : (
				<MediaPlaceholder
					icon="format-image"
					labels={ {
						title: __( 'Slide Background', 'sliderberg' ),
						instructions: __(
							'Drag and drop an image, upload, or choose from your library.',
							'sliderberg'
						),
					} }
					onSelect={ ( media: MediaObject ) =>
						onUpdate( {
							backgroundType: 'image',
							backgroundImage: {
								id: media.id,
								url: media.url,
								alt: media.alt || '',
							},
							focalPoint: { x: 0.5, y: 0.5 },
						} )
					}
					accept="image/*"
					allowedTypes={ [ 'image' ] }
				>
					<div className="sliderberg-placeholder-colors">
						<ColorPalette
							colors={ colorSettings }
							value={ backgroundColor || '' }
							onChange={ ( color ) =>
								onUpdate( {
									backgroundType: 'color',
									backgroundColor: color || '',
								} )
							}
							asButtons
							clearable={ false }
							disableCustomColors
						/>
					</div>
				</MediaPlaceholder>
			) }
		</div>
	);
}
