"use client";

import { Node, mergeAttributes } from '@tiptap/core';

export interface LayoutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    layout: {
      /**
       * Set a layout section with columns
       */
      setLayout: (options: { columns: number }) => ReturnType;
    }
  }
}



export const LayoutExtension = Node.create<LayoutOptions>({
  name: 'layout',
  group: 'block',
  content: 'block+',
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'layout',
      },
    };
  },

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: element => {
          const value = element.getAttribute('data-columns');
          return value ? parseInt(value, 10) : 2;
        },
        renderHTML: attributes => {
          return {
            'data-columns': attributes.columns,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-layout]',
        getAttrs: element => {
          if (element && element instanceof HTMLElement) {
            const columns = element.getAttribute('data-columns');
            return {
              columns: columns ? parseInt(columns, 10) : 2,
            };
          }
          return {};
        },
      },
      {
        tag: 'div.layout-container',
        getAttrs: element => {
          if (element && element instanceof HTMLElement) {
            const columns = element.getAttribute('data-columns');
            return {
              columns: columns ? parseInt(columns, 10) : 2,
            };
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const columns = HTMLAttributes.columns || 2;
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-layout': 'true',
      'data-columns': columns,
      'class': `layout-container columns-${columns}`,
      'style': `grid-template-columns: repeat(${columns}, minmax(0, 1fr));`
    }), 0];
  },

  addCommands() {
    return {
      setLayout: (options) => ({ chain }) => {
        const columns = options.columns;

        // Create shorter content for columns to fit in one row
        const columnContents = Array.from({ length: columns }, (_, i) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: `Column ${i + 1}` }],
        }));

        return chain()
          .insertContent({
            type: this.name,
            attrs: {
              columns: options.columns,
            },
            content: columnContents,
          })
          .run();
      },
    };
  },
}); 