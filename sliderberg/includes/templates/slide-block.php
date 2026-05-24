<?php
/**
 * Slide block template - CSS Grid layout
 * File: includes/templates/slide-block.php
 *
 * Clean DOM structure that works with CSS Grid positioning.
 * Variables are set by render_sliderberg_slide_block() in slide-renderer.php.
 *
 * @var string $class_string    Escaped CSS classes (includes content position)
 * @var string $style_string    Escaped inline styles (backgrounds, borders, etc.)
 * @var bool   $has_overlay     Whether overlay should be rendered
 * @var string $overlay_color   Sanitized overlay color
 * @var float  $overlay_opacity Overlay opacity (0-1)
 * @var string $content         Inner blocks content (sanitized via wp_kses)
 *
 * @since 1.0.0 Original template
 * @since 2.0.0 Updated for Grid layout support
 * @since 2.1.0 Added explicit variable documentation
 */

// Security check - prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Defensive defaults for required variables (should be set by caller)
$class_string = $class_string ?? 'sliderberg-slide';
$style_string = $style_string ?? '';
$has_overlay = $has_overlay ?? false;
$overlay_color = $overlay_color ?? '#000000';
$overlay_opacity = $overlay_opacity ?? 0;
$content = $content ?? '';
?>

<div class="<?php echo $class_string; ?>" style="<?php echo $style_string; ?>">
    <?php if ($has_overlay): ?>
        <div class="sliderberg-overlay" 
             style="background-color: <?php echo esc_attr($overlay_color); ?>; opacity: <?php echo esc_attr($overlay_opacity); ?>;"></div>
    <?php endif; ?>
    
    <div class="sliderberg-slide-content">
        <div class="sliderberg-slide-inner">
            <?php echo $content; ?>
        </div>
    </div>
</div>
