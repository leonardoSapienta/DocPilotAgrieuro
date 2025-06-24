"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent } from "@ui/components/card";
import TipTapEditor from "@ui/components/editor/TipTapEditor";
import { useToast } from "@ui/hooks/use-toast";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUpdateManualMutation } from "../../lib/api";
import { AddSectionDialog } from "./AddSectionDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EmptyStateSection } from "./EmptyStateSection";
import ImageDialog from "./ImageDialog";
import { SectionSelector } from "./SectionSelector";
import type { Section } from "./types";
import { ExampleContentPanel } from "./ExampleContentPanel";
import { contentLanguageMap } from "../translation";
import { ManualDoubleColumnSection } from "./ManualDoubleColumnSection";
import { ManualDoubleColumnSectionPrint } from "./ManualDoubleColumnSectionPrint";

interface ManualAnalysisResponse {
	restructured_content: Array<{
		chapter_info: string;
		restructured_html: string;
		missing_information?: string;
		example_html?: string;
		chapter_number?: number;
	}>;
	images?: Array<{
		name: string;
		url: string;
	}>;
	token_usage: any;
	metadata: any;
}

export function ProcessingClient() {
	const router = useRouter();
	const { toast } = useToast();
	const [sections, setSections] = useState<Section[]>([]);
	const [selectedSection, setSelectedSection] = useState<string | null>(null);
	const [selectedSectionData, setSelectedSectionData] =
		useState<Section | null>(null);
	const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
	const [isAfterDeletion, setIsAfterDeletion] = useState(false);
	const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
	const [editorKey, setEditorKey] = useState(0);
	const [editorInstance, setEditorInstance] = useState<any>(null);
	const [tokenStats, setTokenStats] = useState<any>(null);
	const [metadata, setMetadata] = useState<any>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [templates, setTemplates] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [manualId, setManualId] = useState<string | null>(null);
	const [isProcessingPhase, setIsProcessingPhase] = useState(true);
	const manualIdRef = useRef<string | null>(null);
	const searchParams = useSearchParams();
	const updateManual = useUpdateManualMutation();
	const [isExamplePanelOpen, setIsExamplePanelOpen] = useState(false);
	const language = searchParams.get("language") || "English";

	// Funzione per caricare i template
	const loadTemplates = async () => {
		try {
			const response = await fetch("/api/templates");
			if (!response.ok) {
				throw new Error("Errore nel caricamento dei template");
			}
			const data = await response.json();
			setTemplates(data);

			// Se c'è un template selezionato nel sessionStorage, lo impostiamo
			const storedData = sessionStorage.getItem("manualData");
			if (storedData) {
				const parsedData = JSON.parse(storedData);
				if (parsedData.selectedTemplateId) {
					setSelectedTemplate(
						parsedData.selectedTemplateId.toString(),
					);
				}
			}
		} catch (error) {
			console.error("Errore nel caricamento dei template:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Errore nel caricamento dei template",
			});
		}
	};

	// Carica i template all'inizializzazione
	useEffect(() => {
		loadTemplates();
	}, []);

	// Funzione per aggiornare l'ID del manuale
	const updateManualId = useCallback((id: string | null) => {
		if (id) {
			setManualId(id);
			manualIdRef.current = id;
			// Salva l'ID nel sessionStorage
			const storedData = sessionStorage.getItem("manualData");
			const parsedData = storedData ? JSON.parse(storedData) : {};
			sessionStorage.setItem(
				"manualData",
				JSON.stringify({
					...parsedData,
					manualId: id,
					isExistingManual: true,
				}),
			);
		}
	}, []);

	useEffect(() => {
		const handleOpenAddSectionDialog = () => setIsAddSectionModalOpen(true);
		document.addEventListener(
			"openAddSectionDialog",
			handleOpenAddSectionDialog,
		);
		return () =>
			document.removeEventListener(
				"openAddSectionDialog",
				handleOpenAddSectionDialog,
			);
	}, []);

	useEffect(() => {
		// Carica i dati dal sessionStorage
		const loadData = async () => {
			try {
				// Ottieni l'ID del manuale dall'URL
				const manualId = searchParams.get("manualId");
				if (!manualId) {
					throw new Error("ID manuale non trovato nell'URL");
				}

				// Ottieni la lingua dall'URL
				const language = searchParams.get("language");
				console.log("=== INIZIO CARICAMENTO DATI ===");
				console.log("ManualId dall'URL:", manualId);
				console.log("Language dall'URL:", language);
				console.log("URL completo:", window.location.href);

				// Salva l'ID del manuale nel sessionStorage
				sessionStorage.setItem("currentManualId", manualId);
				setManualId(manualId); // Imposta l'ID nel componente

				// Se c'è un parametro language nell'URL, FORZA sempre il ricaricamento dal database
				// e pulisci completamente il sessionStorage
				if (language) {
					console.log("🔧 Parametro language presente nell'URL:", language, "- FORZO ricaricamento dal database");
					console.log("🧹 Pulizia completa del sessionStorage");
					sessionStorage.removeItem("manualAnalysisResults");
					sessionStorage.removeItem("manualData");
					sessionStorage.removeItem("selectedLanguage");
					sessionStorage.removeItem("currentManualId");
					console.log("✅ SessionStorage pulito completamente");
					
					// Salva immediatamente la lingua selezionata
					sessionStorage.setItem("selectedLanguage", language);
					console.log("💾 Lingua selezionata salvata nel sessionStorage:", language);
				}

				// Recupera i dati dal sessionStorage (potrebbero essere stati appena puliti)
				const storedAnalysisResults = sessionStorage.getItem("manualAnalysisResults");
				const storedManualData = sessionStorage.getItem("manualData");

				console.log("Dati nel sessionStorage dopo pulizia:");
				console.log("- manualAnalysisResults:", storedAnalysisResults ? "presente" : "assente");
				console.log("- manualData:", storedManualData ? "presente" : "assente");

				// Se c'è un parametro language nell'URL, FORZA sempre il caricamento dal database
				// indipendentemente da cosa c'è nel sessionStorage
				if (language || !storedAnalysisResults || !storedManualData) {
					console.log("Caricamento dal database...");
					
					// Recupera dal database
					const response = await fetch(`/api/manuals/${manualId}`);
					if (!response.ok) {
						throw new Error("Errore nel recupero dei dati del manuale");
					}
					const data = await response.json();
					console.log("Risposta API completa:", data);

					// Verifica la struttura dei dati
					if (!data || !data.manual) {
						console.error("Struttura dati non valida:", data);
						throw new Error("Struttura dati non valida");
					}

					// Determina quale contenuto caricare basandosi sul parametro language nell'URL
					const contentKey = language ? contentLanguageMap[language] : "contentEn";
					const content = data.manual[contentKey];
					
					console.log("=== DEBUG LINGUA DETTAGLIATO ===");
					console.log("Lingua selezionata:", language);
					console.log("Chiave contenuto:", contentKey);
					console.log("Contenuto disponibile:", content);
					console.log("Tipo del contenuto:", typeof content);
					console.log("Lunghezza del contenuto:", content ? content.length : "null/undefined");
					console.log("ContentLanguageMap:", contentLanguageMap);
					console.log("Mappa per la lingua selezionata:", language ? contentLanguageMap[language] : "N/A");
					console.log("Campi disponibili nel manuale:", Object.keys(data.manual));
					
					// Debug dettagliato per ogni lingua
					console.log("=== DEBUG TUTTE LE LINGUE ===");
					console.log("contentEn:", data.manual.contentEn ? data.manual.contentEn.length : "null");
					console.log("contentIt:", data.manual.contentIt ? data.manual.contentIt.length : "null");
					console.log("contentFr:", data.manual.contentFr ? data.manual.contentFr.length : "null");
					console.log("contentDe:", data.manual.contentDe ? data.manual.contentDe.length : "null");
					console.log("contentEs:", data.manual.contentEs ? data.manual.contentEs.length : "null");
					
					// Verifica che la mappa funzioni
					if (language && !contentLanguageMap[language]) {
						console.error("ERRORE: Lingua non trovata nella mappa:", language);
						console.error("Lingue disponibili nella mappa:", Object.keys(contentLanguageMap));
					}

					// Funzione helper per estrarre il contenuto corretto
					const extractContent = (content: any) => {
						if (!content) return null;
						
						// Se è già un array, usalo direttamente
						if (Array.isArray(content)) {
							return content;
						}
						
						// Se è un oggetto con proprietà 'capitoli', usa quella
						if (typeof content === 'object' && content.capitoli && Array.isArray(content.capitoli)) {
							console.log("📦 Contenuto trovato in proprietà 'capitoli' dell'oggetto");
							return content.capitoli;
						}
						
						// Se è un oggetto con proprietà 'chapters', usa quella
						if (typeof content === 'object' && content.chapters && Array.isArray(content.chapters)) {
							console.log("📦 Contenuto trovato in proprietà 'chapters' dell'oggetto");
							return content.chapters;
						}
						
						// Se è un oggetto con proprietà 'sections', usa quella
						if (typeof content === 'object' && content.sections && Array.isArray(content.sections)) {
							console.log("📦 Contenuto trovato in proprietà 'sections' dell'oggetto");
							return content.sections;
						}
						
						return null;
					};

					// Estrai il contenuto corretto
					const extractedContent = extractContent(content);
					
					// Logica per la selezione del contenuto
					let contentToUse;
					if (language && extractedContent && Array.isArray(extractedContent) && extractedContent.length > 0) {
						console.log("✅ Usando contenuto della lingua selezionata:", language);
						
						// Verifica se il contenuto è identico a quello inglese
						const englishContent = extractContent(data.manual.contentEn);
						if (englishContent && Array.isArray(englishContent) && englishContent.length > 0) {
							const isSameAsEnglish = JSON.stringify(extractedContent) === JSON.stringify(englishContent);
							console.log("🔍 Verifica contenuto lingua vs inglese:");
							console.log("  - Contenuto lingua selezionata:", extractedContent.length, "elementi");
							console.log("  - Contenuto inglese:", englishContent.length, "elementi");
							console.log("  - Sono identici?", isSameAsEnglish);
							
							if (isSameAsEnglish) {
								console.log("⚠️ ATTENZIONE: Il contenuto della lingua selezionata è identico a quello inglese!");
								console.log("  Questo potrebbe indicare che la traduzione non è stata ancora completata o salvata.");
								console.log("  Usando comunque il contenuto della lingua selezionata...");
							}
						}
						
						contentToUse = extractedContent;
					} else if (language && (!extractedContent || !Array.isArray(extractedContent) || extractedContent.length === 0)) {
						console.log("⚠️ Contenuto della lingua selezionata non disponibile, usando fallback inglese");
						console.log("Motivo:", !extractedContent ? "null/undefined" : !Array.isArray(extractedContent) ? "non è un array" : "array vuoto");
						contentToUse = extractContent(data.manual.contentEn);
					} else if (!language) {
						console.log("ℹ️ Nessuna lingua specificata, usando inglese");
						contentToUse = extractContent(data.manual.contentEn);
					} else {
						console.log("❌ Fallback generico a inglese");
						contentToUse = extractContent(data.manual.contentEn);
					}
					
					console.log("=== DEBUG CONTENUTO FINALE ===");
					console.log("Contenuto finale da usare:", contentToUse);
					console.log("Tipo contenuto finale:", typeof contentToUse);
					console.log("Lunghezza contenuto finale:", contentToUse ? contentToUse.length : "null/undefined");
					console.log("È il contenuto della lingua selezionata?", contentToUse === content);
					console.log("È il fallback inglese?", contentToUse === data.manual.contentEn);
					
					if (!contentToUse || !Array.isArray(contentToUse) || contentToUse.length === 0) {
						console.error("❌ ERRORE: Nessun contenuto valido trovato");
						console.error("Contenuto finale:", contentToUse);
						throw new Error("Nessun contenuto valido trovato per nessuna lingua");
					}

					// Prepara i dati per il processing
					const processingData = {
						sections: contentToUse.map((chapter: any) => ({
							title: chapter.chapter_info || chapter.title || "Capitolo senza titolo",
							content: chapter.restructured_html || chapter.content || "",
							hasContent: Boolean(chapter.restructured_html && chapter.restructured_html.trim() !== ""),
							images: data.manual.images || [],
							imageRefs: (data.manual.images || []).map((img: any) => img.name),
							isMissing: chapter.is_empty || false,
							existsInDb: true,
							missing_information: chapter.missing_information || "",
							example_html: chapter.example_html || "",
							chapter_number: chapter.chapter_number || 9999,
							error: null,
							is_empty: chapter.is_empty || false,
						})),
						metadata: data.manual.metadata || null,
						tokenStats: data.manual.tokenStats || null
					};

					console.log("=== DATI PROCESSING PREPARATI ===");
					console.log("Numero sezioni:", processingData.sections.length);
					console.log("Prima sezione:", processingData.sections[0]);
					console.log("Lingua salvata nel sessionStorage:", language || "English");

					// Salva i dati nel sessionStorage
					sessionStorage.setItem("manualAnalysisResults", JSON.stringify(processingData));
					sessionStorage.setItem("manualData", JSON.stringify({
						mobileId: manualId,
						selectedTemplateId: data.manual.templateId || "",
						selectedLanguage: language || "English" // Salva anche la lingua selezionata
					}));

					// Imposta i dati
					setSections(processingData.sections);
					setMetadata(processingData.metadata);
					setTokenStats(processingData.tokenStats);
					setSelectedTemplate(data.manual.templateId || "");
					setIsLoading(false);
					
					console.log("=== CARICAMENTO COMPLETATO ===");
					console.log("Sezioni caricate:", processingData.sections.length);
					console.log("Lingua finale:", language || "English");
				} else {
					// Usa i dati dal sessionStorage (solo se non c'è un parametro language nell'URL)
					const analysisData = JSON.parse(storedAnalysisResults);
					const manualData = JSON.parse(storedManualData);
					
					console.log("Dati recuperati dal sessionStorage:", {
						analysis: analysisData,
						mobile: manualData
					});
					
					// Imposta i dati dal sessionStorage
					setSections(analysisData.sections || []);
					setMetadata(analysisData.metadata || null);
					setTokenStats(analysisData.tokenStats || null);
					setSelectedTemplate(manualData.selectedTemplateId || "");
					setIsLoading(false);
				}

			} catch (error) {
				console.error("Errore nel caricamento dei dati:", error);
				toast({
					variant: "error",
					title: "Errore",
					description: "Errore nel caricamento dei dati del manuale"
				});
				setIsLoading(false);
			}
		};

		loadData();
	}, [searchParams, toast]);

	const handleSave = async () => {
		try {
			const currentManualId = manualId || sessionStorage.getItem("currentManualId");
			if (!currentManualId) {
				throw new Error("ID manuale non trovato");
			}
			const storedData = sessionStorage.getItem("manualData");
			const parsedData = storedData ? JSON.parse(storedData) : {};
			const pagesInput = parsedData.pagesInput;
			const language = searchParams.get("language") || parsedData.selectedLanguage || "English";
			const contentKey = contentLanguageMap[language] || "contentEn";

			// Serializza la doppia colonna in cima al content della prima sezione inglese
			let sectionsToSave = sections.map((section, idx) => {
				if (language === "English" && idx === 0) {
					const doubleColHtml = `
						<section style=\"width:100%;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:180px;align-items:flex-start;\">
							<div style=\"width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;\">
								${section.doubleColumnImage ? `<img src='${section.doubleColumnImage}' alt='Immagine' style='max-width:100%;max-height:256px;object-fit:contain;aspect-ratio:4/3;border:1px solid #e5e7eb;border-radius:8px;background:#fff;' />` : ''}
							</div>
							<div style=\"width:100%;\">${section.doubleColumnContent || ''}</div>
						</section>
					`;
					// Rimuovi eventuale doppia colonna già presente (sia con " che con ')
					let originalContent = section.content || '';
					originalContent = originalContent.replace(/<section style=['\"]width:100%;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:180px;align-items:flex-start;['\"][\s\S]*?<\/section>/, '');
					return {
						...section,
						content: doubleColHtml + originalContent,
					};
				}
				return section;
			});

			// Prepara i dati per il salvataggio nella lingua corretta
			const sectionsToSaveForApi = sectionsToSave.map((section) => ({
				chapter_info: section.title,
				restructured_html: section.content || "",
				chapter_number: section.chapter_number || 9999,
				example_html: section.example_html || "",
				missing_information: section.missing_information || "",
				is_empty: !section.content || section.content.trim() === "",
			}));

			let updateData: any;
			if (language === "English") {
				updateData = {
					manual: {
						[contentKey]: sectionsToSaveForApi,
						pagesInput: pagesInput,
					},
				};
			} else {
				updateData = {
					manual: {
						[contentKey]: {
							status: 'success',
							message: 'Traduzione completata con successo',
							capitoli: sectionsToSaveForApi,
							lingua_target: language.toLowerCase()
						},
						pagesInput: pagesInput,
					},
				};
			}

			console.log("Dati da salvare:", updateData);

			// Aggiorna il manuale nel database
			const response = await fetch(`/api/manuals/${currentManualId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("Errore nell'aggiornamento del manuale:", {
					status: response.status,
					statusText: response.statusText,
					errorData,
					requestData: updateData,
				});
				throw new Error(
					`Errore nell'aggiornamento del manuale: ${errorData.message || errorData.error || "Errore sconosciuto"}`,
				);
			}

			console.log("✅ Modifiche salvate con successo nel database");

			// Recupera il template selezionato
			const selectedTemplateData = templates.find(
				(t) => t.id.toString() === selectedTemplate,
			);
			if (!selectedTemplateData) {
				throw new Error("Template non trovato");
			}

			// Prepariamo i dati per la fase di traduzione
			const translationData = {
				status: "success",
				sections: sectionsToSave.map((section) => ({
					title: section.title,
					content: section.content || "",
					hasContent: section.hasContent,
					imageRefs: section.imageRefs || [],
					chapter_number: section.chapter_number || 9999,
				})),
				detected_language: language,
				selectedTemplateId: selectedTemplate,
				mobileId: currentManualId,
				isExistingManual: true,
			};

			// Salviamo i dati nel sessionStorage
			sessionStorage.setItem(
				"manualData",
				JSON.stringify(translationData),
			);
			sessionStorage.setItem(
				"selectedTemplate",
				JSON.stringify(selectedTemplateData),
			);
			sessionStorage.setItem("currentManualId", currentManualId);

			console.log("✅ Dati salvati nel sessionStorage");
			console.log("Reindirizzamento alla pagina di traduzione...");

			// Reindirizziamo alla pagina di traduzione
			router.push(`/app/manual/translations?manualId=${currentManualId}`);
		} catch (error) {
			console.error("Errore durante il salvataggio:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Errore durante il salvataggio del manuale",
			});
		}
	};

	const handleAddSection = (sectionName: string) => {
		const newSection: Section = {
			title: sectionName,
			content: "",
			hasContent: false,
			images: [],
			isMissing: false,
			existsInDb: false,
			isManuallyAdded: true,
		};

		setSections((prev) => [...prev, newSection]);
		setSelectedSection(sectionName);
		setSelectedSectionData(newSection);
	};

	const handleSectionSelect = useCallback(
		(sectionTitle: string) => {
			// Resetta l'editor prima di cambiare sezione
			if (editorInstance) {
				editorInstance.destroy();
				setEditorInstance(null);
			}

			setSelectedSection(sectionTitle);
			setSelectedSectionData(
				sections.find((s) => s.title === sectionTitle) || null,
			);
			setIsAfterDeletion(false);
		},
		[sections, editorInstance],
	);

	const handleDeleteSection = useCallback((sectionTitle: string) => {
		setSectionToDelete(sectionTitle);
		setIsDeleteConfirmOpen(true);
	}, []);

	const confirmDelete = () => {
		if (sectionToDelete) {
			const isCurrentlySelected = selectedSection === sectionToDelete;

			setSections((prev) =>
				prev.filter((s) => s.title !== sectionToDelete),
			);

			if (isCurrentlySelected) {
				setSelectedSection(null);
				setSelectedSectionData(null);
				setIsAfterDeletion(true);
			}

			setIsDeleteConfirmOpen(false);
			setSectionToDelete(null);
		}
	};

	const handleEditorContentChange = async (html: string, editor: any = null) => {
		if (editor) {
			setEditorInstance(editor);
		}

		if (selectedSection) {
			// Mantieni gli stili inline e tutte le classi, rimuovi solo eventuali tag <style> per sicurezza
			const contentWithStyles = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

			// Aggiorna lo stato locale
			setSections((prev) =>
				prev.map((section) =>
					section.title === selectedSection
						? { ...section, content: contentWithStyles, hasContent: !!contentWithStyles }
						: section,
				),
			);

			// Aggiorna sempre il sessionStorage
				const updatedSections = sections.map((section) =>
					section.title === selectedSection
						? { ...section, content: contentWithStyles, hasContent: !!contentWithStyles }
						: section,
				);

				// Aggiorna il sessionStorage con le nuove sezioni
				const storedResults = sessionStorage.getItem("manualAnalysisResults");
				if (storedResults) {
					const parsedResults = JSON.parse(storedResults) as ManualAnalysisResponse[];
					const firstResult = parsedResults[0];

					// Verifica che firstResult e restructured_content esistano
					if (firstResult && Array.isArray(firstResult.restructured_content)) {
						// Aggiorna il contenuto ristrutturato
						firstResult.restructured_content = firstResult.restructured_content.map((chapter) =>
							chapter.chapter_info === selectedSection
								? { ...chapter, restructured_html: contentWithStyles }
								: chapter,
						);

						// Salva i risultati aggiornati
						sessionStorage.setItem("manualAnalysisResults", JSON.stringify(parsedResults));
					}
				}

				// Aggiorna anche manualAnalysisData
				sessionStorage.setItem(
					"manualAnalysisData",
					JSON.stringify({
						...JSON.parse(sessionStorage.getItem("manualAnalysisData") || "{}"),
						sections: updatedSections,
					}),
				);

			// Salva sempre nel database se c'è un manualId
			if (manualId) {
				try {
					const response = await fetch(`/api/manuals/${manualId}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							manual: {
							contentEn: sections.map((section) => ({
								chapter_info: section.title,
								restructured_html: section.title === selectedSection ? contentWithStyles : section.content,
									chapter_number: section.chapter_number || 9999,
									example_html: section.example_html || "",
									missing_information: section.missing_information || "",
									is_empty: !section.content || section.content.trim() === "",
							})),
							},
						}),
					});

					if (!response.ok) {
						throw new Error("Errore nell'aggiornamento del manuale");
					}

					console.log("✅ Modifica salvata nel database per la sezione:", selectedSection);
				} catch (error) {
					console.error("Errore nel salvataggio:", error);
					toast({
						variant: "error",
						title: "Errore",
						description: "Errore durante il salvataggio delle modifiche",
					});
				}
			}
		}
	};

	const handleImageSelect = (imageUrl: string) => {
		if (editorInstance) {
			editorInstance.chain().focus().setImage({ src: imageUrl }).run();
		}
	};

	// Cleanup dell'editor quando il componente viene smontato
	useEffect(() => {
		return () => {
			if (editorInstance) {
				editorInstance.destroy();
			}
		};
	}, [editorInstance]);

	// Funzione di ordinamento delle sezioni
	const sortSections = useCallback((sectionsToSort: Section[]) => {
		return [...sectionsToSort].sort((a, b) => {
			// Estrai il numero dal titolo
			const getNumber = (title: string) => {
				const match = title.match(/^(\d+)[\.\s]/);
				return match ? Number.parseInt(match[1], 10) : 9999;
			};

			const numA = getNumber(a.title);
			const numB = getNumber(b.title);

			// Ordina per numero
			return numA - numB;
		});
	}, []);

	// Aggiorna le sezioni quando cambiano
	useEffect(() => {
		if (sections.length > 0) {
			const sortedSections = sortSections(sections);
			setSections(sortedSections);
		}
	}, [sections.length, sortSections]);

	const handleTemplateChange = (templateId: string) => {
		setSelectedTemplate(templateId);

		// Aggiorna il sessionStorage con il template selezionato
		const storedData = sessionStorage.getItem("manualData");
		if (storedData) {
			const parsedData = JSON.parse(storedData);
			parsedData.selectedTemplateId = templateId;
			sessionStorage.setItem("manualData", JSON.stringify(parsedData));
		}

		// Salva anche il template completo
		const selectedTemplateData = templates.find(
			(t) => t.id.toString() === templateId,
		);
		if (selectedTemplateData) {
			sessionStorage.setItem(
				"selectedTemplate",
				JSON.stringify(selectedTemplateData),
			);
		}
	};

	return (
		<div className="w-full p-2 md:p-4 max-w-[2400px] mx-auto">
			<div className="space-y-4">
				<Card>
					<CardContent className="p-4 sm:p-6">
						<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
							<div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
								<SectionSelector
									sections={sections}
									selectedSection={selectedSection}
									onSelectSection={handleSectionSelect}
									onDeleteSection={handleDeleteSection}
								/>

								<div className="w-full sm:w-64">
									<select
										className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md shadow-sm focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
										value={selectedTemplate}
										onChange={(e) =>
											handleTemplateChange(e.target.value)
										}
									>
										<option value="">
											-- Scegli un Template --
										</option>
										{templates.map((template) => (
											<option
												key={template.id}
												value={template.id}
											>
												{template.name}
											</option>
										))}
									</select>
									{!selectedTemplate && (
										<p className="text-xs text-amber-600 mt-1">
											Seleziona un template per continuare
										</p>
									)}
								</div>
							</div>

							<div className="w-full lg:w-auto flex justify-end mt-3 lg:mt-0">
								<div className="flex items-center gap-3 w-full sm:w-auto">
									<Button
										className="h-10 px-4 flex-1 sm:flex-none"
										onClick={handleSave}
										disabled={!selectedTemplate}
									>
										Analizza Lingue
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						{/* Doppia colonna in stampa SOLO nella prima pagina inglese */}
						{language === "English" && sections[0] && (
							<div className="hidden print:block">
								<ManualDoubleColumnSectionPrint
									image={sections[0]?.images?.[0]?.url}
									content={sections[0]?.doubleColumnContent}
								/>
							</div>
						)}
						{/* Doppia colonna interattiva solo in editor inglese, prima sezione */}
						{language === "English" && selectedSection === sections[0]?.title && false && (
							<ManualDoubleColumnSection
								initialImage={sections[0]?.doubleColumnImage}
								initialContent={sections[0]?.doubleColumnContent}
								onChange={({ image, content }) => {
									setSections((prev) =>
										prev.map((section, idx) =>
											idx === 0
												? {
													...section,
													doubleColumnContent: content,
													doubleColumnImage: image,
												}
												: section
										)
									);
								}}
							/>
						)}
						{selectedSection ? (
							<div>
								{/* Doppia colonna SOLO nella prima sezione inglese */}
								{language === "English" && sections[0]?.title === selectedSection && false && (
									<ManualDoubleColumnSection
										initialImage={sections[0]?.doubleColumnImage}
										initialContent={sections[0]?.doubleColumnContent}
										onChange={({ image, content }) => {
											setSections((prev) =>
												prev.map((section, idx) =>
													idx === 0
														? {
																...section,
																doubleColumnContent: content,
																doubleColumnImage: image,
														  }
														: section
												)
											);
										}}
									/>
								)}
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0">
											{selectedSectionData?.isMissing ? (
												<AlertTriangleIcon className="h-5 w-5 text-red-500" />
											) : selectedSectionData?.hasContent ? (
												<CheckCircleIcon className="h-5 w-5 text-green-500" />
											) : (
												<InfoIcon className="h-5 w-5 text-amber-500" />
											)}
										</div>
										<div>
											<h2 className="text-2xl font-semibold">{selectedSection}</h2>
											<p className="text-gray-500 mt-1">
												{selectedSectionData?.isMissing
													? "Questa sezione è mancante nel documento originale."
													: selectedSectionData?.hasContent
														? "Questa sezione contiene contenuto."
														: "Questa sezione non contiene contenuto."}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{selectedSectionData?.example_html && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => setIsExamplePanelOpen(true)}
												className="flex items-center gap-2"
											>
												<InfoIcon className="h-4 w-4" />
												<span>Mostra Example Manual</span>
											</Button>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteSection(selectedSection)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
										>
											Elimina Sezione
										</Button>
									</div>
								</div>

								{selectedSectionData?.missing_information && (
									<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
										<h3 className="text-sm font-medium text-yellow-800 mb-2">
											Informazioni Mancanti
										</h3>
										<p className="text-sm text-yellow-700">
											{selectedSectionData.missing_information}
										</p>
									</div>
								)}

								<div className="mt-6 min-h-[300px] flex flex-col">
									{selectedSectionData && (
										<div
											key={`editor-container-${selectedSection}`}
										>
											<TipTapEditor
												content={
													selectedSectionData.content ||
													""
												}
												onChange={
													handleEditorContentChange
												}
												onImageAdd={() =>
													setIsImageDialogOpen(true)
												}
												sectionImages={
													selectedSectionData.images ||
													[]
												}
												imageRefs={
													selectedSectionData.imageRefs ||
													[]
												}
												selectedSectionTitle={
													selectedSection
												}
												selectedSectionOriginalContent={
													selectedSectionData.content ||
													""
												}
												exampleContent={
													selectedSectionData.example_html
												}
											/>
										</div>
									)}
								</div>

								{selectedSectionData?.images &&
									selectedSectionData.images.length > 0 && (
										<div className="mt-6">
											<h3 className="text-sm font-medium text-gray-500 mb-3">
												Immagini Associate
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{selectedSectionData.images.map(
													(img, idx) => (
														<div
															key={idx}
															className="border rounded-md overflow-hidden"
														>
															<img
																src={img.url}
																alt={`Immagine ${idx + 1}`}
																className="w-full h-32 object-cover"
															/>
														</div>
													),
												)}
											</div>
										</div>
									)}
							</div>
						) : (
							<EmptyStateSection
								isAfterDeletion={isAfterDeletion}
							/>
						)}
					</CardContent>
				</Card>
			</div>

			<AddSectionDialog
				isOpen={isAddSectionModalOpen}
				onClose={() => setIsAddSectionModalOpen(false)}
				onAddSection={handleAddSection}
				params={{ id: manualId || '' }}
			/>

			<DeleteConfirmDialog
				isOpen={isDeleteConfirmOpen}
				onClose={() => setIsDeleteConfirmOpen(false)}
				onConfirm={confirmDelete}
				sectionName={sectionToDelete}
			/>

			<ImageDialog
				isOpen={isImageDialogOpen}
				onClose={() => setIsImageDialogOpen(false)}
				onImageSelect={handleImageSelect}
				sectionImages={selectedSectionData?.images || []}
				imageRefs={selectedSectionData?.imageRefs || []}
				manualId={manualId || undefined}
			/>

			<ExampleContentPanel
				isOpen={isExamplePanelOpen}
				onClose={() => setIsExamplePanelOpen(false)}
				exampleHtml={selectedSectionData?.example_html}
			/>
		</div>
	);
}
