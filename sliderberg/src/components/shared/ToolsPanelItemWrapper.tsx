/**
 * Reusable ToolsPanelItem Wrapper Component
 * Can be used for any control that needs a ToolsPanelItem
 */

import React from "react";
import { __experimentalToolsPanelItem as ToolsPanelItem } from "@wordpress/components";

interface ToolsPanelItemWrapperProps {
  label: string;
  hasValue: () => boolean;
  onDeselect?: () => void;
  isShownByDefault?: boolean;
  children: React.ReactNode;
  className?: string;
  panelId?: string;
  style?: React.CSSProperties;
}

export const ToolsPanelItemWrapper: React.FC<ToolsPanelItemWrapperProps> = ({
  label,
  hasValue,
  onDeselect,
  isShownByDefault = true,
  children,
  className,
  panelId,
  style,
}) => {
  return (
    <ToolsPanelItem
      style={style}
      hasValue={hasValue}
      label={label}
      onDeselect={onDeselect}
      isShownByDefault={isShownByDefault}
      className={className}
      panelId={panelId}
    >
      {children}
    </ToolsPanelItem>
  );
};

export default ToolsPanelItemWrapper;
