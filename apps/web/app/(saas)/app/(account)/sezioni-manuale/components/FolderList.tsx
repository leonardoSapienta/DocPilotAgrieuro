"use client";

import { Button } from "@ui/components/button";
import { useToast } from "@ui/hooks/use-toast";
import { Folder, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FolderListProps {
	folders: Array<{
		id: string;
		name: string;
	}>;
	onDelete: (id: string) => void;
}

export function FolderList({ folders, onDelete }: FolderListProps) {
	const router = useRouter();
	const { toast } = useToast();

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/sections-manual?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok)
				throw new Error("Errore nell'eliminazione della sezione");

			onDelete(id);
			toast({
				title: "Successo",
				description: "Sezione eliminata con successo",
			});
		} catch (error) {
			console.error("Errore:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Impossibile eliminare la sezione",
			});
		}
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{folders.map((folder) => (
				<div
					key={folder.id}
					className="group relative flex items-center gap-4 rounded-lg border p-4 hover:bg-accent"
				>
					<Button
						variant="ghost"
						size="icon"
						className="h-12 w-12"
						onClick={() =>
							router.push(`/app/sezioni-manuale/${folder.id}`)
						}
					>
						<Folder className="h-6 w-6" />
					</Button>
					<div className="flex-1">
						<h3 className="font-medium">{folder.name}</h3>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-2 top-2 opacity-0 group-hover:opacity-100"
						onClick={() => handleDelete(folder.id)}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			))}
		</div>
	);
}
