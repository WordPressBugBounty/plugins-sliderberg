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
 * WordPress color palette structure
 */
export interface WordPressColorPalette {
  name: string;
  slug: string;
  colors?: Array<{ name: string; slug: string; color: string }>;
}
