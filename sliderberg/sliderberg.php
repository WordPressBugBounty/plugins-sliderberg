<?php
/**
 * Plugin Name: Sliderberg
 * Plugin URI: https://sliderberg.com/
 * Description: Slider Block For the Block Editor (Gutenberg). Slide Anything With Ease.
 * Version: 1.0.8
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
define( 'SLIDERBERG_VERSION', '1.0.8' );
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

// Include security utilities
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
    $style_version  = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/style-index.css' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/style-index.css' ) : SLIDERBERG_VERSION;
    $editor_version = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/index.css' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/index.css' ) : SLIDERBERG_VERSION;
    $view_version   = file_exists( SLIDERBERG_PLUGIN_DIR . 'build/view.js' ) ? filemtime( SLIDERBERG_PLUGIN_DIR . 'build/view.js' ) : SLIDERBERG_VERSION;
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

    // Register block styles
    wp_register_style(
        'sliderberg-style',
        SLIDERBERG_PLUGIN_URL . 'build/style-index.css',
        array(),
        $style_version
    );

    // Register editor styles
    wp_register_style(
        'sliderberg-editor',
        SLIDERBERG_PLUGIN_URL . 'build/index.css',
        array(),
        $editor_version
    );

    // Register view script
    wp_register_script(
        'sliderberg-view',
        SLIDERBERG_PLUGIN_URL . 'build/view.js',
        array(),
        $view_version,
        true
    );
    
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
    // Enqueue the already-registered editor script (registered in sliderberg_init)
    wp_enqueue_script('sliderberg-editor');
    
    // Get valid transition effects through filter
    $valid_effects = apply_filters('sliderberg_valid_transition_effects', array('slide', 'fade', 'zoom'));
    
    // Localize script data
    wp_localize_script('sliderberg-editor', 'sliderbergData', array(
        'validTransitionEffects' => $valid_effects
    ));
}
add_action('enqueue_block_editor_assets', 'sliderberg_editor_assets');

// Enqueue frontend assets
function sliderberg_frontend_assets() {
    // Only enqueue if we have sliderberg blocks on the page
    if (has_block('sliderberg/sliderberg')) {
        wp_enqueue_style('sliderberg-style');
        wp_enqueue_script('sliderberg-view');
        
        // Pro add-ons can enqueue wp-hooks here to enable frontend filters:
        // wp_enqueue_script('wp-hooks');
    }
}
add_action('wp_enqueue_scripts', 'sliderberg_frontend_assets');

/**
 * Handle plugin installation via AJAX
 */
function sliderberg_install_plugin() {
    // Check if request is AJAX
    if (!wp_doing_ajax()) {
        wp_die('Invalid request', 'Invalid Request', array('response' => 400));
    }
    
    // Validate request origin
    if (!sliderberg_validate_ajax_origin()) {
        wp_send_json_error(array('message' => 'Invalid request origin'));
    }
    
    // Check rate limiting
    if (!sliderberg_check_rate_limit('install_plugin', 3, 300)) {
        wp_send_json_error(array('message' => 'Too many requests. Please try again later.'));
    }
    
    // Check nonce
    if (!check_ajax_referer('sliderberg_plugin_action', '_ajax_nonce', false)) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Check user capabilities
    if (!current_user_can('install_plugins')) {
        wp_send_json_error(array('message' => 'You do not have permission to install plugins'));
    }

    // Get plugin slug with strict validation
    $plugin = isset($_POST['plugin']) ? sanitize_text_field(wp_unslash($_POST['plugin'])) : '';
    
    // Validate plugin slug format (alphanumeric and hyphens only)
    if (!preg_match('/^[a-z0-9\-]+$/', $plugin)) {
        wp_send_json_error(array('message' => 'Invalid plugin slug format'));
    }
    
    if (empty($plugin) || strlen($plugin) > 50) {
        wp_send_json_error(array('message' => 'Plugin slug is required and must be less than 50 characters'));
    }
    
    // Validate plugin is in whitelist
    if (!sliderberg_is_allowed_plugin($plugin)) {
        wp_send_json_error(array('message' => 'Plugin not allowed'));
    }

    // Include required files
    require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';

    // Get plugin info
    $api = plugins_api('plugin_information', array('slug' => $plugin));
    if (is_wp_error($api)) {
        wp_send_json_error(array('message' => $api->get_error_message()));
    }

    // Install plugin
    $upgrader = new Plugin_Upgrader(new Automatic_Upgrader_Skin());
    $result = $upgrader->install($api->download_link);

    if (is_wp_error($result)) {
        wp_send_json_error(array('message' => $result->get_error_message()));
    }

    wp_send_json_success();
}
add_action('wp_ajax_sliderberg_install_plugin', 'sliderberg_install_plugin');

/**
 * Handle plugin activation via AJAX
 */
function sliderberg_activate_plugin() {
    // Check if request is AJAX
    if (!wp_doing_ajax()) {
        wp_die('Invalid request', 'Invalid Request', array('response' => 400));
    }
    
    // Validate request origin
    if (!sliderberg_validate_ajax_origin()) {
        wp_send_json_error(array('message' => 'Invalid request origin'));
    }
    
    // Check rate limiting
    if (!sliderberg_check_rate_limit('activate_plugin', 5, 300)) {
        wp_send_json_error(array('message' => 'Too many requests. Please try again later.'));
    }
    
    // Check nonce
    if (!check_ajax_referer('sliderberg_plugin_action', '_ajax_nonce', false)) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Check user capabilities
    if (!current_user_can('activate_plugins')) {
        wp_send_json_error(array('message' => 'You do not have permission to activate plugins'));
    }

    // Get plugin slug with strict validation
    $plugin = isset($_POST['plugin']) ? sanitize_text_field(wp_unslash($_POST['plugin'])) : '';
    
    // Validate plugin slug format (alphanumeric and hyphens only)
    if (!preg_match('/^[a-z0-9\-]+$/', $plugin)) {
        wp_send_json_error(array('message' => 'Invalid plugin slug format'));
    }
    
    if (empty($plugin) || strlen($plugin) > 50) {
        wp_send_json_error(array('message' => 'Plugin slug is required and must be less than 50 characters'));
    }
    
    // Validate plugin is in whitelist
    if (!sliderberg_is_allowed_plugin($plugin)) {
        wp_send_json_error(array('message' => 'Plugin not allowed'));
    }

    // Validate plugin path to prevent directory traversal
    $plugin_file = $plugin . '/' . $plugin . '.php';
    if (strpos($plugin_file, '..') !== false || strpos($plugin_file, './') !== false || strpos($plugin_file, '\\') !== false) {
        wp_send_json_error(array('message' => 'Invalid plugin path'));
    }
    
    // Additional check: verify the plugin file exists in the correct location
    $full_plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
    if (!file_exists($full_plugin_path)) {
        wp_send_json_error(array('message' => 'Plugin file not found'));
    }

    // Activate plugin
    $result = activate_plugin($plugin . '/' . $plugin . '.php');

    if (is_wp_error($result)) {
        wp_send_json_error(array('message' => $result->get_error_message()));
    }

    wp_send_json_success();
}
add_action('wp_ajax_sliderberg_activate_plugin', 'sliderberg_activate_plugin'); 
