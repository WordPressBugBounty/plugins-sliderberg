/**
 * Frontend constants
 */

export const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
} as const;

/**
 * Timing constants
 */
export const TIMING = {
    /** Debounce delay for resize events (ms) */
    RESIZE_DEBOUNCE_MS: 150,
    /** Initial slide delay after initialization (ms) */
    INIT_DELAY_MS: 50,
} as const;
