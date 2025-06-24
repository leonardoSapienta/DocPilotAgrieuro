"use client";

import { PageHeader } from "@saas/shared/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useToast } from "@ui/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { FolderList } from "./components/FolderList";

export default function SezioniManualePage() {
	const t = useTranslations();
	const { toast } = useToast();
	const [folders, setFolders] = useState<Array<{ id: string; name: string }>>(
		[],
	);

	useEffect(() => {
		fetchSections();
	}, []);

	const fetchSections = async () => {
		try {
			const response = await fetch("/api/sections-manual");
			if (!response.ok)
				throw new Error("Errore nel caricamento delle sezioni");
			const data = await response.json();
			setFolders(data);
		} catch (error) {
			console.error("Errore:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Impossibile caricare le sezioni",
			});
		}
	};

	const handleFolderCreated = async (folderName: string) => {
		try {
			const response = await fetch("/api/sections-manual", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: folderName }),
			});

			if (!response.ok)
				throw new Error("Errore nel salvataggio della sezione");

			const data = await response.json();
			setFolders((prev) => [...prev, data]);
			toast({
				title: "Successo",
				description: "Sezione creata con successo",
			});
		} catch (error) {
			console.error("Errore:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Impossibile creare la sezione",
			});
		}
	};

	const handleFolderDeleted = (id: string) => {
		setFolders((prev) => prev.filter((folder) => folder.id !== id));
	};

	return (
		<>
			<PageHeader
				title="Sezioni Manuale"
				subtitle="Gestione e organizzazione delle sezioni del manuale"
			/>
			<div className="container mx-auto py-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Gestione Sezioni</CardTitle>
						<CreateFolderDialog
							onFolderCreated={handleFolderCreated}
						/>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<FolderList
								folders={folders}
								onDelete={handleFolderDeleted}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
