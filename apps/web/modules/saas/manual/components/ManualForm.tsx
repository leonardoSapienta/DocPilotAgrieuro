"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Dialog, DialogContent, DialogTrigger } from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import { useToast } from "@ui/hooks/use-toast";
import { cn } from "@ui/lib";
import { HelpCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAnalyzeManualMutation } from "../lib/api";
import type { ManualAnalysisResponse } from "../lib/types";

interface Section {
	id: number;
	name: string;
	description: string;
	cards: Array<{
		description: string;
	}>;
}

interface Chapter {
	chapter_info: string;
	restructured_html: string;
	is_empty?: boolean;
}

interface AnalysisResult {
	results: Array<{
		sections: {
			found: Record<string, string>;
			missing: string[];
			non_conformities: string[];
			compliance_score: number;
		};
		images?: Array<{
			url: string;
		}>;
		table_of_contents: string;
	}>;
}

interface ManualFormProps {
	initialData?: {
		name: string;
		version: number;
		contentEn: any;
		images: any[];
		pagesInput: number;
	};
	manualId?: number;
}

const ManualForm = ({ initialData, manualId }: ManualFormProps) => {
	const t = useTranslations();
	const { toast } = useToast();
	const router = useRouter();
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [prompt, setPrompt] = useState("");
	const [manualName, setManualName] = useState(initialData?.name || "");
	const [version, setVersion] = useState(
		initialData?.version?.toString() || "",
	);
	const [selectedSection, setSelectedSection] = useState<number | null>(null);
	const [useExampleManual, setUseExampleManual] = useState(false);
	const analyzeMutation = useAnalyzeManualMutation();
	const [analysisResults, setAnalysisResults] =
		useState<ManualAnalysisResponse | null>(null);
	const [isPolling, setIsPolling] = useState(false);

	const {
		data: sections = [],
		isLoading: isLoadingSections,
		error: sectionsError,
	} = useQuery<Section[]>({
		queryKey: ["sectionsManual"],
		queryFn: async () => {
			try {
				const response = await fetch("/api/sections-manual");
				if (!response.ok) {
					throw new Error("Errore nel recupero delle sezioni");
				}
				const data = await response.json();
				if (!Array.isArray(data)) {
					throw new Error("Formato dati sezioni non valido");
				}
				return data;
			} catch (error) {
				console.error("Errore nel caricamento delle sezioni:", error);
				throw error;
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchOnWindowFocus: false,
		retry: 3, // Riprova 3 volte in caso di errore
	});
	console.log("Sections from query:", sections);
	console.log("Selected section:", selectedSection);

	// Set default section when data is loaded
	useEffect(() => {
		if (sections?.length > 0 && selectedSection === null) {
			const defaultSection = sections[0];
			if (defaultSection?.id) {
				setSelectedSection(defaultSection.id);
			}
		}
	}, [sections, selectedSection]);

	// Gestione errori sezioni
	useEffect(() => {
		if (sectionsError) {
			toast({
				variant: "error",
				title: "Errore",
				description:
					"Errore nel caricamento delle sezioni. Riprova più tardi.",
			});
		}
	}, [sectionsError, toast]);

	// Controlla se siamo nella fase di processing
	useEffect(() => {
		const storedAnalysis = sessionStorage.getItem("manualAnalysisResults");
		if (storedAnalysis) {
			setAnalysisResults(JSON.parse(storedAnalysis));
		}
	}, []);

	// Funzione per verificare se c'è un'analisi in corso
	const checkOngoingAnalysis = () => {
		const lastAnalysisData = sessionStorage.getItem("lastAnalysisData");
		const analysisStartTime = sessionStorage.getItem("analysisStartTime");
		
		if (lastAnalysisData && analysisStartTime) {
			const { timestamp } = JSON.parse(lastAnalysisData);
			const startTime = parseInt(analysisStartTime);
			
			// Se l'analisi è stata avviata negli ultimi 4 ore
			if (Date.now() - startTime < 14400000) {
				return true;
			}
		}
		return false;
	};

	// Funzione per recuperare i risultati dell'analisi
	const recoverAnalysisResults = async () => {
		const lastAnalysisData = sessionStorage.getItem("lastAnalysisData");
		if (lastAnalysisData) {
			const { data } = JSON.parse(lastAnalysisData);
			
			// Verifica che i dati siano nel formato corretto
			if (!data || !data.restructured_content) {
				console.error("Formato dati non valido:", data);
				return false;
			}

			setAnalysisResults({
				status: "success",
				restructured_content: data.restructured_content,
				images: data.images || [],
				metadata: {
					processing_time: 0,
					model_used: "",
					iso_compliance: {
						score: 100,
						non_conformities: []
					}
				},
				total_processed_pages: 0,
				results: [],
				token_usage: {
					prompt_tokens: 0,
					completion_tokens: 0,
					total_tokens: 0,
					estimated_cost: 0
				},
				file_count: 1,
				files: [],
				chapter_titles: data.restructured_content.map((chapter: any) => chapter.chapter_info),
				missing_chapters: [],
				example_manual_used: ""
			});
			
			toast({
				title: "Analisi recuperata",
				description: "I risultati dell'analisi precedente sono stati recuperati",
			});
			return true;
		}
		return false;
	};

	// Effetto per controllare l'analisi in corso al caricamento
	useEffect(() => {
		// Se abbiamo un manualId, significa che siamo nella fase di processing
		if (manualId) {
			// Recupera i dati dal database
			const fetchManualData = async () => {
				try {
					const response = await fetch(`/api/manuals/${manualId}`);
					if (!response.ok) {
						throw new Error("Errore nel recupero dei dati del manuale");
					}
					const data = await response.json();

					// Aggiorna i dati nel sessionStorage
					const analysisData: ManualAnalysisResponse = {
						status: "success" as const,
						restructured_content: data.manual.contentEn,
						images: data.manual.images || [],
						metadata: {
							processing_time: 0,
							model_used: "",
							iso_compliance: {
								score: 100,
								non_conformities: []
							}
						},
						total_processed_pages: 0,
						results: [],
						token_usage: {
							prompt_tokens: 0,
							completion_tokens: 0,
							total_tokens: 0,
							estimated_cost: 0
						},
						file_count: 1,
						files: [],
						chapter_titles: data.manual.contentEn.map((chapter: any) => chapter.chapter_info),
						missing_chapters: [],
						example_manual_used: ""
					};

					setAnalysisResults(analysisData);
					sessionStorage.setItem("manualAnalysisResults", JSON.stringify(analysisData));
					sessionStorage.setItem("analysisCompleted", "true");
				} catch (error) {
					console.error("Errore durante il recupero dei dati:", error);
					toast({
						variant: "error",
						title: "Errore",
						description: "Errore nel recupero dei dati del manuale"
					});
				}
			};

			fetchManualData();
			return;
		}

		const hasOngoingAnalysis = checkOngoingAnalysis();
		if (hasOngoingAnalysis) {
			setIsPolling(true);
			recoverAnalysisResults();
		}
	}, [manualId]);

	// Effetto per il polling dei risultati
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		const isAnalysisCompleted = sessionStorage.getItem("analysisCompleted") === "true";
		if (isPolling && !isAnalysisCompleted) {
			intervalId = setInterval(async () => {
				const manualId = sessionStorage.getItem("currentManualId");
				if (manualId) {
					try {
						const response = await fetch(`/api/manuals/${manualId}`);
						if (response.ok) {
							const data = await response.json();
							if (data.manual.contentEn && data.manual.contentEn.length > 0) {
								const analysisData: ManualAnalysisResponse = {
									status: "success" as const,
									restructured_content: data.manual.contentEn,
									images: data.manual.images || [],
									metadata: {
										processing_time: 0,
										model_used: "",
										iso_compliance: {
											score: 100,
											non_conformities: []
										}
									},
									total_processed_pages: 0,
									results: [],
									token_usage: {
										prompt_tokens: 0,
										completion_tokens: 0,
										total_tokens: 0,
										estimated_cost: 0
									},
									file_count: 1,
									files: [],
									chapter_titles: data.manual.contentEn.map((chapter: any) => chapter.chapter_info),
									missing_chapters: [],
									example_manual_used: ""
								};

								setAnalysisResults(analysisData);
								sessionStorage.setItem("manualAnalysisResults", JSON.stringify(analysisData));
								sessionStorage.setItem("analysisCompleted", "true");
								setIsPolling(false);
								toast({
									title: "Analisi completata",
									description: "L'analisi è stata completata con successo",
								});
							}
						}
					} catch (error) {
						console.error("Errore durante il polling:", error);
					}
				}
			}, 5000);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isPolling, toast]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			const invalidFiles = files.filter(
				(file) =>
					file.type !== "application/pdf" &&
					file.type !==
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
					file.type !== "application/msword" &&
					!file.name.toLowerCase().endsWith(".docx") &&
					!file.name.toLowerCase().endsWith(".doc") &&
					!file.name.toLowerCase().endsWith(".pdf"),
			);
			if (invalidFiles.length > 0) {
				toast({
					variant: "error",
					title: "Errore",
					description:
						"Per favore seleziona solo file PDF, DOC o DOCX",
				});
				return;
			}
			setSelectedFiles((prev) => [...prev, ...files]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Se abbiamo un manualId, significa che siamo nella fase di processing
		if (manualId) {
			// Recupera i dati dal database
			try {
				const response = await fetch(`/api/manuals/${manualId}`);
				if (!response.ok) {
					throw new Error("Errore nel recupero dei dati del manuale");
				}
				const data = await response.json();

				// Aggiorna i dati nel sessionStorage
				const analysisData: ManualAnalysisResponse = {
					status: "success" as const,
					restructured_content: data.manual.contentEn,
					images: data.manual.images || [],
					metadata: {
						processing_time: 0,
						model_used: "",
						iso_compliance: {
							score: 100,
							non_conformities: []
						}
					},
					total_processed_pages: 0,
					results: [],
					token_usage: {
						prompt_tokens: 0,
						completion_tokens: 0,
						total_tokens: 0,
						estimated_cost: 0
					},
					file_count: 1,
					files: [],
					chapter_titles: data.manual.contentEn.map((chapter: any) => chapter.chapter_info),
					missing_chapters: [],
					example_manual_used: ""
				};

				sessionStorage.setItem("manualAnalysisResults", JSON.stringify(analysisData));
				sessionStorage.setItem("analysisCompleted", "true");

				// Naviga alla pagina di processing
				router.push(`/app/manual/processing?manualId=${manualId}`);
			} catch (error) {
				console.error("Errore durante il recupero dei dati:", error);
				toast({
					variant: "error",
					title: "Errore",
					description: "Errore nel recupero dei dati del manuale"
				});
			}
			return;
		}

		if (!manualName) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Per favore inserisci il nome del manuale",
			});
			return;
		}

		if (!version) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Per favore inserisci la versione",
			});
			return;
		}

		if (selectedFiles.length === 0) {
			toast({
				variant: "error",
				title: "Errore",
				description: "Per favore seleziona almeno un file",
			});
			return;
		}

		try {
			setIsPolling(true);
			// 1. Creiamo il manuale nel database
			const selectedSectionData = sections.find(
				(section) => section.id === selectedSection,
			);

			const createResponse = await fetch("/api/manuals", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: manualName,
					version: Number(version),
					contentEn: {},
					images: [],
					pdf: null,
					docx: null,
					exampleManualUrl: useExampleManual ? selectedSectionData?.cards?.[0]?.description : null
				}),
			});

			if (!createResponse.ok) {
				const errorData = await createResponse.json().catch(() => null);
				console.error("Errore nella risposta del server:", {
					status: createResponse.status,
					statusText: createResponse.statusText,
					errorData
				});
				throw new Error(`Errore nella creazione del manuale: ${createResponse.statusText}`);
			}

			const response = await createResponse.json();
			console.log("Risposta completa dal backend:", JSON.stringify(response, null, 2));
			console.log("Contenuto manual:", JSON.stringify(response.manual, null, 2));
			console.log("Tipo di manual:", typeof response.manual);
			console.log("Chiavi di manual:", Object.keys(response.manual));
			console.log("Valore di id:", response.manual?.id);

			// Verifica che la risposta abbia la struttura corretta
			if (!response.success) {
				console.error("Risposta non valida - success è false");
				throw new Error("Errore nella creazione del manuale");
			}

			if (!response.manual) {
				console.error("Risposta non valida - manual è undefined");
				throw new Error("Errore nella creazione del manuale: manuale non trovato");
			}

			// Verifica se l'ID è presente e valido
			if (!response.manual.id) {
				console.error("Risposta non valida - ID mancante:", {
					manual: JSON.stringify(response.manual, null, 2),
					id: response.manual.id,
					idType: typeof response.manual.id,
					keys: Object.keys(response.manual)
				});
				throw new Error("Errore nella creazione del manuale: ID mancante");
			}

			console.log("ID manuale trovato:", response.manual.id);

			// 2. Salviamo l'ID nel sessionStorage
			sessionStorage.setItem("currentManualId", response.manual.id.toString());

			// 3. Eseguiamo l'analisi
			const analyzeParams = {
				file: selectedFiles[0],
				manualName,
				version,
				exampleManualUrl: useExampleManual ? selectedSectionData?.cards?.[0]?.description || "" : "",
				prompt
			};

			console.log("Inizio analisi con parametri:", analyzeParams);

			const analysisResponse = await analyzeMutation.mutateAsync(analyzeParams);
			console.log("Analisi completata:", analysisResponse);

			// 4. Aggiorniamo il manuale con i risultati dell'analisi
			const updateResponse = await fetch(`/api/manuals/${response.manual.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					manual: {
						contentEn: analysisResponse.restructured_content || [],
						images: analysisResponse.images || [],
						pagesInput: analysisResponse.total_processed_pages || 0,
					}
				}),
			});

			if (!updateResponse.ok) {
				throw new Error("Errore nell'aggiornamento del manuale");
			}

			// 5. Salviamo i risultati nel sessionStorage
			sessionStorage.setItem(
				"manualAnalysisResults",
				JSON.stringify(analysisResponse)
			);

			sessionStorage.setItem(
				"manualFormData",
				JSON.stringify({
					manualName,
					version,
					selectedSection,
					prompt
				})
			);

			// 6. Mostriamo il messaggio di successo
			toast({
				title: "Successo",
				description: "Analisi completata con successo",
			});

		} catch (error) {
			console.error("Errore durante l'operazione:", error);
			setIsPolling(false);
			toast({
				variant: "error",
				title: "Errore",
				description: error instanceof Error ? error.message : "Errore durante l'operazione",
			});
		}
	};

	const handleContinue = async () => {
		console.log("handleContinue iniziato");

		// Recupera l'ID del manuale dal sessionStorage
		const currentManualId = sessionStorage.getItem("currentManualId");
		if (!currentManualId) {
			toast({
				variant: "error",
				title: "Errore",
				description: "ID manuale non trovato"
			});
			return;
		}

		try {
			// Recupera i dati dal database
			const response = await fetch(`/api/manuals/${currentManualId}`);
			if (!response.ok) {
				throw new Error("Errore nel recupero dei dati del manuale");
			}
			const data = await response.json();

			// Verifica che contentEn sia un array
			if (!data.manual.contentEn || !Array.isArray(data.manual.contentEn)) {
				console.error("contentEn non è un array:", data.manual.contentEn);
				toast({
					variant: "error",
					title: "Errore",
					description: "Contenuto del manuale non valido. Riprova l'analisi."
				});
				return;
			}

			// Prepara i dati per il processing
			const processingData = {
				manualName: data.manual.name,
				version: data.manual.version,
				sections: data.manual.contentEn.map((chapter: any) => ({
					title: chapter.chapter_info,
					content: chapter.restructured_html || "",
					hasContent: Boolean(
						chapter.restructured_html &&
						chapter.restructured_html.trim() !== "",
					),
					images: data.manual.images || [],
					imageRefs: (data.manual.images || []).map(
						(img: any) => img.name,
					),
					isMissing:
						!chapter.restructured_html ||
						chapter.restructured_html.trim() === "",
					existsInDb: true,
					missing_information: chapter.missing_information || "",
					example_html: chapter.example_html || "",
					chapter_number:
						Number.parseInt(chapter.chapter_number) || 9999,
					error: null,
					is_empty:
						!chapter.restructured_html ||
						chapter.restructured_html.trim() === "",
				})),
				missingSections: data.manual.contentEn
					.filter(
						(chapter: any) =>
							!chapter.restructured_html ||
							chapter.restructured_html.trim() === "",
					)
					.map((chapter: any) => chapter.chapter_info),
				nonConformities: [],
				complianceScore: 100,
				tableOfContents: data.manual.contentEn
					.map((chapter: any) => chapter.chapter_info)
					.join("\n"),
				imageRefs: [],
				processingTime: 0,
			};

			// Salva i dati nel sessionStorage nel formato corretto
			sessionStorage.setItem(
				"manualData",
				JSON.stringify({
					manualId: currentManualId,
					isExistingManual: true,
					selectedTemplateId: data.manual.templateId || null,
					name: data.manual.name,
					version: data.manual.version,
					contentEn: data.manual.contentEn,
					images: data.manual.images || [],
				}),
			);

			sessionStorage.setItem(
				"manualAnalysisData",
				JSON.stringify({
					restructured_content: data.manual.contentEn,
					images: data.manual.images || [],
					metadata: {
						iso_compliance: {
							score: 100,
							non_conformities: [],
						},
						processing_time: 0,
					},
				}),
			);

			sessionStorage.setItem(
				"manualAnalysisResults",
				JSON.stringify(processingData),
			);

			sessionStorage.setItem(
				"manualFormData",
				JSON.stringify({
					manualName: data.manual.name,
					version: data.manual.version,
					sectionId: null,
					exampleManualUrl: "",
				}),
			);

			sessionStorage.setItem(
				"manualImagesData",
				JSON.stringify({
					images: data.manual.images || [],
				}),
			);

			// Naviga alla pagina di processing
			router.push(`/app/manual/processing?manualId=${currentManualId}`);
		} catch (error) {
			console.error("Errore durante il recupero dei dati:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Errore nel recupero dei dati del manuale"
			});
		}
	};

	return (
		<>
			{analyzeMutation.isPending && !manualId && (
				<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-lg font-medium">
							Analisi del manuale in corso...
						</p>
						<p className="text-sm text-muted-foreground">
							Questa operazione potrebbe richiedere alcuni minuti
						</p>
					</div>
				</div>
			)}
			<Card className="p-8 bg-white border-2 border-black/20">
				{!manualId ? (
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="file"
									className="text-lg font-semibold text-black"
								>
									{t("istruzioni-manuale.form.fileLabel")}
									<span className="ml-2 text-sm font-normal text-muted-foreground">
										(Max 1GB per file)
									</span>
								</Label>
								<div className="flex items-center gap-4">
									<Input
										id="file"
										type="file"
										accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
										multiple
										onChange={handleFileChange}
										className="flex-1"
									/>
								</div>
								{selectedFiles.length > 0 && (
									<div className="space-y-2">
										{selectedFiles.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 border rounded"
											>
												<span className="text-sm">
													{file.name}
												</span>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="w-auto bg-black hover:bg-black/90 text-white"
													onClick={() =>
														handleRemoveFile(index)
													}
												>
													Rimuovi
												</Button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label
										htmlFor="prompt"
										className="text-lg font-semibold text-black"
									>
										{t("istruzioni-manuale.form.promptLabel")}
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
											<div className="space-y-2">
												<h4 className="font-medium">
													{t(
														"istruzioni-manuale.form.help.title",
													)}
												</h4>
												<p className="text-sm text-muted-foreground whitespace-pre-line">
													{t(
														"istruzioni-manuale.form.help.content",
													)}
												</p>
											</div>
										</DialogContent>
									</Dialog>
								</div>
								<Textarea
									id="prompt"
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder={t(
										"istruzioni-manuale.form.promptPlaceholder",
									)}
									className={cn(
										"min-h-[120px] bg-white/50 border-2 transition-colors resize-none",
										"hover:border-black/50 focus:border-black",
										prompt ? "border-black" : "border-black/30",
										"whitespace-pre-wrap",
										"p-4",
										"text-base",
										"leading-normal",
										"tracking-normal",
										"focus:outline-none",
										"focus:ring-0",
									)}
									onKeyDown={(e) => {
										if (e.key === " ") {
											e.preventDefault();
											setPrompt((prev) => `${prev} `);
										}
									}}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="manualName"
										className="text-lg font-semibold text-black"
									>
										Nome Manuale
									</Label>
									<Input
										id="manualName"
										value={manualName}
										onChange={(e) =>
											setManualName(e.target.value)
										}
										placeholder="Inserisci il nome del manuale"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="version"
										className="text-lg font-semibold text-black"
									>
										Versione
									</Label>
									<Input
										id="version"
										value={version}
										onChange={(e) => setVersion(e.target.value)}
										placeholder="Inserisci la versione (es. 1.0.0)"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="section"
									className="text-lg font-semibold text-black"
								>
									Sezioni manuale
								</Label>
								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<input
											type="checkbox"
											id="useExampleManual"
											checked={useExampleManual}
											onChange={(e) =>
												setUseExampleManual(
													e.target.checked,
												)
											}
											className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
										/>
										<Label
											htmlFor="useExampleManual"
											className="text-sm"
										>
											Utilizza un manuale di esempio come
											riferimento
										</Label>
									</div>

									{useExampleManual && (
										<Select
											value={selectedSection?.toString() || ""}
											onValueChange={(value) => {
												const sectionId = value ? Number.parseInt(value) : null;
												// Verifica che la sezione esista prima di impostarla
												if (!sectionId || sections.some(s => s.id === sectionId)) {
													setSelectedSection(sectionId);
												} else {
													toast({
														variant: "error",
														title: "Errore",
														description: "Sezione non valida. Per favore seleziona una sezione valida.",
													});
												}
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Seleziona una sezione">
													{isLoadingSections
														? "Caricamento..."
														: selectedSection
															? sections.find(
																	(s) => s.id === selectedSection,
																)?.name || "Sezione non trovata"
															: "Seleziona una sezione"}
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												{isLoadingSections ? (
													<SelectItem value="loading" disabled>
														Caricamento sezioni...
													</SelectItem>
												) : sections.length === 0 ? (
													<SelectItem value="empty" disabled>
														Nessuna sezione disponibile
													</SelectItem>
												) : (
													sections.map((section) => (
														<SelectItem
															key={section.id}
															value={section.id.toString()}
														>
															{section.name}
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
									)}
								</div>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full bg-black hover:bg-black/90 text-white"
							disabled={analyzeMutation.isPending}
						>
							{analyzeMutation.isPending
								? "Analisi in corso..."
								: "Analizza"}
						</Button>

						{analyzeMutation.isSuccess && analyzeMutation.data && (
							<div className="mt-6 space-y-4">
								<Alert className="bg-white border-2">
									<AlertDescription>
										<div className="space-y-6">
											<div className="flex items-center justify-between border-b pb-4">
												<div>
													<h3 className="text-lg font-semibold text-green-600">
														✓ Analisi Completata
													</h3>
													<p className="text-sm text-muted-foreground">
														Manuale: {manualName} -
														Versione: {version}
													</p>
												</div>
											</div>

											{/* Statistiche */}
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
												<div>
													<p className="text-sm text-muted-foreground">
														Sezioni Trovate
													</p>
													<p className="text-lg font-semibold">
														{
															analyzeMutation.data.restructured_content.filter(
																(
																	chapter: Chapter,
																) =>
																	chapter.restructured_html &&
																	chapter.restructured_html.trim() !==
																		"" &&
																	!chapter.is_empty,
															).length
														}
													</p>
												</div>
												<div>
													<p className="text-sm text-muted-foreground">
														Sezioni Mancanti
													</p>
													<p className="text-lg font-semibold">
														{
															analyzeMutation.data.restructured_content.filter(
																(
																	chapter: Chapter,
																) =>
																	!chapter.restructured_html ||
																	chapter.restructured_html.trim() ===
																		"" ||
																	chapter.is_empty,
															).length
														}
													</p>
												</div>
											</div>

											{/* Lista delle sezioni trovate */}
											<div className="space-y-4">
												<h4 className="font-medium text-sm text-gray-700">
													Sezioni Trovate:
												</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
													{analyzeMutation.data.restructured_content
														.filter(
															(chapter: Chapter) =>
																chapter.restructured_html &&
																chapter.restructured_html.trim() !==
																	"" &&
																!chapter.is_empty,
														)
														.map(
															(
																chapter: Chapter,
																index: number,
															) => (
																<div
																	key={index}
																	className="flex items-center gap-2 p-2 bg-green-50 rounded-md"
																>
																	<span className="text-green-600">
																		✓
																	</span>
																	<span className="text-sm">
																		{
																			chapter.chapter_info
																		}
																	</span>
																</div>
															),
														)}
												</div>
											</div>

											{/* Lista delle sezioni mancanti */}
											<div className="space-y-4">
												<h4 className="font-medium text-sm text-gray-700">
													Sezioni Mancanti:
												</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
													{analyzeMutation.data.restructured_content
														.filter(
															(chapter: Chapter) =>
																!chapter.restructured_html ||
																chapter.restructured_html.trim() ===
																	"" ||
																chapter.is_empty,
														)
														.map(
															(
																chapter: Chapter,
																index: number,
															) => (
																<div
																	key={index}
																	className="flex items-center gap-2 p-2 bg-amber-50 rounded-md"
																>
																	<span className="text-amber-600">
																		⚠
																	</span>
																	<span className="text-sm">
																		{
																			chapter.chapter_info
																		}
																	</span>
																</div>
															),
														)}
												</div>
											</div>

											{/* Bottone per procedere */}
											<div className="flex flex-col gap-3 pt-4">
												<Button
													type="button"
													onClick={handleContinue}
													className="w-full bg-black hover:bg-black/90 text-white"
												>
													Procedi al Processing
												</Button>
												<p className="text-sm text-center text-muted-foreground">
													Clicca per procedere alla fase di processing delle sezioni
												</p>
											</div>
										</div>
									</AlertDescription>
								</Alert>
							</div>
						)}
					</form>
				) : (
					<div className="space-y-8">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="file"
									className="text-lg font-semibold text-black"
								>
									{t("istruzioni-manuale.form.fileLabel")}
									<span className="ml-2 text-sm font-normal text-muted-foreground">
										(Max 1GB per file)
									</span>
								</Label>
								<div className="flex items-center gap-4">
									<Input
										id="file"
										type="file"
										accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
										multiple
										onChange={handleFileChange}
										className="flex-1"
									/>
								</div>
								{selectedFiles.length > 0 && (
									<div className="space-y-2">
										{selectedFiles.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 border rounded"
											>
												<span className="text-sm">
													{file.name}
												</span>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="w-auto bg-black hover:bg-black/90 text-white"
													onClick={() =>
														handleRemoveFile(index)
													}
												>
													Rimuovi
												</Button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label
										htmlFor="prompt"
										className="text-lg font-semibold text-black"
									>
										{t("istruzioni-manuale.form.promptLabel")}
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
											<div className="space-y-2">
												<h4 className="font-medium">
													{t(
														"istruzioni-manuale.form.help.title",
													)}
												</h4>
												<p className="text-sm text-muted-foreground whitespace-pre-line">
													{t(
														"istruzioni-manuale.form.help.content",
													)}
												</p>
											</div>
										</DialogContent>
									</Dialog>
								</div>
								<Textarea
									id="prompt"
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder={t(
										"istruzioni-manuale.form.promptPlaceholder",
									)}
									className={cn(
										"min-h-[120px] bg-white/50 border-2 transition-colors resize-none",
										"hover:border-black/50 focus:border-black",
										prompt ? "border-black" : "border-black/30",
										"whitespace-pre-wrap",
										"p-4",
										"text-base",
										"leading-normal",
										"tracking-normal",
										"focus:outline-none",
										"focus:ring-0",
									)}
									onKeyDown={(e) => {
										if (e.key === " ") {
											e.preventDefault();
											setPrompt((prev) => `${prev} `);
										}
									}}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="manualName"
										className="text-lg font-semibold text-black"
									>
										Nome Manuale
									</Label>
									<Input
										id="manualName"
										value={manualName}
										onChange={(e) =>
											setManualName(e.target.value)
										}
										placeholder="Inserisci il nome del manuale"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="version"
										className="text-lg font-semibold text-black"
									>
										Versione
									</Label>
									<Input
										id="version"
										value={version}
										onChange={(e) => setVersion(e.target.value)}
										placeholder="Inserisci la versione (es. 1.0.0)"
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="section"
									className="text-lg font-semibold text-black"
								>
									Sezioni manuale
								</Label>
								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<input
											type="checkbox"
											id="useExampleManual"
											checked={useExampleManual}
											onChange={(e) =>
												setUseExampleManual(
													e.target.checked,
												)
											}
											className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
										/>
										<Label
											htmlFor="useExampleManual"
											className="text-sm"
										>
											Utilizza un manuale di esempio come
											riferimento
										</Label>
									</div>

									{useExampleManual && (
										<Select
											value={selectedSection?.toString() || ""}
											onValueChange={(value) => {
												const sectionId = value ? Number.parseInt(value) : null;
												// Verifica che la sezione esista prima di impostarla
												if (!sectionId || sections.some(s => s.id === sectionId)) {
													setSelectedSection(sectionId);
												} else {
													toast({
														variant: "error",
														title: "Errore",
														description: "Sezione non valida. Per favore seleziona una sezione valida.",
													});
												}
											}}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Seleziona una sezione">
													{isLoadingSections
														? "Caricamento..."
														: selectedSection
															? sections.find(
																	(s) => s.id === selectedSection,
																)?.name || "Sezione non trovata"
															: "Seleziona una sezione"}
												</SelectValue>
											</SelectTrigger>
											<SelectContent>
												{isLoadingSections ? (
													<SelectItem value="loading" disabled>
														Caricamento sezioni...
													</SelectItem>
												) : sections.length === 0 ? (
													<SelectItem value="empty" disabled>
														Nessuna sezione disponibile
													</SelectItem>
												) : (
													sections.map((section) => (
														<SelectItem
															key={section.id}
															value={section.id.toString()}
														>
															{section.name}
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
									)}
								</div>
							</div>
						</div>

						<Button
							type="button"
							onClick={handleContinue}
							className="w-full bg-black hover:bg-black/90 text-white"
						>
							Procedi al Processing
						</Button>
					</div>
				)}
			</Card>
		</>
	);
};

export default ManualForm;
