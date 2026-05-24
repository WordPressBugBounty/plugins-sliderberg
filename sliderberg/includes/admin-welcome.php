<?php
/**
 * Enhanced SliderBerg Admin Welcome Page with Improved Security
 * Security improvements while maintaining post/page content integrity
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Security: Define allowed actions to prevent arbitrary action execution
define('SLIDERBERG_ALLOWED_ACTIONS', array(
    'sliderberg_create_post',
    'sliderberg_create_page'
));

/**
 * Add admin menu with proper capability checks
 */
function sliderberg_admin_menu() {
    // Security: Use appropriate capability based on functionality
    // For plugin management functions, require higher privileges
    $admin_capability = 'manage_options'; // For admin functions like plugin installation
    $editor_capability = 'edit_posts';    // For content creation functions
    
    // Only show admin menu to users who can at least edit posts
    if (!current_user_can($editor_capability)) {
        return;
    }
    
    add_menu_page(
        __('SliderBerg', 'sliderberg'),           // Page title
        __('SliderBerg', 'sliderberg'),           // Menu title
        $editor_capability,                        // Capability - allow editors access
        'sliderberg-welcome',                     // Menu slug
        'sliderberg_welcome_page',                // Callback function
        SLIDERBERG_PLUGIN_URL . 'assets/images/logo-icon.svg', // Icon
        30                                        // Position
    );
    
    // Add submenu item for welcome page
    add_submenu_page(
        'sliderberg-welcome',                     // Parent slug
        __('Welcome', 'sliderberg'),              // Page title
        __('Welcome', 'sliderberg'),              // Menu title
        $editor_capability,                       // Capability
        'sliderberg-welcome',                     // Menu slug
        'sliderberg_welcome_page'                 // Callback function
    );
}
add_action('admin_menu', 'sliderberg_admin_menu');

/**
 * Enhanced security function to validate and sanitize action parameters
 */
function sliderberg_validate_action_request($action) {
    // Security: Validate action is in allowed list
    if (!in_array($action, SLIDERBERG_ALLOWED_ACTIONS, true)) {
        return false;
    }
    
    // Security: Verify secure nonce
    if (!isset($_GET['_wpnonce']) || !sliderberg_verify_secure_nonce($_GET['_wpnonce'], $action)) {
        return false;
    }
    
    // Security: Check if user is logged in and not a bot
    if (!is_user_logged_in() || !current_user_can('edit_posts')) {
        return false;
    }
    
    // Security: Additional CSRF protection - check referer
    if (!wp_get_referer() || !wp_validate_redirect(wp_get_referer())) {
        // Allow if coming from admin area
        $referer = wp_get_referer();
        if (!$referer || strpos($referer, admin_url()) !== 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * Enhanced function to handle post creation with additional security
 */
function sliderberg_handle_create_post_action() {
    // Security: Check if this is our action
    if (!isset($_GET['action']) || $_GET['action'] !== 'sliderberg_create_post') {
        return;
    }
    
    // Security: Validate the request
    if (!sliderberg_validate_action_request('sliderberg_create_post')) {
        wp_die(
            __('Security check failed. Please try again.', 'sliderberg'),
            __('Security Error', 'sliderberg'),
            array('response' => 403)
        );
    }
    
    // Security: Double-check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die(
            __('You do not have permission to create posts.', 'sliderberg'),
            __('Permission Error', 'sliderberg'),
            array('response' => 403)
        );
    }

    // IMPORTANT: Keep post content exactly as provided - DO NOT MODIFY
    $post_content = '<!-- wp:sliderberg/sliderberg {"type":"blocks","navigationPlacement":"outside","className":"wp-block-sliderberg-sliderberg alignfull"} -->
<!-- wp:sliderberg/slide {"backgroundType":"color","backgroundColor":"#007cba","className":"wp-block-sliderberg-slide sliderberg-slide sliderberg-content-position-center-center has-007-cba-background-color has-background"} -->
<!-- wp:heading {"textAlign":"center","textColor":"white"} -->
<h2 class="wp-block-heading has-text-align-center has-white-color has-text-color">Welcome to Your First Slide</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white"} -->
<p class="has-text-align-center has-white-color has-text-color">Start customizing your slider by adding content, images, and more slides. Click on this slide to edit its background and content.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"white","textColor":"black","style":{"border":{"radius":"25px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-black-color has-white-background-color has-text-color has-background wp-element-button" style="border-radius:25px">Get Started</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- /wp:sliderberg/slide -->
<!-- /wp:sliderberg/sliderberg -->';

    // Security: Sanitize post title and prepare data
    $post_data = array(
        'post_title'    => sanitize_text_field(__('New Post with SliderBerg', 'sliderberg')),
        'post_content'  => $post_content, // Content kept exactly as provided
        'post_status'   => 'draft',
        'post_type'     => 'post',
        'post_author'   => get_current_user_id(),
        'meta_input'    => array(
            '_sliderberg_created' => current_time('mysql'),
            '_sliderberg_version' => SLIDERBERG_VERSION
        )
    );

    // Security: Use wp_insert_post with error handling
    $post_id = wp_insert_post($post_data, true);

    if (is_wp_error($post_id)) {
        error_log('SliderBerg: Failed to create post - ' . $post_id->get_error_message());
        wp_die(
            __('Failed to create post. Please try again.', 'sliderberg'),
            __('Creation Error', 'sliderberg'),
            array('response' => 500)
        );
    }

    if ($post_id) {
        // Security: Sanitize redirect URL and validate
        $edit_url = admin_url('post.php?post=' . absint($post_id) . '&action=edit');
        $edit_url = wp_validate_redirect($edit_url, admin_url());
        
        // Security: Add success message and redirect
        wp_safe_redirect($edit_url);
        exit;
    } else {
        wp_die(
            __('Failed to create post. Please try again.', 'sliderberg'),
            __('Creation Error', 'sliderberg'),
            array('response' => 500)
        );
    }
}
add_action('admin_init', 'sliderberg_handle_create_post_action');

/**
 * Enhanced function to handle page creation with additional security
 */
function sliderberg_handle_create_page_action() {
    // Security: Check if this is our action
    if (!isset($_GET['action']) || $_GET['action'] !== 'sliderberg_create_page') {
        return;
    }
    
    // Security: Validate the request
    if (!sliderberg_validate_action_request('sliderberg_create_page')) {
        wp_die(
            __('Security check failed. Please try again.', 'sliderberg'),
            __('Security Error', 'sliderberg'),
            array('response' => 403)
        );
    }
    
    // Security: Double-check user permissions
    if (!current_user_can('edit_pages')) {
        wp_die(
            __('You do not have permission to create pages.', 'sliderberg'),
            __('Permission Error', 'sliderberg'),
            array('response' => 403)
        );
    }

    // IMPORTANT: Keep page content exactly as provided - DO NOT MODIFY
    $page_content = '<!-- wp:sliderberg/sliderberg {"type":"blocks","navigationPlacement":"outside","className":"wp-block-sliderberg-sliderberg alignfull"} -->
<!-- wp:sliderberg/slide {"backgroundType":"color","backgroundColor":"#28a745","minHeight":500,"className":"wp-block-sliderberg-slide sliderberg-slide sliderberg-content-position-center-center has-28-a-745-background-color has-background"} -->
<!-- wp:heading {"textAlign":"center","level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-text-align-center has-white-color has-text-color">Welcome to Your Landing Page</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white","fontSize":"large"} -->
<p class="has-text-align-center has-white-color has-text-color has-large-font-size">Create an amazing landing page with this slider. Add compelling content, beautiful images, and call-to-action buttons to engage your visitors.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"white","textColor":"black","style":{"border":{"radius":"30px"},"spacing":{"padding":{"left":"2rem","right":"2rem","top":"0.75rem","bottom":"0.75rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-black-color has-white-background-color has-text-color has-background wp-element-button" style="border-radius:30px;padding-top:0.75rem;padding-right:2rem;padding-bottom:0.75rem;padding-left:2rem">Learn More</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- /wp:sliderberg/slide -->
<!-- /wp:sliderberg/sliderberg -->';

    // Security: Sanitize page title and prepare data
    $page_data = array(
        'post_title'    => sanitize_text_field(__('New Landing Page with SliderBerg', 'sliderberg')),
        'post_content'  => $page_content, // Content kept exactly as provided
        'post_status'   => 'draft',
        'post_type'     => 'page',
        'post_author'   => get_current_user_id(),
        'meta_input'    => array(
            '_sliderberg_created' => current_time('mysql'),
            '_sliderberg_version' => SLIDERBERG_VERSION
        )
    );

    // Security: Use wp_insert_post with error handling
    $page_id = wp_insert_post($page_data, true);

    if (is_wp_error($page_id)) {
        error_log('SliderBerg: Failed to create page - ' . $page_id->get_error_message());
        wp_die(
            __('Failed to create page. Please try again.', 'sliderberg'),
            __('Creation Error', 'sliderberg'),
            array('response' => 500)
        );
    }

    if ($page_id) {
        // Security: Sanitize redirect URL and validate
        $edit_url = admin_url('post.php?post=' . absint($page_id) . '&action=edit');
        $edit_url = wp_validate_redirect($edit_url, admin_url());
        
        // Security: Add success message and redirect
        wp_safe_redirect($edit_url);
        exit;
    } else {
        wp_die(
            __('Failed to create page. Please try again.', 'sliderberg'),
            __('Creation Error', 'sliderberg'),
            array('response' => 500)
        );
    }
}
add_action('admin_init', 'sliderberg_handle_create_page_action');

/**
 * Enhanced admin styles enqueue with security checks
 */
function sliderberg_admin_styles($hook) {
    // Security: Only load on our admin pages
    if (strpos($hook, 'sliderberg-welcome') !== false) {
        // Security: Verify user has access to this page
        if (!current_user_can('edit_posts')) {
            return;
        }
        
        wp_enqueue_style(
            'sliderberg-admin-welcome',
            SLIDERBERG_PLUGIN_URL . 'assets/css/admin-welcome.css',
            array(),
            SLIDERBERG_VERSION
        );

        wp_enqueue_script(
            'sliderberg-admin-welcome',
            SLIDERBERG_PLUGIN_URL . 'assets/js/admin-welcome.js',
            array('jquery'),
            SLIDERBERG_VERSION,
            true
        );
    }
}
add_action('admin_enqueue_scripts', 'sliderberg_admin_styles');

/**
 * Enhanced activation redirect with security checks
 */
function sliderberg_activation_redirect() {
    // Security: Check activation redirect option and user permissions
    if (get_option('sliderberg_activation_redirect', false) && current_user_can('edit_posts')) {
        delete_option('sliderberg_activation_redirect');
        
        // Security: Only redirect for single plugin activation, not bulk
        if (!isset($_GET['activate-multi'])) {
            $redirect_url = admin_url('admin.php?page=sliderberg-welcome');
            wp_safe_redirect($redirect_url);
            exit;
        }
    }
}
add_action('admin_init', 'sliderberg_activation_redirect');

/**
 * Set activation redirect flag on plugin activation
 */
function sliderberg_set_activation_redirect() {
    // Security: Only set flag if user can edit posts
    if (current_user_can('edit_posts')) {
        add_option('sliderberg_activation_redirect', true);
    }
}
// Use the main plugin file for activation hook
register_activation_hook(dirname(__DIR__) . '/sliderberg.php', 'sliderberg_set_activation_redirect');

/**
 * Enhanced welcome page with security improvements
 */
function sliderberg_welcome_page() {
    // Security: Final permission check
    if (!current_user_can('edit_posts')) {
        wp_die(
            __('You do not have permission to access this page.', 'sliderberg'),
            __('Permission Error', 'sliderberg'),
            array('response' => 403)
        );
    }
    
    // Security: Generate secure nonces with enhanced security
    $create_post_nonce = sliderberg_generate_secure_nonce('sliderberg_create_post');
    $create_page_nonce = sliderberg_generate_secure_nonce('sliderberg_create_page');
    
    // Security: Create properly escaped URLs
    $create_post_url = esc_url(admin_url('admin.php?page=sliderberg-welcome&action=sliderberg_create_post&_wpnonce=' . $create_post_nonce));
    $create_page_url = esc_url(admin_url('admin.php?page=sliderberg-welcome&action=sliderberg_create_page&_wpnonce=' . $create_page_nonce));
    ?>
    <div class="sliderberg-welcome-wrap">
        <div class="sliderberg-welcome-header">
            <div class="sliderberg-welcome-header-content">
                <div class="sliderberg-welcome-intro">
                    <h1><?php echo esc_html__('Welcome to SliderBerg!', 'sliderberg'); ?></h1>
                    <p class="sliderberg-welcome-subtitle">
                        <?php echo esc_html__('Create beautiful, responsive sliders with ease using the WordPress block editor.', 'sliderberg'); ?>
                    </p>
                </div>
                <div class="sliderberg-welcome-version">
                    <?php echo esc_html(sprintf(__('Version %s', 'sliderberg'), SLIDERBERG_VERSION)); ?>
                </div>
            </div>
        </div>

        <div class="sliderberg-welcome-content">
            <div class="sliderberg-welcome-main">
                
                

                <!-- Getting Started Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php echo esc_html__('📖 Getting Started Guide', 'sliderberg'); ?></h2>
                        <p><?php echo esc_html__('Follow these simple steps to create your first slider', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-steps-grid">
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">1</div>
                            <div class="sliderberg-step-content">
                                <h3><?php echo esc_html__('Add SliderBerg Block', 'sliderberg'); ?></h3>
                                <p><?php echo esc_html__('In any post or page, click the + button and search for "SliderBerg" to add the block.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo esc_url(SLIDERBERG_PLUGIN_URL); ?>assets/images/screenshots/step-1-add-block.png" alt="<?php echo esc_attr__('Add SliderBerg Block', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">2</div>
                            <div class="sliderberg-step-content">
                                <h3><?php echo esc_html__('Customize Your Slides', 'sliderberg'); ?></h3>
                                <p><?php echo esc_html__('Add content, images, and customize the background. Each slide can contain any WordPress blocks.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo esc_url(SLIDERBERG_PLUGIN_URL); ?>assets/images/screenshots/step-3-customize.png" alt="<?php echo esc_attr__('Customize Slides', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">3</div>
                            <div class="sliderberg-step-content">
                                <h3><?php echo esc_html__('Configure Settings', 'sliderberg'); ?></h3>
                                <p><?php echo esc_html__('Use the block settings panel to customize transitions, autoplay, navigation, and more.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo esc_url(SLIDERBERG_PLUGIN_URL); ?>assets/images/screenshots/step-4-settings.png" alt="<?php echo esc_attr__('Configure Settings', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Start Section -->
                <div class="sliderberg-welcome-section sliderberg-quick-start-section">
                    <div class="sliderberg-section-header">
                        <h2><?php echo esc_html__('🚀 Quick Start', 'sliderberg'); ?></h2>
                        <p><?php echo esc_html__('Get started immediately with pre-configured sliders', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-quick-actions">
                        <div class="sliderberg-quick-action">
                            <div class="sliderberg-quick-action-icon">📝</div>
                            <h3><?php echo esc_html__('Create Post with Slider', 'sliderberg'); ?></h3>
                            <p><?php echo esc_html__('Start a new blog post with a pre-configured SliderBerg block ready to customize.', 'sliderberg'); ?></p>
                            <a href="<?php echo $create_post_url; ?>" class="sliderberg-action-button sliderberg-action-button-primary">
                                <?php echo esc_html__('Create Post with Slider', 'sliderberg'); ?>
                            </a>
                        </div>
                        
                        <div class="sliderberg-quick-action">
                            <div class="sliderberg-quick-action-icon">🏠</div>
                            <h3><?php echo esc_html__('Create Landing Page', 'sliderberg'); ?></h3>
                            <p><?php echo esc_html__('Create a stunning landing page with a hero slider to showcase your content.', 'sliderberg'); ?></p>
                            <a href="<?php echo $create_page_url; ?>" class="sliderberg-action-button sliderberg-action-button-secondary">
                                <?php echo esc_html__('Create Landing Page', 'sliderberg'); ?>
                            </a>
                        </div>
                        
                    </div>
                </div>

                <!-- Features Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php echo esc_html__('✨ Key Features', 'sliderberg'); ?></h2>
                        <p><?php echo esc_html__('Everything you need to create stunning sliders', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-features-grid">
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🎨</div>
                            <h4><?php echo esc_html__('Beautiful Transitions', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Choose from slide, fade, or zoom effects with customizable duration and easing.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">📱</div>
                            <h4><?php echo esc_html__('Mobile Responsive', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Touch-enabled with swipe gestures. Looks perfect on all devices.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">⚡</div>
                            <h4><?php echo esc_html__('Performance Optimized', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Lightweight and fast. Built with modern web standards for smooth performance.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">♿</div>
                            <h4><?php echo esc_html__('Accessibility Ready', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Keyboard navigation, ARIA labels, and screen reader support built-in.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🎯</div>
                            <h4><?php echo esc_html__('Easy to Use', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Intuitive block interface. No coding required. Works with any WordPress theme.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🔧</div>
                            <h4><?php echo esc_html__('Highly Customizable', 'sliderberg'); ?></h4>
                            <p><?php echo esc_html__('Control every aspect: navigation style, autoplay, colors, and positioning.', 'sliderberg'); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Tips Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php echo esc_html__('💡 Pro Tips', 'sliderberg'); ?></h2>
                        <p><?php echo esc_html__('Get the most out of SliderBerg with these helpful tips', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-tips-grid">
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">🖼️</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php echo esc_html__('Image Optimization', 'sliderberg'); ?></h4>
                                <p><?php echo esc_html__('Use optimized images (WebP format when possible) for faster loading times. Recommended size: 1920×1080px.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">⏱️</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php echo esc_html__('Autoplay Best Practices', 'sliderberg'); ?></h4>
                                <p><?php echo esc_html__('Keep autoplay speed between 3-7 seconds. Enable "Pause on Hover" for better user experience.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">📐</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php echo esc_html__('Content Positioning', 'sliderberg'); ?></h4>
                                <p><?php echo esc_html__('Use focal points for background images and experiment with different content positions for visual impact.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">🎯</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php echo esc_html__('Call-to-Action', 'sliderberg'); ?></h4>
                                <p><?php echo esc_html__('Add button blocks to your slides for clear calls-to-action. Use contrasting colors for better visibility.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="sliderberg-welcome-sidebar">
                
                <!-- Quick Links -->
                <div class="sliderberg-sidebar-section">
                    <h3><?php echo esc_html__('Quick Links', 'sliderberg'); ?></h3>
                    <ul class="sliderberg-quick-links">
                        <li><a href="<?php echo esc_url(admin_url('post-new.php?post_type=page')); ?>" class="sliderberg-link"><?php echo esc_html__('Create New Page', 'sliderberg'); ?></a></li>
                        <li><a href="<?php echo esc_url('https://sliderberg.com/docs/'); ?>" target="_blank" rel="noopener noreferrer" class="sliderberg-link"><?php echo esc_html__('Documentation', 'sliderberg'); ?></a></li>
                        <li><a href="<?php echo esc_url('https://wordpress.org/support/plugin/sliderberg/'); ?>" target="_blank" rel="noopener noreferrer" class="sliderberg-link"><?php echo esc_html__('Get Support', 'sliderberg'); ?></a></li>
                        <li><a href="<?php echo esc_url('https://wordpress.org/support/plugin/sliderberg/reviews/'); ?>" target="_blank" rel="noopener noreferrer" class="sliderberg-link"><?php echo esc_html__('Leave us a review', 'sliderberg'); ?></a></li>
                    </ul>
                </div>
                <!-- Support -->
                <div class="sliderberg-sidebar-section">
                    <h3><?php echo esc_html__('Need Help?', 'sliderberg'); ?></h3>
                    <p><?php echo esc_html__('We\'re here to help you succeed with SliderBerg.', 'sliderberg'); ?></p>
                    <a href="<?php echo esc_url('https://wordpress.org/support/plugin/sliderberg/'); ?>" target="_blank" rel="noopener noreferrer" class="sliderberg-support-button">
                        <?php echo esc_html__('Contact Support', 'sliderberg'); ?>
                    </a>
                </div>
                <?php if (current_user_can('install_plugins')) : ?>
                <!-- Other Plugins - Only show to users who can install plugins -->
                <div class="sliderberg-sidebar-section">
                    <h3><?php echo esc_html__('Our Other Plugins', 'sliderberg'); ?></h3>
                    
                    <div class="sliderberg-other-plugins">
                        <?php
                        $plugins = array(
                            'ultimate-blocks' => array(
                                'name' => 'Ultimate Blocks',
                                'slug' => 'ultimate-blocks',
                                'description' => __('Enhance your Gutenberg editor with 25+ powerful blocks.', 'sliderberg')
                            ),
                            'wp-table-builder' => array(
                                'name' => 'WP Table Builder',
                                'slug' => 'wp-table-builder',
                                'description' => __('Create beautiful tables with an intuitive drag & drop interface.', 'sliderberg')
                            ),
                            'tableberg' => array(
                                'name' => 'Tableberg',
                                'slug' => 'tableberg',
                                'description' => __('Create and manage tables directly in the Gutenberg editor.', 'sliderberg')
                            )
                        );

                        foreach ($plugins as $plugin) {
                            $status = 'install';
                            $button_text = __('Install Now', 'sliderberg');
                            
                            if (is_plugin_active($plugin['slug'] . '/' . $plugin['slug'] . '.php')) {
                                $status = 'active';
                                $button_text = __('Active', 'sliderberg');
                            } elseif (file_exists(WP_PLUGIN_DIR . '/' . $plugin['slug'] . '/' . $plugin['slug'] . '.php')) {
                                $status = 'inactive';
                                $button_text = __('Activate', 'sliderberg');
                            }
                            ?>
                            <div class="sliderberg-plugin-card" data-plugin-slug="<?php echo esc_attr($plugin['slug']); ?>">
                                <h4><?php echo esc_html($plugin['name']); ?></h4>
                                <p><?php echo esc_html($plugin['description']); ?></p>
                                <?php if (current_user_can('install_plugins') || (current_user_can('activate_plugins') && $status === 'inactive')) : ?>
                                <button class="sliderberg-plugin-button" 
                                        data-plugin="<?php echo esc_attr($plugin['slug']); ?>"
                                        data-status="<?php echo esc_attr($status); ?>"
                                        data-nonce="<?php echo wp_create_nonce('sliderberg_plugin_action'); ?>"
                                        <?php echo ($status === 'active') ? 'disabled' : ''; ?>>
                                    <?php echo esc_html($button_text); ?>
                                </button>
                                <?php else : ?>
                                <button class="sliderberg-plugin-button" disabled>
                                    <?php echo esc_html__('Insufficient permissions', 'sliderberg'); ?>
                                </button>
                                <?php endif; ?>
                            </div>
                            <?php
                        }
                        ?>
                    </div>
                </div>
                <?php endif; ?>

                

            </div>
        </div>

        <!-- Footer -->
        <div class="sliderberg-welcome-footer">
            <p>
                <?php echo wp_kses(
                    sprintf(
                        __('Made with ❤️ by %s', 'sliderberg'),
                        '<a href="' . esc_url('https://dotcamp.com') . '" target="_blank" rel="noopener noreferrer">DotCamp</a>'
                    ),
                    array(
                        'a' => array(
                            'href' => array(),
                            'target' => array(),
                            'rel' => array()
                        )
                    )
                ); ?>
            </p>
        </div>
    </div>
    <?php
}