/**
 * Styling helper utilities for shared components
 */

import { omitBy, isUndefined, trim, isEmpty } from "lodash";

interface BorderRadius {
  topLeft?: string | number;
  topRight?: string | number;
  bottomLeft?: string | number;
  bottomRight?: string | number;
}

interface Border {
  [key: string]: {
    width?: string;
    style?: string;
    color?: string;
  };
}

interface Shadow {
  preset?: string;
  shadow?: string;
  horizontal?: number;
  vertical?: number;
  blur?: number;
  spread?: number;
  color?: string;
  inset?: boolean;
}

/**
 * Check if border radius values are mixed (single string value)
 *
 * @param values - Border radius values
 * @returns True if values are mixed (string), false otherwise
 */
export function hasMixedValues(
  values: Record<string, any> | string = {}
): boolean {
  return typeof values === "string";
}

/**
 * Split border radius value into individual corners
 * If value is a string, applies same value to all corners
 *
 * @param value - Border radius value (string or object)
 * @returns Object with topLeft, topRight, bottomLeft, bottomRight values
 */
export function splitBorderRadius(value: string | BorderRadius): BorderRadius {
  const isValueMixed = hasMixedValues(value);
  const splittedBorderRadius: BorderRadius = {
    topLeft: value,
    topRight: value,
    bottomLeft: value,
    bottomRight: value,
  };
  return isValueMixed ? splittedBorderRadius : (value as BorderRadius);
}

function hasSplitBorders(border: Record<string, any> = {}): boolean {
  const sides = ["top", "right", "bottom", "left"];

  for (const side in border) {
    if (sides.includes(side)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if given value is a spacing preset.
 *
 * @param value Value to check
 * @return Return true if value is string in format var:preset|spacing|.
 */
export function isValueSpacingPreset(value: string | undefined): boolean {
  if (!value?.includes) {
    return false;
  }
  return value === "0" || value.includes("var:preset|spacing|");
}

/**
 * Converts a spacing preset into a custom value.
 *
 * @param value Value to convert.
 * @return CSS var string for given spacing preset value.
 */
export function getSpacingPresetCssVar(
  value: string | undefined
): string | undefined {
  if (!value) {
    return;
  }

  const slug = value.match(/var:preset\|spacing\|(.+)/);

  if (!slug) {
    return value;
  }

  return `var(--wp--preset--spacing--${slug[1]})`;
}

/**
 * Generates CSS box-shadow value from shadow object.
 *
 * @param shadow Shadow object with settings
 * @return CSS box-shadow value
 */
export function getBoxShadowCss(shadow: Shadow): string | undefined {
  if (isEmpty(shadow)) {
    return undefined;
  }

  // Handle preset shadows with direct shadow values
  if (shadow.preset && shadow.preset !== "custom" && shadow.shadow) {
    return shadow.shadow;
  }

  if (shadow.preset && shadow.preset !== "custom" && !shadow.color) {
    return undefined;
  }

  const {
    horizontal = 0,
    vertical = 0,
    blur = 0,
    spread = 0,
    color = "rgba(0, 0, 0, 0.2)",
    inset = false,
  } = shadow;

  return `${
    inset ? "inset " : ""
  }${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}

export function getSpacingCss(
  object: Record<string, any>
): Record<string, any> {
  let css: Record<string, any> = {};
  if (!object) {
    return css;
  }
  for (const [key, value] of Object.entries(object)) {
    if (isValueSpacingPreset(value)) {
      css[key] = getSpacingPresetCssVar(value);
    } else {
      css[key] = value;
    }
  }
  return css;
}

/**
 * Function that's help you to generate splitted or non splitted border CSS.
 * @param object border attributes
 * @return A css object
 */
export const getBorderCSS = (
  object: Record<string, any>
): Record<string, any> => {
  let css: Record<string, any> = {};

  if (!hasSplitBorders(object)) {
    css["top"] = object;
    css["right"] = object;
    css["bottom"] = object;
    css["left"] = object;
    return css;
  }
  return object;
};

export function getSingleSideBorderValue(
  border: Record<string, any>,
  side: string
): string {
  const hasWidth = !isEmpty(border[side]?.width);
  return `${border[side]?.width ?? ""} ${
    hasWidth && isEmpty(border[side]?.style)
      ? "solid"
      : border[side]?.style ?? ""
  } ${hasWidth && isEmpty(border[side]?.color) ? "" : border[side]?.color}`;
}

export function getBorderVariablesCss(
  border: Record<string, any>,
  slug: string
): Record<string, string> {
  const borderInFourDimension = getBorderCSS(border);
  const borderSides = ["top", "right", "bottom", "left"];
  let borders: Record<string, string> = {};
  for (let i = 0; i < borderSides.length; i++) {
    const side = borderSides[i];
    const sideProperty = `--sliderberg-${slug}-border-${side}`;
    const sideValue = getSingleSideBorderValue(borderInFourDimension, side);
    borders[sideProperty] = sideValue;
  }

  return borders;
}

export function generateStyles(
  styles: Record<string, any>
): Record<string, any> {
  return omitBy(
    styles,
    (value: any) =>
      value === false ||
      isEmpty(value) ||
      isUndefined(value) ||
      trim(value) === "" ||
      trim(value) === "undefined undefined undefined"
  );
}

export function getBackgroundColorVar(
  attributes: Record<string, any>,
  bgColorAttrKey: string,
  gradientAttrKey: string
): string {
  if (!isEmpty(attributes[bgColorAttrKey])) {
    return attributes[bgColorAttrKey];
  } else if (!isEmpty(attributes[gradientAttrKey])) {
    return attributes[gradientAttrKey];
  } else {
    return "";
  }
}
