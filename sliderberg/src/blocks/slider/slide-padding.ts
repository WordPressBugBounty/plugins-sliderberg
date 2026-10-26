/**
 * Slide padding helpers shared by the slider and slide blocks' editors.
 * Mirrors sliderberg_get_slide_padding_vars() / sliderberg_get_own_padding_vars()
 * in includes/. slider/style.scss turns the per-device variables these
 * produce into the actual padding.
 */

export type PaddingSides = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

export type ResponsivePadding = {
  desktop?: PaddingSides;
  tablet?: PaddingSides;
  mobile?: PaddingSides;
};

const SIDES = ["top", "right", "bottom", "left"] as const;
const DEVICES = ["desktop", "tablet", "mobile"] as const;

/** Padding every slide's content had before it was configurable. */
export const DEFAULT_SLIDE_PADDING = "20px";

/** Convert a WP spacing value ("var:preset|spacing|50" or "24px") to CSS. */
export function spacingValueToCSS(value: string): string {
  if (value.startsWith("var:")) {
    return `var(--wp--preset--spacing--${value.split("|").pop()})`;
  }
  return value;
}

/**
 * Resolve per-device padding so a side left empty on tablet/mobile inherits
 * the next larger device. Sides that end up empty everywhere stay unset.
 */
function resolveDevices(padding: ResponsivePadding) {
  const resolved = {} as Record<(typeof DEVICES)[number], PaddingSides>;
  let previous: PaddingSides = {};
  DEVICES.forEach((device) => {
    const current: PaddingSides = { ...previous };
    SIDES.forEach((side) => {
      const value = padding[device]?.[side];
      if (value) {
        current[side] = spacingValueToCSS(value);
      }
    });
    resolved[device] = current;
    previous = current;
  });
  return resolved;
}

/**
 * The slider's padding for all its slides, as one CSS variable per side and
 * device. Unset sides use the 20px default. All twelve are always output so a
 * nested slider never inherits its parent slider's values.
 */
export function getSlidePaddingVars(
  padding: ResponsivePadding,
): Record<string, string> {
  const resolved = resolveDevices(padding);
  const vars: Record<string, string> = {};
  DEVICES.forEach((device) =>
    SIDES.forEach((side) => {
      vars[`--sliderberg-slide-padding-${side}-${device}`] =
        resolved[device][side] ?? DEFAULT_SLIDE_PADDING;
    }),
  );
  return vars;
}

/**
 * A single slide's own padding, overriding the slider's per side and device.
 * Only sides the slide actually sets are output; the rest fall back to the
 * slider's value in style.scss.
 */
export function getOwnPaddingVars(
  padding: ResponsivePadding,
): Record<string, string> {
  const resolved = resolveDevices(padding);
  const vars: Record<string, string> = {};
  DEVICES.forEach((device) =>
    SIDES.forEach((side) => {
      const value = resolved[device][side];
      if (value) {
        vars[`--sliderberg-own-padding-${side}-${device}`] = value;
      }
    }),
  );
  return vars;
}
