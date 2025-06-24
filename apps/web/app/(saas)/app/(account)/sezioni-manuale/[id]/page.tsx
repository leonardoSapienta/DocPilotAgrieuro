"use client";

import { PageHeader } from "@saas/shared/components/PageHeader";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useToast } from "@ui/hooks/use-toast";
import { ArrowLeft, Loader2, Lock, LockOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SectionCard {
	id: number;
	title: string;
	description: string;
	createdAt: string;
}

export default function SectionPage() {
	const t = useTranslations();
	const { toast } = useToast();
	const router = useRouter();
	const params = useParams();
	const [sectionName, setSectionName] = useState("");
	const [manualName, setManualName] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [existingCard, setExistingCard] = useState<SectionCard | null>(null);
	const [isLocked, setIsLocked] = useState(true);

	useEffect(() => {
		if (params?.id) {
			fetchSectionData();
		}
	}, [params?.id]);

	const fetchSectionData = async () => {
		try {
			// Fetch section data
			console.log("Fetching section data...");
			const response = await fetch(`/api/sections-manual/${params.id}`);
			if (!response.ok)
				throw new Error(
					"Errore nel caricamento dei dati della sezione",
				);
			const data = await response.json();
			setSectionName(data.name);
			console.log("Section data loaded:", data);

			// Fetch cards data
			console.log("Fetching cards data...");
			const cardsResponse = await fetch(
				`/api/sections-manual/${params.id}/cards`,
			);
			if (!cardsResponse.ok)
				throw new Error("Errore nel caricamento delle cards");
			const cardsData = await cardsResponse.json();
			console.log("Cards data loaded:", cardsData);

			if (cardsData && cardsData.length > 0) {
				console.log("Found existing card:", cardsData[0]);
				setExistingCard(cardsData[0]);
				setManualName(cardsData[0].title);
				setIsLocked(true);
			} else {
				console.log("No existing cards found");
				setIsLocked(false);
			}
		} catch (error) {
			console.error("Errore completo:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Impossibile caricare i dati",
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (
				file.type === "application/pdf" ||
				file.type ===
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
				file.name.toLowerCase().endsWith(".docx")
			) {
				setSelectedFile(file);
			} else {
				toast({
					variant: "error",
					title: "Errore",
					description: "Per favore seleziona un file PDF o DOCX",
				});
			}
		}
	};

	const toggleLock = () => {
		setIsLocked(!isLocked);
		if (!isLocked) {
			// Se stiamo bloccando, ripristiniamo i dati originali
			if (existingCard) {
				setManualName(existingCard.title);
			}
			setSelectedFile(null);
		}
	};

	const saveCard = async (filePath: string) => {
		try {
			const cardData = {
				title: manualName,
				description: `${process.env.NEXT_PUBLIC_SITE_FLASK}/${filePath}`,
			};

			const response = await fetch(
				`/api/sections-manual/${params.id}/cards`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(cardData),
				},
			);

			if (!response.ok) {
				throw new Error("Errore nel salvataggio della card");
			}

			// Aggiorna i dati dopo il salvataggio
			await fetchSectionData();

			toast({
				title: "Successo",
				description: "Card creata con successo",
			});
		} catch (error) {
			console.error("Errore nel salvataggio della card:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Impossibile salvare la card",
			});
		}
	};

	const handleSave = async () => {
		if (!manualName.trim()) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Il nome del manuale è obbligatorio",
			});
			return;
		}

		if (!selectedFile && !isLocked) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Per favore seleziona un file PDF o DOCX",
			});
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("file", selectedFile!);
			formData.append("filename", manualName);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SITE_FLASK}/api/estrai-sezione`,
				{
					method: "POST",
					body: formData,
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || "Errore nel salvataggio del manuale",
				);
			}

			// Usiamo il nome del manuale inserito nel form e aggiungiamo solo .md
			const manualUrl = `${manualName}.md`;

			// Se l'upload è riuscito, salva la card con l'URL del manuale
			await saveCard(manualUrl);

			setManualName("");
			setSelectedFile(null);
			setIsLocked(true);
			toast({
				title: "Successo",
				description: "Manuale e card salvati con successo",
			});
		} catch (error) {
			console.error("Errore completo:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Impossibile salvare il manuale",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<PageHeader
				title={sectionName}
				subtitle="Gestione delle card della sezione"
			/>
			<div className="container mx-auto py-8">
				<div className="mb-4">
					<Button
						variant="ghost"
						onClick={() => router.push("/app/sezioni-manuale")}
						className="gap-2"
						disabled={isLoading}
					>
						<ArrowLeft className="h-4 w-4" />
						Torna indietro
					</Button>
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Manuale
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 p-0.5"
								onClick={toggleLock}
								disabled={isLoading}
							>
								{isLocked ? (
									<Lock className="h-4 w-4 text-yellow-500" />
								) : (
									<LockOpen className="h-4 w-4 text-green-500" />
								)}
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="manualName">Nome Manuale</Label>
								<Input
									id="manualName"
									value={manualName}
									onChange={(e) =>
										setManualName(e.target.value)
									}
									placeholder="Inserisci il nome del manuale"
									disabled={isLoading || isLocked}
								/>
							</div>
							{isLocked && existingCard ? (
								<div className="mt-4">
									<Label>Card esistente</Label>
									<div className="mt-2 p-4 border rounded-lg">
										<p className="font-medium">
											{existingCard.title}
										</p>
										<p className="text-sm text-muted-foreground">
											Caricata il:{" "}
											{new Date(
												existingCard.createdAt,
											).toLocaleDateString("it-IT", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
							) : (
								<div className="grid gap-2">
									<Label htmlFor="pdf">File PDF o DOCX</Label>
									<div className="flex items-center gap-2">
										<Input
											id="pdf"
											type="file"
											accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
											onChange={handleFileChange}
											disabled={isLoading}
										/>
										{selectedFile && (
											<span className="text-sm text-muted-foreground">
												{selectedFile.name}
											</span>
										)}
									</div>
								</div>
							)}
							<Button
								onClick={handleSave}
								className="w-full"
								disabled={
									!manualName.trim() ||
									(!selectedFile && !isLocked) ||
									isLoading
								}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Caricamento in corso...
									</>
								) : (
									"Salva"
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
