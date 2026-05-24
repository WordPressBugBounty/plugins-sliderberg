import React, { Component, ErrorInfo, ReactNode } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for SliderBerg blocks
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor( props: ErrorBoundaryProps ) {
		super( props );
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(
		error: Error
	): Partial< ErrorBoundaryState > {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch( error: Error, errorInfo: ErrorInfo ): void {
		// Log error details for debugging
		this.setState( {
			error,
			errorInfo,
		} );

		// Log to console in development
		if ( process.env.NODE_ENV === 'development' ) {
			// eslint-disable-next-line no-console
			console.error(
				'SliderBerg Error Boundary caught an error:',
				error,
				errorInfo
			);
		}
	}

	handleReset = (): void => {
		this.setState( {
			hasError: false,
			error: null,
			errorInfo: null,
		} );
	};

	render(): ReactNode {
		if ( this.state.hasError ) {
			// Custom fallback UI provided
			if ( this.props.fallback ) {
				return this.props.fallback;
			}

			// Default fallback UI
			return (
				<div className="sliderberg-error-boundary">
					<div className="sliderberg-error-content">
						<h3>{ __( 'Something went wrong', 'sliderberg' ) }</h3>
						<p>
							{ __(
								'An error occurred while rendering this slider block.',
								'sliderberg'
							) }
						</p>
						{ process.env.NODE_ENV === 'development' &&
							this.state.error && (
								<details style={ { marginTop: '1rem' } }>
									<summary>
										{ __( 'Error Details', 'sliderberg' ) }
									</summary>
									<pre
										style={ {
											padding: '1rem',
											background: '#f5f5f5',
											overflow: 'auto',
											fontSize: '12px',
										} }
									>
										{ this.state.error.toString() }
										{ '\n\n' }
										{ this.state.errorInfo?.componentStack }
									</pre>
								</details>
							) }
						<div style={ { marginTop: '1rem' } }>
							<Button
								variant="primary"
								onClick={ this.handleReset }
							>
								{ __( 'Try Again', 'sliderberg' ) }
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
