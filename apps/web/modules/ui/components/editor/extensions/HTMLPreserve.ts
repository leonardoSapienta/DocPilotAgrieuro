import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// Enhanced HTML Preserve extension that preserves custom alert blocks and their structure
export interface HtmlBlockOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    htmlBlock: {
      /**
       * Insert a raw HTML block
       */
      insertHtmlBlock: (html: string) => ReturnType
    }
  }
}

export const HtmlBlock = Node.create<HtmlBlockOptions>({
  name: 'htmlBlock',
  group: 'block',
  content: '',
  marks: '',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: element => element.innerHTML || element.outerHTML,
        renderHTML: attributes => {
          return { 'data-html': attributes.html }
        }
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.alert-block',
        getAttrs: dom => ({ html: (dom as HTMLElement).outerHTML }),
      },
      {
        tag: 'div[class*="alert-block"]',
        getAttrs: dom => ({ html: (dom as HTMLElement).outerHTML }),
      }
    ]
  },

  renderHTML({ node }) {
    const container = document.createElement('div');
    container.innerHTML = node.attrs.html;
    return container.firstChild || ['div', { 'data-html-block': true }, 0];
  },

  addCommands() {
    return {
      insertHtmlBlock:
        (html: string) => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { html },
          })
        },
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, editor }) => {
      const dom = document.createElement('div');
      dom.innerHTML = node.attrs.html;

      // If the inner HTML has content, return the first child
      if (dom.firstChild) {
        return { dom: dom.firstChild as HTMLElement };
      }

      // Fallback to just the container
      return { dom };
    }
  },
});

// Add the HTMLPreserve extension to allow custom HTML in the editor
export const HTMLPreserve = Extension.create({
  name: 'htmlPreserve',

  addExtensions() {
    return [
      HtmlBlock
    ]
  }
});
