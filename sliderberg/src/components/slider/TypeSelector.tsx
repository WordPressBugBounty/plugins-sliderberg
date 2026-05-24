import React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon, grid, plus } from '@wordpress/icons';
import { applyFilters } from '@wordpress/hooks';

interface SliderType {
	id: string;
	title: string;
	description: string;
	icon: JSX.Element;
	isComingSoon?: boolean;
	isPro?: boolean;
}

interface TypeSelectorProps {
	onTypeSelect: ( typeId: string ) => void;
}

export const TypeSelector: React.FC< TypeSelectorProps > = ( {
	onTypeSelect,
} ) => {
	const defaultSliderTypes: SliderType[] = [
		{
			id: 'blocks',
			title: __( 'Blocks Slider', 'sliderberg' ),
			description: __(
				'Create a slider with custom blocks',
				'sliderberg'
			),
			icon: <Icon icon={ grid } />,
		},
		{
			id: 'coming-soon',
			title: __( 'More Coming Soon', 'sliderberg' ),
			description: __( 'Stay tuned for more slider types', 'sliderberg' ),
			icon: <Icon icon={ plus } />,
			isComingSoon: true,
		},
	];

	// Allow pro plugin to modify slider types
	const sliderTypes = applyFilters(
		'sliderberg.sliderTypes',
		defaultSliderTypes
	) as SliderType[];

	const handleTypeSelect = ( typeId: string ) => {
		const selectedType = sliderTypes.find( ( type ) => type.id === typeId );

		if ( selectedType?.isComingSoon ) {
			return;
		}

		// Allow pro plugin to modify type selection behavior
		const shouldProceed = applyFilters(
			'sliderberg.beforeTypeSelect',
			true,
			typeId,
			selectedType
		);

		if ( shouldProceed ) {
			onTypeSelect( typeId );
		}
	};

	const handleKeyDown = ( event: React.KeyboardEvent, typeId: string ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			handleTypeSelect( typeId );
		}
	};

	const renderTypeCard = ( type: SliderType ) => {
		// Allow pro plugin to modify type card rendering
		const cardContent = applyFilters(
			'sliderberg.typeCardContent',
			null,
			type
		) as React.ReactNode;

		if ( cardContent ) {
			return cardContent;
		}

		return (
			<>
				<div className="sliderberg-type-icon">{ type.icon }</div>
				<h3>{ type.title }</h3>
				<p>{ type.description }</p>
				{ type.isComingSoon && (
					<div className="sliderberg-coming-soon-badge">
						{ __( 'Coming Soon', 'sliderberg' ) }
					</div>
				) }
				{ type.isPro && (
					<div className="sliderberg-pro-badge">
						{ __( 'Pro', 'sliderberg' ) }
					</div>
				) }
			</>
		);
	};

	return (
		<div className="sliderberg-type-selector">
			<h2 className="sliderberg-title">
				{ __( 'Choose Slider Type', 'sliderberg' ) }
			</h2>
			<div className="sliderberg-grid">
				{ sliderTypes.map( ( type ) => (
					<div
						key={ type.id }
						className={ `sliderberg-type-card ${
							type.isComingSoon ? 'is-coming-soon' : ''
						} ${ type.isPro ? 'is-pro' : '' }` }
						onClick={ () => handleTypeSelect( type.id ) }
						onKeyDown={ ( e ) => handleKeyDown( e, type.id ) }
						role="button"
						tabIndex={ 0 }
						aria-label={ type.title }
					>
						{ renderTypeCard( type ) }
					</div>
				) ) }
			</div>
		</div>
	);
};
