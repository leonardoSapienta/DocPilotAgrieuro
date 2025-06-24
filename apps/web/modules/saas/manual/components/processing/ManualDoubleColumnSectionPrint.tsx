import React from "react";

interface ManualDoubleColumnSectionPrintProps {
  image?: string;
  content?: string;
}

export function ManualDoubleColumnSectionPrint({ image, content }: ManualDoubleColumnSectionPrintProps) {
  return (
    <section
      className="w-full mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start print:grid print:grid-cols-2 print:gap-4 bg-transparent"
      style={{ minHeight: 180 }}
    >
      <div className="w-full flex flex-col items-center justify-center">
        {image ? (
          <img
            src={image}
            alt="Immagine"
            className="max-w-full max-h-64 object-contain aspect-[4/3] border rounded bg-white print:max-h-40"
            style={{ background: "#fff" }}
          />
        ) : null}
      </div>
      <div className="w-full">
        {content ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : null}
      </div>
    </section>
  );
} 