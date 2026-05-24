/**
 * WordPress dependencies
 */
import React from "react";
import { SelectControl as WPSelectControl } from "@wordpress/components";

/**
 * Internal dependencies
 */
import { SelectControlProps } from "./types";

/**
 * Select control component
 * Wrapper around WordPress SelectControl with default value handling
 */
const UBSelectControl: React.FC<SelectControlProps> = ({
  label,
  value,
  onChange = () => {},
  options,
  disabled = false,
}) => {
  const displayValue = value ?? "auto";

  return (
    <WPSelectControl
      disabled={disabled}
      label={label}
      value={displayValue}
      options={options}
      onChange={onChange}
      __next40pxDefaultSize
      __nextHasNoMarginBottom
    />
  );
};

export default UBSelectControl;
