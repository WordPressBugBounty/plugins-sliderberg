import type { ReactNode } from "react";
import { useState } from "@wordpress/element";
import { getFeatureInfo } from "./upsell-data";
import UpsellModal from "./UpsellModal";
import "./upsell.scss";

const LockIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="#1e1e1e"
	>
		<path d="M17 10h-1V7c0-2.21-1.79-4-4-4S8 4.79 8 7v3H7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-5 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-7H9V7c0-1.66 1.34-3 3-3s3 1.34 3 3v3z" />
	</svg>
);

interface LockedControlProps {
	featureKey: string;
	children: ReactNode;
}

function LockedControl( { children, featureKey }: LockedControlProps ) {
	const [ showUpsell, setShowUpsell ] = useState( false );
	const featureInfo = getFeatureInfo( featureKey );

	return (
		<>
			<div className="sliderberg-locked-root">
				<div className="sliderberg-locked-children">{ children }</div>
				<button
					className="sliderberg-lock-overlay"
					onClick={ () => setShowUpsell( true ) }
					aria-label={ `Unlock ${ featureInfo?.title || featureKey }` }
				>
					<span className="sliderberg-lock-badge">
						<LockIcon />
						<span className="sliderberg-lock-badge-text">PRO</span>
					</span>
				</button>
			</div>
			{ showUpsell && (
				<UpsellModal
					onClose={ () => setShowUpsell( false ) }
					initialFeature={ featureKey }
				/>
			) }
		</>
	);
}

export default LockedControl;
