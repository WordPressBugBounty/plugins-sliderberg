/**
 * Slide block constants and types.
 */

import type {
	FocalPoint,
	MediaObject,
	ContentPosition,
} from '../../types/common';
import type { PaddingSides } from '../slider/slide-padding';

export type { FocalPoint, MediaObject, ContentPosition };

/**
 * Slide block attributes interface (mirrors block.json)
 */
export interface SlideAttributes {
	backgroundType: string;
	backgroundImage: MediaObject | null;
	backgroundColor: string | null;
	backgroundGradient: string | null;
	focalPoint: FocalPoint;
	overlayColor: string;
	overlayOpacity: number;
	minHeight: number;
	/** Unset = inherit the next larger device's value. */
	tabletMinHeight?: number;
	mobileMinHeight?: number;
	/** This slide's own padding per device; overrides the slider's per side. */
	contentPadding?: PaddingSides;
	tabletContentPadding?: PaddingSides;
	mobileContentPadding?: PaddingSides;
	contentPosition: ContentPosition;
	isFixed: boolean;
	// Deprecated border attrs (kept for backward compat)
	borderWidth: number;
	borderColor: string;
	borderStyle: string;
	// New border attrs
	border: Record< string, any >;
	borderRadius: number;
	slideBorderRadius: Record< string, any >;
	isBorderControlChanged: boolean;
	slideLink: string;
	slideLinkNewTab: boolean;
}

/**
 * Background type options
 */
export const BACKGROUND_TYPES = [
	{ label: 'Color', value: 'color' },
	{ label: 'Gradient', value: 'gradient' },
	{ label: 'Image', value: 'image' },
];

/**
 * Content position options (3x3 grid)
 */
export const CONTENT_POSITIONS: ContentPosition[] = [
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
