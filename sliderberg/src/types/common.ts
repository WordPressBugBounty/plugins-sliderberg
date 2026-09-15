/**
 * Common type definitions shared across the plugin.
 */

/**
 * Focal point for background image positioning.
 * Values are normalized between 0 and 1.
 */
export interface FocalPoint {
	x: number;
	y: number;
}

/**
 * WordPress media object returned from MediaUpload.
 */
export interface MediaObject {
	id: number;
	url: string;
	alt?: string;
	title?: string;
	media_type?: string;
	type?: string;
}

/**
 * Valid content position values for slides.
 */
export type ContentPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center-center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';
