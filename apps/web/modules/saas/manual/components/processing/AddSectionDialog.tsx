import { useState, useEffect, useRef } from "react";
import { Button } from "@ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { useToast } from "@ui/hooks/use-toast";

interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionName: string) => void;
  params: { id: string };
}

export function AddSectionDialog({
  isOpen,
  onClose,
  onAddSection,
  params,
}: AddSectionDialogProps) {
  const [newSectionName, setNewSectionName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset the input and focus it when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewSectionName("");
      // Use setTimeout to ensure the dialog is fully rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;

    try {
      // Prima di aggiungere la nuova sezione, imposta tutte le sezioni esistenti come non attive
      const response = await fetch(`/api/manuals/${params.id}/set-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello stato delle sezioni');
      }

      // Aggiungi la nuova sezione
      onAddSection(newSectionName.trim());
      setNewSectionName("");
      onClose();
    } catch (error) {
      console.error('Errore durante l\'aggiunta della sezione:', error);
      toast({
        variant: "error",
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta della sezione",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSection();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Aggiungi Nuova Sezione</DialogTitle>
          <DialogDescription className="text-gray-500">
            Inserisci il nome della nuova sezione che desideri aggiungere al documento
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            ref={inputRef}
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome della sezione"
            className="w-full border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 h-10"
          >
            Annulla
          </Button>
          <Button
            variant="secondary"
            className="bg-black text-white hover:bg-black/90 h-10"
            onClick={handleAddSection}
            disabled={!newSectionName.trim()}
          >
            Aggiungi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 