"use client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { Button } from "@ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useToast } from "@ui/hooks/use-toast";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface Icon {
	id: string;
	nome: string;
	descrizione: string | null;
	urlicona: string;
	createdAt: string;
}

interface IconFormData {
	name: string;
	description: string;
	file: File | null;
}

export default function IconsPage() {
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [icons, setIcons] = useState<Icon[]>([]);
	const [iconToDelete, setIconToDelete] = useState<Icon | null>(null);
	const [iconToEdit, setIconToEdit] = useState<Icon | null>(null);
	const [formData, setFormData] = useState<IconFormData>({
		name: "",
		description: "",
		file: null,
	});
	const [preview, setPreview] = useState<string | null>(null);

	useEffect(() => {
		fetchIcons();
	}, []);

	const fetchIcons = async () => {
		try {
			const response = await fetch("/api/icons");
			if (!response.ok)
				throw new Error("Errore nel recupero delle icone");
			const data = await response.json();
			setIcons(data);
		} catch (error) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Impossibile caricare le icone",
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData((prev) => ({ ...prev, file }));
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData.file) return;

		try {
			setIsLoading(true);
			const formDataToSend = new FormData();
			formDataToSend.append("file", formData.file);
			formDataToSend.append("name", formData.name);
			formDataToSend.append("description", formData.description);

			const response = await fetch("/api/icons/upload", {
				method: "POST",
				body: formDataToSend,
			});

			if (!response.ok) {
				throw new Error("Errore durante il caricamento");
			}

			const data = await response.json();

			toast({
				title: "Icona caricata",
				description: "L'icona è stata caricata con successo",
			});

			// Reset form
			setFormData({
				name: "",
				description: "",
				file: null,
			});
			setPreview(null);
			setIsOpen(false);

			// Ricarica le icone
			await fetchIcons();
		} catch (error) {
			toast({
				variant: "error",
				title: "Errore",
				description:
					"Si è verificato un errore durante il caricamento dell'icona",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (icon: Icon) => {
		try {
			const response = await fetch(`/api/icone/${icon.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Errore durante l'eliminazione");
			}

			toast({
				title: "Icona eliminata",
				description: "L'icona è stata eliminata con successo",
			});

			// Aggiorna la lista delle icone
			setIcons((prev) => prev.filter((i) => i.id !== icon.id));
		} catch (error) {
			toast({
				variant: "error",
				title: "Errore",
				description:
					"Si è verificato un errore durante l'eliminazione dell'icona",
			});
		} finally {
			setIconToDelete(null);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium">Icone</h3>
					<p className="text-sm text-muted-foreground">
						Gestisci le icone del manuale
					</p>
				</div>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Aggiungi Icona
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Aggiungi Nuova Icona</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-4">
								<div>
									<Label htmlFor="name">Nome Icona</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										required
									/>
								</div>

								<div>
									<Label htmlFor="description">
										Descrizione
									</Label>
									<Input
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
									/>
								</div>

								<div>
									<Label htmlFor="icon">Icona</Label>
									<div className="mt-2">
										<Input
											id="icon"
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="cursor-pointer"
										/>
										{preview && (
											<div className="mt-4">
												<img
													src={preview}
													alt="Preview"
													className="max-h-32 mx-auto"
												/>
											</div>
										)}
									</div>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? "Caricamento..." : "Salva Icona"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{icons.map((icon) => (
					<Card key={icon.id} className="relative">
						<div className="absolute top-2 right-2 flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-primary"
								onClick={() => setIconToEdit(icon)}
								aria-label="Modifica icona"
							>
								<Pencil className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-destructive hover:text-destructive/90"
								onClick={() => setIconToDelete(icon)}
								aria-label="Elimina icona"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<CardHeader>
							<CardTitle>{icon.nome}</CardTitle>
							{icon.descrizione && (
								<CardDescription>
									{icon.descrizione}
								</CardDescription>
							)}
						</CardHeader>
						<CardContent>
							<div className="w-32 h-32 mx-auto">
								<img
									src={icon.urlicona}
									alt={icon.nome}
									className="object-contain w-full h-full"
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<AlertDialog
				open={!!iconToDelete}
				onOpenChange={() => setIconToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
						<AlertDialogDescription>
							Questa azione non può essere annullata. L'icona
							verrà eliminata permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annulla</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								iconToDelete && handleDelete(iconToDelete)
							}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Elimina
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
