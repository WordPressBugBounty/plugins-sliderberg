import { __ } from "@wordpress/i18n";
import {
	createPortal,
	useState,
	useEffect,
	useCallback,
} from "@wordpress/element";
import { PRO_FEATURES, PROMO_CONFIG, getFeatureImage } from "./upsell-data";
import { upsellIcon } from "./upsell-icon";

declare global {
	interface Window {
		sliderbergData?: {
			isPro: boolean;
			upgradeUrl: string;
			upsellImages?: Record< string, string >;
		};
	}
}

const ChevronLeft = () => (
	<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
		<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
	</svg>
);

const ChevronRight = () => (
	<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
		<path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" />
	</svg>
);

interface UpsellModalProps {
	initialFeature: string;
	onClose: () => void;
}

function UpsellModal( { initialFeature, onClose }: UpsellModalProps ) {
	const pricingLink =
		window.sliderbergData?.upgradeUrl ?? "https://sliderberg.com/pricing";
	const { code: promoCode, text: promoText } = PROMO_CONFIG;
	const totalFeatures = PRO_FEATURES.length;

	const startIndex = PRO_FEATURES.findIndex( ( f ) => f.name === initialFeature );
	const [ activeIndex, setActiveIndex ] = useState(
		startIndex > -1 ? startIndex : 0,
	);
	const [ slideDirection, setSlideDirection ] = useState( "" );
	const [ slideKey, setSlideKey ] = useState( 0 );

	const goToPrev = useCallback( () => {
		setSlideDirection( "slide-left" );
		setSlideKey( ( k ) => k + 1 );
		setActiveIndex( ( prev ) => ( prev > 0 ? prev - 1 : totalFeatures - 1 ) );
	}, [ totalFeatures ] );

	const goToNext = useCallback( () => {
		setSlideDirection( "slide-right" );
		setSlideKey( ( k ) => k + 1 );
		setActiveIndex( ( prev ) =>
			prev < totalFeatures - 1 ? prev + 1 : 0,
		);
	}, [ totalFeatures ] );

	useEffect( () => {
		const handleKeyDown = ( e: KeyboardEvent ) => {
			if ( e.key === "Escape" ) onClose();
			if ( e.key === "ArrowLeft" ) goToPrev();
			if ( e.key === "ArrowRight" ) goToNext();
		};
		document.addEventListener( "keydown", handleKeyDown );
		return () => document.removeEventListener( "keydown", handleKeyDown );
	}, [ onClose, goToPrev, goToNext ] );

	const currentFeature = PRO_FEATURES[ activeIndex ];

	return createPortal(
		<div className="sliderberg-upsell-modal">
			<div
				className="sliderberg-upsell-modal-backdrop"
				onClick={ onClose }
			></div>

			<div className="sliderberg-upsell-modal-outer">
				<button
					className="sliderberg-upsell-nav sliderberg-upsell-nav-prev"
					onClick={ goToPrev }
					aria-label={ __( "Previous feature", "sliderberg" ) }
				>
					<ChevronLeft />
				</button>

				<div className="sliderberg-upsell-modal-container">
					<div className="sliderberg-upsell-modal-header">
						<span className="sliderberg-upsell-modal-header-icon">
							{ upsellIcon }
						</span>
						<span className="sliderberg-upsell-modal-header-title">
							{ currentFeature.title }
						</span>
					</div>

					<div className="sliderberg-upsell-slide-wrapper">
						<div
							className={ `sliderberg-upsell-slide ${ slideDirection }` }
							key={ slideKey }
						>
							{ getFeatureImage( currentFeature.name ) && (
								<img
									className="sliderberg-upsell-modal-image"
									src={ getFeatureImage( currentFeature.name ) }
									alt={ currentFeature.title }
								/>
							) }
							{ currentFeature.description && (
								<p className="sliderberg-upsell-modal-description">
									<strong>{ currentFeature.title }</strong>{ " " }
									{ currentFeature.description }
								</p>
							) }
							{ promoCode && promoText && (
								<div className="sliderberg-upsell-promo">
									<span>{ promoText }</span>
									<code>{ promoCode }</code>
								</div>
							) }
						</div>
					</div>

					<div className="sliderberg-upsell-modal-footer">
						<button
							className="sliderberg-upsell-modal-cancel"
							onClick={ onClose }
						>
							{ __( "Cancel", "sliderberg" ) }
						</button>
						<a
							className="sliderberg-upsell-modal-cta"
							href={ pricingLink }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ ( e ) => {
								e.preventDefault();
								window.open( pricingLink, "_blank", "noopener,noreferrer" );
							} }
						>
							{ __( "Get Sliderberg PRO →", "sliderberg" ) }
						</a>
					</div>
				</div>

				<button
					className="sliderberg-upsell-nav sliderberg-upsell-nav-next"
					onClick={ goToNext }
					aria-label={ __( "Next feature", "sliderberg" ) }
				>
					<ChevronRight />
				</button>
			</div>
		</div>,
		document.body,
	);
}

export default UpsellModal;
