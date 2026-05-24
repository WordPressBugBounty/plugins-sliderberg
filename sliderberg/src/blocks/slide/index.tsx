/**
 * Slide Block Registration
 * Explicit registration for JS/editor, block.json for PHP
 */
import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import { InnerBlocks } from "@wordpress/block-editor";
import "./style.css";
import "./editor.css";
import { SlideBlock } from "./SlideBlock";
import { ErrorBoundary } from "../../components/shared/ErrorBoundary";
import deprecated from "./deprecated";
import type { SlideAttributes } from "../../types/slide";

interface SlideEditProps {
  attributes: SlideAttributes;
  setAttributes: (attrs: Partial<SlideAttributes>) => void;
  clientId: string;
  context: {
    "sliderberg/minHeight"?: number;
  };
}

/**
 * Slide Edit wrapper with error boundary
 * Prevents errors in slide component from crashing the entire editor
 */
const SlideEdit = (props: SlideEditProps) => {
  const parentMinHeight = props.context?.["sliderberg/minHeight"];
  return (
    <ErrorBoundary>
      <SlideBlock {...props} parentMinHeight={parentMinHeight} />
    </ErrorBoundary>
  );
};

// Register block with explicit configuration (block.json used by PHP only)
registerBlockType("sliderberg/slide", {
  title: __("Slide", "sliderberg"),
  description: __(
    "A sophisticated slide with advanced background and content positioning options.",
    "sliderberg",
  ),
  category: "widgets",
  icon: "cover-image",
  parent: ["sliderberg/sliderberg"],
  usesContext: ["sliderberg/minHeight"],
  supports: {
    html: false,
    anchor: true,
    inserter: false,
  },
  attributes: {
    backgroundType: {
      type: "string",
      default: "color" as "color" | "image" | "gradient",
    },
    backgroundImage: {
      type: "object",
      default: null,
    },
    backgroundColor: {
      type: "string",
      default: null,
    },
    backgroundGradient: {
      type: "string",
      default: null,
    },
    focalPoint: {
      type: "object",
      default: { x: 0.5, y: 0.5 },
    },
    overlayColor: {
      type: "string",
      default: "#000000",
    },
    overlayOpacity: {
      type: "number",
      default: 0,
    },
    minHeight: {
      type: "number",
      default: 400,
    },
    contentPosition: {
      type: "string",
      default: "center-center",
    },
    isFixed: {
      type: "boolean",
      default: false,
    },
    borderWidth: {
      type: "number",
      default: 0,
    },
    borderColor: {
      type: "string",
      default: "#000000",
    },
    borderStyle: {
      type: "string",
      default: "solid",
    },
    border: {
      type: "object",
      default: {},
    },
    borderRadius: {
      type: "number",
      default: 0,
    },
    slideBorderRadius: {
      type: "object",
      default: {},
    },
    isBorderControlChanged: {
      type: "boolean",
      default: false,
    },
  },
  edit: SlideEdit,
  save: () => {
    return <InnerBlocks.Content />;
  },
  deprecated,
});
