"use client";

import { PageHeader } from "@saas/shared/components/PageHeader";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { useToast } from "@ui/hooks/use-toast";
import { HelpCircle, Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ManualInstruction {
	id: number;
	file_path: string;
	prompt: string | null;
	createdAt: string;
	updatedAt: string;
}

export default function ManualInstructionsPage() {
	const t = useTranslations();
	const { toast } = useToast();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [prompt, setPrompt] = useState("");
	const [isLocked, setIsLocked] = useState(false);
	const [savedInstruction, setSavedInstruction] =
		useState<ManualInstruction | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Recupera l'ultima istruzione manuale
	useEffect(() => {
		const fetchLastInstruction = async () => {
			try {
				const response = await fetch("/api/manual-instructions/latest");
				if (response.ok) {
					const data = await response.json();
					if (data) {
						setSavedInstruction(data);
						setIsLocked(true);
					}
				}
			} catch (error) {
				console.error("Error fetching last instruction:", error);
			}
		};

		fetchLastInstruction();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (
				file.type !== "application/pdf" &&
				file.type !==
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
				!file.name.toLowerCase().endsWith(".docx")
			) {
				toast({
					variant: "error",
					title: "Errore",
					description: "Per favore seleziona un file PDF o DOCX",
				});
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		const fileInput = document.getElementById("file") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleUnlock = () => {
		setIsLocked(false);
		setSelectedFile(null);
		setPrompt("");
		setSavedInstruction(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isLocked) return;

		try {
			setIsLoading(true);

			if (!selectedFile) {
				toast({
					variant: "error",
					title: "Errore",
					description: "Per favore seleziona un file",
				});
				return;
			}

			if (!prompt || prompt.trim() === "") {
				toast({
					variant: "error",
					title: "Errore",
					description: "Per favore inserisci un prompt",
				});
				return;
			}

			// Debug delle variabili d'ambiente e del prompt
			console.log("Debug del form:", {
				flaskUrl: process.env.NEXT_PUBLIC_SITE_FLASK_PDF_TO_TEXT,
				flaskBase: process.env.NEXT_PUBLIC_SITE_FLASK,
				baseUrl: process.env.NEXT_PUBLIC_SITE_URL,
				prompt: prompt,
				file: selectedFile.name,
			});

			// Invia il PDF al servizio Flask per la conversione in testo
			const flaskFormData = new FormData();
			flaskFormData.append("file", selectedFile);
			flaskFormData.append("prompt", prompt.trim());

			// Usiamo l'URL base di Flask e aggiungiamo il percorso
			const flaskBaseUrl = process.env.NEXT_PUBLIC_SITE_FLASK;
			if (!flaskBaseUrl) {
				toast({
					variant: "error",
					title: "Errore di configurazione",
					description:
						"Il servizio di conversione PDF non è configurato correttamente. Contatta l'amministratore.",
				});
				return;
			}

			const flaskUrl = `${flaskBaseUrl}/flask-api/convert-pdf-to-text`;
			console.log("URL completo del servizio Flask:", flaskUrl);

			try {
				// Debug della richiesta
				console.log("Dati inviati al servizio Flask:", {
					file: selectedFile.name,
					prompt: prompt.trim(),
				});

				const flaskResponse = await fetch(flaskUrl, {
					method: "POST",
					body: flaskFormData,
					headers: {
						Accept: "application/json",
					},
					mode: "cors", // Abilita CORS
				});

				console.log(
					"Risposta dal servizio Flask (status):",
					flaskResponse.status,
				);
				console.log(
					"Risposta dal servizio Flask (headers):",
					flaskResponse.headers,
				);

				if (!flaskResponse.ok) {
					const errorData = await flaskResponse
						.json()
						.catch(() => ({ message: "Errore sconosciuto" }));
					console.error("Dettagli errore Flask:", errorData);
					throw new Error(
						errorData.message ||
							"Errore nella conversione del PDF in testo",
					);
				}

				const flaskData = await flaskResponse.json();
				console.log("Risposta dal servizio Flask (dati):", flaskData);

				// Se la conversione ha successo, salva l'istruzione nel database
				if (flaskData.status === "success") {
					const formData = new FormData();
					formData.append("file", selectedFile);
					formData.append("prompt", prompt.trim());

					const response = await fetch("/api/manual-instructions", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.message ||
								"Errore nel salvataggio dei dati",
						);
					}

					const data = await response.json();
					setSavedInstruction(data);
					setIsLocked(true);

					toast({
						title: "Successo",
						description: "File e prompt salvati con successo",
					});
				} else {
					throw new Error(
						flaskData.message || "Errore nella conversione del PDF",
					);
				}
			} catch (error) {
				if (
					error instanceof TypeError &&
					error.message === "Failed to fetch"
				) {
					toast({
						variant: "error",
						title: "Errore di connessione",
						description:
							"Impossibile connettersi al servizio di conversione PDF. Verifica che il server sia attivo e che non ci siano problemi di rete.",
					});
					return;
				}
				throw error;
			}
		} catch (error) {
			console.error("Error:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Si è verificato un errore durante il salvataggio",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<PageHeader
				title={t("istruzioni-manuale.title")}
				subtitle={t("istruzioni-manuale.description")}
			/>
			<div className="container max-w-6xl py-8">
				<Card>
					<CardHeader>
						<CardTitle>
							{t("istruzioni-manuale.form.title")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="file">
										{t("istruzioni-manuale.form.fileLabel")}
									</Label>
									{isLocked && (
										<Button
											variant="outline"
											size="icon"
											onClick={handleUnlock}
											className="h-8 w-8"
										>
											<Unlock className="h-4 w-4" />
										</Button>
									)}
								</div>
								{isLocked ? (
									<div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
										<Lock className="h-4 w-4" />
										<span className="text-sm">
											{savedInstruction?.file_path}
										</span>
									</div>
								) : (
									<div className="flex items-center gap-4">
										<Input
											id="file"
											type="file"
											accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
											onChange={handleFileChange}
											className="flex-1"
										/>
										{selectedFile && (
											<Button
												type="button"
												variant="outline"
												onClick={handleRemoveFile}
												className="text-red-500 hover:text-red-700"
											>
												Rimuovi
											</Button>
										)}
									</div>
								)}
								{selectedFile && !isLocked && (
									<p className="text-sm text-muted-foreground">
										{t(
											"istruzioni-manuale.form.fileSelected",
											{
												name: selectedFile.name,
											},
										)}
									</p>
								)}
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label
											htmlFor="prompt"
											className="text-lg font-semibold"
										>
											Prompt
										</Label>
										<Dialog>
											<DialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-black hover:text-black/80 hover:bg-black/10 rounded-full"
												>
													<HelpCircle className="h-5 w-5" />
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogTitle>
													Istruzioni per il Prompt
												</DialogTitle>
												<div className="space-y-4">
													<p className="text-sm text-muted-foreground">
														Identifica le seguenti 9
														sezioni obbligatorie:
													</p>
													<ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
														<li>Cover</li>
														<li>
															Panoramica generale
														</li>
														<li>
															Installazione/Configurazione
														</li>
														<li>
															Utilizzo/Operatività
														</li>
														<li>
															Manutenzione/Gestione
														</li>
														<li>
															Risoluzione dei
															problemi
														</li>
														<li>Sicurezza</li>
														<li>Appendici</li>
														<li>Note legali</li>
													</ol>
													<p className="text-sm text-muted-foreground">
														Puoi copiare e incollare
														questo elenco nel campo
														prompt per assicurarti
														che tutte le sezioni
														vengano identificate
														correttamente.
													</p>
												</div>
											</DialogContent>
										</Dialog>
									</div>
									{isLocked ? (
										<div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
											<Lock className="h-4 w-4" />
											<span className="text-sm whitespace-pre-line">
												{savedInstruction?.prompt}
											</span>
										</div>
									) : (
										<Textarea
											id="prompt"
											value={prompt}
											onChange={(e) =>
												setPrompt(e.target.value)
											}
											placeholder="Inserisci il prompt per l'analisi del manuale"
											className="min-h-[120px]"
											disabled={isLocked}
										/>
									)}
								</div>
							</div>

							{!isLocked && (
								<Button
									type="submit"
									disabled={!selectedFile || isLoading}
								>
									{isLoading
										? "Elaborazione in corso..."
										: "Salva"}
								</Button>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
