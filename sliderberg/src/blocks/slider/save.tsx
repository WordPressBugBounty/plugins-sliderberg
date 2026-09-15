/**
 * Slider block save component.
 * Returns only InnerBlocks.Content — wrapper is handled by PHP render_callback.
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function Save() {
	return <InnerBlocks.Content />;
}
