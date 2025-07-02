"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { X } from "lucide-react";
import { cn } from "@ui/lib/utils";

interface ExampleContentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  exampleHtml?: string;
}

export function ExampleContentPanel({
  isOpen,
  onClose,
  exampleHtml,
}: ExampleContentPanelProps) {
  return (
    <Card className="h-full rounded-none border-none shadow-none bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          Contenuto dall'Example Manual
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="overflow-y-auto h-[calc(100vh-8rem)]">
        {exampleHtml ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: exampleHtml }}
          />
        ) : (
          <div className="text-sm text-gray-500">
            Nessun contenuto di esempio disponibile per questa sezione.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 