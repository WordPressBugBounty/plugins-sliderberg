/**
 * Slider block registration.
 */

import { registerBlockType, registerBlockVariation } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";

import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";
import { carouselIcon, sliderbergIcon } from "./icons";

import "./style.scss";

// v1 attribute shape, before `mode` replaced the boolean `isCarouselMode`.
// Kept only so existing saved sliders migrate cleanly — see `migrate()` below.
const { mode: _mode, ...legacyAttributes } = (metadata as any).attributes;
const deprecatedAttributes = {
  ...legacyAttributes,
  isCarouselMode: { type: "boolean", default: false },
};

registerBlockType(metadata.name, {
  ...(metadata as any),
  icon: sliderbergIcon,
  edit: Edit,
  save: Save,
  deprecated: [
    {
      attributes: deprecatedAttributes,
      save: Save,
      // Only migrate content saved before `mode` existed — never a block
      // that's already been through this schema (mode present) or a brand
      // new, never-picked chooser block (neither attribute present).
      isEligible: (attributes: Record<string, any>) =>
        attributes.mode === undefined && attributes.isCarouselMode !== undefined,
      migrate(attributes: Record<string, any>) {
        const { isCarouselMode, ...rest } = attributes;
        return {
          ...rest,
          mode: isCarouselMode ? "carousel" : "slider",
        };
      },
    },
  ],
});

registerBlockVariation("sliderberg/sliderberg", {
  name: "slider",
  title: __("Slider", "sliderberg"),
  description: __(
    "Display slides one at a time, with blocks added to each slide.",
    "sliderberg",
  ),
  icon: "format-image",
  attributes: { mode: "slider" },
  isActive: ["mode"],
  scope: ["inserter", "transform"],
});

registerBlockVariation("sliderberg/sliderberg", {
  name: "carousel",
  title: __("Carousel", "sliderberg"),
  description: __(
    "Display several slides at once in a scrollable row.",
    "sliderberg",
  ),
  icon: carouselIcon,
  // Carousel shows multiple slides at once, so arrows overlaying the slides
  // read better placed outside by default (Slider keeps the overlay default).
  attributes: { mode: "carousel", navOutside: true },
  isActive: ["mode"],
  scope: ["inserter", "transform"],
});
