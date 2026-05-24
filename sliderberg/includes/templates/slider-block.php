<?php
/**
 * SliderBerg main block template
 * File: templates/slider-block.php
 * 
 * This template expects variables to be set by sliderberg_render_slider_template().
 * All variables have defaults as a safety measure.
 * 
 * @var string $wrapper_attr_string   Escaped wrapper attributes
 * @var string $container_attr_string Escaped container attributes  
 * @var string $navigation_type       Navigation type (split, top, bottom)
 * @var string $navigation_placement  Navigation placement (overlay, outside)
 * @var float  $navigation_opacity    Navigation opacity (0-1)
 * @var string $navigation_shape      Navigation shape (circle, square)
 * @var string $navigation_size       Navigation size (small, medium, large)
 * @var array  $nav_button_styles     Array of button styles
 * @var array  $split_nav_styles      Array of split navigation styles
 * @var int    $navigation_horizontal_pos Horizontal position for split nav
 * @var int    $navigation_vertical_pos   Vertical position for split nav
 * @var bool   $hide_dots             Whether to hide indicator dots
 * @var bool   $hide_navigation       Whether to hide navigation arrows
 * @var string $content               Inner blocks content (sanitized)
 * 
 * @since 1.0.0 Original template
 * @since 2.0.0 Updated with explicit variable documentation
 */

// Security check - prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Defensive defaults for required variables (should be set by caller)
$wrapper_attr_string = $wrapper_attr_string ?? '';
$container_attr_string = $container_attr_string ?? '';
$navigation_type = $navigation_type ?? 'bottom';
$navigation_placement = $navigation_placement ?? 'overlay';
$navigation_opacity = $navigation_opacity ?? 1;
$navigation_shape = $navigation_shape ?? 'circle';
$navigation_size = $navigation_size ?? 'medium';
$nav_button_styles = $nav_button_styles ?? array();
$split_nav_styles = $split_nav_styles ?? array();
$navigation_horizontal_pos = $navigation_horizontal_pos ?? 20;
$navigation_vertical_pos = $navigation_vertical_pos ?? 20;
$hide_dots = $hide_dots ?? false;
$hide_navigation = $hide_navigation ?? false;
$content = $content ?? '';
?>

<div<?php echo $wrapper_attr_string; ?>>
    <?php if ($navigation_type === 'top'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-top" style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="sliderberg-container">
        <div class="sliderberg-slides">
            <div class="sliderberg-slides-container"<?php echo $container_attr_string; ?>>
                <?php echo $content; ?>
            </div>
            
            <?php if ($navigation_type === 'split'): ?>
                <?php if ($navigation_placement === 'overlay'): ?>
                    <!-- Direct positioning mode: render buttons without overlay container to avoid blocking slide content -->
                    <?php if (!$hide_navigation): ?>
                        <?php 
                        // Defensive bounds checking for position values (security layer)
                        $safe_horizontal_pos = isset($navigation_horizontal_pos) ? max(0, min(200, intval($navigation_horizontal_pos))) : 20;
                        $safe_vertical_pos = isset($navigation_vertical_pos) ? max(-200, min(200, intval($navigation_vertical_pos))) : 20;
                        
                        // Use direct positioning with CSS custom properties (like React editor fix)
                        $prev_direct_styles = array_merge($nav_button_styles, [
                            '--sliderberg-nav-horizontal-position' => $safe_horizontal_pos . 'px',
                            '--sliderberg-nav-vertical-position' => $safe_vertical_pos . 'px'
                        ]);
                        echo render_nav_button('prev', $prev_direct_styles, $navigation_shape, $navigation_size, 'sliderberg-frontend-direct');
                        
                        $next_direct_styles = array_merge($nav_button_styles, [
                            '--sliderberg-nav-horizontal-position' => $safe_horizontal_pos . 'px',
                            '--sliderberg-nav-vertical-position' => $safe_vertical_pos . 'px'
                        ]);
                        echo render_nav_button('next', $next_direct_styles, $navigation_shape, $navigation_size, 'sliderberg-frontend-direct');
                        ?>
                    <?php endif; ?>
                    <?php echo render_slide_indicators($hide_dots); ?>
                <?php else: ?>
                    <!-- Standard overlay container mode (for non-overlay placement) -->
                    <div class="sliderberg-navigation" 
                         data-type="<?php echo esc_attr($navigation_type); ?>"
                         data-placement="<?php echo esc_attr($navigation_placement); ?>"
                         style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
                        <div class="sliderberg-nav-controls">
                            <?php if (!$hide_navigation): ?>
                                <?php 
                                $prev_styles = array_merge($nav_button_styles, $split_nav_styles, [
                                    'left' => intval($navigation_horizontal_pos) . 'px'
                                ]);
                                echo render_nav_button('prev', $prev_styles, $navigation_shape, $navigation_size);
                                
                                $next_styles = array_merge($nav_button_styles, $split_nav_styles, [
                                    'right' => intval($navigation_horizontal_pos) . 'px'
                                ]);
                                echo render_nav_button('next', $next_styles, $navigation_shape, $navigation_size);
                                ?>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php echo render_slide_indicators($hide_dots); ?>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
    
    <?php if ($navigation_type === 'bottom'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-bottom" style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</div>
