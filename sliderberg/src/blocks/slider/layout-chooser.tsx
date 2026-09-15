/**
 * "Pick a layout to get started" chooser shown before a mode (Slider or
 * Carousel) has been picked. Picking a layout just sets the `mode`
 * attribute on this same block instance — nothing is nested or replaced.
 */

import { Button, Icon, Placeholder } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

import { carouselIcon, sliderbergIcon } from "./icons";

interface LayoutChooserProps {
  onSelect: (mode: "slider" | "carousel") => void;
}

export default function LayoutChooser({ onSelect }: LayoutChooserProps) {
  return (
    <Placeholder
      icon={sliderbergIcon}
      label={__("Sliderberg", "sliderberg")}
      instructions={__("Pick a layout to get started.", "sliderberg")}
    >
      <div className="sliderberg-layout-chooser">
        <Button
          __next40pxDefaultSize
          variant="tertiary"
          className="sliderberg-layout-chooser__option"
          onClick={() => onSelect("slider")}
        >
          <Icon icon="format-image" size={32} />
          <span className="sliderberg-layout-chooser__title">
            {__("Slider", "sliderberg")}
          </span>
          <span className="sliderberg-layout-chooser__description">
            {__("One slide at a time", "sliderberg")}
          </span>
        </Button>
        <Button
          __next40pxDefaultSize
          variant="tertiary"
          className="sliderberg-layout-chooser__option"
          onClick={() => onSelect("carousel")}
        >
          <Icon icon={carouselIcon} size={32} />
          <span className="sliderberg-layout-chooser__title">
            {__("Carousel", "sliderberg")}
          </span>
          <span className="sliderberg-layout-chooser__description">
            {__("Several slides at once", "sliderberg")}
          </span>
        </Button>
      </div>
      <p className="sliderberg-layout-chooser__hint">
        {__("You can switch between the two later.", "sliderberg")}
      </p>
    </Placeholder>
  );
}
