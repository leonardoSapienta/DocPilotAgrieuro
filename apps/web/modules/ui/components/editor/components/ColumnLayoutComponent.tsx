"use client";

import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { cn } from '@ui/lib/utils';

export function ColumnLayoutComponent(props: NodeViewProps) {
  const columns = props.node.attrs.columns || 2;

  return (
    <NodeViewWrapper className="layout-component mb-4">
      <div className="layout-component-container border border-gray-200 rounded-md p-1 relative">
        <div
          className="grid gap-4 p-2"
          data-columns={columns}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          <NodeViewContent className="content" />
        </div>
        {props.selected && (
          <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
        )}
      </div>
    </NodeViewWrapper>
  );
} 