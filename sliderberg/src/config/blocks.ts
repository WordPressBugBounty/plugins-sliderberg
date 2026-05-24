/**
 * Configuration for Sliderberg blocks
 */

export const PRO_BLOCKS = {
    POSTS_SLIDER: 'sliderberg-pro/posts-slider',
    WOO_PRODUCTS: 'sliderberg-pro/woo-products',
} as const;

export const ALLOWED_PRO_BLOCK_NAMES = Object.values(PRO_BLOCKS);

export const isProBlock = (blockName: string): boolean => {
    return ALLOWED_PRO_BLOCK_NAMES.includes(
        blockName as (typeof ALLOWED_PRO_BLOCK_NAMES)[number]
    );
};
