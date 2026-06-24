<?php
/**
 * Security helpers for Sliderberg.
 *
 * @package Sliderberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generate a nonce for the given action.
 *
 * Thin wrapper around wp_create_nonce() so callers don't depend directly on
 * the WP function name and the implementation can be swapped later.
 *
 * @param string $action Action name.
 * @return string Nonce value.
 */
function sliderberg_generate_secure_nonce( $action ) {
	return wp_create_nonce( $action );
}

/**
 * Verify a nonce for the given action.
 *
 * @param string $nonce  Nonce value to verify.
 * @param string $action Action name.
 * @return bool True if valid, false otherwise.
 */
function sliderberg_verify_secure_nonce( $nonce, $action ) {
	return (bool) wp_verify_nonce( $nonce, $action );
}
