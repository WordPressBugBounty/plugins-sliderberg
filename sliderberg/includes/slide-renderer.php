<?php
/**
 * Slide block server-side renderer.
 * Outputs a swiper-slide div with background, overlay, and content.
 *
 * @package Sliderberg
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Register the slide block with PHP rendering.
 */
function sliderberg_register_slide_block() {
    register_block_type_from_metadata(
        SLIDERBERG_PLUGIN_DIR . 'build/blocks/slide',
        array(
            'render_callback' => 'render_sliderberg_slide_block',
        )
    );
}

/**
 * Render the slide block on the frontend.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Inner block content.
 * @param WP_Block $block      Block instance.
 * @return string HTML output.
 */
function render_sliderberg_slide_block( $attributes, $content, $block ) {
    // The slider minimum height is the floor for every slide. A slide-specific
    // value can make the slide taller, but cannot make it shorter than the
    // parent slider and expose empty space below it.
    $parent_min_height = isset( $block->context['sliderberg/minHeight'] ) ? absint( $block->context['sliderberg/minHeight'] ) : 400;
    $slide_min_height  = isset( $attributes['minHeight'] ) ? absint( $attributes['minHeight'] ) : 400;
    $effective_height  = ( $slide_min_height !== 400 ) ? max( $slide_min_height, $parent_min_height ) : $parent_min_height;
    $transition_effect = isset( $block->context['sliderberg/transitionEffect'] ) ? $block->context['sliderberg/transitionEffect'] : 'slide';
    $is_parallax       = 'parallax' === $transition_effect;

    // Background — infer type from values so backgroundType doesn't need to be kept in sync
    $bg_styles = array();

    if ( ! empty( $attributes['backgroundImage']['url'] ) ) {
        $bg_url  = esc_url( $attributes['backgroundImage']['url'] );
        $focal_x = isset( $attributes['focalPoint']['x'] ) ? floatval( $attributes['focalPoint']['x'] ) * 100 : 50;
        $focal_y = isset( $attributes['focalPoint']['y'] ) ? floatval( $attributes['focalPoint']['y'] ) * 100 : 50;
        $is_fixed = ! empty( $attributes['isFixed'] );

        $bg_styles[] = sprintf( 'background-image:url(%s)', $bg_url );
        $bg_styles[] = 'background-size:cover';
        $bg_styles[] = sprintf( 'background-position:%s%% %s%%', $focal_x, $focal_y );
        $bg_styles[] = 'background-repeat:no-repeat';
        $bg_styles[] = sprintf( 'background-attachment:%s', $is_fixed ? 'fixed' : 'scroll' );
    } elseif ( ! empty( $attributes['backgroundGradient'] ) ) {
        $bg_styles[] = sprintf( 'background-image:%s', esc_attr( $attributes['backgroundGradient'] ) );
    } elseif ( ! empty( $attributes['backgroundColor'] ) ) {
        $bg_styles[] = sprintf( 'background-color:%s', esc_attr( $attributes['backgroundColor'] ) );
    }

    // Border (new per-side format)
    $border = isset( $attributes['border'] ) ? $attributes['border'] : array();
    $border_styles = array();
    if ( is_array( $border ) && ! empty( $border ) ) {
        $sides = array( 'top', 'right', 'bottom', 'left' );
        foreach ( $sides as $side ) {
            if ( ! empty( $border[ $side ] ) ) {
                $b = $border[ $side ];
                $width = isset( $b['width'] ) ? esc_attr( $b['width'] ) : '0px';
                $style = isset( $b['style'] ) ? esc_attr( $b['style'] ) : 'solid';
                $color = isset( $b['color'] ) ? esc_attr( $b['color'] ) : 'transparent';
                $border_styles[] = sprintf( 'border-%s:%s %s %s', $side, $width, $style, $color );
            }
        }
    }

    // Border radius (new per-corner format)
    $border_radius = isset( $attributes['slideBorderRadius'] ) ? $attributes['slideBorderRadius'] : array();
    $radius_styles = array();
    if ( is_array( $border_radius ) && ! empty( $border_radius ) ) {
        $corners = array(
            'topLeft'     => 'border-top-left-radius',
            'topRight'    => 'border-top-right-radius',
            'bottomLeft'  => 'border-bottom-left-radius',
            'bottomRight' => 'border-bottom-right-radius',
        );
        foreach ( $corners as $key => $prop ) {
            if ( ! empty( $border_radius[ $key ] ) ) {
                $radius_styles[] = sprintf( '%s:%s', $prop, esc_attr( $border_radius[ $key ] ) );
            }
        }
    }

    // Content position
    $position = isset( $attributes['contentPosition'] ) ? $attributes['contentPosition'] : 'center-center';
    $valid_positions = array(
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right',
    );
    if ( ! in_array( $position, $valid_positions, true ) ) {
        $position = 'center-center';
    }

    $parts          = explode( '-', $position );
    $vertical       = isset( $parts[0] ) ? $parts[0] : 'center';
    $horizontal     = isset( $parts[1] ) ? $parts[1] : 'center';
    $align_items    = 'center' === $vertical ? 'center' : ( 'top' === $vertical ? 'flex-start' : 'flex-end' );
    $justify_content = 'center' === $horizontal ? 'center' : ( 'left' === $horizontal ? 'flex-start' : 'flex-end' );

    // Combine all slide styles
    $base_slide_styles = array_merge(
        $border_styles,
        $radius_styles,
        array( sprintf( 'min-height:%dpx', $effective_height ) )
    );

    if ( $is_parallax ) {
        $slide_style_str = implode( ';', $base_slide_styles );
    } else {
        $slide_style_str = implode( ';', array_merge( $bg_styles, $base_slide_styles ) );
    }

    // Content styles
    $content_style = sprintf(
        'display:flex;flex-direction:column;align-items:%s;justify-content:%s;min-height:%dpx;padding:20px;width:100%%;box-sizing:border-box;',
        $align_items,
        $justify_content,
        $effective_height
    );

    // Overlay
    $overlay_html  = '';
    $overlay_color = isset( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : '';
    $has_image     = ! empty( $attributes['backgroundImage']['url'] );
    if ( ! empty( $overlay_color ) && $has_image ) {
        $overlay_opacity = isset( $attributes['overlayOpacity'] ) ? floatval( $attributes['overlayOpacity'] ) : 1;
        if ( $overlay_opacity <= 0 ) {
            $overlay_opacity = 1;
        }
        $overlay_html = sprintf(
            '<div class="sliderberg-slide-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:%s;opacity:%s;pointer-events:none;z-index:1;"></div>',
            esc_attr( $overlay_color ),
            $overlay_opacity
        );
    }

    $background_html = '';
    if ( $is_parallax && ! empty( $bg_styles ) ) {
        $background_html = sprintf(
            '<div class="sliderberg-slide-background" style="%1$s;position:absolute;top:0;left:0;right:0;bottom:0;" data-swiper-parallax="-20%%"></div>',
            esc_attr( implode( ';', $bg_styles ) )
        );
    }

    // Slide link
    $slide_link         = isset( $attributes['slideLink'] ) ? esc_url( $attributes['slideLink'] ) : '';
    $slide_link_new_tab = ! empty( $attributes['slideLinkNewTab'] );
    $slide_link_attrs   = '';
    $slide_link_style   = '';
    if ( ! empty( $slide_link ) ) {
        $slide_link_attrs = sprintf(
            ' data-slide-link="%s" data-slide-link-target="%s"',
            $slide_link,
            $slide_link_new_tab ? '_blank' : '_self'
        );
        $slide_link_style = 'cursor:pointer;';
    }

    // Build slide classes
    $slide_classes = 'swiper-slide sliderberg-slide';
    $slide_classes = apply_filters( 'sliderberg_slide_classes', $slide_classes, $attributes );

    $content_parallax_attr = $is_parallax ? ' data-swiper-parallax="-100"' : '';

    return sprintf(
        '<div class="%1$s" style="%2$s;position:relative;overflow:hidden;%8$s"%9$s>%3$s%4$s<div class="sliderberg-slide-content" style="%5$s;position:relative;z-index:2;"%6$s>%7$s</div></div>',
        esc_attr( $slide_classes ),
        esc_attr( $slide_style_str ),
        $background_html,
        $overlay_html,
        esc_attr( $content_style ),
        $content_parallax_attr,
        $content,
        esc_attr( $slide_link_style ),
        $slide_link_attrs
    );
}
