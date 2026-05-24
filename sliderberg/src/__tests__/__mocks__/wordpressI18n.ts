/**
 * Mock for @wordpress/i18n package
 * 
 * Provides simple pass-through implementations of i18n functions
 * for use in Jest tests.
 */

export const __ = (text: string): string => text;
export const _x = (text: string): string => text;
export const _n = (single: string, plural: string, number: number): string =>
  number === 1 ? single : plural;
export const _nx = (single: string, plural: string, number: number): string =>
  number === 1 ? single : plural;
export const sprintf = (format: string, ...args: unknown[]): string => {
  let result = format;
  args.forEach((arg, index) => {
    result = result.replace(/%[sd]/, String(arg));
  });
  return result;
};

