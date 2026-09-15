/**
 * @sliderberg/shared
 * Shared components and utilities for the Sliderberg monorepo.
 * Import from "@sliderberg/shared" in any workspace package.
 */

// --- UI Components ---
export { default as BorderControl } from "./components/BorderControl";
export { default as CustomToggleGroupControl } from "./components/ToggleGroupControl";
export { default as CustomFontSizePicker } from "./components/FontSizePicker";
export { default as FontAppearanceControl } from "./components/FontAppearanceControl";
export { default as SpacingControl } from "./components/SpacingControl";
export { default as ColorSettings } from "./components/ColorSettings";
export { default as ColorSettingsWithGradient } from "./components/ColorSettingsWithGradient";
export { default as BackgroundImageControl } from "./components/BackgroundImageControl";
export { default as ToolsPanelWrapper } from "./components/ToolsPanelWrapper";
export { default as ToolsPanelItemWrapper } from "./components/ToolsPanelItemWrapper";
export { default as UBSelectControl } from "./components/SelectControl";
export { default as TabsPanelControl } from "./components/TabsPanelControl";
export { default as SpacingControlWithToolsPanel } from "./components/SpacingControlWithToolsPanel";
export { default as BorderControlWithToolsPanel } from "./components/BorderControlWithToolsPanel";
export { default as ColorSettingsWithToolsPanel } from "./components/ColorSettingsWithToolsPanel";
export { default as ColorSettingsWithGradientWithToolsPanel } from "./components/ColorSettingsWithGradientWithToolsPanel";
export { default as RangeControlWithToolsPanel } from "./components/RangeControlWithToolsPanel";
export { default as SelectControlWithToolsPanel } from "./components/SelectControlWithToolsPanel";
export { default as ToggleGroupControlWithToolsPanel } from "./components/ToggleGroupControlWithToolsPanel";
export { default as ToggleControlWithToolsPanel } from "./components/ToggleControlWithToolsPanel";
export { default as CustomFontSizePickerWithToolsPanel } from "./components/CustomFontSizePickerWithToolsPanel";
export { default as FontAppearanceControlWithToolsPanel } from "./components/FontAppearanceControlWithToolsPanel";
export { ErrorBoundary } from "./components/ErrorBoundary";
export { ReviewRequest } from "./components/ReviewRequest";

// --- Styling Utilities ---
export {
  getBackgroundColorVar,
  generateStyles,
  getBorderCSS,
  getSingleSideBorderValue,
  splitBorderRadius,
} from "./components/utils/styling-helpers";

// --- Component Types ---
export type {
  BaseControlProps,
  ToolsPanelControlProps,
  BorderControlProps,
  ColorSettingsProps,
  ColorSettingsWithGradientProps,
  CustomFontSizePickerProps,
  FontAppearanceControlProps,
  FontAppearanceValue,
  BackgroundImageControlProps,
  SelectControlProps,
  SpacingControlProps,
  SpacingControlWithToolsPanelProps,
  TabDefinition,
  TabsPanelControlProps,
  ToggleGroupOption,
  ToggleGroupControlProps,
  WordPressColorPalette,
  ToolsPanelWrapperProps,
  ToolsPanelItemWrapperProps,
  BorderControlWithToolsPanelProps,
  ColorSettingsWithToolsPanelProps,
  ColorSettingsWithGradientWithToolsPanelProps,
  RangeControlWithToolsPanelProps,
  SelectControlWithToolsPanelProps,
  ToggleGroupControlWithToolsPanelProps,
  ToggleControlWithToolsPanelProps,
  CustomFontSizePickerWithToolsPanelProps,
  FontAppearanceControlWithToolsPanelProps,
} from "./components/types";
