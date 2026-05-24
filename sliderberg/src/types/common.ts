/**
 * Common type definitions shared across the plugin
 * This is the single source of truth for shared interfaces
 */

export interface HTMLElementWithDataClientId extends HTMLElement {
	getAttribute: ( name: string ) => string | null;
	style: CSSStyleDeclaration;
}

export interface BaseComponentProps {
	className?: string;
	style?: React.CSSProperties;
	[ key: string ]: any;
}

/**
 * Focal point for background image positioning
 * Values are normalized between 0 and 1
 */
export interface FocalPoint {
	x: number;
	y: number;
}

/**
 * WordPress media object returned from MediaUpload
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
 * Valid content position values for slides
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

/**
 * Valid border style values
 */
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double';

/**
 * Valid transition easing values
 */
export type TransitionEasing =
	| 'ease'
	| 'ease-in'
	| 'ease-out'
	| 'ease-in-out'
	| 'linear';

/**
 * Valid transition effect values
 */
export type TransitionEffect = 'slide' | 'fade' | 'zoom';
