/**
 * Utility functions for SliderBerg frontend
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with a cancel method
 */
export function debounce<T extends ( ...args: any[] ) => void>(
	fn: T,
	delay: number
): T & { cancel: () => void } {
	let timeoutId: number | null = null;

	const debounced = ( ...args: Parameters< T > ) => {
		if ( timeoutId !== null ) {
			clearTimeout( timeoutId );
		}
		timeoutId = window.setTimeout( () => {
			timeoutId = null;
			fn( ...args );
		}, delay );
	};

	debounced.cancel = () => {
		if ( timeoutId !== null ) {
			clearTimeout( timeoutId );
			timeoutId = null;
		}
	};

	return debounced as T & { cancel: () => void };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per specified interval.
 *
 * @param fn - The function to throttle
 * @param limit - Minimum time between invocations in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends ( ...args: any[] ) => void>(
	fn: T,
	limit: number
): T {
	let lastCall = 0;
	let timeoutId: number | null = null;

	const throttled = ( ...args: Parameters< T > ) => {
		const now = Date.now();

		if ( now - lastCall >= limit ) {
			lastCall = now;
			fn( ...args );
		} else if ( timeoutId === null ) {
			// Schedule a call for the end of the throttle period
			timeoutId = window.setTimeout( () => {
				lastCall = Date.now();
				timeoutId = null;
				fn( ...args );
			}, limit - ( now - lastCall ) );
		}
	};

	return throttled as T;
}

