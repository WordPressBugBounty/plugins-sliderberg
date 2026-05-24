interface ReviewState {
	saveCount: number;
	hasSeenNotice: boolean;
	hasDismissedPermanently: boolean;
	lastShownDate: number | null;
}

const STORAGE_KEY = 'sliderberg_review_state';
const SAVES_BEFORE_SHOW = 1;
const DAYS_BETWEEN_SHOWS = 30;

export class ReviewStateManager {
	private state: ReviewState;

	constructor() {
		this.state = this.loadState();
	}

	private loadState(): ReviewState {
		try {
			const stored = localStorage.getItem( STORAGE_KEY );
			if ( stored ) {
				return JSON.parse( stored );
			}
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to load review state:', e );
		}

		return {
			saveCount: 0,
			hasSeenNotice: false,
			hasDismissedPermanently: false,
			lastShownDate: null,
		};
	}

	private saveState(): void {
		try {
			localStorage.setItem( STORAGE_KEY, JSON.stringify( this.state ) );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to save review state:', e );
		}
	}

	incrementSaveCount(): void {
		this.state.saveCount++;
		this.saveState();
	}

	shouldShowNotice(): boolean {
		// Don't show if permanently dismissed
		if ( this.state.hasDismissedPermanently ) {
			return false;
		}

		// Don't show if not enough saves
		if ( this.state.saveCount < SAVES_BEFORE_SHOW ) {
			return false;
		}

		// Don't show if shown recently
		if ( this.state.lastShownDate ) {
			const daysSinceLastShow =
				( Date.now() - this.state.lastShownDate ) /
				( 1000 * 60 * 60 * 24 );
			if ( daysSinceLastShow < DAYS_BETWEEN_SHOWS ) {
				return false;
			}
		}

		return true;
	}

	markAsShown(): void {
		this.state.hasSeenNotice = true;
		this.state.lastShownDate = Date.now();
		this.saveState();
	}

	dismiss( permanent: boolean = false ): void {
		if ( permanent ) {
			this.state.hasDismissedPermanently = true;
		}
		this.state.lastShownDate = Date.now();
		this.saveState();
	}

	reset(): void {
		this.state = {
			saveCount: 0,
			hasSeenNotice: false,
			hasDismissedPermanently: false,
			lastShownDate: null,
		};
		this.saveState();
	}

	getState(): Readonly< ReviewState > {
		return { ...this.state };
	}
}

// Export singleton instance
export const reviewStateManager = new ReviewStateManager();
