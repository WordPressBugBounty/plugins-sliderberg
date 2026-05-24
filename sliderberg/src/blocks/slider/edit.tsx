/**
 * Slider Block Edit Component - Rewritten
 * Uses new modular SliderBlock component with custom hooks
 */

import React from "react";
import { SliderBlock } from "./SliderBlock";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import { SliderAttributes } from "../../types/slider";

interface EditProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
  clientId?: string;
}

export const Edit = (props: EditProps) => {
  return (
    <ErrorBoundary>
      <SliderBlock {...props} clientId={props.clientId || ""} />
    </ErrorBoundary>
  );
};
