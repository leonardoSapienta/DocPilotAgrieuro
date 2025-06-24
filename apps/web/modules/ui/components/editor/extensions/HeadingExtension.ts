import { Extension } from '@tiptap/core';
import Heading, { Level } from '@tiptap/extension-heading';

// Extended version of Heading extension to properly support all heading levels
export const HeadingExtension = Heading.extend({
  name: 'customHeading',

  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3, 4, 5, 6] as Level[],
    };
  },

  // Make sure heading commands always take precedence
  priority: 1000,

  // Override the name() and isActive methods to ensure proper detection
  parseHTML() {
    return this.options.levels
      .map(level => ({
        tag: `h${level}`,
        attrs: { level },
      }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level as Level)
      ? node.attrs.level
      : this.options.levels[0];

    return [`h${level}`, HTMLAttributes, 0];
  },
}); 