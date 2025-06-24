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
import { useState } from "react";

interface CreateFolderDialogProps {
	onFolderCreated: (folderName: string) => void;
}

export function CreateFolderDialog({
	onFolderCreated,
}: CreateFolderDialogProps) {
	const [folderName, setFolderName] = useState("");
	const [open, setOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (folderName.trim()) {
			onFolderCreated(folderName.trim());
			setFolderName("");
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Nuova Cartella</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Crea Nuova Cartella</DialogTitle>
					<DialogDescription>
						Inserisci il nome della cartella che vuoi creare
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Input
								id="folderName"
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								placeholder="Nome cartella"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Crea</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
