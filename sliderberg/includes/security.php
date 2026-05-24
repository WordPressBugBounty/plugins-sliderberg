<?php
/**
 * Security utilities for SliderBerg
 * 
 * @package SliderBerg
 * @since 1.0.3
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get allowed HTML tags/attributes for rendering slide content
 * Extends WordPress 'post' context to allow safe media embeds.
 *
 * @return array Allowed HTML for wp_kses
 */
function sliderberg_get_allowed_html() {
  // Start with WordPress defaults for post content
  $allowed = wp_kses_allowed_html('post');

  // Permit iframes for common oEmbed providers (YouTube, Vimeo, etc.)
  $allowed['iframe'] = array(
    'src' => true,
    'width' => true,
    'height' => true,
    'title' => true,
    'frameborder' => true,
    'allow' => true,
    'allowfullscreen' => true,
    'referrerpolicy' => true,
    'loading' => true,
    'name' => true,
    'id' => true,
    'class' => true,
    'style' => true,
    'sandbox' => true,
  );

  // HTML5 video/audio sources
  $allowed['video'] = array(
    'src' => true,
    'poster' => true,
    'preload' => true,
    'controls' => true,
    'muted' => true,
    'loop' => true,
    'autoplay' => true,
    'playsinline' => true,
    'crossorigin' => true,
    'width' => true,
    'height' => true,
    'id' => true,
    'class' => true,
    'style' => true,
  );

  $allowed['audio'] = array(
    'src' => true,
    'preload' => true,
    'controls' => true,
    'loop' => true,
    'autoplay' => true,
    'muted' => true,
    'crossorigin' => true,
    'id' => true,
    'class' => true,
    'style' => true,
  );

  $allowed['source'] = array(
    'src' => true,
    'type' => true,
    'media' => true,
  );

  // SVG elements and attributes for inline SVG support
  $svg_attributes = array(
    'class' => true,
    'id' => true,
    'style' => true,
    'xmlns' => true,
    'viewbox' => true,
    'width' => true,
    'height' => true,
    'fill' => true,
    'stroke' => true,
    'stroke-width' => true,
    'stroke-linecap' => true,
    'stroke-linejoin' => true,
    'stroke-dasharray' => true,
    'stroke-dashoffset' => true,
    'opacity' => true,
    'fill-opacity' => true,
    'stroke-opacity' => true,
    'transform' => true,
    'x' => true,
    'y' => true,
    'x1' => true,
    'y1' => true,
    'x2' => true,
    'y2' => true,
    'cx' => true,
    'cy' => true,
    'r' => true,
    'rx' => true,
    'ry' => true,
    'd' => true,
    'points' => true,
    'dx' => true,
    'dy' => true,
    'offset' => true,
    'stop-color' => true,
    'stop-opacity' => true,
    'gradientunits' => true,
    'gradienttransform' => true,
    'patternunits' => true,
    'patterntransform' => true,
    'clip-path' => true,
    'clip-rule' => true,
    'mask' => true,
    'href' => true,
    'xlink:href' => true,
    'preserveaspectratio' => true,
    'aria-hidden' => true,
    'aria-label' => true,
    'role' => true,
    'focusable' => true,
    'text-anchor' => true,
    'font-size' => true,
    'font-family' => true,
    'font-weight' => true,
    'dominant-baseline' => true,
    'alignment-baseline' => true,
  );

  // SVG container
  $allowed['svg'] = $svg_attributes;

  // SVG shapes
  $allowed['path'] = $svg_attributes;
  $allowed['circle'] = $svg_attributes;
  $allowed['rect'] = $svg_attributes;
  $allowed['ellipse'] = $svg_attributes;
  $allowed['line'] = $svg_attributes;
  $allowed['polygon'] = $svg_attributes;
  $allowed['polyline'] = $svg_attributes;

  // SVG text
  $allowed['text'] = $svg_attributes;
  $allowed['tspan'] = $svg_attributes;

  // SVG grouping and structure
  $allowed['g'] = $svg_attributes;
  $allowed['defs'] = $svg_attributes;
  $allowed['symbol'] = $svg_attributes;
  $allowed['use'] = $svg_attributes;
  $allowed['clippath'] = $svg_attributes;
  $allowed['mask'] = $svg_attributes;

  // SVG gradients and patterns
  $allowed['lineargradient'] = $svg_attributes;
  $allowed['radialgradient'] = $svg_attributes;
  $allowed['stop'] = $svg_attributes;
  $allowed['pattern'] = $svg_attributes;

  // SVG filters
  $allowed['filter'] = $svg_attributes;
  $allowed['fegaussianblur'] = array_merge($svg_attributes, array('in' => true, 'stddeviation' => true, 'result' => true));
  $allowed['feoffset'] = array_merge($svg_attributes, array('in' => true, 'result' => true));
  $allowed['feblend'] = array_merge($svg_attributes, array('in' => true, 'in2' => true, 'mode' => true, 'result' => true));
  $allowed['fecolormatrix'] = array_merge($svg_attributes, array('in' => true, 'type' => true, 'values' => true, 'result' => true));

  /**
   * Filter the allowed HTML for SliderBerg content.
   *
   * @param array $allowed Allowed tags/attributes array.
   */
  return apply_filters('sliderberg_allowed_html', $allowed);
}



/**
 * Validate and sanitize color values (hex, rgb, rgba)
 * Enhanced to prevent CSS injection attacks
 * 
 * @param string $color The color value to validate
 * @return string Sanitized color value or empty string if invalid
 */
function sliderberg_validate_color($color) {
    if (empty($color)) {
        return '';
    }
    
    // Remove any potentially dangerous characters first
    $color = preg_replace('/[^a-zA-Z0-9\#\(\)\,\.\s]/', '', $color);
    
    // Trim whitespace
    $color = trim($color);
    
    // Enhanced CSS injection prevention with comprehensive patterns
    $dangerous_patterns = array(
        'expression', 'javascript:', 'javascript', 'script', 'url(', '@import',
        'data:', '/*', '*/', '\\', '\u', '\x', ';', '}', '{', '<', '>',
        'behavior:', 'binding:', '-moz-binding:', 'include', 'filter:',
        'position:fixed', 'position:absolute', 'calc(', 'attr(', 'var(',
        'counter(', 'counters(', 'content:', '@charset', '@namespace',
        'element(', '-webkit-', '-moz-', 'image(', 'image-set(',
        'cross-fade(', 'linear-gradient(', 'radial-gradient(',
        'repeating-', 'conic-gradient(', '::', '!important'
    );
    
    // Normalize the color for checking
    $normalized = strtolower(preg_replace('/\s+/', '', $color));
    
    foreach ($dangerous_patterns as $pattern) {
        if (strpos($normalized, strtolower($pattern)) !== false) {
            return '';
        }
    }
    
    // Check for hex escape sequences
    if (preg_match('/\\\\[0-9a-fA-F]{1,6}/', $color)) {
        return '';
    }
    
    // Check for Unicode characters that could be used maliciously
    if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $color)) {
        return '';
    }
    
    // Check for encoded characters
    if (preg_match('/%[0-9a-fA-F]{2}/', $color)) {
        return '';
    }
    
    // Validate hex colors (3 or 6 digits)
    if (preg_match('/^#([0-9A-Fa-f]{3}){1,2}$/', $color)) {
        return strtolower($color);
    }
    
    // Validate rgb/rgba colors with strict pattern
    if (preg_match('/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0(?:\.\d{1,3})?|1(?:\.0{1,3})?)\s*)?\)$/i', $color, $matches)) {
        $r = intval($matches[1]);
        $g = intval($matches[2]);
        $b = intval($matches[3]);
        
        // Ensure RGB values are within valid range
        if ($r > 255 || $g > 255 || $b > 255) {
            return '';
        }
        
        if (isset($matches[4])) {
            $alpha = floatval($matches[4]);
            // Ensure alpha is within valid range
            if ($alpha < 0 || $alpha > 1) {
                return '';
            }
            return sprintf('rgba(%d, %d, %d, %.3f)', $r, $g, $b, $alpha);
        } else {
            return sprintf('rgb(%d, %d, %d)', $r, $g, $b);
        }
    }
    
    // Check against a whitelist of named colors (optional, more restrictive)
    $allowed_named_colors = array(
        'transparent', 'white', 'black', 'red', 'green', 'blue',
        'yellow', 'cyan', 'magenta', 'gray', 'grey'
    );
    
    if (in_array(strtolower($color), $allowed_named_colors, true)) {
        return strtolower($color);
    }
    
    return '';
}

/**
 * Validate numeric value within range
 * 
 * @param mixed $value The value to validate
 * @param int $min Minimum allowed value
 * @param int $max Maximum allowed value
 * @param int $default Default value if validation fails
 * @return int Validated integer
 */
function sliderberg_validate_numeric_range($value, $min, $max, $default) {
    // First check for scientific notation or other bypass attempts
    if (is_string($value)) {
        // Remove whitespace
        $value = trim($value);
        
        // Check for scientific notation (e.g., 1e10, 1E+10)
        if (preg_match('/[eE]/i', $value)) {
            return $default;
        }
        
        // Check for hex (0x), octal (0), or binary (0b) notation
        if (preg_match('/^0[xXbB]/', $value)) {
            return $default;
        }
        
        // Only allow digits, minus sign, and decimal point
        if (!preg_match('/^-?\d+(\.\d+)?$/', $value)) {
            return $default;
        }
    }
    
    // Convert to integer (this handles both string and numeric inputs)
    $value = intval($value);
    
    // Additional check for infinity or NaN
    if (!is_finite($value)) {
        return $default;
    }
    
    if ($value < $min || $value > $max) {
        return $default;
    }
    
    return $value;
}

/**
 * Validate content position
 * 
 * @param string $position The position value
 * @return string Valid position or default
 */
function sliderberg_validate_position($position) {
    $valid_positions = array(
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    );
    
    return in_array($position, $valid_positions, true) ? $position : 'center-center';
}

/**
 * Validate transition effect
 * 
 * @param string $effect The effect value
 * @return string Valid effect or default
 */
function sliderberg_validate_transition_effect($effect) {
    $valid_effects = array('slide', 'fade', 'zoom');
    return in_array($effect, $valid_effects, true) ? $effect : 'slide';
}

/**
 * Validate transition easing
 * 
 * @param string $easing The easing value
 * @return string Valid easing or default
 */
function sliderberg_validate_transition_easing($easing) {
    $valid_easings = array('ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear');
    return in_array($easing, $valid_easings, true) ? $easing : 'ease';
}

/**
 * Sanitize focal point value
 * 
 * @param array $focal_point The focal point array
 * @return array Sanitized focal point
 */
function sliderberg_sanitize_focal_point($focal_point) {
    $default = array('x' => 0.5, 'y' => 0.5);
    
    if (!is_array($focal_point)) {
        return $default;
    }
    
    return array(
        'x' => max(0, min(1, floatval($focal_point['x'] ?? 0.5))),
        'y' => max(0, min(1, floatval($focal_point['y'] ?? 0.5)))
    );
}

/**
 * Check if user can manage sliderberg
 * 
 * @return bool
 */
function sliderberg_user_can_manage() {
    return current_user_can('edit_posts');
}

/**
 * Get allowed plugins for installation
 * 
 * @return array
 */
function sliderberg_get_allowed_plugins() {
    return array(
        'ultimate-blocks',
        'wp-table-builder',
        'tableberg'
    );
}

/**
 * Validate plugin slug
 * 
 * @param string $plugin_slug The plugin slug to validate
 * @return bool
 */
function sliderberg_is_allowed_plugin($plugin_slug) {
    $allowed = sliderberg_get_allowed_plugins();
    return in_array($plugin_slug, $allowed, true);
}

/**
 * Validate file path is within plugin directory
 * 
 * @param string $file_path The file path to validate
 * @return bool
 */
function sliderberg_validate_file_path($file_path) {
    // Get real paths to prevent directory traversal
    $real_file_path = realpath($file_path);
    $real_plugin_dir = realpath(SLIDERBERG_PLUGIN_DIR);
    
    // Check if file exists and is within plugin directory
    if (!$real_file_path || !$real_plugin_dir) {
        return false;
    }
    
    // Ensure file is within plugin directory
    if (strpos($real_file_path, $real_plugin_dir) !== 0) {
        return false;
    }
    
    // Additional check for specific file extensions
    $allowed_extensions = array('.php', '.css', '.js', '.json');
    $file_extension = strtolower(substr($real_file_path, strrpos($real_file_path, '.')));
    
    if (!in_array($file_extension, $allowed_extensions, true)) {
        return false;
    }
    
    return true;
}

/**
 * Secure include function
 * 
 * @param string $file_path The file to include
 * @return bool
 */
function sliderberg_secure_include($file_path) {
    if (!sliderberg_validate_file_path($file_path)) {
        return false;
    }
    
    include $file_path;
    return true;
}

/**
 * Generate secure nonce with time-based data
 * 
 * @param string $action The action for the nonce
 * @return string The generated nonce
 */
function sliderberg_generate_secure_nonce($action) {
    $user_id = get_current_user_id();
    $session_token = wp_get_session_token();
    $timestamp = floor(time() / 86400); // Daily rotation
    $nonce_data = $action . '|' . $user_id . '|' . $session_token . '|' . $timestamp . '|' . wp_salt('nonce');
    
    return wp_create_nonce($nonce_data);
}

/**
 * Verify secure nonce
 * 
 * @param string $nonce The nonce to verify
 * @param string $action The action for the nonce
 * @return bool|int False if invalid, 1 if valid and recent, 2 if valid but older
 */
function sliderberg_verify_secure_nonce($nonce, $action) {
    $user_id = get_current_user_id();
    $session_token = wp_get_session_token();
    $current_timestamp = floor(time() / 86400);
    
    // Check current day
    $nonce_data = $action . '|' . $user_id . '|' . $session_token . '|' . $current_timestamp . '|' . wp_salt('nonce');
    if (wp_verify_nonce($nonce, $nonce_data)) {
        return 1;
    }
    
    // Check previous day (for edge cases)
    $prev_timestamp = $current_timestamp - 1;
    $nonce_data_prev = $action . '|' . $user_id . '|' . $session_token . '|' . $prev_timestamp . '|' . wp_salt('nonce');
    if (wp_verify_nonce($nonce, $nonce_data_prev)) {
        return 2;
    }
    
    return false;
}

/**
 * Simple rate limiting for AJAX actions
 * 
 * @param string $action The action to rate limit
 * @param int $max_attempts Maximum attempts allowed
 * @param int $window Time window in seconds
 * @return bool True if allowed, false if rate limited
 */
function sliderberg_check_rate_limit($action, $max_attempts = 5, $window = 60) {
    $user_id = get_current_user_id();
    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '';
    
    // Use stronger hashing algorithm
    $key = 'sliderberg_rate_' . $action . '_' . $user_id . '_' . hash('sha256', $ip . wp_salt('auth'));
    
    // Get current attempts
    $attempts = get_transient($key);
    
    if ($attempts === false) {
        // First attempt
        set_transient($key, 1, $window);
        return true;
    }
    
    if ($attempts >= $max_attempts) {
        // Rate limited
        return false;
    }
    
    // Increment attempts
    set_transient($key, $attempts + 1, $window);
    return true;
}

/**
 * Validate AJAX request origin
 * 
 * @return bool True if valid origin, false otherwise
 */
function sliderberg_validate_ajax_origin() {
    // Check if this is an AJAX request
    if (!wp_doing_ajax()) {
        return false;
    }
    
    // Get the referer header
    $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
    
    if (empty($referer)) {
        return false;
    }
    
    // Parse the referer URL
    $referer_parts = wp_parse_url($referer);
    if (!$referer_parts || !isset($referer_parts['host'])) {
        return false;
    }
    
    // Get the site URL parts
    $site_url = get_site_url();
    $site_parts = wp_parse_url($site_url);
    if (!$site_parts || !isset($site_parts['host'])) {
        return false;
    }
    
    // Compare hosts (case-insensitive)
    $referer_host = strtolower($referer_parts['host']);
    $site_host = strtolower($site_parts['host']);
    
    // Direct host match
    if ($referer_host === $site_host) {
        return true;
    }
    
    // Check for www prefix variations
    if ('www.' . $referer_host === $site_host || $referer_host === 'www.' . $site_host) {
        return true;
    }
    
    // Check if referer is from a subdomain (if multisite)
    if (is_multisite()) {
        // Get the base domain
        $base_domain = preg_replace('/^www\./', '', $site_host);
        
        // Check if referer is a subdomain of the base domain
        if (substr($referer_host, -strlen($base_domain)) === $base_domain) {
            return true;
        }
    }
    
    // Additional check: verify the request came from admin area
    if (strpos($referer, admin_url()) === 0) {
        return true;
    }
    
    return false;
}
