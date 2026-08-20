<?php
/**
 * Plugin Name: Sliderberg
 * Plugin URI: https://sliderberg.com/
 * Description: Slider Block For the Block Editor (Gutenberg). Slide Anything With Ease.
 * Version: 1.2.2
 * Author: DotCamp
 * Author URI: https://dotcamp.com/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sliderberg
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define( 'SLIDERBERG_VERSION', '1.2.2' );
define('SLIDERBERG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SLIDERBERG_PLUGIN_URL', plugin_dir_url(__FILE__));

if ( ! function_exists( 'sli_fs' ) ) {
    // Create a helper function for easy SDK access.
    function sli_fs() {
        global $sli_fs;

        if ( ! isset( $sli_fs ) ) {
            // Include Freemius SDK.
            require_once dirname( __FILE__ ) . '/vendor/freemius/start.php';
            $sli_fs = fs_dynamic_init( array(
                'id'                  => '19340',
                'slug'                => 'sliderberg',
                'type'                => 'plugin',
                'public_key'          => 'pk_f6a90542b187793a33ebb75752ce7', // This is a public key, safe to expose
                'is_premium'          => false,
                'has_addons'          => false,
                'has_paid_plans'      => false,
                'menu'                => array(
                    'slug'           => 'sliderberg-welcome',
                    'contact'        => false,
                ),
            ) );
        }

        return $sli_fs;
    }

    // Init Freemius.
    sli_fs();
    // Signal that SDK was initiated.
    do_action( 'sli_fs_loaded' );
}

// Include security helpers (must load before admin-welcome.php)
require_once SLIDERBERG_PLUGIN_DIR . 'includes/security.php';

// Include admin welcome page
require_once SLIDERBERG_PLUGIN_DIR . 'includes/admin-welcome.php';

// Include slider and slide renderer
require_once SLIDERBERG_PLUGIN_DIR . 'includes/slider-renderer.php';
require_once SLIDERBERG_PLUGIN_DIR . 'includes/slide-renderer.php';

// Include review handler
require_once SLIDERBERG_PLUGIN_DIR . 'includes/class-review-handler.php';

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function sliderberg_init() {
    
    // Version assets by file modification time to avoid cache issues
    $editor_version = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/index.css' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/index.css' ) : SLIDERBERG_VERSION;
    $style_version = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/style-index.css' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/style-index.css' ) : SLIDERBERG_VERSION;
    $editor_js_version = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/index.js' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/index.js' ) : SLIDERBERG_VERSION;

    // Load editor script dependencies from asset file
    $editor_asset_file = SLIDERBERG_PLUGIN_DIR . 'build/index.asset.php';
    $editor_dependencies = array('wp-blocks', 'wp-element', 'wp-editor');
    if ( file_exists( $editor_asset_file ) ) {
        $editor_asset = require $editor_asset_file;
        $editor_dependencies = isset( $editor_asset['dependencies'] ) ? $editor_asset['dependencies'] : $editor_dependencies;
    }

    // Register editor script FIRST (required by block.json)
    wp_register_script(
        'sliderberg-editor',
        SLIDERBERG_PLUGIN_URL . 'build/index.js',
        $editor_dependencies,
        $editor_js_version,
        true
    );

    // Register shared styles first so block.json can load them on the
    // frontend and inside the editor iframe.
    wp_register_style(
        'sliderberg-style',
        SLIDERBERG_PLUGIN_URL . 'build/style-index.css',
        array(),
        $style_version
    );

    // Register editor-only styles after the shared styles.
    wp_register_style(
        'sliderberg-editor',
        SLIDERBERG_PLUGIN_URL . 'build/index.css',
        array( 'sliderberg-style' ),
        $editor_version
    );

    // The frontend view script is registered and enqueued on demand in
    // sliderberg_enqueue_view_assets(), called by the render callback.

    // Register blocks AFTER assets are registered
    // Register slider block with PHP rendering
    sliderberg_register_slider_block();
    
    // Register slide block with PHP rendering
    sliderberg_register_slide_block();
}
add_action('init', 'sliderberg_init');

// Initialize review handler
add_action('init', function() {
    new \SliderBerg\Review_Handler();
});

// Load plugin text domain
add_action('plugins_loaded', function() {
    load_plugin_textdomain('sliderberg', false, dirname(plugin_basename(__FILE__)) . '/languages');
});

// Enqueue editor assets
function sliderberg_editor_assets() {
    wp_enqueue_script( 'sliderberg-editor' );

    // Pass pro status and upgrade URL to the editor JS.
    // isPro is true when the pro plugin is active and its class is loaded.
    $is_pro      = class_exists( 'SliderbergPro\Pro_Features' );
    $upgrade_url =  'https://sliderberg.com/pricing/';

    // Scan assets/images/upsell/ and build a feature-key → URL map.
    // Drop any image named by feature key (e.g. cube-effect.gif) there; no rebuild needed.
    $images_dir    = plugin_dir_path( __FILE__ ) . 'assets/images/upsell/';
    $images_url    = plugins_url( 'assets/images/upsell/', __FILE__ );
    $upsell_images = array();

    if ( is_dir( $images_dir ) ) {
        $allowed_ext = array( 'gif', 'png', 'jpg', 'jpeg', 'webp', 'svg' );
        foreach ( glob( $images_dir . '*' ) as $file ) {
            $ext = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );
            if ( in_array( $ext, $allowed_ext, true ) ) {
                $key                   = pathinfo( $file, PATHINFO_FILENAME );
                $upsell_images[ $key ] = $images_url . basename( $file );
            }
        }
    }

    wp_localize_script(
        'sliderberg-editor',
        'sliderbergData',
        array(
            'isPro'        => $is_pro,
            'upgradeUrl'   => esc_url( $upgrade_url ),
            'upsellImages' => $upsell_images,
        )
    );
}
add_action( 'enqueue_block_editor_assets', 'sliderberg_editor_assets' );

/**
 * Register and enqueue the frontend view assets (Swiper CSS + the vanilla
 * Swiper initializer, plus the block's own frontend styles).
 *
 * Called directly from render_sliderberg_slider_block() rather than hooked to
 * wp_enqueue_scripts behind has_block('sliderberg/sliderberg') — has_block()
 * only scans the current post's raw content, so it misses the block when
 * it's rendered from a synced pattern, template part, query loop, or widget.
 * Calling this from the render callback guarantees it runs whenever the
 * block actually renders, wherever it was placed. wp_enqueue_style()/
 * wp_enqueue_script() are no-ops on repeat calls, so this is safe to call
 * once per slider on pages with multiple sliders.
 */
function sliderberg_enqueue_view_assets() {
    wp_enqueue_style(
        'sliderberg-style',
        SLIDERBERG_PLUGIN_URL . 'build/style-index.css',
        array(),
        filemtime( SLIDERBERG_PLUGIN_DIR . 'build/style-index.css' )
    );

    wp_enqueue_style(
        'sliderberg-view',
        SLIDERBERG_PLUGIN_URL . 'build/view.css',
        array(),
        filemtime( SLIDERBERG_PLUGIN_DIR . 'build/view.css' )
    );

    $view_asset = require SLIDERBERG_PLUGIN_DIR . 'build/view.asset.php';

    wp_enqueue_script(
        'sliderberg-view',
        SLIDERBERG_PLUGIN_URL . 'build/view.js',
        $view_asset['dependencies'],
        $view_asset['version'],
        true
    );
}
