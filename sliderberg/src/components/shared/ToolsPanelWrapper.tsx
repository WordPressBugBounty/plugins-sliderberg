/**
 * Reusable ToolsPanel Wrapper Component
 * Can be used for any set of controls that need a ToolsPanel
 */

import React from "react";
import { __experimentalToolsPanel as ToolsPanel } from "@wordpress/components";

interface ToolsPanelWrapperProps {
  label: string;
  resetAll?: () => void;
  children: React.ReactNode;
  className?: string;
  dropdownMenuProps?: Record<string, any>;
}

export const ToolsPanelWrapper: React.FC<ToolsPanelWrapperProps> = ({
  label,
  resetAll,
  children,
  className,
  dropdownMenuProps,
}) => {
  return (
    <ToolsPanel
      label={label}
      resetAll={resetAll}
      className={className}
      dropdownMenuProps={dropdownMenuProps}
    >
      {children}
    </ToolsPanel>
  );
};

export default ToolsPanelWrapper;
