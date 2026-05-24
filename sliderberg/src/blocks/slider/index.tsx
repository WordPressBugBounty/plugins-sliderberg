/**
 * Slider Block Registration
 *
 * Uses block.json as the single source of truth for:
 * - Block name, title, description, category, icon
 * - Supports configuration
 * - All block attributes
 *
 * This file adds:
 * - Edit and Save components
 * - Deprecations
 * - Pro plugin attribute extensions via filter
 */

import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { applyFilters } from '@wordpress/hooks';
import * as React from 'react';

// Import block metadata from block.json (single source of truth)
import metadata from './block.json';

// Import styles
import './style.css';
import './editor.css';

// Import components
import { Edit } from './edit';

// Import deprecations
import deprecated from './deprecated';

// Import slide block
import '../slide';

// Allow pro features to add type-specific attributes
const typeAttributes = applyFilters(
	'sliderberg.blockAttributes',
	{}
) as Record< string, any >;

/**
 * Register the main slider block
 *
 * WordPress merges block.json metadata (registered via PHP) with this JS registration.
 * The block.json provides: name, title, description, category, icon, supports, attributes
 * This file provides: edit, save, deprecated, and any runtime attribute extensions
 */
registerBlockType( metadata.name, {
	// Spread metadata from block.json
	...metadata,
	// Merge attributes: block.json attributes + pro plugin extensions
	attributes: {
		...metadata.attributes,
		...typeAttributes,
	},
	// Components (must be defined in JS)
	edit: Edit,
	save: () => {
		return <InnerBlocks.Content />;
	},
	deprecated,
} );
