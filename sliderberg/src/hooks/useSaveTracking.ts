import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import { store as editorStore } from '@wordpress/editor';
import { store as blockEditorStore } from '@wordpress/block-editor';

interface SaveTrackingOptions {
	onSaveComplete?: () => void;
	blockName?: string;
}

export const useSaveTracking = ( options: SaveTrackingOptions = {} ) => {
	const { onSaveComplete, blockName = 'sliderberg/slider' } = options;

	const { isSaving, isAutosaving, didSaveSucceed, hasSliderbergBlock } =
		useSelect(
			( select ) => {
				const editor = select( editorStore );
				const blockEditor = select( blockEditorStore );

				// Check if post contains SliderBerg blocks
				const blocks = blockEditor.getBlocks();
				const hasBlock = blocks.some(
					( block: any ) =>
						block.name === blockName ||
						block.innerBlocks?.some(
							( inner: any ) => inner.name === blockName
						)
				);

				return {
					isSaving: editor.isSavingPost(),
					isAutosaving: editor.isAutosavingPost(),
					didSaveSucceed: editor.didPostSaveRequestSucceed(),
					hasSliderbergBlock: hasBlock,
				};
			},
			[ blockName ]
		);

	const previousIsSaving = useRef( isSaving );
	const hasTriggered = useRef( false );

	useEffect( () => {
		// Detect when save completes successfully
		if (
			! isSaving &&
			previousIsSaving.current &&
			didSaveSucceed &&
			! isAutosaving &&
			hasSliderbergBlock
		) {
			// Prevent multiple triggers for the same save
			if ( ! hasTriggered.current ) {
				hasTriggered.current = true;
				onSaveComplete?.();

				// Reset trigger flag after a delay
				setTimeout( () => {
					hasTriggered.current = false;
				}, 1000 );
			}
		}

		previousIsSaving.current = isSaving;
	}, [
		isSaving,
		isAutosaving,
		didSaveSucceed,
		hasSliderbergBlock,
		onSaveComplete,
	] );

	return {
		isSaving: isSaving && ! isAutosaving,
		isAutosaving,
		didSaveSucceed,
		hasSliderbergBlock,
	};
};
