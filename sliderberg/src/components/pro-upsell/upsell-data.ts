import { __ } from "@wordpress/i18n";

export interface ProFeature {
  name: string;
  title: string;
  description: string;
}

/**
 * Promo configuration — set these once to show a promo banner in every upsell modal.
 * Leave code/text empty to hide the promo.
 */
export const PROMO_CONFIG = {
  code: "SB20",
  text: "Use code to get 20% off:",
};

export const PRO_FEATURES: ProFeature[] = [
  {
    name: "coverflow-effect",
    title: __("Coverflow Effect", "sliderberg"),
    description: __(
      "Create stunning 3D coverflow transitions that add depth and visual interest to your sliders.",
      "sliderberg",
    ),
  },
  {
    name: "flip-effect",
    title: __("Flip Effect", "sliderberg"),
    description: __(
      "Dramatic flip transitions that reveal each slide with a card-flip animation.",
      "sliderberg",
    ),
  },
  {
    name: "cube-effect",
    title: __("Cube Effect", "sliderberg"),
    description: __(
      "Transform your slider into a rotating 3D cube for a unique browsing experience.",
      "sliderberg",
    ),
  },
  {
    name: "parallax-effect",
    title: __("Parallax Effect", "sliderberg"),
    description: __(
      "Add depth with parallax scrolling effects that bring your slides to life.",
      "sliderberg",
    ),
  },
  {
    name: "fraction-pagination",
    title: __("Fraction Pagination", "sliderberg"),
    description: __(
      "Show slide numbers (e.g. 3/10) for navigation — perfect for storytelling and portfolios.",
      "sliderberg",
    ),
  },
  {
    name: "progress-pagination",
    title: __("Progress Bar Pagination", "sliderberg"),
    description: __(
      "Display a dynamic progress bar showing visitors their progress through your slides.",
      "sliderberg",
    ),
  },
  {
    name: "vertical-slider",
    title: __("Vertical Slider", "sliderberg"),
    description: __(
      "Scroll through slides vertically for a modern scroll-based presentation experience.",
      "sliderberg",
    ),
  },
];

export function getFeatureInfo(featureKey: string): ProFeature | undefined {
  return PRO_FEATURES.find((f) => f.name === featureKey);
}

// ---------------------------------------------------------------------------
// Image support
// ---------------------------------------------------------------------------
// Drop an image or GIF into packages/sliderberg/assets/images/upsell/ named
// after the feature key (e.g. cube-effect.gif, coverflow-effect.png).
// PHP scans that directory and passes URLs via wp_localize_script — no
// webpack rebuild needed, just reload the editor after adding a file.
// ---------------------------------------------------------------------------

export function getFeatureImage( featureKey: string ): string | undefined {
	return window.sliderbergData?.upsellImages?.[ featureKey ];
}
