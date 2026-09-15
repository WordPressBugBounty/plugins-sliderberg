/**
 * Shared type definitions for Sliderberg shared components
 */

import { ReactNode } from "react";

/**
 * Base props interface for most controls
 */
export interface BaseControlProps {
  label: string;
  attrKey: string;
}

/**
 * Props for controls that integrate with ToolsPanel
 */
export interface ToolsPanelControlProps extends BaseControlProps {
  showDefault?: boolean;
  isSingle?: boolean;
}

/**
 * Props for BorderControl component
 */
export interface BorderControlProps {
  borderLabel: string;
  attrBorderKey: string;
  borderRadiusLabel: string;
  attrBorderRadiusKey: string;
  isShowBorder?: boolean;
  isShowBorderRadius?: boolean;
  showDefaultBorder?: boolean;
  showDefaultBorderRadius?: boolean;
}

/**
 * Props for ColorSettings component
 */
export interface ColorSettingsProps {
  label: string;
  attrKey: string;
  onAttributesUpdate?: (attrs: Record<string, any>) => void;
}

/**
 * Props for ColorSettingsWithGradient component
 */
export interface ColorSettingsWithGradientProps {
  label: string;
  attrBackgroundKey: string;
  attrGradientKey: string;
}

/**
 * Props for BackgroundImageControl component
 */
export interface BackgroundImageControlProps {
  label?: string;
  panelId?: string;
  hasImage?: boolean;
  onUploadError?: (message: string) => void;
  onImageChange?: (media: any) => void;
  onImageRemove?: () => void;
}

/**
 * Props for ToolsPanelWrapper component
 */
export interface ToolsPanelWrapperProps {
  label: string;
  resetAll?: () => void;
  children: React.ReactNode;
  className?: string;
  dropdownMenuProps?: Record<string, any>;
}

/**
 * Props for ToolsPanelItemWrapper component
 */
export interface ToolsPanelItemWrapperProps {
  label: string;
  hasValue: () => boolean;
  onDeselect?: () => void;
  isShownByDefault?: boolean;
  children: React.ReactNode;
  className?: string;
  panelId?: string;
}

/**
 * Props for SelectControl component
 */
export interface SelectControlProps {
  label: string;
  value: any;
  onChange?: (value: any) => void;
  options: Array<{ label: string; value: any }>;
  disabled?: boolean;
}

/**
 * Props for SpacingControl component
 */
export interface SpacingControlProps extends BaseControlProps {
  minimumCustomValue?: number;
  sides?: string[];
}

/**
 * Props for SpacingControlWithToolsPanel component
 */
export interface SpacingControlWithToolsPanelProps extends BaseControlProps {
  showByDefault?: boolean;
  minimumCustomValue?: number;
}

/**
 * Tab definition for TabsPanelControl
 */
export interface TabDefinition {
  name: string;
  title: string;
  component: ReactNode;
}

/**
 * Props for TabsPanelControl component
 */
export interface TabsPanelControlProps {
  tabs: TabDefinition[];
}

/**
 * Toggle group option definition
 */
export interface ToggleGroupOption {
  value: any;
  icon?: JSX.Element;
  label: string;
}

/**
 * Props for ToggleGroupControl component
 */
export interface ToggleGroupControlProps {
  label: string;
  options: ToggleGroupOption[];
  attributeKey: string;
  isBlock?: boolean;
  isAdaptiveWidth?: boolean;
}

/**
 * Font appearance value structure.
 */
export interface FontAppearanceValue {
  fontStyle?: string;
  fontWeight?: string;
}

/**
 * Props for shared font appearance control wrapper.
 */
export interface FontAppearanceControlProps {
  attrKey: string;
  label: string;
  showDefault?: boolean;
  defaultValue?: FontAppearanceValue;
  onAttributesUpdate?: (attrs: Record<string, any>) => void;
  hasFontStyles?: boolean;
  hasFontWeights?: boolean;
  fontFamilyFaces?: Array<Record<string, any>>;
}

/**
 * Props for FontAppearanceControlWithToolsPanel component
 */
export interface FontAppearanceControlWithToolsPanelProps
  extends FontAppearanceControlProps {
  isShownByDefault?: boolean;
}

/**
 * Props for shared font size picker wrapper.
 */
export interface CustomFontSizePickerProps {
  attrKey: string;
  label: string;
  showDefault?: boolean;
  defaultValue?: number | string;
  onAttributesUpdate?: (attrs: Record<string, any>) => void;
  withSlider?: boolean;
  withReset?: boolean;
  fallbackFontSize?: number;
}

/**
 * Props for CustomFontSizePickerWithToolsPanel component
 */
export interface CustomFontSizePickerWithToolsPanelProps
  extends CustomFontSizePickerProps {
  label: string;
  isShownByDefault?: boolean;
}

/**
 * WordPress color palette structure
 */
export interface WordPressColorPalette {
  name: string;
  slug: string;
  colors?: Array<{ name: string; slug: string; color: string }>;
}

/**
 * Props for BorderControlWithToolsPanel component
 */
export interface BorderControlWithToolsPanelProps {
  borderLabel: string;
  attrBorderKey: string;
  borderRadiusLabel: string;
  attrBorderRadiusKey: string;
  isShowBorder?: boolean;
  isShowBorderRadius?: boolean;
  showDefaultBorder?: boolean;
  showDefaultBorderRadius?: boolean;
}

/**
 * Props for ColorSettingsWithToolsPanel component
 */
export interface ColorSettingsWithToolsPanelProps {
  label: string;
  attrKey: string;
  onAttributesUpdate?: (attrs: Record<string, any>) => void;
}

/**
 * Props for ColorSettingsWithGradientWithToolsPanel component
 */
export interface ColorSettingsWithGradientWithToolsPanelProps {
  label: string;
  attrBackgroundKey: string;
  attrGradientKey: string;
}

/**
 * Props for RangeControlWithToolsPanel component
 */
export interface RangeControlWithToolsPanelProps {
  label: string;
  attrKey: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  required?: boolean;
  isShownByDefault?: boolean;
}

/**
 * Props for SelectControlWithToolsPanel component
 */
export interface SelectControlWithToolsPanelProps {
  label: string;
  attrKey: string;
  options: Array<{ label: string; value: any }>;
  defaultValue?: string;
  help?: string;
  isShownByDefault?: boolean;
}

/**
 * Props for ToggleGroupControlWithToolsPanel component
 */
export interface ToggleGroupControlWithToolsPanelProps {
  label: string;
  attrKey: string;
  options: ToggleGroupOption[];
  defaultValue?: any;
  isShownByDefault?: boolean;
}

/**
 * Props for ToggleControlWithToolsPanel component
 */
export interface ToggleControlWithToolsPanelProps {
  label: string;
  attrKey: string;
  defaultValue?: boolean;
  isShownByDefault?: boolean;
  help?: string;
}
