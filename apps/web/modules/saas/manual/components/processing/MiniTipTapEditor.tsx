import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@ui/lib/utils";

interface MiniTipTapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  className?: string;
}

export function MiniTipTapEditor({ content = "", onChange, className }: MiniTipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [1, 2] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-2 border-b px-2 py-1 bg-white rounded-t">
        <button
          type="button"
          className={cn(
            "px-2 py-1 text-xs rounded hover:bg-gray-100",
            editor.isActive("heading", { level: 1 }) && "bg-gray-200 font-bold"
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          Titolo H1
        </button>
        <button
          type="button"
          className={cn(
            "px-2 py-1 text-xs rounded hover:bg-gray-100",
            editor.isActive("heading", { level: 2 }) && "bg-gray-200 font-bold"
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Titolo H2
        </button>
        <button
          type="button"
          className={cn(
            "px-2 py-1 text-xs rounded hover:bg-gray-100",
            editor.isActive("paragraph") && "bg-gray-200 font-bold"
          )}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          Paragrafo
        </button>
        <div className="ml-4 flex gap-1">
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-xs rounded hover:bg-gray-100",
              editor.isActive({ textAlign: "left" }) && "bg-gray-200 font-bold"
            )}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            Allinea sx
          </button>
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-xs rounded hover:bg-gray-100",
              editor.isActive({ textAlign: "center" }) && "bg-gray-200 font-bold"
            )}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            Centro
          </button>
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-xs rounded hover:bg-gray-100",
              editor.isActive({ textAlign: "right" }) && "bg-gray-200 font-bold"
            )}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            Allinea dx
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-24 p-2 border rounded-b" />
    </div>
  );
} 