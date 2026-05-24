/* global jQuery, ajaxurl */
jQuery( document ).ready( function ( $ ) {
	// Disable buttons that are already active
	$( '.sliderberg-plugin-button[data-status="active"]' ).prop(
		'disabled',
		true
	);

	$( '.sliderberg-plugin-button' ).on( 'click', function ( e ) {
		e.preventDefault();

		// Don't proceed if button is disabled
		if ( $( this ).prop( 'disabled' ) ) {
			return;
		}

		const button = $( this );
		const pluginSlug = button.data( 'plugin' );
		const status = button.data( 'status' );
		const nonce = button.data( 'nonce' );

		// Disable button and show loading state
		button.prop( 'disabled', true );
		const originalText = button.text();
		button.text( 'Processing...' );

		if ( status === 'install' ) {
			// Install plugin
			$.ajax( {
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'sliderberg_install_plugin',
					plugin: pluginSlug,
					_ajax_nonce: nonce,
				},
				success( response ) {
					if ( response.success ) {
						button.data( 'status', 'inactive' );
						button.text( 'Activate' );
					} else {
						button.text( originalText );
						// eslint-disable-next-line no-alert
						window.alert(
							response.data.message ||
								'Installation failed. Please try again.'
						);
					}
				},
				error() {
					button.text( originalText );
					// eslint-disable-next-line no-alert
					window.alert( 'Installation failed. Please try again.' );
				},
				complete() {
					button.prop( 'disabled', false );
				},
			} );
		} else if ( status === 'inactive' ) {
			// Activate plugin
			$.ajax( {
				url: ajaxurl,
				type: 'POST',
				data: {
					action: 'sliderberg_activate_plugin',
					plugin: pluginSlug,
					_ajax_nonce: nonce,
				},
				success( response ) {
					if ( response.success ) {
						button.data( 'status', 'active' );
						button.text( 'Active' );
						button.prop( 'disabled', true );
						// Force a reflow to ensure the styles are applied
						void button[ 0 ].offsetHeight;
						button.addClass( 'active' );
					} else {
						button.text( originalText );
						// eslint-disable-next-line no-alert
						window.alert(
							response.data.message ||
								'Activation failed. Please try again.'
						);
					}
				},
				error() {
					button.text( originalText );
					// eslint-disable-next-line no-alert
					window.alert( 'Activation failed. Please try again.' );
				},
				complete() {
					if ( button.data( 'status' ) !== 'active' ) {
						button.prop( 'disabled', false );
					}
				},
			} );
		}
	} );
} );
