import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import './review-request.css';

interface ReviewRequestProps {
	onDismiss: ( permanent?: boolean ) => void;
}

export const ReviewRequest: React.FC< ReviewRequestProps > = ( {
	onDismiss,
} ) => {
	const handleLeaveReview = () => {
		window.open(
			'https://wordpress.org/support/plugin/sliderberg/reviews/',
			'_blank',
			'noopener noreferrer'
		);
		onDismiss( true ); // Permanent dismiss after clicking review
	};

	const handleDismiss = () => {
		onDismiss( false ); // Temporary dismiss
	};

	return (
		<div className="sliderberg-review-request">
			<div className="sliderberg-review-request__content">
				<div className="sliderberg-review-request__header">
					<span className="sliderberg-review-request__icon">💙</span>
					<h3 className="sliderberg-review-request__title">
						{ __( 'Love SliderBerg?', 'sliderberg' ) }
					</h3>
					<Button
						className="sliderberg-review-request__close"
						icon={ close }
						label={ __( 'Dismiss', 'sliderberg' ) }
						onClick={ handleDismiss }
					/>
				</div>
				<p className="sliderberg-review-request__text">
					{ __(
						"If it's helping you build better sliders, we'd truly appreciate a quick review.",
						'sliderberg'
					) }
				</p>
				<Button
					variant="primary"
					className="sliderberg-review-request__button"
					onClick={ handleLeaveReview }
				>
					{ __( 'Leave a Review', 'sliderberg' ) }
				</Button>
			</div>
		</div>
	);
};
