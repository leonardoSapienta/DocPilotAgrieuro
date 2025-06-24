import { useState } from "react";
import ImageDialog from "./ImageDialog";
import { MiniTipTapEditor } from "./MiniTipTapEditor";

interface ManualDoubleColumnSectionProps {
  initialImage?: string;
  initialContent?: string;
  onChange?: (data: { image?: string; content: string }) => void;
}

export function ManualDoubleColumnSection({
  initialImage = "",
  initialContent = "",
  onChange,
}: ManualDoubleColumnSectionProps) {
  const [image, setImage] = useState<string>(initialImage);
  const [content, setContent] = useState<string>(initialContent);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  function handleImageSelect(url: string) {
    setImage(url);
    setIsImageDialogOpen(false);
    onChange?.({ image: url, content });
  }

  function handleContentChange(html: string) {
    setContent(html);
    onChange?.({ image, content: html });
  }

  return (
    <section
      className="w-full rounded-md p-0 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start print:grid print:grid-cols-2 print:gap-4 bg-transparent"
      style={{ minHeight: 180 }}
    >
      <div className="w-full flex flex-col items-center justify-center">
        {image ? (
          <div className="relative w-full flex flex-col items-center">
            <img
              src={image}
              alt="Immagine caricata"
              className="max-w-full max-h-64 object-contain aspect-[4/3] border rounded bg-white print:max-h-40"
              style={{ background: "#fff" }}
            />
            <button
              type="button"
              className="mt-2 text-xs text-blue-600 underline"
              onClick={() => setIsImageDialogOpen(true)}
            >
              Cambia immagine
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="border border-dashed rounded p-4 text-gray-500 hover:border-blue-400"
            onClick={() => setIsImageDialogOpen(true)}
          >
            Carica o scegli immagine
          </button>
        )}
        <ImageDialog
          isOpen={isImageDialogOpen}
          onClose={() => setIsImageDialogOpen(false)}
          onImageSelect={handleImageSelect}
          sectionImages={[]}
        />
      </div>
      <div className="w-full">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Testo personalizzato</span>
        </div>
        <MiniTipTapEditor
          content={content}
          onChange={handleContentChange}
          className="border rounded min-h-32"
        />
      </div>
    </section>
  );
} 