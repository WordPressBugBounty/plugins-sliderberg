/**
 * Slide type definitions
 * Imports shared types from common.ts
 */

import {
  FocalPoint,
  MediaObject,
  ContentPosition,
  BorderStyle,
} from "./common";

// Re-export for convenience
export type { FocalPoint, MediaObject, ContentPosition, BorderStyle };

/**
 * Background type options for slides
 */
export type BackgroundType = "image" | "color" | "gradient";

/**
 * Slide block attributes
 */
export interface SlideAttributes {
  backgroundType: BackgroundType;
  backgroundImage: MediaObject | null;
  backgroundColor: string;
  backgroundGradient: string;
  focalPoint: FocalPoint;
  overlayColor: string;
  overlayOpacity: number;
  minHeight: number;
  contentPosition: ContentPosition;
  isFixed: boolean;
  borderWidth: number;
  borderColor: string;
  borderStyle: BorderStyle;
  border: Record<string, any>;
  borderRadius: number;
  slideBorderRadius: Record<string, any>;
  isBorderControlChanged: boolean;
}

/**
 * Props for the slide edit component
 */
export interface SlideEditProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
  isSelected: boolean;
  clientId: string;
}

/**
 * Props passed to MediaUpload render function
 */
export interface MediaUploadRenderProps {
  open: () => void;
}
