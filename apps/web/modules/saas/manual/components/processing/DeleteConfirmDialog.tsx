import { Button } from "@ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionName: string | null;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  sectionName,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Conferma Eliminazione</DialogTitle>
          <DialogDescription className="text-gray-500">
            Sei sicuro di voler eliminare la sezione "{sectionName}"? Questa azione non può essere
            annullata.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 h-10"
          >
            Annulla
          </Button>
          <Button
            variant="error"
            className="bg-red-600 hover:bg-red-700 text-white h-10"
            onClick={onConfirm}
          >
            Elimina
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 