"use client";

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// Simplified extension that doesn't add custom commands (we'll use built-in TipTap commands instead)
export const TableComponentExtension = Extension.create({
  name: 'tableComponent',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableComponent'),
      }),
    ];
  },
}); 