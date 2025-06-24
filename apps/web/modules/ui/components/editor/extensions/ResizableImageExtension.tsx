"use client";

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { ResizableImageComponent } from '../components/ResizableImageComponent';

// Extend the Image extension to add resize capabilities
export const ResizableImageExtension = Image.extend({
  name: 'resizableImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      // Store original dimensions for aspect ratio calculations
      originalWidth: {
        default: null,
        parseHTML: element => element.getAttribute('data-original-width'),
        renderHTML: attributes => {
          if (!attributes.originalWidth) {
            return {};
          }
          return { 'data-original-width': attributes.originalWidth };
        },
      },
      originalHeight: {
        default: null,
        parseHTML: element => element.getAttribute('data-original-height'),
        renderHTML: attributes => {
          if (!attributes.originalHeight) {
            return {};
          }
          return { 'data-original-height': attributes.originalHeight };
        },
      },
    };
  },

  // Override the parseHTML method to support our resizable image attributes
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: el => {
          const element = el as HTMLImageElement;

          // When parsing, store the original dimensions for reference
          // These could be used later for calculating aspect ratio
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            originalWidth: element.getAttribute('data-original-width') || element.getAttribute('width'),
            originalHeight: element.getAttribute('data-original-height') || element.getAttribute('height'),
          };
        },
      },
    ];
  },

  // Use the custom React component for rendering the node
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
}); 