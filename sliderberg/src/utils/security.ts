/**
 * Security utilities for SliderBerg
 * Contains validation and sanitization functions for various data types
 */

// Extend window interface for sliderbergData
declare global {
	interface Window {
		sliderbergData?: {
			validTransitionEffects?: string[];
		};
	}
}

/**
 * Validates and sanitizes color values
 * @param color - The color value to validate (string or object with hex property)
 * @return A sanitized color value or default fallback
 */
export function validateColor( color: string | { hex: string } ): string {
	const colorValue = typeof color === 'string' ? color : color.hex;

	// Basic validation for hex colors
	if ( /^#([0-9A-F]{3}){1,2}$/i.test( colorValue ) ) {
		return colorValue;
	}

	// Validation for rgba
	if (
		/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
			colorValue
		)
	) {
		return colorValue;
	}

	return '#000000'; // Default fallback
}

/**
 * Validates and sanitizes gradient values
 * @param gradient - The gradient value to validate
 * @return A sanitized gradient value or empty string
 */
export function validateGradient( gradient: string ): string {
	if ( ! gradient || typeof gradient !== 'string' ) {
		return '';
	}

	// Remove any potential script injections
	const cleaned = gradient
		.replace( /<script[^>]*>.*?<\/script>/gi, '' )
		.replace( /javascript:/gi, '' )
		.trim();

	// Basic validation for CSS gradient functions
	const gradientRegex =
		/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\s*\(/i;

	if ( ! gradientRegex.test( cleaned ) ) {
		return '';
	}

	// Check for balanced parentheses
	let parenthesesCount = 0;
	for ( const char of cleaned ) {
		if ( char === '(' ) {
			parenthesesCount++;
		}
		if ( char === ')' ) {
			parenthesesCount--;
		}
		if ( parenthesesCount < 0 ) {
			return '';
		} // Closing parenthesis before opening
	}
	if ( parenthesesCount !== 0 ) {
		return '';
	} // Unbalanced parentheses

	// Additional safety check for common CSS gradient patterns
	// This ensures the gradient contains valid CSS color values
	const hasValidColors =
		/(#[0-9A-F]{3,8}|rgb|rgba|hsl|hsla|transparent|currentColor|[a-z]+)/i.test(
			cleaned
		);

	if ( ! hasValidColors ) {
		return '';
	}

	return cleaned;
}

/**
 * Validates media URLs
 * @param media - The media object containing the URL
 * @return Boolean indicating if the URL is valid
 */
export function isValidMediaUrl( media: { url: string } | null ): boolean {
	if ( ! media || ! media.url ) {
		return false;
	}

	try {
		// Basic URL validation
		new URL( media.url );
		return true;
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.error( 'Invalid media URL:', e );
		return false;
	}
}

/**
 * Validates and sanitizes numeric values within a range
 * @param value        - The value to validate
 * @param min          - Minimum allowed value
 * @param max          - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @return A sanitized number within the specified range
 */
export function validateNumericRange(
	value: number,
	min: number,
	max: number,
	defaultValue: number
): number {
	if ( typeof value !== 'number' || isNaN( value ) ) {
		return defaultValue;
	}
	return Math.min( Math.max( value, min ), max );
}

/**
 * Validates content position values
 * @param position - The position value to validate
 * @return A valid position value or default
 */
export function validateContentPosition( position: string ): string {
	const validPositions = [
		'top-left',
		'top-center',
		'top-right',
		'center-left',
		'center-center',
		'center-right',
		'bottom-left',
		'bottom-center',
		'bottom-right',
	];
	return validPositions.includes( position ) ? position : 'center-center';
}

/**
 * Get valid transition effects from PHP
 * This allows the pro plugin to register additional effects via PHP filter
 */
function getValidTransitionEffects(): string[] {
	// Default effects
	const defaultEffects = [ 'slide', 'fade', 'zoom' ];

	// Check if additional effects are registered from PHP
	if (
		window.sliderbergData &&
		window.sliderbergData.validTransitionEffects
	) {
		return window.sliderbergData.validTransitionEffects;
	}

	return defaultEffects;
}

/**
 * Validates transition effect values
 * @param effect - The effect value to validate
 * @return A valid effect value or default
 */
export function validateTransitionEffect( effect: string ): string {
	const validEffects = getValidTransitionEffects();
	return validEffects.includes( effect ) ? effect : 'slide';
}

/**
 * Validates transition easing values
 * @param easing - The easing value to validate
 * @return A valid easing value or default
 */
export function validateTransitionEasing(
	easing: string
): 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' {
	const validEasings = [
		'ease',
		'ease-in',
		'ease-out',
		'ease-in-out',
		'linear',
	];
	return validEasings.includes( easing )
		? ( easing as
				| 'ease'
				| 'ease-in'
				| 'ease-out'
				| 'ease-in-out'
				| 'linear' )
		: 'ease';
}

/**
 * Sanitizes HTML attribute values
 * @param value - The value to sanitize
 * @return A sanitized string safe for use in HTML attributes
 */
export function sanitizeAttributeValue( value: string ): string {
	// Remove any potentially dangerous characters
	// Allow only alphanumeric, spaces, hyphens, underscores, periods
	return value.replace( /[^\w\s\-_.]/g, '' );
}

/**
 * Validates border style values
 * @param style - The border style value to validate
 * @return A valid border style value or default
 */
export function validateBorderStyle(
	style: string
): 'solid' | 'dashed' | 'dotted' | 'double' {
	const validStyles = [ 'solid', 'dashed', 'dotted', 'double' ];
	return validStyles.includes( style )
		? ( style as 'solid' | 'dashed' | 'dotted' | 'double' )
		: 'solid';
}

/**
 * Validates and sanitizes DOM element IDs
 * @param id - The ID to validate
 * @return A sanitized ID safe for DOM operations
 */
export function sanitizeDOMId( id: string ): string {
	// DOM IDs must start with a letter and contain only alphanumeric, hyphens, underscores
	const sanitized = id.replace( /[^a-zA-Z0-9\-_]/g, '' );

	// Ensure it starts with a letter
	if ( ! /^[a-zA-Z]/.test( sanitized ) ) {
		return 'slide_' + sanitized;
	}

	return sanitized;
}

/**
 * Validates numeric attributes from DOM
 * @param value        - The value to validate
 * @param min          - Minimum allowed value
 * @param max          - Maximum allowed value
 * @param defaultValue - Default if validation fails
 * @return A validated number
 */
export function validateDOMNumeric(
	value: string | null,
	min: number,
	max: number,
	defaultValue: number
): number {
	if ( ! value ) {
		return defaultValue;
	}

	// Remove any non-numeric characters except decimal point and minus
	const cleaned = value.replace( /[^0-9.\-]/g, '' );
	const parsed = parseFloat( cleaned );

	if ( isNaN( parsed ) || ! isFinite( parsed ) ) {
		return defaultValue;
	}

	return validateNumericRange( parsed, min, max, defaultValue );
}
