"use client";

import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@ui/lib/utils';
import { AlertType } from '../extensions/AlertBlockExtension';

export function AlertBlockComponent(props: NodeViewProps) {
  const alertType = props.node.attrs.type as AlertType || 'important';
  const isSelected = props.selected;

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

  const getAlertIcon = () => {
    switch (alertType) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 stroke-2" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 stroke-2" />;
      case 'caution':
        return <AlertCircle className="w-6 h-6 stroke-2" />;
      case 'important':
      default:
        return null; // No icon for important alerts
    }
  };

  const getTitle = () => {
    const title = props.node.attrs.title || '';
    if (title) return title;

    switch (alertType) {
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
  };

  return (
    <NodeViewWrapper className="alert-block-component not-prose my-4">
      <div
        className={cn(
          "relative p-4 rounded-md border",
          getAlertClasses(),
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
        data-alert-type={alertType}
      >
        <div className="alert-content flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {alertType !== 'important' && (
              <div className={cn("alert-icon flex-shrink-0", getIconColor())}>
                {getAlertIcon()}
              </div>
            )}
            <h2 className={cn("alert-title font-medium text-lg", getTitleColor())}>
              {getTitle()}
            </h2>
          </div>
          <div className={cn("alert-description", getDescriptionColor())}>
            <NodeViewContent className="content" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
} 