const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );

/**
 * Webpack configuration for Sliderberg
 *
 * Bundle architecture:
 * - index.js (~54KB): Editor bundle - React components, settings UI, block registration
 *   Only loaded in WordPress admin when editing posts/pages
 * - view.js (~27KB): Frontend bundle - Vanilla TS slider controller, animations, events
 *   Only loaded when page contains sliderberg/sliderberg block
 *
 * Code splitting consideration:
 * Current bundles are compact enough that aggressive code splitting would add
 * complexity without significant benefit. WordPress already conditionally loads
 * assets based on has_block('sliderberg/sliderberg').
 *
 * To analyze bundle composition, run:
 * ANALYZE_BUNDLE=true npm run build
 */
const BundleAnalyzerPlugin = process.env.ANALYZE_BUNDLE
	? require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin
	: null;

module.exports = {
	...defaultConfig,
	entry: {
		index: './src/index.ts',
		view: './src/view.ts',
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...( defaultConfig.resolve?.alias || {} ),
			'@sliderberg/shared': path.resolve( __dirname, '../shared/src' ),
		},
	},
	plugins: [
		...( defaultConfig.plugins || [] ),
		...( BundleAnalyzerPlugin ? [ new BundleAnalyzerPlugin() ] : [] ),
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: path.resolve(
						__dirname,
						'src/blocks/slider/block.json'
					),
					to: path.resolve(
						__dirname,
						'build/blocks/slider/block.json'
					),
				},
				{
					from: path.resolve(
						__dirname,
						'src/blocks/slide/block.json'
					),
					to: path.resolve(
						__dirname,
						'build/blocks/slide/block.json'
					),
				},
			],
		} ),
	],
};
