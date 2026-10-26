/**
 * Padding with Desktop / Tablet / Mobile tabs, shown in the block's Styles →
 * Dimensions panel. Sides left empty on tablet/mobile inherit the next
 * larger device; the breakpoints match the carousel's responsive settings.
 */

import { __ } from "@wordpress/i18n";
import {
  InspectorControls,
  useBlockEditContext,
} from "@wordpress/block-editor";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";
import {
  SpacingControlWithToolsPanel,
  TabsPanelControl,
} from "@sliderberg/shared";

interface ResponsivePaddingControlProps {
  label: string;
  /** Attribute names holding each device's { top, right, bottom, left }. */
  attrKeys: { desktop: string; tablet: string; mobile: string };
  attributes: Record<string, any>;
  setAttributes: (attrs: Record<string, any>) => void;
  desktopHelp: string;
}

const hasSides = (value: unknown) =>
  !!value &&
  typeof value === "object" &&
  Object.values(value as Record<string, unknown>).some(Boolean);

export default function ResponsivePaddingControl({
  label,
  attrKeys,
  attributes,
  setAttributes,
  desktopHelp,
}: ResponsivePaddingControlProps) {
  const { clientId } = useBlockEditContext();
  const keys = [attrKeys.desktop, attrKeys.tablet, attrKeys.mobile];
  const cleared = Object.fromEntries(keys.map((key) => [key, undefined]));

  const tab = (name: string, title: string, attrKey: string, help: string) => ({
    name,
    title,
    component: (
      <div style={{ marginTop: "16px" }}>
        <SpacingControlWithToolsPanel label={label} attrKey={attrKey} />
        <p
          className="components-base-control__help"
          style={{ marginTop: "8px", marginBottom: 0 }}
        >
          {help}
        </p>
      </div>
    ),
  });

  const tabs = [
    tab("desktop", __("Desktop", "sliderberg"), attrKeys.desktop, desktopHelp),
    tab(
      "tablet",
      __("Tablet", "sliderberg"),
      attrKeys.tablet,
      __(
        "Screens 768px - 1023px. Empty sides use the Desktop value.",
        "sliderberg",
      ),
    ),
    tab(
      "mobile",
      __("Mobile", "sliderberg"),
      attrKeys.mobile,
      __(
        "Screens below 768px. Empty sides use the Tablet value.",
        "sliderberg",
      ),
    ),
  ];

  return (
    <InspectorControls group="dimensions">
      <ToolsPanelItem
        panelId={clientId}
        label={label}
        isShownByDefault
        hasValue={() => keys.some((key) => hasSides(attributes[key]))}
        onDeselect={() => setAttributes(cleared)}
        resetAllFilter={(attrs: Record<string, any>) => ({
          ...attrs,
          ...cleared,
        })}
        className="sliderberg-responsive-settings"
        style={{ gridColumn: "1 / -1" }}
      >
        <TabsPanelControl tabs={tabs} />
      </ToolsPanelItem>
    </InspectorControls>
  );
}
