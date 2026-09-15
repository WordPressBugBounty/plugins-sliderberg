/**
 * Slide block registration.
 */

import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType( metadata.name, {
	...( metadata as any ),
	edit: Edit,
	save: Save,
} );
