"use client";

import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { CardDescription } from "@ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { useToast } from "@ui/hooks/use-toast";
import { cn } from "@ui/lib";
import { CheckCircle2, Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Label } from "@ui/components/label";
import { Input } from "@ui/components/input";

interface ManualCardProps {
	name: string;
	contentEn: any;
	contentIt: any;
	contentFr: any;
	contentDe: any;
	contentEs: any;
	createdAt: Date;
	id: number;
	version: number;
	isActive: boolean;
	pdf?: string | null;
	docx?: string | null;
	pdf_it?: string | null;
	pdf_en?: string | null;
	pdf_fr?: string | null;
	pdf_de?: string | null;
	pdf_es?: string | null;
	docx_it?: string | null;
	docx_en?: string | null;
	docx_fr?: string | null;
	docx_de?: string | null;
	docx_es?: string | null;
	creatorName?: string;
}

export function ManualCard({
	name,
	contentEn: initialContentEn,
	contentIt,
	contentFr,
	contentDe,
	contentEs,
	createdAt,
	id,
	version,
	isActive,
	creatorName,
}: ManualCardProps) {
	const [contentEn, setContentEn] = useState(initialContentEn);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreatingNewVersion, setIsCreatingNewVersion] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pollingAttempts, setPollingAttempts] = useState(0);
	const [analysisStatus, setAnalysisStatus] = useState<
		"queued" | "processing" | "completed" | "error"
	>("queued");
	const [manualData, setManualData] = useState<any>(null);
	const router = useRouter();
	const { toast } = useToast();
	const isProcessed = contentEn && Object.keys(contentEn).length > 0;
	const [pollingInterval, setPollingInterval] =
		useState<NodeJS.Timeout | null>(null);
	const [versions, setVersions] = useState<Array<{ id: number; version: number; isActive: boolean; createdAt: string }>>([]);
	const [isLoadingVersions, setIsLoadingVersions] = useState(false);
	const [newVersionNumber, setNewVersionNumber] = useState("");
	const [isNewVersionDialogOpen, setIsNewVersionDialogOpen] = useState(false);
	const [formattedDate, setFormattedDate] = useState<string>("");

	// Costanti per il polling
	const MAX_POLLING_ATTEMPTS = 1440; // 4 ore con intervallo di 10 secondi
	const POLLING_INTERVAL = 10000; // 10 secondi
	const REQUEST_TIMEOUT = 5000; // 5 secondi per ogni richiesta

	// Funzione per controllare lo stato del manuale
	const checkStatus = async () => {
		try {
			const response = await fetch(`/api/manuals/${id}`);
			if (!response.ok)
				throw new Error("Errore nel recupero dello stato");

			const data = await response.json();
			console.log("Stato manuale aggiornato:", data.status);

			if (data.status !== analysisStatus) {
				setAnalysisStatus(data.status);
				if (data.status === "completed") {
					// Ferma il polling quando il manuale è completato
					if (pollingInterval) {
						clearInterval(pollingInterval);
						setPollingInterval(null);
					}
					toast({
						title: "Analisi completata",
						description:
							"Il manuale è stato elaborato con successo",
					});
				}
			}
		} catch (error) {
			console.error("Errore nel controllo dello stato:", error);
			// Ferma il polling in caso di errore
			if (pollingInterval) {
				clearInterval(pollingInterval);
				setPollingInterval(null);
			}
		}
	};

	// Carica i dati del manuale all'avvio
	useEffect(() => {
		const fetchManualData = async () => {
			try {
				const response = await fetch(`/api/manuals/${id}`);
				if (!response.ok)
					throw new Error("Errore nel recupero dei dati");
				const data = await response.json();
				setManualData(data.manual);
			} catch (error) {
				console.error("Errore nel caricamento dei dati:", error);
			}
		};

		fetchManualData();
	}, [id]);

	// Avvia il polling solo se il manuale è in elaborazione
	useEffect(() => {
		if (analysisStatus === "processing") {
			// Controlla immediatamente
			checkStatus();

			// Poi controlla ogni 10 secondi
			const interval = setInterval(checkStatus, 10000);
			setPollingInterval(interval);

			// Cleanup
			return () => {
				if (interval) {
					clearInterval(interval);
				}
			};
		}
	}, [analysisStatus]);

	// Aggiungi questo useEffect per gestire la formattazione della data
	useEffect(() => {
		if (createdAt) {
			setFormattedDate(format(new Date(createdAt), "dd/MM/yyyy", { locale: it }));
		}
	}, [createdAt]);

	const handleDelete = async () => {
		if (
			confirm(
				"Sei sicuro di voler eliminare questo manuale? Questa azione eliminerà anche tutte le immagini associate.",
			)
		) {
			setIsDeleting(true);
			try {
				const response = await fetch(`/api/manuals/${id}`, {
					method: "DELETE",
				});

				if (response.ok) {
					toast({
						title: "Manuale eliminato",
						description:
							"Il manuale e le sue immagini sono state eliminate con successo",
					});
					router.refresh();
				} else {
					const error = await response.text();
					toast({
						variant: "error",
						title: "Errore",
						description:
							error ||
							"Errore durante l'eliminazione del manuale",
					});
				}
			} catch (error) {
				console.error("Errore durante l'eliminazione:", error);
				toast({
					variant: "error",
					title: "Errore",
					description:
						"Si è verificato un errore durante l'eliminazione del manuale",
				});
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleEdit = async () => {
		try {
			setIsLoading(true);

			// Recupera i dati del manuale dal database
			const response = await fetch(`/api/manuals/${id}`);
			if (!response.ok) {
				throw new Error("Errore nel recupero dei dati del manuale");
			}
			const manualData = await response.json();

			// Recupera i template
			const templateResponse = await fetch("/api/templates");
			if (!templateResponse.ok) {
				throw new Error("Errore nel recupero dei template");
			}
			const templates = await templateResponse.json();

			// Prepara i dati per l'analisi
			const analysisResults = {
				restructured_content: manualData.manual.contentEn,
				images: manualData.manual.images || [],
				metadata: {
					iso_compliance: {
						score: 100,
						non_conformities: [],
					},
					processing_time: 0,
				},
			};

			// Prepara i dati per il processing
			const processingData = {
				manualName: manualData.manual.name,
				version: manualData.manual.version,
				sections: manualData.manual.contentEn.map((chapter: any) => ({
					title: chapter.chapter_info,
					content: chapter.restructured_html || "",
					hasContent: Boolean(
						chapter.restructured_html &&
							chapter.restructured_html.trim() !== "",
					),
					images: manualData.manual.images || [],
					imageRefs: (manualData.manual.images || []).map(
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
				missingSections: manualData.manual.contentEn
					.filter(
						(chapter: any) =>
							!chapter.restructured_html ||
							chapter.restructured_html.trim() === "",
					)
					.map((chapter: any) => chapter.chapter_info),
				nonConformities: [],
				complianceScore: 100,
				tableOfContents: manualData.manual.contentEn
					.map((chapter: any) => chapter.chapter_info)
					.join("\n"),
				imageRefs: [],
				processingTime: 0,
			};

			// Salva i dati nel sessionStorage nel formato corretto
			sessionStorage.setItem(
				"manualData",
				JSON.stringify({
					manualId: id.toString(),
					isExistingManual: true,
					selectedTemplateId: manualData.manual.templateId || null,
					name: manualData.manual.name,
					version: manualData.manual.version,
					contentEn: manualData.manual.contentEn,
					images: manualData.manual.images || [],
				}),
			);

			sessionStorage.setItem(
				"manualAnalysisData",
				JSON.stringify(analysisResults),
			);
			sessionStorage.setItem(
				"manualAnalysisResults",
				JSON.stringify(processingData),
			);
			sessionStorage.setItem(
				"manualFormData",
				JSON.stringify({
					manualName: manualData.manual.name,
					version: manualData.manual.version,
					sectionId: null,
					exampleManualUrl: "",
				}),
			);
			sessionStorage.setItem(
				"manualImagesData",
				JSON.stringify({
					images: manualData.manual.images || [],
				}),
			);

			// Reindirizza alla pagina di processing
			router.push(`/app/manual/processing?manualId=${id}`);
		} catch (error) {
			console.error("Errore durante la modifica:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					"Si è verificato un errore durante la modifica del manuale",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Funzione per scaricare un PDF
	const handleDownload = (url: string, filename: string) => {
		window.open(url, "_blank");
	};

	// Funzione per ottenere le opzioni di download disponibili
	const getDownloadOptions = () => {
		const options = [];

		// Aggiungi opzione PDF se disponibile
		if (manualData?.pdf) {
			options.push({
				label: "PDF",
				onClick: () =>
					handleDownload(manualData.pdf, `${name}_v${version}.pdf`),
			});
		}

		// Aggiungi opzione DOCX se disponibile
		if (manualData?.docx) {
			options.push({
				label: "DOCX",
				onClick: () =>
					handleDownload(manualData.docx, `${name}_v${version}.docx`),
			});
		}

		// Aggiungi opzioni per le singole lingue se disponibili
		if (manualData?.pdf_it) {
			options.push({
				label: "PDF Italiano",
				onClick: () =>
					handleDownload(
						manualData.pdf_it,
						`${name}_v${version}_it.pdf`,
					),
			});
		}
		if (manualData?.docx_it) {
			options.push({
				label: "DOCX Italiano",
				onClick: () =>
					handleDownload(
						manualData.docx_it,
						`${name}_v${version}_it.docx`,
					),
			});
		}
		if (manualData?.pdf_en) {
			options.push({
				label: "PDF Inglese",
				onClick: () =>
					handleDownload(
						manualData.pdf_en,
						`${name}_v${version}_en.pdf`,
					),
			});
		}
		if (manualData?.docx_en) {
			options.push({
				label: "DOCX Inglese",
				onClick: () =>
					handleDownload(
						manualData.docx_en,
						`${name}_v${version}_en.docx`,
					),
			});
		}
		if (manualData?.pdf_fr) {
			options.push({
				label: "PDF Francese",
				onClick: () =>
					handleDownload(
						manualData.pdf_fr,
						`${name}_v${version}_fr.pdf`,
					),
			});
		}
		if (manualData?.docx_fr) {
			options.push({
				label: "DOCX Francese",
				onClick: () =>
					handleDownload(
						manualData.docx_fr,
						`${name}_v${version}_fr.docx`,
					),
			});
		}
		if (manualData?.pdf_de) {
			options.push({
				label: "PDF Tedesco",
				onClick: () =>
					handleDownload(
						manualData.pdf_de,
						`${name}_v${version}_de.pdf`,
					),
			});
		}
		if (manualData?.docx_de) {
			options.push({
				label: "DOCX Tedesco",
				onClick: () =>
					handleDownload(
						manualData.docx_de,
						`${name}_v${version}_de.docx`,
					),
			});
		}
		if (manualData?.pdf_es) {
			options.push({
				label: "PDF Spagnolo",
				onClick: () =>
					handleDownload(
						manualData.pdf_es,
						`${name}_v${version}_es.pdf`,
					),
			});
		}
		if (manualData?.docx_es) {
			options.push({
				label: "DOCX Spagnolo",
				onClick: () =>
					handleDownload(
						manualData.docx_es,
						`${name}_v${version}_es.docx`,
					),
			});
		}

		return options;
	};

	const handleCreateNewVersion = async () => {
		try {
			setIsCreatingNewVersion(true);
			const response = await fetch(`/api/manuals/${id}/new-version`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					version: Number(newVersionNumber)
				}),
			});

			if (!response.ok) {
				throw new Error("Errore nella creazione della nuova versione");
			}

			const data = await response.json();
			toast({
				title: "Nuova versione creata",
				description: `La versione ${data.manual.version} è stata creata con successo`,
			});
			setIsNewVersionDialogOpen(false);
			setNewVersionNumber("");
			router.refresh();
		} catch (error) {
			console.error("Errore durante la creazione della nuova versione:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Si è verificato un errore durante la creazione della nuova versione",
			});
		} finally {
			setIsCreatingNewVersion(false);
		}
	};

	// Carica le versioni del manuale
	const loadVersions = async () => {
		try {
			setIsLoadingVersions(true);
			const response = await fetch(`/api/manuals/${id}/versions`);
			if (!response.ok) throw new Error("Errore nel recupero delle versioni");
			const data = await response.json();
			console.log("Versioni ricevute:", data.versions); // Debug log
			setVersions(data.versions);
		} catch (error) {
			console.error("Errore nel caricamento delle versioni:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Errore nel caricamento delle versioni",
			});
		} finally {
			setIsLoadingVersions(false);
		}
	};

	// Cambia la versione attiva
	const handleVersionChange = async (versionId: number) => {
		try {
			const response = await fetch(`/api/manuals/${versionId}/set-active`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					oldActiveId: id // Invia l'ID della versione attiva corrente
				})
			});

			if (!response.ok) {
				throw new Error("Errore nel cambio versione");
			}

			toast({
				title: "Versione aggiornata",
				description: "La versione attiva è stata aggiornata con successo",
			});
			router.refresh();
		} catch (error) {
			console.error("Errore durante il cambio versione:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Si è verificato un errore durante il cambio versione",
			});
		}
	};

	// Funzione per determinare le lingue disponibili
	const getAvailableLanguages = () => {
		const languages = [];
		
		// Verifica se il contenuto esiste e ha sezioni
		const hasContent = (content: any) => {
			if (!content) return false;
			if (Array.isArray(content) && content.length > 0) return true;
			if (typeof content === 'object' && content.capitoli && Array.isArray(content.capitoli) && content.capitoli.length > 0) return true;
			return false;
		};

		if (hasContent(contentEn)) {
			languages.push({ code: 'English', label: 'Inglese', content: contentEn });
		}
		if (hasContent(contentIt)) {
			languages.push({ code: 'Italian', label: 'Italiano', content: contentIt });
		}
		if (hasContent(contentFr)) {
			languages.push({ code: 'French', label: 'Francese', content: contentFr });
		}
		if (hasContent(contentDe)) {
			languages.push({ code: 'German', label: 'Tedesco', content: contentDe });
		}
		if (hasContent(contentEs)) {
			languages.push({ code: 'Spanish', label: 'Spagnolo', content: contentEs });
		}

		return languages;
	};

	// Funzione per gestire la selezione della lingua
	const handleLanguageSelect = async (language: { code: string; label: string; content: any }) => {
		try {
			setIsLoading(true);

			// Recupera i dati del manuale dal database
			const response = await fetch(`/api/manuals/${id}`);
			if (!response.ok) {
				throw new Error("Errore nel recupero dei dati del manuale");
			}
			const manualData = await response.json();

			// Recupera i template
			const templateResponse = await fetch("/api/templates");
			if (!templateResponse.ok) {
				throw new Error("Errore nel recupero dei template");
			}
			const templates = await templateResponse.json();

			// Funzione helper per estrarre il contenuto corretto
			const extractContent = (content: any) => {
				if (!content) return null;
				
				// Se è già un array, usalo direttamente
				if (Array.isArray(content)) {
					return content;
				}
				
				// Se è un oggetto con proprietà 'capitoli', usa quella
				if (typeof content === 'object' && content.capitoli && Array.isArray(content.capitoli)) {
					return content.capitoli;
				}
				
				// Se è un oggetto con proprietà 'chapters', usa quella
				if (typeof content === 'object' && content.chapters && Array.isArray(content.chapters)) {
					return content.chapters;
				}
				
				// Se è un oggetto con proprietà 'sections', usa quella
				if (typeof content === 'object' && content.sections && Array.isArray(content.sections)) {
					return content.sections;
				}
				
				return null;
			};

			// Estrai il contenuto della lingua selezionata
			const extractedContent = extractContent(language.content);
			
			if (!extractedContent || !Array.isArray(extractedContent) || extractedContent.length === 0) {
				throw new Error(`Nessun contenuto valido trovato per la lingua ${language.label}`);
			}

			// Prepara i dati per l'analisi
			const analysisResults = {
				restructured_content: extractedContent,
				images: manualData.manual.images || [],
				metadata: {
					iso_compliance: {
						score: 100,
						non_conformities: [],
					},
					processing_time: 0,
				},
			};

			// Prepara i dati per il processing
			const processingData = {
				manualName: manualData.manual.name,
				version: manualData.manual.version,
				sections: extractedContent.map((chapter: any) => ({
					title: chapter.chapter_info || chapter.title || "Capitolo senza titolo",
					content: chapter.restructured_html || chapter.content || "",
					hasContent: Boolean(
						chapter.restructured_html &&
							chapter.restructured_html.trim() !== "",
					),
					images: manualData.manual.images || [],
					imageRefs: (manualData.manual.images || []).map(
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
				missingSections: extractedContent
					.filter(
						(chapter: any) =>
							!chapter.restructured_html ||
							chapter.restructured_html.trim() === "",
					)
					.map((chapter: any) => chapter.chapter_info || chapter.title),
				nonConformities: [],
				complianceScore: 100,
				tableOfContents: extractedContent
					.map((chapter: any) => chapter.chapter_info || chapter.title)
					.join("\n"),
				imageRefs: [],
				processingTime: 0,
			};

			// Salva i dati nel sessionStorage nel formato corretto
			sessionStorage.setItem(
				"manualData",
				JSON.stringify({
					manualId: id.toString(),
					isExistingManual: true,
					selectedTemplateId: manualData.manual.templateId || null,
					name: manualData.manual.name,
					version: manualData.manual.version,
					contentEn: manualData.manual.contentEn,
					images: manualData.manual.images || [],
					selectedLanguage: language.code,
				}),
			);

			sessionStorage.setItem(
				"manualAnalysisData",
				JSON.stringify(analysisResults),
			);
			sessionStorage.setItem(
				"manualAnalysisResults",
				JSON.stringify(processingData),
			);
			sessionStorage.setItem(
				"manualFormData",
				JSON.stringify({
					manualName: manualData.manual.name,
					version: manualData.manual.version,
					sectionId: null,
					exampleManualUrl: "",
				}),
			);
			sessionStorage.setItem(
				"manualImagesData",
				JSON.stringify({
					images: manualData.manual.images || [],
				}),
			);

			// Reindirizza alla pagina di processing con la lingua selezionata
			router.push(`/app/manual/processing?manualId=${id}&language=${language.code}`);
		} catch (error) {
			console.error("Errore durante la modifica:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					"Si è verificato un errore durante la modifica del manuale",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className={cn("relative", !isActive && "opacity-50")}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-lg">{name}</CardTitle>
						<CardDescription>
							Versione {version} - {formattedDate}
							{creatorName && (
								<>
									<br />
									Creato da: {creatorName}
								</>
							)}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<DropdownMenu onOpenChange={(open) => open && loadVersions()}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 px-2"
								>
									<Badge>v{version}</Badge>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent 
								align="end" 
								className="w-[200px]"
							>
								{isLoadingVersions ? (
									<div className="p-2 text-sm text-muted-foreground">
										Caricamento versioni...
									</div>
								) : versions.length > 0 ? (
									versions.map((v) => (
										<DropdownMenuItem
											key={v.id}
											onClick={() => handleVersionChange(v.id)}
											className={cn(
												"cursor-pointer",
												v.isActive && "bg-accent"
											)}
										>
											v{v.version} - {format(new Date(v.createdAt), "dd/MM/yyyy", { locale: it })}
										</DropdownMenuItem>
									))
								) : (
									<div className="p-2 text-sm text-muted-foreground">
										Nessuna altra versione disponibile
									</div>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsNewVersionDialogOpen(true)}
							disabled={isCreatingNewVersion}
							className="h-6 px-2"
						>
							<Plus className="h-4 w-4 mr-1" />
							Nuova versione
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-4">
					{isProcessed ? (
						<div className="flex items-center gap-2 text-green-600">
							<CheckCircle2 className="h-5 w-5" />
							<span>Elaborato</span>
						</div>
					) : (
						<div className="flex items-center gap-2 text-yellow-600">
							<Loader2 className="h-5 w-5 animate-spin" />
							<span>In elaborazione...</span>
						</div>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
								>
									<Download className="mr-2 h-4 w-4" />
									Scarica
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-[200px]"
							>
								{getDownloadOptions().map((option, index) => (
									<DropdownMenuItem
										key={index}
										onClick={option.onClick}
										className="cursor-pointer"
									>
										{option.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									disabled={isLoading}
									className="w-full"
								>
									<Pencil className="mr-2 h-4 w-4" />
									Modifica
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-[200px]"
							>
								{getAvailableLanguages().map((language, index) => (
									<DropdownMenuItem
										key={index}
										onClick={() => handleLanguageSelect(language)}
										className="cursor-pointer"
									>
										{language.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<Button
							variant="outline"
							size="sm"
							onClick={handleDelete}
							disabled={isDeleting}
							className="w-full"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Elimina
						</Button>
					</div>
				</div>
			</CardContent>
			<Dialog open={isNewVersionDialogOpen} onOpenChange={setIsNewVersionDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Nuova versione</DialogTitle>
						<DialogDescription>
							Inserisci il numero della nuova versione
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="version">Numero versione</Label>
							<Input
								id="version"
								type="number"
								step="0.1"
								value={newVersionNumber}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVersionNumber(e.target.value)}
								placeholder="es. 1.1"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsNewVersionDialogOpen(false)}>
							Annulla
						</Button>
						<Button onClick={handleCreateNewVersion} disabled={!newVersionNumber || isCreatingNewVersion}>
							{isCreatingNewVersion ? "Creazione..." : "Crea"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
