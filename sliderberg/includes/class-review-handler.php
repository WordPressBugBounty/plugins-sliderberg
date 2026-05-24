<?php
/**
 * Review Handler Class
 *
 * @package SliderBerg
 */

namespace SliderBerg;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Review Handler Class
 */
class Review_Handler {

	/**
	 * Initialize the review handler
	 */
	public function __construct() {
		add_action( 'wp_ajax_sliderberg_dismiss_review', array( $this, 'handle_dismiss_review' ) );
		add_action( 'wp_ajax_sliderberg_track_review_click', array( $this, 'handle_track_review_click' ) );
	}

	/**
	 * Handle review dismissal
	 */
	public function handle_dismiss_review() {
		// Verify nonce
		if ( ! check_ajax_referer( 'sliderberg_nonce', 'nonce', false ) ) {
			wp_send_json_error( 'Invalid nonce' );
		}

		// Check user permissions
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( 'Insufficient permissions' );
		}

		$permanent = isset( $_POST['permanent'] ) && $_POST['permanent'] === 'true';

		if ( $permanent ) {
			update_user_meta( get_current_user_id(), 'sliderberg_review_dismissed_permanently', true );
		} else {
			update_user_meta( get_current_user_id(), 'sliderberg_review_dismissed_until', time() + ( 30 * DAY_IN_SECONDS ) );
		}

		wp_send_json_success();
	}

	/**
	 * Track when user clicks the review button
	 */
	public function handle_track_review_click() {
		// Verify nonce
		if ( ! check_ajax_referer( 'sliderberg_nonce', 'nonce', false ) ) {
			wp_send_json_error( 'Invalid nonce' );
		}

		// Check user permissions
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( 'Insufficient permissions' );
		}

		// Mark as permanently dismissed since they clicked review
		update_user_meta( get_current_user_id(), 'sliderberg_review_dismissed_permanently', true );
		update_user_meta( get_current_user_id(), 'sliderberg_review_clicked', true );

		wp_send_json_success();
	}

	/**
	 * Check if review should be shown for current user
	 *
	 * @return bool
	 */
	public static function should_show_review() {
		// Don't show if permanently dismissed
		if ( get_user_meta( get_current_user_id(), 'sliderberg_review_dismissed_permanently', true ) ) {
			return false;
		}

		// Check temporary dismissal
		$dismissed_until = get_user_meta( get_current_user_id(), 'sliderberg_review_dismissed_until', true );
		if ( $dismissed_until && $dismissed_until > time() ) {
			return false;
		}

		return true;
	}
}