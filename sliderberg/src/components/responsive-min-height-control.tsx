/**
 * Minimum height with Desktop / Tablet / Mobile tabs. Tablet and mobile are
 * optional and inherit the next larger device's value until set; the
 * breakpoints match the carousel's responsive settings.
 */

import { __ } from "@wordpress/i18n";
import { RangeControl } from "@wordpress/components";
import { TabsPanelControl } from "@sliderberg/shared";

export type Device = "desktop" | "tablet" | "mobile";

interface ResponsiveMinHeightControlProps {
  desktop: number;
  tablet?: number;
  mobile?: number;
  /** Value the Desktop control resets to. */
  desktopDefault: number;
  desktopHelp: string;
  onChange: (device: Device, value: number | undefined) => void;
}

export default function ResponsiveMinHeightControl({
  desktop,
  tablet,
  mobile,
  desktopDefault,
  desktopHelp,
  onChange,
}: ResponsiveMinHeightControlProps) {
  const rangeProps = {
    __next40pxDefaultSize: true,
    __nextHasNoMarginBottom: true,
    label: __("Minimum Height", "sliderberg"),
    min: 100,
    max: 1000,
    step: 10,
  };

  const tabs = [
    {
      name: "desktop",
      title: __("Desktop", "sliderberg"),
      component: (
        <div style={{ marginTop: "20px" }}>
          <RangeControl
            {...rangeProps}
            help={desktopHelp}
            value={desktop}
            allowReset
            resetFallbackValue={desktopDefault}
            onChange={(value) => onChange("desktop", value ?? desktopDefault)}
          />
        </div>
      ),
    },
    {
      name: "tablet",
      title: __("Tablet", "sliderberg"),
      component: (
        <div style={{ marginTop: "20px" }}>
          <RangeControl
            {...rangeProps}
            help={__(
              "Screens 768px - 1023px. Reset to use the Desktop value.",
              "sliderberg",
            )}
            value={tablet}
            initialPosition={desktop}
            allowReset
            onChange={(value) => onChange("tablet", value)}
          />
        </div>
      ),
    },
    {
      name: "mobile",
      title: __("Mobile", "sliderberg"),
      component: (
        <div style={{ marginTop: "20px" }}>
          <RangeControl
            {...rangeProps}
            help={__(
              "Screens below 768px. Reset to use the Tablet value.",
              "sliderberg",
            )}
            value={mobile}
            initialPosition={tablet ?? desktop}
            allowReset
            onChange={(value) => onChange("mobile", value)}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      className="sliderberg-responsive-settings"
      style={{ gridColumn: "1 / -1", marginBottom: "16px" }}
    >
      <TabsPanelControl tabs={tabs} />
    </div>
  );
}
