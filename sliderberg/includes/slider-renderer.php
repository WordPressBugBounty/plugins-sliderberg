<?php
/**
 * Slider block server-side renderer.
 * Outputs Swiper-compatible HTML with config in data-swiper-data attribute.
 *
 * @package Sliderberg
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Check whether a transition effect can run in carousel mode.
 *
 * @param string $transition_effect Selected transition effect.
 * @return bool
 */
function sliderberg_is_transition_effect_allowed_in_carousel( $transition_effect ) {
    return in_array( $transition_effect, array( 'slide', 'coverflow' ), true );
}

/**
 * Register the slider block with PHP rendering.
 */
function sliderberg_register_slider_block() {
    register_block_type_from_metadata(
        SLIDERBERG_PLUGIN_DIR . 'build/blocks/slider',
        array(
            'render_callback' => 'render_sliderberg_slider_block',
        )
    );
}

/**
 * Build the Swiper configuration array from block attributes.
 *
 * @param string $transition_effect Selected transition effect.
 * @param bool   $is_carousel       Whether carousel mode is enabled.
 * @return array<string, mixed>
 */
function sliderberg_get_transition_effect_config( $transition_effect, $is_carousel = false ) {
    if ( $is_carousel && ! sliderberg_is_transition_effect_allowed_in_carousel( $transition_effect ) ) {
        return array(
            'effect' => 'slide',
        );
    }

    if ( 'fade' === $transition_effect ) {
        return array(
            'effect'     => 'fade',
            'fadeEffect' => array(
                'crossFade' => true,
            ),
        );
    }

    if ( 'zoom' === $transition_effect ) {
        return array(
            'effect'         => 'creative',
            'creativeEffect' => array(
                'prev' => array(
                    'opacity' => 0,
                    'scale'   => 0.95,
                ),
                'next' => array(
                    'opacity' => 0,
                    'scale'   => 1.05,
                ),
            ),
        );
    }

    if ( 'coverflow' === $transition_effect ) {
        return array(
            'centeredSlides'  => $is_carousel,
            'effect'          => 'coverflow',
            'coverflowEffect' => array(
                'depth'        => 100,
                'modifier'     => 1,
                'rotate'       => 50,
                'scale'        => 1,
                'slideShadows' => true,
                'stretch'      => 0,
            ),
            'watchSlidesProgress' => $is_carousel,
        );
    }

    if ( 'flip' === $transition_effect ) {
        return array(
            'effect'     => 'flip',
            'flipEffect' => array(
                'limitRotation' => true,
                'slideShadows'  => true,
            ),
        );
    }

    if ( 'cube' === $transition_effect ) {
        return array(
            'effect'     => 'cube',
            'cubeEffect' => array(
                'shadow'       => true,
                'shadowOffset' => 20,
                'shadowScale'  => 0.94,
                'slideShadows' => true,
            ),
        );
    }

    if ( 'parallax' === $transition_effect ) {
        return array(
            'effect'   => 'slide',
            'parallax' => true,
        );
    }

    return array(
        'effect' => 'slide',
    );
}

/**
 * Build the Swiper configuration array from block attributes.
 *
 * @param array $attrs Block attributes.
 * @return array Swiper config.
 */
function sliderberg_build_swiper_config( $attrs ) {
    $attrs = apply_filters( 'sliderberg_slider_attributes', $attrs );

    $transition_effect = isset( $attrs['transitionEffect'] ) ? $attrs['transitionEffect'] : 'slide';
    $is_carousel      = ! empty( $attrs['isCarouselMode'] );
    $slides_to_show   = isset( $attrs['slidesToShow'] ) ? absint( $attrs['slidesToShow'] ) : 3;
    $slides_to_scroll = isset( $attrs['slidesToScroll'] ) ? absint( $attrs['slidesToScroll'] ) : 1;
    $slide_spacing    = isset( $attrs['slideSpacing'] ) ? absint( $attrs['slideSpacing'] ) : 20;

    $config = array_merge(
        array(
        'speed'          => isset( $attrs['transitionDuration'] ) ? absint( $attrs['transitionDuration'] ) : 500,
        'loop'           => isset( $attrs['infiniteLoop'] ) ? (bool) $attrs['infiniteLoop'] : true,
        'slidesPerView'  => $is_carousel ? $slides_to_show : 1,
        'slidesPerGroup' => $is_carousel ? $slides_to_scroll : 1,
        'spaceBetween'   => $is_carousel ? $slide_spacing : 0,
        'keyboard'       => array( 'enabled' => true ),
        'a11y'           => array(
            'prevSlideMessage' => __( 'Previous slide', 'sliderberg' ),
            'nextSlideMessage' => __( 'Next slide', 'sliderberg' ),
        ),
        ),
        sliderberg_get_transition_effect_config( $transition_effect, $is_carousel )
    );

    // Autoplay
    if ( ! empty( $attrs['autoplay'] ) ) {
        $config['autoplay'] = array(
            'delay'              => isset( $attrs['autoplaySpeed'] ) ? absint( $attrs['autoplaySpeed'] ) : 5000,
            'disableOnInteraction' => false,
            'pauseOnMouseEnter'  => isset( $attrs['pauseOnHover'] ) ? (bool) $attrs['pauseOnHover'] : true,
        );
    }

    // Navigation
    $hide_nav = ! empty( $attrs['hideNavigation'] );
    if ( ! $hide_nav ) {
        $config['navigation'] = array(
            'nextEl' => '.swiper-button-next',
            'prevEl' => '.swiper-button-prev',
        );
    }

    // Pagination
    $hide_dots = ! empty( $attrs['hideDots'] );
    if ( ! $hide_dots ) {
        $config['pagination'] = array(
            'el'        => '.swiper-pagination',
            'clickable' => true,
        );
    }

    // Responsive breakpoints (carousel mode only)
    if ( $is_carousel ) {
        $config['breakpoints'] = array(
            0    => array(
                'slidesPerView'  => isset( $attrs['mobileSlidesToShow'] ) ? absint( $attrs['mobileSlidesToShow'] ) : 1,
                'slidesPerGroup' => isset( $attrs['mobileSlidesToScroll'] ) ? absint( $attrs['mobileSlidesToScroll'] ) : 1,
                'spaceBetween'   => isset( $attrs['mobileSlideSpacing'] ) ? absint( $attrs['mobileSlideSpacing'] ) : 10,
            ),
            768  => array(
                'slidesPerView'  => isset( $attrs['tabletSlidesToShow'] ) ? absint( $attrs['tabletSlidesToShow'] ) : 2,
                'slidesPerGroup' => isset( $attrs['tabletSlidesToScroll'] ) ? absint( $attrs['tabletSlidesToScroll'] ) : 1,
                'spaceBetween'   => isset( $attrs['tabletSlideSpacing'] ) ? absint( $attrs['tabletSlideSpacing'] ) : 15,
            ),
            1024 => array(
                'slidesPerView'  => $slides_to_show,
                'slidesPerGroup' => $slides_to_scroll,
                'spaceBetween'   => $slide_spacing,
            ),
        );
    }

    // Slider direction
    $direction = isset( $attrs['sliderDirection'] ) ? $attrs['sliderDirection'] : 'horizontal';
    if ( 'vertical' === $direction ) {
        $config['direction'] = 'vertical';
    }

    return apply_filters( 'sliderberg_swiper_config', $config, $attrs );
}

/**
 * Render the slider block on the frontend.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Inner block content (rendered slides).
 * @return string HTML output.
 */
function render_sliderberg_slider_block( $attributes, $content ) {
    $attributes = apply_filters( 'sliderberg_slider_attributes', $attributes );

    $hide_nav  = ! empty( $attributes['hideNavigation'] );
    $hide_dots = ! empty( $attributes['hideDots'] );
    $transition_effect = isset( $attributes['transitionEffect'] ) ? sanitize_html_class( $attributes['transitionEffect'] ) : 'slide';

    // Navigation style attributes
    $nav_color    = isset( $attributes['navigationColor'] ) ? esc_attr( $attributes['navigationColor'] ) : '#ffffff';
    $nav_bg_color = isset( $attributes['navigationBgColor'] ) ? esc_attr( $attributes['navigationBgColor'] ) : 'rgba(0, 0, 0, 0.5)';
    $nav_opacity  = isset( $attributes['navigationOpacity'] ) ? floatval( $attributes['navigationOpacity'] ) : 1;
    $dot_color    = isset( $attributes['dotColor'] ) ? esc_attr( $attributes['dotColor'] ) : '#6c757d';
    $dot_active   = isset( $attributes['dotActiveColor'] ) ? esc_attr( $attributes['dotActiveColor'] ) : '#ffffff';
    $min_height   = isset( $attributes['minHeight'] ) ? absint( $attributes['minHeight'] ) : 400;

    // Navigation shape and size
    $nav_shape      = isset( $attributes['navigationShape'] ) ? sanitize_html_class( $attributes['navigationShape'] ) : 'circle';
    $nav_size       = isset( $attributes['navigationSize'] ) ? sanitize_html_class( $attributes['navigationSize'] ) : 'medium';
    $nav_size_value = isset( $attributes['navigationSizeValue']['all'] ) ? $attributes['navigationSizeValue']['all'] : '';
    $easing         = isset( $attributes['transitionEasing'] ) ? esc_attr( $attributes['transitionEasing'] ) : 'ease';

    // Navigation position attributes
    $nav_horizontal = isset( $attributes['navHorizontal'] ) ? sanitize_html_class( $attributes['navHorizontal'] ) : 'space-between';
    $nav_vertical   = isset( $attributes['navVertical'] ) ? sanitize_html_class( $attributes['navVertical'] ) : 'center';
    $dots_h         = isset( $attributes['dotsHorizontal'] ) ? sanitize_html_class( $attributes['dotsHorizontal'] ) : 'center';
    $dots_v         = isset( $attributes['dotsVertical'] ) ? sanitize_html_class( $attributes['dotsVertical'] ) : 'bottom';
    $nav_outside    = ! empty( $attributes['navOutside'] );
    $nav_free       = ! empty( $attributes['navFreePosition'] );
    $prev_free_x    = isset( $attributes['prevFreeX'] ) ? absint( $attributes['prevFreeX'] ) : 3;
    $prev_free_y    = isset( $attributes['prevFreeY'] ) ? absint( $attributes['prevFreeY'] ) : 50;
    $next_free_x    = isset( $attributes['nextFreeX'] ) ? absint( $attributes['nextFreeX'] ) : 97;
    $next_free_y    = isset( $attributes['nextFreeY'] ) ? absint( $attributes['nextFreeY'] ) : 50;
    $dots_free_x    = isset( $attributes['dotsFreeX'] ) ? absint( $attributes['dotsFreeX'] ) : 50;
    $dots_free_y    = isset( $attributes['dotsFreeY'] ) ? absint( $attributes['dotsFreeY'] ) : 90;

    // Width handling
    $width_preset = isset( $attributes['widthPreset'] ) ? $attributes['widthPreset'] : 'default';
    $width_style  = '';
    if ( 'custom' === $width_preset ) {
        $custom_width = isset( $attributes['customWidth'] ) ? floatval( $attributes['customWidth'] ) : 0;
        $width_unit   = isset( $attributes['widthUnit'] ) ? esc_attr( $attributes['widthUnit'] ) : 'px';
        if ( $custom_width > 0 ) {
            $width_style = sprintf( 'max-width:%s%s;margin-left:auto;margin-right:auto;', $custom_width, $width_unit );
        }
    }

    // CSS custom properties for theming
    $css_vars = sprintf(
        '--swiper-navigation-color:%s;--swiper-navigation-background-color:%s;--sliderberg-nav-opacity:%s;--swiper-pagination-color:%s;--swiper-pagination-bullet-inactive-color:%s;--swiper-pagination-bullet-inactive-opacity:1;--sliderberg-min-height:%dpx;--sliderberg-easing:%s;',
        $nav_color,
        $nav_bg_color,
        $nav_opacity,
        $dot_active,
        $dot_color,
        $min_height,
        $easing
    );

    // Custom navigation size CSS variable
    if ( ! empty( $nav_size_value ) ) {
        // Convert WP preset format "var:preset|spacing|XX" to CSS var
        if ( 0 === strpos( $nav_size_value, 'var:' ) ) {
            $parts          = explode( '|', $nav_size_value );
            $preset_slug    = end( $parts );
            $nav_size_css   = sprintf( 'var(--wp--preset--spacing--%s)', sanitize_html_class( $preset_slug ) );
        } else {
            $nav_size_css = esc_attr( $nav_size_value );
        }
        $css_vars .= sprintf( '--sliderberg-nav-btn-size:%s;', $nav_size_css );
    }

    // Free position CSS variables (per-element)
    if ( $nav_free ) {
        $css_vars .= sprintf(
            '--sliderberg-prev-free-x:%d%%;--sliderberg-prev-free-y:%d%%;--sliderberg-next-free-x:%d%%;--sliderberg-next-free-y:%d%%;--sliderberg-dots-free-x:%d%%;--sliderberg-dots-free-y:%d%%;',
            $prev_free_x, $prev_free_y,
            $next_free_x, $next_free_y,
            $dots_free_x, $dots_free_y
        );
    }

    $css_vars = apply_filters( 'sliderberg_slider_css_vars', $css_vars, $attributes );

    $inline_style = $css_vars . $width_style;

    // Block wrapper classes
    $size_class    = ! empty( $nav_size_value ) ? 'sliderberg-nav-custom-size' : 'sliderberg-nav-' . $nav_size;
    $extra_classes = 'sliderberg-nav-' . $nav_shape . ' ' . $size_class . ' sliderberg-effect-' . $transition_effect;

    // Vertical direction class
    $direction = isset( $attributes['sliderDirection'] ) ? sanitize_html_class( $attributes['sliderDirection'] ) : 'horizontal';
    if ( 'vertical' === $direction ) {
        $extra_classes .= ' sliderberg-vertical';
    }

    if ( 'vertical' !== $direction ) {
        if ( $nav_free ) {
            $extra_classes .= ' sliderberg-nav-free';
        } else {
            $extra_classes .= ' sliderberg-nav-h-' . $nav_horizontal . ' sliderberg-nav-v-' . $nav_vertical;
            $extra_classes .= ' sliderberg-dots-h-' . $dots_h . ' sliderberg-dots-v-' . $dots_v;
            if ( $nav_outside ) {
                $extra_classes .= ' sliderberg-nav-outside';
            }
        }
    }

    $extra_classes = apply_filters( 'sliderberg_slider_classes', $extra_classes, $attributes );

    $wrapper_attributes = get_block_wrapper_attributes( array(
        'class' => $extra_classes,
        'style' => $inline_style,
    ) );

    // Build Swiper config JSON
    $swiper_config = sliderberg_build_swiper_config( $attributes );
    $swiper_json   = wp_json_encode( $swiper_config );

    // Navigation buttons
    $nav_html = '';
    if ( ! $hide_nav ) {
        $nav_html = '<button class="swiper-button-prev" aria-label="' . esc_attr__( 'Previous slide', 'sliderberg' ) . '"></button>'
                  . '<button class="swiper-button-next" aria-label="' . esc_attr__( 'Next slide', 'sliderberg' ) . '"></button>';
    }

    // Pagination
    $pagination_html = '';
    if ( ! $hide_dots ) {
        $pagination_html = '<div class="swiper-pagination"></div>';
    }

    return sprintf(
        '<div %1$s>'
        . '<div class="sliderberg-swiper-wrap">'
        . '<div class="swiper sliderberg-swiper" data-swiper-data=\'%2$s\'>'
        . '<div class="swiper-wrapper">%3$s</div>'
        . '</div>'
        . '%4$s'
        . '%5$s'
        . '</div>'
        . '</div>',
        $wrapper_attributes,
        esc_attr( $swiper_json ),
        $content,
        $nav_html,
        $pagination_html
    );
}
