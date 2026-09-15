/**
 * Color helpers for the slider block's paired color controls (pagination
 * dots, navigation arrows).
 */

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*[\d.]+\s*)?\)$/i;

/**
 * Parse a hex (#rgb, #rgba, #rrggbb, #rrggbbaa) or rgb()/rgba() color string
 * into its RGB components. Returns null for anything else (gradients, named
 * colors, unrecognized input) rather than guessing.
 */
function parseColorToRgb(
  color: string,
): { r: number; g: number; b: number } | null {
  const value = color.trim();

  const hexMatch = value.match(HEX_COLOR);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  const rgbMatch = value.match(RGB_COLOR);
  if (rgbMatch) {
    return {
      r: parseFloat(rgbMatch[1]),
      g: parseFloat(rgbMatch[2]),
      b: parseFloat(rgbMatch[3]),
    };
  }

  return null;
}

/**
 * Derive a muted secondary color from a chosen primary color by reusing its
 * RGB and applying a reduced alpha, so the pair stays visually related and
 * the secondary color reads as dimmer regardless of background. Used to pair
 * the active/inactive pagination dots and the navigation arrow icon/
 * background colors.
 */
export function deriveMutedColor(primaryColor: string, alpha = 0.4): string {
  const rgb = parseColorToRgb(primaryColor);
  if (!rgb) {
    return primaryColor;
  }

  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;
}
