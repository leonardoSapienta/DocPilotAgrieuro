"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { useToast } from "@ui/hooks/use-toast";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CreateCardDialogProps {
	onCardCreated: (title: string, description: string) => void;
}

export function CreateCardDialog({ onCardCreated }: CreateCardDialogProps) {
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async () => {
		if (!title || !description) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Titolo e descrizione sono obbligatori",
			});
			return;
		}

		onCardCreated(title, description);
		setTitle("");
		setDescription("");
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Plus className="h-4 w-4" />
					Crea Card
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Crea Nuova Card</DialogTitle>
					<DialogDescription>
						Aggiungi una nuova card alla sezione
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="title">Titolo</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="description">Descrizione</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Annulla
					</Button>
					<Button onClick={handleSubmit}>Crea</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
