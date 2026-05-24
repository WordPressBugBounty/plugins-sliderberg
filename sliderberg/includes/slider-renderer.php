<?php
/**
 * PHP renderer for SliderBerg main block
 * File: includes/slider-renderer.php
 */

/**
 * Sanitize CSS color values using enhanced security function
 */
function sliderberg_sanitize_css_color($color) {
    return sliderberg_validate_color($color);
}

function render_sliderberg_slider_block($attributes, $content, $block) {
    // Allow pro plugin to modify attributes
    $attributes = apply_filters('sliderberg_slider_attributes', $attributes, $attributes['type'] ?? '');
    
    // Set defaults and sanitize attributes
    $type = sanitize_text_field($attributes['type'] ?? '');
    
    // Allow complete custom rendering for specific slider types
    $custom_output = apply_filters('sliderberg_render_slider_type', '', $attributes, $type, $block);
    if (!empty($custom_output)) {
        return $custom_output;
    }
    $navigation_type = sanitize_text_field($attributes['navigationType'] ?? 'bottom');
    $navigation_placement = sanitize_text_field($attributes['navigationPlacement'] ?? 'overlay');
    $navigation_shape = sanitize_text_field($attributes['navigationShape'] ?? 'circle');
    $navigation_size = sanitize_text_field($attributes['navigationSize'] ?? 'medium');
    $navigation_color = sliderberg_sanitize_css_color($attributes['navigationColor'] ?? '#ffffff');
    $navigation_bg_color = sliderberg_sanitize_css_color($attributes['navigationBgColor'] ?? 'rgba(0, 0, 0, 0.5)');
    $navigation_opacity = floatval($attributes['navigationOpacity'] ?? 1);
    $navigation_vertical_pos = intval($attributes['navigationVerticalPosition'] ?? 20);
    $navigation_horizontal_pos = intval($attributes['navigationHorizontalPosition'] ?? 20);
    $dot_color = sliderberg_sanitize_css_color($attributes['dotColor'] ?? '#6c757d');
    $dot_active_color = sliderberg_sanitize_css_color($attributes['dotActiveColor'] ?? '#ffffff');
    $hide_dots = (bool)($attributes['hideDots'] ?? false);
    $hide_navigation = (bool)($attributes['hideNavigation'] ?? false);
    $transition_effect = sanitize_text_field($attributes['transitionEffect'] ?? 'slide');
    $transition_duration = intval($attributes['transitionDuration'] ?? 500);
    $transition_easing = sanitize_text_field($attributes['transitionEasing'] ?? 'ease');
    $autoplay = (bool)($attributes['autoplay'] ?? false);
    $autoplay_speed = intval($attributes['autoplaySpeed'] ?? 5000);
    $pause_on_hover = (bool)($attributes['pauseOnHover'] ?? true);
    $width_preset = sanitize_text_field($attributes['widthPreset'] ?? 'full');
    $custom_width = sanitize_text_field($attributes['customWidth'] ?? '');
    $align = sanitize_text_field($attributes['align'] ?? '');
    
    // Carousel attributes
    $is_carousel_mode = (bool)($attributes['isCarouselMode'] ?? false);
    $slides_to_show = max(1, min(10, intval($attributes['slidesToShow'] ?? 3)));
    $slides_to_scroll = max(1, min($slides_to_show, intval($attributes['slidesToScroll'] ?? 1)));
    $slide_spacing = max(0, min(100, intval($attributes['slideSpacing'] ?? 20)));
    $infinite_loop = (bool)($attributes['infiniteLoop'] ?? true);
    
    // Responsive carousel attributes
    $tablet_slides_to_show = max(1, min(10, intval($attributes['tabletSlidesToShow'] ?? 2)));
    $tablet_slides_to_scroll = max(1, min($tablet_slides_to_show, intval($attributes['tabletSlidesToScroll'] ?? 1)));
    $tablet_slide_spacing = max(0, min(100, intval($attributes['tabletSlideSpacing'] ?? 15)));
    $mobile_slides_to_show = max(1, min(10, intval($attributes['mobileSlidesToShow'] ?? 1)));
    $mobile_slides_to_scroll = max(1, min($mobile_slides_to_show, intval($attributes['mobileSlidesToScroll'] ?? 1)));
    $mobile_slide_spacing = max(0, min(100, intval($attributes['mobileSlideSpacing'] ?? 10)));
    
    // Validate transition effect using filter
    $valid_effects = apply_filters('sliderberg_valid_transition_effects', ['slide', 'fade', 'zoom']);
    if (!in_array($transition_effect, $valid_effects)) {
        $transition_effect = 'slide';
    }
    
    // Validate navigation type
    $valid_nav_types = ['split', 'top', 'bottom'];
    if (!in_array($navigation_type, $valid_nav_types)) {
        $navigation_type = 'bottom';
    }
    
    // Build CSS custom properties
    $css_vars = [
        '--sliderberg-dot-color' => $dot_color,
        '--sliderberg-dot-active-color' => $dot_active_color,
        '--sliderberg-slides-to-show' => $slides_to_show,
        '--sliderberg-slide-spacing' => $slide_spacing . 'px',
    ];
    
    // Add custom width if specified (with validation)
    if ($width_preset === 'custom' && $custom_width) {
        // Validate custom width is numeric and within reasonable bounds
        $validated_width = intval($custom_width);
        if ($validated_width > 0 && $validated_width <= 9999) {
            $css_vars['--sliderberg-custom-width'] = $validated_width . 'px';
        }
    }
    
    // Build wrapper attributes
    $wrapper_classes = ['wp-block-sliderberg-sliderberg'];
    if ($align) {
        $wrapper_classes[] = 'align' . $align;
    }
    if ($is_carousel_mode) {
        $wrapper_classes[] = 'sliderberg-carousel-mode';
    }
    
    $wrapper_attrs = [
        'class' => implode(' ', $wrapper_classes),
        'data-width-preset' => $width_preset,
        'style' => build_css_vars_string($css_vars)
    ];
    
    // Allow pro plugin to modify wrapper attributes
    $wrapper_attrs = apply_filters('sliderberg_wrapper_attributes', $wrapper_attrs, $attributes, $type);
    
    // Build a single JSON configuration for the frontend controller
    $config = [
        'transitionEffect' => $transition_effect,
        'transitionDuration' => $transition_duration,
        'transitionEasing' => $transition_easing,
        'autoplay' => (bool) $autoplay,
        'autoplaySpeed' => $autoplay_speed,
        'pauseOnHover' => (bool) $pause_on_hover,
        'isCarouselMode' => (bool) $is_carousel_mode,
        'slidesToShow' => $slides_to_show,
        'slidesToScroll' => $slides_to_scroll,
        'slideSpacing' => $slide_spacing,
        'infiniteLoop' => (bool) $infinite_loop,
        // Responsive
        'tabletSlidesToShow' => $tablet_slides_to_show,
        'tabletSlidesToScroll' => $tablet_slides_to_scroll,
        'tabletSlideSpacing' => $tablet_slide_spacing,
        'mobileSlidesToShow' => $mobile_slides_to_show,
        'mobileSlidesToScroll' => $mobile_slides_to_scroll,
        'mobileSlideSpacing' => $mobile_slide_spacing,
    ];
    // Frontend reads a single JSON configuration
    $container_attrs = [
        'data-config' => wp_json_encode( $config ),
    ];
    
    // Navigation button styles
    $nav_button_styles = [
        'color' => $navigation_color,
        'background-color' => $navigation_bg_color
    ];
    
    // Split navigation positioning
    $split_nav_styles = [];
    if ($navigation_type === 'split') {
        $split_nav_styles = [
            'transform' => "translateY(calc(-50% + {$navigation_vertical_pos}px))"
        ];
    }
    
    // Allow modifying the slide content generation for different slider types
    $slides_content = apply_filters('sliderberg_generate_slides', $content, $attributes, $type);
    
    // Prepare variables for template
    $template_vars = [
        'wrapper_attrs' => $wrapper_attrs,
        'container_attrs' => $container_attrs,
        'navigation_type' => $navigation_type,
        'navigation_placement' => $navigation_placement,
        'navigation_opacity' => $navigation_opacity,
        'navigation_shape' => $navigation_shape,
        'navigation_size' => $navigation_size,
        'nav_button_styles' => $nav_button_styles,
        'split_nav_styles' => $split_nav_styles,
        'navigation_horizontal_pos' => $navigation_horizontal_pos,
        'navigation_vertical_pos' => $navigation_vertical_pos,
        'hide_dots' => $hide_dots,
        'hide_navigation' => $hide_navigation,
        'content' => $slides_content // Modified content from filter
    ];
    
    // Allow actions before slider rendering
    ob_start();
    do_action('sliderberg_before_slider', $attributes, $type);
    
    // Render template
    sliderberg_render_slider_template($template_vars);
    
    // Allow actions after slider rendering
    do_action('sliderberg_after_slider', $attributes, $type);
    
    return ob_get_clean();
}

/**
 * Build CSS variables string from array
 */
function build_css_vars_string($vars) {
    $styles = [];
    foreach ($vars as $property => $value) {
        if ($value) {
            $styles[] = $property . ': ' . esc_attr($value);
        }
    }
    return implode('; ', $styles);
}

/**
 * Render navigation button
 */
function render_nav_button($type, $styles, $shape, $size, $additional_class = '') {
    $style_string = build_inline_styles($styles);
    
    // Build CSS classes
    $classes = ['sliderberg-nav-button', "sliderberg-{$type}"];
    if (!empty($additional_class)) {
        $classes[] = $additional_class;
    }
    $class_string = implode(' ', $classes);
    
    // Hardcoded secure SVG icons
    $icons = [
        'prev' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/></svg>',
        'next' => '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/></svg>'
    ];
    
    $icon = isset($icons[$type]) ? $icons[$type] : $icons['next'];
    $label = $type === 'prev' ? __('Previous Slide', 'sliderberg') : __('Next Slide', 'sliderberg');
    
    return sprintf(
        '<button class="%s" aria-label="%s" data-shape="%s" data-size="%s" style="%s">%s</button>',
        esc_attr($class_string),
        esc_attr($label),
        esc_attr($shape),
        esc_attr($size),
        esc_attr($style_string),
        $icon
    );
}

/**
 * Build inline styles string with proper escaping
 */
function build_inline_styles($styles) {
    $style_parts = [];
    $safe_properties = array(
        'color', 'background-color', 'opacity', 'left', 'right', 
        'top', 'bottom', 'transform', 'width', 'height'
    );
    
    foreach ($styles as $property => $value) {
        // Allow CSS custom properties (CSS variables)
        $is_custom_property = strpos($property, '--') === 0;
        
        // Validate property name
        if (!$is_custom_property && !in_array($property, $safe_properties)) {
            continue;
        }
        
        if ($value) {
            // Handle CSS custom properties (strict whitelist validation)
            if ($is_custom_property) {
                // Only allow specific SliderBerg custom properties
                $allowed_custom_props = array(
                    '--sliderberg-nav-horizontal-position',
                    '--sliderberg-nav-vertical-position'
                );
                
                if (!in_array($property, $allowed_custom_props)) {
                    continue;
                }
                
                // Validate value format for position properties
                if (strpos($property, 'position') !== false) {
                    // Must be in format: digits + 'px'
                    if (!preg_match('/^\d+px$/', $value)) {
                        continue;
                    }
                    
                    // Extract numeric value for bounds checking
                    $numeric_value = intval($value);
                    
                    // Bounds checking based on property type
                    if (strpos($property, 'horizontal') !== false) {
                        // Horizontal: 0-200px range
                        if ($numeric_value < 0 || $numeric_value > 200) {
                            continue;
                        }
                    } elseif (strpos($property, 'vertical') !== false) {
                        // Vertical: -200 to +200px range (allows negative for centering adjustments)
                        if ($numeric_value < -200 || $numeric_value > 200) {
                            continue;
                        }
                    }
                }
                
                $value = esc_attr($value);
            } 
            // Escape the value based on property type
            elseif ($property === 'color' || $property === 'background-color') {
                $value = sliderberg_sanitize_css_color($value);
            } elseif (in_array($property, array('left', 'right', 'top', 'bottom', 'width', 'height'))) {
                // Ensure numeric values with px
                if (preg_match('/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/', $value, $matches)) {
                    $value = floatval($matches[1]) . ($matches[2] ?? 'px');
                } else {
                    continue;
                }
            } elseif ($property === 'opacity') {
                $value = max(0, min(1, floatval($value)));
            } elseif ($property === 'transform') {
                // Only allow safe transform functions
                if (!preg_match('/^(translateY|translateX|scale)\([^;]+\)$/', $value)) {
                    continue;
                }
            }
            
            if ($value) {
                $style_parts[] = esc_attr($property) . ': ' . esc_attr($value);
            }
        }
    }
    return implode('; ', $style_parts);
}

/**
 * Render slider indicators
 */
function render_slide_indicators($hide_dots) {
    if ($hide_dots) {
        return '';
    }
    return '<div class="sliderberg-slide-indicators"><!-- Indicators populated by JS --></div>';
}

/**
 * Render the slider template
 */
function sliderberg_render_slider_template($vars) {
    // Explicitly define variables instead of using extract()
    $wrapper_attrs = isset($vars['wrapper_attrs']) ? $vars['wrapper_attrs'] : array();
    $container_attrs = isset($vars['container_attrs']) ? $vars['container_attrs'] : array();
    $navigation_type = isset($vars['navigation_type']) ? $vars['navigation_type'] : 'bottom';
    $navigation_placement = isset($vars['navigation_placement']) ? $vars['navigation_placement'] : 'overlay';
    $navigation_opacity = isset($vars['navigation_opacity']) ? floatval($vars['navigation_opacity']) : 1;
    $navigation_shape = isset($vars['navigation_shape']) ? $vars['navigation_shape'] : 'circle';
    $navigation_size = isset($vars['navigation_size']) ? $vars['navigation_size'] : 'medium';
    $nav_button_styles = isset($vars['nav_button_styles']) ? $vars['nav_button_styles'] : array();
    $split_nav_styles = isset($vars['split_nav_styles']) ? $vars['split_nav_styles'] : array();
    $navigation_horizontal_pos = isset($vars['navigation_horizontal_pos']) ? intval($vars['navigation_horizontal_pos']) : 20;
    $navigation_vertical_pos = isset($vars['navigation_vertical_pos']) ? intval($vars['navigation_vertical_pos']) : 20;
    $hide_dots = isset($vars['hide_dots']) ? (bool)$vars['hide_dots'] : false;
    $hide_navigation = isset($vars['hide_navigation']) ? (bool)$vars['hide_navigation'] : false;
    $content = isset($vars['content']) ? $vars['content'] : '';
    
    // Sanitize content while allowing safe media embeds via allowed HTML.
    $content = wp_kses( $content, sliderberg_get_allowed_html() );
    
    // Build wrapper attributes string
    $wrapper_attr_string = '';
    foreach ($wrapper_attrs as $attr => $value) {
        $wrapper_attr_string .= sprintf(' %s="%s"', $attr, esc_attr($value));
    }
    
    // Build container attributes string
    $container_attr_string = '';
    foreach ($container_attrs as $attr => $value) {
        $container_attr_string .= sprintf(' %s="%s"', $attr, esc_attr($value));
    }
    
    // Include the template directly from the plugin directory
    include __DIR__ . '/templates/slider-block.php';
}

/**
 * Register the slider block with PHP rendering
 */
function sliderberg_register_slider_block() {
    // Use block.json as the single source of truth; only provide render callback here
    register_block_type_from_metadata(
        SLIDERBERG_PLUGIN_DIR . 'src/blocks/slider',
        [ 'render_callback' => 'render_sliderberg_slider_block' ]
    );
}
