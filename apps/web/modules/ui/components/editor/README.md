# TipTap WYSIWYG Drag & Drop Editor

This is a complete implementation of a WYSIWYG editor using TipTap with drag-and-drop functionality. The editor allows users to drag predefined components from a sidebar into the editing area and has both Edit and Preview modes.

## Features

- **Edit and Preview Modes**: Toggle between editing content and previewing the final output
- **Drag & Drop Interface**: Drag components from the sidebar into the editor
- **Rich Text Editing**: Full text formatting capabilities (bold, italic, headings, etc.)
- **Pre-styled Components**: Ready-to-use components with predefined styles
- **Table Support**: Insert and edit tables with custom dimensions

## Components

- **TipTapEditor.tsx**: Main editor component that integrates TipTap with drag-and-drop capabilities
- **EditorSidebar.tsx**: Sidebar component with draggable blocks
- **EditorToolbar.tsx**: Formatting toolbar for the editor
- **Extensions**:
  - **HTMLPreserve.ts**: Custom extension to preserve HTML classes and styles
  - **TableComponentExtension.tsx**: Extension for handling table insertion

## Draggable Blocks

The sidebar includes these draggable components:

1. **Title**: Inserts an `<h1>` element
2. **Paragraph**: Inserts a `<p>` element with support for nested lists
3. **Table**: Inserts an HTML table with configurable rows and columns
4. **Alert Blocks**:
   - Danger: Red alert box with icon and editable content
   - Warning: Amber alert box with icon and editable content
   - Caution: Yellow alert box with icon and editable content
   - Important: Blue alert box with editable content (no icon)

## Implementation Details

- Uses `@tiptap/react` and `@tiptap/starter-kit` for rich text editing
- Uses `@dnd-kit/core` for drag-and-drop functionality
- Preserves HTML/CSS classes and styles when inserting components
- Custom extensions for specialized functionality

## Usage

Import the TipTapEditor component and use it in your Next.js app:

```tsx
import TipTapEditor from "../components/editor/TipTapEditor";

export default function MyEditorPage() {
  const handleChange = (html: string) => {
    console.log('Editor content:', html);
  };

  return (
    <div className="container mx-auto py-10">
      <h1>My WYSIWYG Editor</h1>
      <TipTapEditor onChange={handleChange} />
    </div>
  );
}
```

## Demo

A demo page is available at `/wysiwyg-editor` showing the editor in action. 