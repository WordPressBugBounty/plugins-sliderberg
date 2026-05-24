<?php
/**
 * PHP renderer for slide block - Rewritten for Grid layout
 * File: includes/slide-renderer.php
 *
 * Outputs clean DOM structure that works with CSS Grid positioning
 * No flexbox interference with nested blocks
 *
 * @since 1.0.0 Original implementation
 * @since 2.0.0 Rewritten with Grid layout support
 * @since 2.1.0 Refactored to use centralized security functions
 * @since 2.2.0 Updated to use Sliderberg_Styles_CSS_Generator class
 */

// Include the CSS generator class
require_once __DIR__ . '/class-styles-css-generator.php';

/**
 * Validate gradient CSS value
 * 
 * @param string $gradient The gradient value to validate
 * @return string Validated gradient or empty string
 */
function sliderberg_validate_gradient($gradient) {
    if (empty($gradient)) {
        return '';
    }
    
    // Remove any potential script injections
    $gradient = preg_replace('/<script[^>]*>.*?<\/script>/i', '', $gradient);
    $gradient = str_ireplace('javascript:', '', $gradient);
    $gradient = trim($gradient);
    
    // Validate gradient syntax
    if (!preg_match('/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\s*\(/i', $gradient)) {
        return '';
    }
    
    // Check for balanced parentheses
    $open_count = substr_count($gradient, '(');
    $close_count = substr_count($gradient, ')');
    if ($open_count !== $close_count || $open_count === 0) {
        return '';
    }
    
    // Additional safety check for valid CSS color values
    if (!preg_match('/(#[0-9A-Fa-f]{3,8}|rgb|rgba|hsl|hsla|transparent|currentColor|[a-z]+)/i', $gradient)) {
        return '';
    }
    
    return $gradient;
}

function render_sliderberg_slide_block($attributes, $content, $block) {
    // Get parent slider's minHeight from block context
    $parent_min_height = $block->context['sliderberg/minHeight'] ?? 400;
    // Set defaults and sanitize
    $background_image = $attributes['backgroundImage'] ?? null;
    
    // Use Sliderberg_Styles_CSS_Generator for background color/gradient
    $background_value = Sliderberg_Styles_CSS_Generator::get_background_color_var(
        $attributes,
        'backgroundColor',
        'backgroundGradient'
    );
    
    $focal_point = sliderberg_sanitize_focal_point($attributes['focalPoint'] ?? null);
    
    // Use centralized color validation for overlay
    $overlay_color = sliderberg_validate_color($attributes['overlayColor'] ?? '');
    if (empty($overlay_color)) {
        $overlay_color = '#000000'; // Default
    }
    
    $overlay_opacity = floatval($attributes['overlayOpacity'] ?? 0);
    $min_height = sliderberg_validate_numeric_range($attributes['minHeight'] ?? 400, 100, 1000, 400);
    
    // Use parent's minHeight if slide's minHeight is the default (400)
    // This allows individual slides to override the parent's setting
    $effective_min_height = ($min_height !== 400) ? $min_height : $parent_min_height;

    $content_position = sliderberg_validate_position($attributes['contentPosition'] ?? 'center-center');
    $is_fixed = (bool)($attributes['isFixed'] ?? false);
    
    // New border object format
    $border = $attributes['border'] ?? [];
    $slide_border_radius = $attributes['slideBorderRadius'] ?? [];
    
    // Build classes
    $classes = [
        'sliderberg-slide',
        'sliderberg-content-position-' . $content_position
    ];
    
    // Add border class if slide has borders
    $has_border = !empty($border);
    if ($has_border) {
        $classes[] = 'has-border';
    }
    
    // Build styles - use effective_min_height instead of min_height
    $styles = ['min-height: ' . $effective_min_height . 'px'];
    
    // Process border - use new object format only
    if (!empty($border)) {
        $border_in_dimensions = Sliderberg_Styles_CSS_Generator::get_border_css($border);
        $sides = ['top', 'right', 'bottom', 'left'];
        foreach ($sides as $side) {
            $border_value = Sliderberg_Styles_CSS_Generator::get_single_side_border_value($border_in_dimensions, $side);
            if (!empty($border_value) && trim($border_value) !== '') {
                $styles[] = 'border-' . $side . ': ' . esc_attr($border_value);
            }
        }
    }
    
    // Process border radius - use new object format only
    if (!empty($slide_border_radius)) {
        $corners = [
            'topLeft' => 'border-top-left-radius',
            'topRight' => 'border-top-right-radius',
            'bottomLeft' => 'border-bottom-left-radius',
            'bottomRight' => 'border-bottom-right-radius'
        ];
        foreach ($corners as $corner => $css_property) {
            if (!empty($slide_border_radius[$corner])) {
                $styles[] = $css_property . ': ' . esc_attr($slide_border_radius[$corner]);
            }
        }
    }
    
    // Apply background - gradient takes precedence, then image, then color
    if (!empty($background_value)) {
        // Check if it's a gradient
        if (strpos($background_value, 'gradient') !== false) {
            $validated_gradient = sliderberg_validate_gradient($background_value);
            if (!empty($validated_gradient)) {
                $styles[] = 'background-image: ' . esc_attr($validated_gradient);
            }
        } else {
            // It's a solid color
            $styles[] = 'background-color: ' . esc_attr($background_value);
        }
    }
    
    if ($background_image && !empty($background_image['url'])) {
        // Validate image URL
        $image_url = esc_url($background_image['url']);
        if (!empty($image_url)) {
            $styles[] = 'background-image: url(' . $image_url . ')';
            // Validate and sanitize focal point values
            $focal_x = max(0, min(1, floatval($focal_point['x'] ?? 0.5))) * 100;
            $focal_y = max(0, min(1, floatval($focal_point['y'] ?? 0.5))) * 100;
            $styles[] = 'background-position: ' . esc_attr($focal_x) . '% ' . esc_attr($focal_y) . '%';
            $styles[] = 'background-size: cover';
            $styles[] = 'background-attachment: ' . ($is_fixed ? 'fixed' : 'scroll');
        }
    }
    
    // Process inner blocks content
    $inner_content = '';
    if ($block instanceof WP_Block && !empty($block->inner_blocks)) {
        foreach ($block->inner_blocks as $inner_block) {
            $inner_content .= $inner_block->render();
        }
    } else {
        // Fallback to $content parameter
        $inner_content = $content;
    }
    
    // Allow filtering classes and styles before render
    $classes = apply_filters('sliderberg_slide_classes', $classes, $attributes);
    $styles = apply_filters('sliderberg_slide_styles', $styles, $attributes);
    
    // Prepare template variables
    $class_string = esc_attr(implode(' ', $classes));
    $style_string = esc_attr(implode('; ', $styles));
    $has_overlay = $overlay_opacity > 0;
    $content = $inner_content; // Use processed content
    // Centralized sanitization: allow embeds via allowed HTML
    $content = wp_kses($content, sliderberg_get_allowed_html());
    
    // Render template
    ob_start();
    
    /**
     * Action: Fires before a single slide is rendered
     * 
     * @since 2.1.0
     * @param array $attributes The slide attributes
     */
    do_action('sliderberg_before_slide', $attributes);
    
    include __DIR__ . '/templates/slide-block.php';
    
    /**
     * Action: Fires after a single slide is rendered
     * 
     * @since 2.1.0
     * @param array $attributes The slide attributes
     */
    do_action('sliderberg_after_slide', $attributes);
    
    return ob_get_clean();
}

/**
 * Register the slide block
 */
function sliderberg_register_slide_block() {
    register_block_type(
        'sliderberg/slide',
        [
            'render_callback' => 'render_sliderberg_slide_block',
            'uses_context' => ['sliderberg/minHeight']
        ]
    );
}
