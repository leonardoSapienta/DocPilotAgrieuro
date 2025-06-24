"use client";

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AlertBlockComponent } from '../components/AlertBlockComponent';

export interface AlertBlockOptions {
  HTMLAttributes: Record<string, any>;
}

export type AlertType = 'danger' | 'warning' | 'caution' | 'important';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alertBlock: {
      /**
       * Add an alert block
       */
      setAlertBlock: (options: { type: AlertType, title?: string, content?: string }) => ReturnType;
    }
  }
}

export const AlertBlockExtension = Node.create<AlertBlockOptions>({
  name: 'alertBlock',
  group: 'block',
  content: 'block+',
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'important',
        parseHTML: element => element.getAttribute('data-alert-type') || 'important',
        renderHTML: attributes => {
          return {
            'data-alert-type': attributes.type,
          };
        },
      },
      title: {
        default: '',
        parseHTML: element => {
          const titleEl = element.querySelector('.alert-title');
          return titleEl ? titleEl.textContent : '';
        },
        renderHTML: attributes => {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.alert-block',
        getAttrs: element => {
          if (element && element instanceof HTMLElement) {
            const alertType = getAlertTypeFromClasses(element);
            const titleEl = element.querySelector('.alert-title');

            return {
              type: alertType,
              title: titleEl ? titleEl.textContent : '',
            };
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const alertType = node.attrs.type || 'important';
    const title = node.attrs.title || getDefaultTitle(alertType);

    const getAlertClasses = () => {
      switch (alertType) {
        case 'danger':
          return 'bg-red-50 border-red-100';
        case 'warning':
          return 'bg-orange-50 border-orange-100';
        case 'caution':
          return 'bg-yellow-50 border-yellow-100';
        case 'important':
        default:
          return 'bg-blue-50 border-blue-100';
      }
    };

    const getIconColor = () => {
      switch (alertType) {
        case 'danger':
          return 'text-[#9B2423]';
        case 'warning':
          return 'text-[#d05d29]';
        case 'caution':
          return 'text-[#f9a900]';
        case 'important':
        default:
          return 'text-blue-500';
      }
    };

    const getTitleColor = () => {
      switch (alertType) {
        case 'danger':
          return 'text-[#9B2423]';
        case 'warning':
          return 'text-[#d05d29]';
        case 'caution':
          return 'text-[#f9a900]';
        case 'important':
        default:
          return 'text-blue-800';
      }
    };

    const getDescriptionColor = () => {
      switch (alertType) {
        case 'danger':
          return 'text-red-700';
        case 'warning':
          return 'text-orange-700';
        case 'caution':
          return 'text-yellow-700';
        case 'important':
        default:
          return 'text-blue-700';
      }
    };

    // Create alert container
    const attrs = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      {
        'data-alert-type': alertType,
        'class': `alert-block ${getAlertClasses()} p-4 rounded-md border my-4`,
      }
    );

    // For different alert types, create different structures
    if (alertType === 'important') {
      return [
        'div',
        attrs,
        ['div', { class: 'alert-content flex flex-col gap-3' },
          ['div', { class: 'flex items-center gap-3' },
            ['h2', { class: `alert-title font-medium text-lg ${getTitleColor()}` }, title]
          ],
          ['div', { class: `alert-description ${getDescriptionColor()}` }, 0]
        ]
      ];
    } else if (alertType === 'danger') {
      return [
        'div',
        attrs,
        ['div', { class: 'alert-content flex flex-col gap-3' },
          ['div', { class: 'flex items-center gap-3' },
            ['div', { class: `alert-icon flex-shrink-0 ${getIconColor()}` },
              ['svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              },
                ['path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }],
                ['line', { x1: '12', y1: '9', x2: '12', y2: '13' }],
                ['line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }]
              ]
            ],
            ['h2', { class: `alert-title font-medium text-lg ${getTitleColor()}` }, title]
          ],
          ['div', { class: `alert-description ${getDescriptionColor()}` }, 0]
        ]
      ];
    } else if (alertType === 'warning') {
      return [
        'div',
        attrs,
        ['div', { class: 'alert-content flex flex-col gap-3' },
          ['div', { class: 'flex items-center gap-3' },
            ['div', { class: `alert-icon flex-shrink-0 ${getIconColor()}` },
              ['svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              },
                ['path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }],
                ['line', { x1: '12', y1: '9', x2: '12', y2: '13' }],
                ['line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }]
              ]
            ],
            ['h2', { class: `alert-title font-medium text-lg ${getTitleColor()}` }, title]
          ],
          ['div', { class: `alert-description ${getDescriptionColor()}` }, 0]
        ]
      ];
    } else {
      // Caution
      return [
        'div',
        attrs,
        ['div', { class: 'alert-content flex flex-col gap-3' },
          ['div', { class: 'flex items-center gap-3' },
            ['div', { class: `alert-icon flex-shrink-0 ${getIconColor()}` },
              ['svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '24',
                height: '24',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
              },
                ['circle', { cx: '12', cy: '12', r: '10' }],
                ['line', { x1: '12', y1: '8', x2: '12', y2: '12' }],
                ['line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }]
              ]
            ],
            ['h2', { class: `alert-title font-medium text-lg ${getTitleColor()}` }, title]
          ],
          ['div', { class: `alert-description ${getDescriptionColor()}` }, 0]
        ]
      ];
    }
  },

  addCommands() {
    return {
      setAlertBlock: options => ({ chain }) => {
        const { type, title, content } = options;

        return chain()
          .insertContent({
            type: this.name,
            attrs: {
              type,
              title: title || getDefaultTitle(type),
            },
            content: [
              {
                type: 'paragraph',
                content: content ? [{ type: 'text', text: content }] : [
                  { type: 'text', text: getDefaultContent(type) }
                ],
              },
            ],
          })
          .run();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertBlockComponent);
  },
});

// Helper functions
function getAlertTypeFromClasses(element: HTMLElement): AlertType {
  if (element.classList.contains('bg-red-50')) return 'danger';
  if (element.classList.contains('bg-amber-50')) return 'warning';
  if (element.classList.contains('bg-yellow-50')) return 'caution';
  return 'important';
}

function getDefaultTitle(type: AlertType): string {
  switch (type) {
    case 'danger':
      return 'DANGER';
    case 'warning':
      return 'WARNING';
    case 'caution':
      return 'CAUTION';
    case 'important':
    default:
      return 'IMPORTANT';
  }
}

function getDefaultContent(type: AlertType): string {
  switch (type) {
    case 'danger':
      return 'This is a danger message that you should pay attention to.';
    case 'warning':
      return 'This is a warning message that you should be aware of.';
    case 'caution':
      return 'This is a caution message you should consider carefully.';
    case 'important':
    default:
      return 'This is an important message that needs your attention.';
  }
} 