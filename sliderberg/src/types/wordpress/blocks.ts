import { ComponentType } from 'react';

declare module '@wordpress/blocks' {
	export interface BlockSettings {
		title: string;
		description: string;
		category: string;
		icon: string;
		supports?: Record< string, any >;
		attributes?: Record< string, any >;
		edit: ComponentType< any >;
		save: ComponentType< any >;
		[ key: string ]: any;
	}

	export function registerBlockType(
		name: string,
		settings: BlockSettings
	): void;
	export function unregisterBlockType( name: string ): void;
	export function getBlockTypes(): BlockSettings[];
	export function getBlockType( name: string ): BlockSettings | undefined;
}

declare module '@wordpress/block-editor' {
	export function useSetting( name: string ): any;
	export function useMultipleOriginColorsAndGradients(): any;
	export function __experimentalUseMultipleOriginColorsAndGradients(): any;
}
