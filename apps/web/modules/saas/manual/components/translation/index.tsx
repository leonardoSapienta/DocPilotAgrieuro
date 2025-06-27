"use client";
import { Button } from "@ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Progress } from "@ui/components/progress";
import { useToast } from "@ui/hooks/use-toast";
import {
	Download,
	FileDown,
	FileText,
	Languages,
	Loader2,
	RefreshCw,
	ArrowLeft,
	Edit,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslations } from "next-intl";

// Mappa le lingue ai codici del database per i campi content
export const contentLanguageMap: Record<string, string> = {
	'Italian': 'contentIt',
	'English': 'contentEn',
	'French': 'contentFr',
	'German': 'contentDe',
	'Spanish': 'contentEs'
} as const;

// Utility per verificare e formattare correttamente immagini base64
function formatBase64Image(base64String: string): string {
	if (!base64String) {
		return "";
	}

	// Se già ha un prefisso data:image o è un URL http, restituisci così com'è
	if (
		base64String.startsWith("data:image") ||
		base64String.startsWith("http")
	) {
		return base64String;
	}

	// Controlla se è un valido base64
	try {
		// Test di validità base64
		const testString = base64String.substring(0, 10);
		atob(testString);

		// Determina il tipo di immagine se possibile
		// Il check dei primi bytes potrebbe aiutare a determinare il formato
		// ma per semplicità assumiamo che possa essere png, jpeg o svg

		// In caso di dubbio, usiamo jpeg che è più comune
		return `data:image/jpeg;base64,${base64String}`;
	} catch (e) {
		console.error("Stringa non valida come base64:", e);
		return "";
	}
}

// Funzione più avanzata per visualizzare un'immagine base64 con fallback
function createImageWithFallback(
	base64String: string,
	altText: string,
	className: string,
): string {
	if (!base64String) {
		return "";
	}

	// Log di debug per tracciare la lunghezza della stringa base64
	console.log(
		`Creazione immagine ${className} - Lunghezza stringa: ${base64String.length} caratteri`,
	);

	// Verifica se già contiene un prefisso data: o è un URL
	if (
		base64String.startsWith("data:image") ||
		base64String.startsWith("http")
	) {
		// Stringa già formattata, ritorniamo l'immagine con strategia di fallback
		const prefixedSrc = base64String;
		return createMultiStrategyImage(prefixedSrc, altText, className);
	}

	// Per immagini senza prefisso, crea una strategia multi-formato
	return createMultiFormatImageFallback(base64String, altText, className);
}

// Nuova funzione per creare una strategia multipla di rendering per la stessa immagine
function createMultiStrategyImage(
	src: string,
	altText: string,
	className: string,
): string {
	// Strategia 1: Immagine standard
	const imgTag = `<img src="${src}" alt="${altText}" class="${className}" style="display:block" 
		onerror="console.error('Errore caricamento IMG ${className}'); this.style.display='none'; document.getElementById('${className}-object').style.display='block';" 
		onload="console.log('Immagine ${className} caricata come IMG'); this.style.display='block'; document.getElementById('${className}-object').style.display='none';">`;

	// Strategia 2: Object tag (spesso più compatibile con PDF)
	const objectTag = `<object id="${className}-object" data="${src}" type="image/svg+xml" class="${className}" style="display:none" 
		onload="console.log('Object ${className} caricato');" 
		onerror="console.error('Errore caricamento OBJECT ${className}');">
		${altText}
	</object>`;

	// Wrapper con entrambe le strategie
	return `<div class="${className}-multi-strategy">${imgTag}${objectTag}</div>`;
}

// Nuova funzione specializzata per testare diversi formati di immagine
function createMultiFormatImageFallback(
	base64String: string,
	altText: string,
	className: string,
): string {
	// Tenta diversi formati di immagine (png, jpeg, gif, svg)
	const formats = ["jpeg", "png", "gif", "svg+xml"];

	// Container con ID per poter essere referenziato successivamente
	const containerId = `${className}-container-${Math.random().toString(36).substring(2, 9)}`;

	// Script per provare formati in sequenza e applicare quello che funziona
	const fallbackScript = `
	<script>
		// Funzione che tenta di caricare l'immagine con diversi formati
		function tryLoadImage_${containerId}() {
			const container = document.getElementById('${containerId}');
			if (!container) {
				return;
			}
			
			const formats = ${JSON.stringify(formats)};
			const base64 = "${base64String}";
			let successfulLoad = false;
			
			// Tenta ogni formato in sequenza
			function tryFormat(index) {
				if (index >= formats.length || successfulLoad) {
					return;
				}
				
				const format = formats[index];
				const img = new Image();
				
				img.onload = function() {
					console.log('Formato funzionante per ${className}: ' + format);
					successfulLoad = true;
					
					// Rimuovi tutte le immagini precedenti
					while (container.firstChild) {
						container.removeChild(container.firstChild);
					}
					
					// Crea sia IMG che OBJECT con il formato che funziona
					const imgTag = document.createElement('img');
					imgTag.src = 'data:image/' + format + ';base64,' + base64;
					imgTag.alt = "${altText}";
					imgTag.className = "${className}";
					
					// Assicurati che sia visibile
					imgTag.style.display = 'block';
					container.appendChild(imgTag);
					
					// Aggiungi anche un object tag come fallback
					const objTag = document.createElement('object');
					objTag.data = 'data:image/' + format + ';base64,' + base64;
					objTag.type = 'image/' + format;
					objTag.className = "${className}";
					objTag.style.display = 'none';
					objTag.appendChild(document.createTextNode("${altText}"));
					container.appendChild(objTag);
				};
				
				img.onerror = function() {
					console.log('Formato non funzionante per ${className}: ' + format);
					tryFormat(index + 1);
				};
				
				img.src = 'data:image/' + format + ';base64,' + base64;
			}
			
			// Inizia con il primo formato
			tryFormat(0);
			
			// Prova anche senza tipo specificato come ultima risorsa
			setTimeout(function() {
				if (!successfulLoad) {
					console.log('Tentativo con formato generico per ${className}');
					const genericImg = new Image();
					genericImg.onload = function() {
						console.log('Formato generico funzionante per ${className}');
						
						// Rimuovi tutte le immagini precedenti
						while (container.firstChild) {
							container.removeChild(container.firstChild);
						}
						
						// Crea l'immagine con formato generico
						const imgTag = document.createElement('img');
						imgTag.src = 'data:image;base64,' + base64;
						imgTag.alt = "${altText}";
						imgTag.className = "${className}";
						imgTag.style.display = 'block';
						container.appendChild(imgTag);
					};
					
					genericImg.onerror = function() {
						console.error('Nessun formato funzionante per ${className}');
					};
					
					genericImg.src = 'data:image;base64,' + base64;
				}
			}, 500);
		}
		
		// Esegui dopo il rendering della pagina
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', tryLoadImage_${containerId});
		} else {
			tryLoadImage_${containerId}();
		}
	</script>
	`;

	// Contenitore iniziale vuoto che verrà popolato dallo script
	return `<div id="${containerId}" class="${className}-container"></div>${fallbackScript}`;
}

interface LanguageStatus {
	translation: number;
	qaCheck: number;
	status: "completed" | "processing" | "queued" | "edit";
}

interface TranslationStatus {
	[key: string]: LanguageStatus;
}

interface Section {
	title?: string;
	content?: string;
	chapter_number: number;
	chapter_info: string;
	restructured_html: string;
	example_html?: string;
}

// Interfacce per le traduzioni
interface TranslationTitles {
	English: string;
	French: string;
	German: string;
	Spanish: string;
	[key: string]: string; // Aggiungiamo un index signature per permettere l'accesso dinamico
}

// Aggiungo l'interfaccia per il formato delle traduzioni
interface TranslatedChapter {
	is_empty: boolean;
	chapter_info: string;
	example_html: string;
	chapter_number: number;
	restructured_html: string;
	missing_information: string;
}

// Aggiungo l'interfaccia per il tipo di contentFields
interface ContentFields {
	Italian: any[];
	English: any[];
	French: any[];
	German: any[];
	Spanish: any[];
	[key: string]: any[]; // Aggiungo l'index signature
}

interface Chapter {
	chapter_number: number;
	chapter_info: string;
	restructured_html: string;
	example_html?: string;
}

interface Template {
	title: string;
	font_title?: string;
	logo_path?: string;
	chapters?: Chapter[];
}

export function TranslationClient() {
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [translations, setTranslations] = useState<TranslationStatus>({
			Italian: { translation: 100, qaCheck: 100, status: "edit" },
			English: { translation: 0, qaCheck: 0, status: "queued" },
			French: { translation: 0, qaCheck: 0, status: "queued" },
			German: { translation: 0, qaCheck: 0, status: "queued" },
			Spanish: { translation: 0, qaCheck: 0, status: "queued" },
		});
	const [isExporting, setIsExporting] = useState(false);
	const [manualId, setManualId] = useState<string | null>(null);
	const printFrameRef = useRef<HTMLIFrameElement>(null);
	const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
		null,
	);
	const { toast } = useToast();
	const [sections, setSections] = useState<any[]>([]);
	const [metadata, setMetadata] = useState<any>(null);
	const [tokenStats, setTokenStats] = useState<any>(null);
	const [exportFormat, setExportFormat] = useState<'pdf' | 'docx'>('pdf');
	const [pageFormat, setPageFormat] = useState<'A4' | 'A5'>('A4');
	const [showPrintDialog, setShowPrintDialog] = useState(false);

	// Mappa lingua -> campo DB
	const linguaToDbKey: Record<string, string> = {
		Italian: "pdf_it",
		French: "pdf_fr",
		German: "pdf_de",
		English: "pdf_en",
		Spanish: "pdf_es",
	};

	// Mappa i nomi delle lingue in inglese
	const languageNames: Record<string, string> = {
		'Italian': 'Italian',
		'French': 'French',
		'German': 'German',
		'English': 'English',
		'Spanish': 'Spanish'
	};

	// Mappa i nomi delle lingue localizzati per il rettangolo
	const languageDisplayNames: Record<string, string> = {
		'Italian': 'Italiano',
		'French': 'Français',
		'German': 'Deutsch',
		'English': 'English',
		'Spanish': 'Español',
	};

	// Riorganizza le lingue per iniziare con l'inglese
	const sortedLanguages: string[] = ['English', 'Italian', 'French', 'German', 'Spanish'];
	
	console.log("=== DEBUG SORTED LANGUAGES ===");
	console.log("sortedLanguages:", sortedLanguages);
	console.log("Prima lingua:", sortedLanguages[0]);
	console.log("Stato traduzioni corrente:", translations);

	// Funzione per controllare le traduzioni esistenti
	const checkExistingTranslations = async (manualId: string) => {
		try {
			const response = await fetch(`/api/manuals/${manualId}`);
			if (!response.ok) {
				throw new Error("Errore nel recupero dei dati del manuale");
			}
			const data = await response.json();
			const manual = data.manual;

			// Verifica quali lingue hanno effettivamente contenuto
			const translations: TranslationStatus = {
				Italian: {
					translation: manual.contentIt ? 100 : 0,
					qaCheck: manual.contentIt ? 100 : 0,
					status: manual.contentIt ? "edit" : "queued",
				},
				English: {
					translation: manual.contentEn ? 100 : 0,
					qaCheck: manual.contentEn ? 100 : 0,
					status: manual.contentEn ? "edit" : "queued",
				},
				French: {
					translation: manual.contentFr ? 100 : 0,
					qaCheck: manual.contentFr ? 100 : 0,
					status: manual.contentFr ? "edit" : "queued",
				},
				German: {
					translation: manual.contentDe ? 100 : 0,
					qaCheck: manual.contentDe ? 100 : 0,
					status: manual.contentDe ? "edit" : "queued",
				},
				Spanish: {
					translation: manual.contentEs ? 100 : 0,
					qaCheck: manual.contentEs ? 100 : 0,
					status: manual.contentEs ? "edit" : "queued",
				},
			};

			setTranslations(translations);
		} catch (error) {
			console.error("Errore nel controllo delle traduzioni:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Errore nel controllo delle traduzioni esistenti",
			});
		}
	};

	// Effetto per inizializzare il componente
	useEffect(() => {
		const initializeManual = async () => {
			try {
				// Recupera l'ID del manuale dall'URL
				const manualIdFromUrl = searchParams.get("manualId");
				console.log("=== INIZIALIZZAZIONE MANUALE ===");
				console.log("ManualId dall'URL:", manualIdFromUrl);

				if (!manualIdFromUrl) {
					throw new Error("ID manuale non trovato nell'URL");
				}

				setManualId(manualIdFromUrl);

				// Recupera i dati del manuale
				const response = await fetch(`/api/manuals/${manualIdFromUrl}`);
				if (!response.ok) {
					throw new Error("Errore nel recupero dei dati del manuale");
				}
				const manualData = await response.json();
				console.log("Dati manuale recuperati:", manualData);

				// Aggiorna lo stato delle traduzioni
				const translations: TranslationStatus = {
					Italian: {
						translation: manualData.manual.contentIt ? 100 : 0,
						qaCheck: manualData.manual.contentIt ? 100 : 0,
						status: manualData.manual.contentIt ? "edit" : "queued",
					},
					English: {
						translation: manualData.manual.contentEn ? 100 : 0,
						qaCheck: manualData.manual.contentEn ? 100 : 0,
						status: manualData.manual.contentEn ? "edit" : "queued",
					},
					French: {
						translation: manualData.manual.contentFr ? 100 : 0,
						qaCheck: manualData.manual.contentFr ? 100 : 0,
						status: manualData.manual.contentFr ? "edit" : "queued",
					},
					German: {
						translation: manualData.manual.contentDe ? 100 : 0,
						qaCheck: manualData.manual.contentDe ? 100 : 0,
						status: manualData.manual.contentDe ? "edit" : "queued",
					},
					Spanish: {
						translation: manualData.manual.contentEs ? 100 : 0,
						qaCheck: manualData.manual.contentEs ? 100 : 0,
						status: manualData.manual.contentEs ? "edit" : "queued",
					},
				};

				setTranslations(translations);
				console.log("Stato traduzioni aggiornato:", translations);

			} catch (error) {
				console.error("Errore nell'inizializzazione:", error);
				toast({
					variant: "error",
					title: "Errore",
					description: "Errore nel caricamento del manuale. Riprova più tardi.",
				});
				router.push("/app/manual");
			}
		};

		initializeManual();
	}, [searchParams, router, toast]);

	// Funzione per aggiornare lo stato delle traduzioni
	const updateTranslationStatus = (manualData: any) => {
		// Verifica quali lingue hanno effettivamente contenuto
		const translations: TranslationStatus = {
			Italian: {
				translation: manualData.contentIt ? 100 : 0,
				qaCheck: manualData.contentIt ? 100 : 0,
				status: manualData.contentIt ? "edit" : "queued",
			},
			English: {
				translation: manualData.contentEn ? 100 : 0,
				qaCheck: manualData.contentEn ? 100 : 0,
				status: manualData.contentEn ? "edit" : "queued",
			},
			French: {
				translation: manualData.contentFr ? 100 : 0,
				qaCheck: manualData.contentFr ? 100 : 0,
				status: manualData.contentFr ? "edit" : "queued",
			},
			German: {
				translation: manualData.contentDe ? 100 : 0,
				qaCheck: manualData.contentDe ? 100 : 0,
				status: manualData.contentDe ? "edit" : "queued",
			},
			Spanish: {
				translation: manualData.contentEs ? 100 : 0,
				qaCheck: manualData.contentEs ? 100 : 0,
				status: manualData.contentEs ? "edit" : "queued",
			},
		};

		setTranslations(translations);
	};

	// Funzione per gestire la traduzione
	const handleTranslate = async (language: string) => {
		if (!manualId) {
			alert("ID manuale non trovato. Riprova più tardi.");
			return;
		}

		try {
			// Prima recupera i dati dal database per assicurarci di avere l'ID corretto
			const response = await fetch(`/api/manuals/${manualId}`);
			if (!response.ok) {
				throw new Error("Errore nel recupero dei dati del manuale");
			}
			const dbData = await response.json();

			// Controlla se esiste già una traduzione per questa lingua
			const existingTranslation =
				dbData.manual[
					`content${language.charAt(0).toUpperCase() + language.slice(1)}`
				];
			if (existingTranslation) {
				const shouldRetranslate = window.confirm(
					`Esiste già una traduzione in ${language}. Vuoi procedere con una nuova traduzione?`,
				);
				if (!shouldRetranslate) {
					return;
				}
			}

			// --- MODIFICA: per la traduzione in inglese prendi i capitoli dall'italiano ---
			let sourceChapters;
			if (language.toLowerCase() === 'english') {
				if (!dbData.manual.contentIt || !Array.isArray(dbData.manual.contentIt) || dbData.manual.contentIt.length === 0) {
					throw new Error("Nessun contenuto trovato nella lingua italiana");
				}
				sourceChapters = dbData.manual.contentIt;
			} else {
				if (!dbData.manual.contentEn || !Array.isArray(dbData.manual.contentEn) || dbData.manual.contentEn.length === 0) {
					throw new Error("Nessun contenuto trovato nella lingua inglese");
				}
				sourceChapters = dbData.manual.contentEn;
			}

			// Prepara i dati per l'API di traduzione
			const translationData = {
				lingua: language.toLowerCase(),
				capitoli: sourceChapters.map((chapter: any) => ({
					is_empty:
						!chapter.restructured_html ||
						chapter.restructured_html.trim() === "",
					chapter_info: chapter.chapter_info,
					example_html: chapter.example_html || "",
					chapter_number: chapter.chapter_number || 9999,
					restructured_html: chapter.restructured_html || "",
					missing_information: chapter.missing_information || "",
				})),
			};

			// Aggiorna lo stato della traduzione
			setTranslations((prev) => ({
				...prev,
				[language]: {
					...prev[language],
					status: "processing",
				},
			}));

			// Chiama l'API di traduzione
			const translationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_SITE_FLASK}/flask-api/traduzioni`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(translationData),
				},
			);

			if (!translationResponse.ok) {
				const errorData = await translationResponse
					.json()
					.catch(() => null);
				throw new Error(
					errorData?.message || "Errore durante la traduzione",
				);
			}

			const translatedContent = await translationResponse.json();

			// Prepara i dati per il salvataggio nel database
			const updateData: any = {};
			switch (language.toLowerCase()) {
				case "english":
					updateData.contentEn = translatedContent;
					break;
				case "french":
					updateData.contentFr = translatedContent;
					break;
				case "german":
					updateData.contentDe = translatedContent;
					break;
				case "italian":
					updateData.contentIt = translatedContent;
					break;
				case "spanish":
					updateData.contentEs = translatedContent;
					break;
			}

			// Salva nel database
			const saveResponse = await fetch(`/api/manuals/${manualId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (!saveResponse.ok) {
				throw new Error(
					"Errore durante il salvataggio della traduzione",
				);
			}

			// Aggiorna lo stato della traduzione
			setTranslations((prev) => ({
				...prev,
				[language]: {
					...prev[language],
					status: "completed",
					translation: 100,
				},
			}));

			toast({
				title: "Traduzione completata",
				description: `La traduzione in ${language} è stata completata con successo`,
			});
		} catch (error) {
			console.error("Errore durante la traduzione:", error);
			toast({
				variant: "error",
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Si è verificato un errore durante la traduzione",
			});

			// Ripristina lo stato in caso di errore
			setTranslations((prev) => ({
				...prev,
				[language]: {
					...prev[language],
					status: "edit",
				},
			}));
		}
	};

	// Funzione per pulire la cache e forzare un reload del template
	const clearTemplateCache = () => {
		try {
			console.log("Pulizia della cache del template...");

			// Rimuovi tutti i possibili template in cache
			const possibleKeys = [
				"selectedTemplate",
				"template",
				"manualTemplate",
				"manualTemplates", // Aggiungiamo anche questa chiave
				"templateData",
				"currentTemplate",
				"templateId",
				"selectedTemplateId",
			];

			possibleKeys.forEach((key) => {
				if (sessionStorage.getItem(key)) {
					console.log(`Rimozione di ${key} dalla sessionStorage`);
					sessionStorage.removeItem(key);
				}
			});

			// Verifica se c'è un template ID nell'URL
			const templateId = searchParams.get("template");
			if (templateId) {
				console.log(`Ricaricamento del template con ID: ${templateId}`);

				// Invece di ricaricare la pagina, forziamo il caricamento del template dal server
				loadTemplateById(templateId).then((success) => {
					if (success) {
						alert(
							"Template aggiornato con successo! Genera un nuovo PDF per vedere il risultato.",
						);
					} else {
						alert(
							"Impossibile caricare il template. Riprova più tardi.",
						);
					}
				});
			} else {
				alert(
					"Cache del template pulita. Scegli un template dalla pagina precedente.",
				);
				router.back(); // Torna indietro per selezionare un template
			}
		} catch (error) {
			console.error("Errore durante la pulizia della cache:", error);
			alert("Si è verificato un errore durante la pulizia della cache.");
		}
	};

	// Funzione per caricare un template specifico dal server
	const loadTemplateById = async (templateId: string): Promise<Template | null> => {
		try {
			console.log(
				`Caricamento template dal server con ID: ${templateId}`,
			);
			const response = await fetch(`/api/templates/${templateId}`);

			if (!response.ok) {
				console.error("Errore API:", response.status);
				return null;
			}

			const templateData = await response.json();
			console.log("Template caricato dal server:", templateData);

			// Processa le immagini base64 se necessario
			if (templateData.logo_path) {
				if (
					!templateData.logo_path.startsWith("data:image") &&
					!templateData.logo_path.startsWith("http")
				) {
					console.log("Formattazione logo_path come base64");
					templateData.logo_path = formatBase64Image(
						templateData.logo_path,
					);
				}
				console.log(
					"Logo header pronto per l'uso:",
					templateData.logo_path ? "presente" : "assente",
				);
			}

			if (templateData.logo_footer) {
				if (
					!templateData.logo_footer.startsWith("data:image") &&
					!templateData.logo_footer.startsWith("http")
				) {
					console.log("Formattazione logo_footer come base64");
					templateData.logo_footer = formatBase64Image(
						templateData.logo_footer,
					);
				}
				console.log(
					"Logo footer pronto per l'uso:",
					templateData.logo_footer ? "presente" : "assente",
				);
			}

			// Prima di salvare, controlla che il template abbia un id
			if (!templateData.id && templateId) {
				templateData.id = templateId;
				console.log("Aggiunto ID mancante al template:", templateId);
			}

			// Salva il template appena caricato
			const templateString = JSON.stringify(templateData);

			// Rimuovi eventuali template precedenti dalla sessionStorage
			const possibleKeys = [
				"selectedTemplate",
				"template",
				"manualTemplate",
				"templateData",
				"currentTemplate",
				"templateId",
				"selectedTemplateId",
			];

			possibleKeys.forEach((key) => {
				if (sessionStorage.getItem(key)) {
					console.log(
						`Rimozione di ${key} dalla sessionStorage prima di salvare il nuovo template`,
					);
					sessionStorage.removeItem(key);
				}
			});

			// Salva il nuovo template
			sessionStorage.setItem("selectedTemplate", templateString);
			console.log("Nuovo template salvato con chiave 'selectedTemplate'");

			// Se c'è un array manualTemplates, aggiorna anche quello
			try {
				const manualTemplatesData =
					sessionStorage.getItem("manualTemplates");
				if (manualTemplatesData) {
					const templates = JSON.parse(manualTemplatesData);
					if (Array.isArray(templates)) {
						// Cerca se esiste già un template con questo ID
						const templateIndex = templates.findIndex(
							(t) => t.id === templateData.id,
						);

						if (templateIndex >= 0) {
							// Aggiorna il template esistente
							templates[templateIndex] = templateData;
						} else if (templates.length > 0) {
							// Sostituisci il primo template con quello nuovo
							templates[0] = templateData;
						} else {
							// Aggiungi il nuovo template
							templates.push(templateData);
						}

						// Salva l'array aggiornato
						sessionStorage.setItem(
							"manualTemplates",
							JSON.stringify(templates),
						);
						console.log("Array manualTemplates aggiornato");
					}
				} else {
					// Se non esiste l'array manualTemplates, crealo con questo template
					const newTemplatesArray = [templateData];
					sessionStorage.setItem(
						"manualTemplates",
						JSON.stringify(newTemplatesArray),
					);
					console.log("Creato nuovo array manualTemplates");
				}
			} catch (error) {
				console.error(
					"Errore nell'aggiornamento di manualTemplates:",
					error,
				);
			}

			console.log("Template salvato con successo nella sessione");
			return templateData as Template;
		} catch (error) {
			console.error("Errore durante il caricamento del template:", error);
			return null;
		}
	};

	// Funzione per verificare se il template selezionato corrisponde a quello desiderato
	const ensureCorrectTemplate = (
		templates: any[],
		selectedTemplateId: string | null,
	): any => {
		if (!templates || !templates.length) return null;

		console.log(`Ricerca template - ID selezionato: ${selectedTemplateId}`);
		console.log(`Numero di template disponibili: ${templates.length}`);

		// Controlla prima i dati del manuale nella sessione
		const storedData = sessionStorage.getItem("manualData");
		if (storedData) {
			try {
				const parsedData = JSON.parse(storedData);

				// Controlla se c'è un ID di template selezionato nei dati del manuale
				if (parsedData.selectedTemplateId) {
					const selectedIdNumber = Number.parseInt(
						String(parsedData.selectedTemplateId),
					);
					console.log(
						`ID template nei dati del manuale: ${selectedIdNumber}`,
					);

					const selectedById = templates.find(
						(t) =>
							Number.parseInt(String(t.id)) === selectedIdNumber,
					);

					if (selectedById) {
						console.log(
							`Template trovato dai dati del manuale: ${selectedById.name || selectedById.id}`,
						);
						return selectedById;
					}
				}
			} catch (e) {
				console.error("Errore nel parsing della sessione:", e);
			}
		}

		// Se c'è un ID specifico selezionato nell'URL, cerca quel template
		if (selectedTemplateId) {
			const selectedIdNumber = Number.parseInt(selectedTemplateId);
			console.log(
				`Tentativo di trovare template ID ${selectedIdNumber} dall'URL`,
			);

			const selected = templates.find(
				(t) => Number.parseInt(String(t.id)) === selectedIdNumber,
			);

			if (selected) {
				console.log(
					`Template selezionato dall'URL trovato: ${selected.name || selected.id}`,
				);
				return selected;
			}
		}

		// Se non troviamo il template selezionato, prendiamo il primo
		console.log(
			`Nessun template selezionato trovato, uso il primo disponibile: ${templates[0].name || templates[0].id}`,
		);
		return templates[0];
	};

	useEffect(() => {
		// Check if running in browser before using sessionStorage
		if (typeof window === "undefined") return;

		// Ottieni i dati del manuale dalla sessione
		const manualDataStr = sessionStorage.getItem("manualData");
		let selectedTemplateFromSession = null;

		// Estrai l'ID del template dai dati del manuale (prioritario)
		if (manualDataStr) {
			try {
				const manualData = JSON.parse(manualDataStr);
				if (manualData.selectedTemplateId) {
					selectedTemplateFromSession =
						manualData.selectedTemplateId.toString();
					console.log(
						`ID template dai dati del manuale: ${selectedTemplateFromSession}`,
					);
				}
			} catch (error) {
				console.error(
					"Errore nell'analisi dei dati del manuale:",
					error,
				);
			}
		}

		// Controlla se è presente un ID template nell'URL all'avvio (secondario)
		const urlTemplateId = searchParams.get("template");
		if (urlTemplateId) {
			console.log(
				`Template ID trovato nell'URL all'avvio: ${urlTemplateId}`,
			);
			// Se non abbiamo già un ID dai dati del manuale, usa quello dell'URL
			if (!selectedTemplateFromSession) {
				selectedTemplateFromSession = urlTemplateId;
			}
		}

		// Imposta l'ID del template corrente
		if (selectedTemplateFromSession) {
			setCurrentTemplateId(selectedTemplateFromSession);
			console.log(
				`Template ID impostato: ${selectedTemplateFromSession}`,
			);

			// Carica il template selezionato
			loadTemplateById(selectedTemplateFromSession).then((success) => {
				if (success) {
					console.log("Template caricato con successo");
				} else {
					console.error(
						"Impossibile caricare il template selezionato",
					);
				}
			});
		}

		const storedData = sessionStorage.getItem("manualData");
		if (storedData) {
			try {
				const parsedData = JSON.parse(storedData);
				console.log("=== DEBUG INFO ===");
				console.log("Parsed data:", parsedData);

				// Salva l'ID del template se presente nei dati
				if (parsedData.selectedTemplateId && !currentTemplateId) {
					console.log(
						"Trovato template ID nei dati:",
						parsedData.selectedTemplateId,
					);
					setCurrentTemplateId(
						parsedData.selectedTemplateId.toString(),
					);
				}

				if (parsedData.status === "success" && parsedData.sections) {
					// Determiniamo la lingua del contenuto originale
					const detectedLanguage =
						parsedData.detected_language || "English";

					// Aggiorniamo lo stato delle traduzioni
					setTranslations((prev) => ({
						...prev,
						[detectedLanguage]: {
							translation: 100,
							qaCheck: 100,
							status: "edit",
						},
						// Manteniamo le altre lingue come queued
						...Object.fromEntries(
							Object.entries(prev)
								.filter(([lang]) => lang !== detectedLanguage)
								.map(([lang]) => [
									lang,
									{
										translation: 0,
										qaCheck: 0,
										status: "queued",
									},
								]),
						),
					}));
				}
			} catch (error) {
				console.error("Error parsing translation data:", error);
			}
		}

		// Verifica se esiste un template selezionato con varie possibili chiavi
		const possibleTemplateKeys = [
			"selectedTemplate",
			"template",
			"manualTemplate",
			"templateData",
			"currentTemplate",
			"templateId",
			"selectedTemplateId",
		];

		console.log("=== STORAGE DEBUG ===");
		// Mostra tutte le chiavi disponibili in sessionStorage
		console.log("Chiavi in sessionStorage:");
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			console.log(`- ${key}`);

			// Se la chiave contiene "template" (case insensitive), controlla il contenuto
			if (key?.toLowerCase().includes("template")) {
				try {
					const value = sessionStorage.getItem(key);
					if (value) {
						console.log(
							`Contenuto di ${key}: ${value.substring(0, 50)}...`,
						);
					} else {
						console.log(`Contenuto di ${key}: vuoto`);
					}
				} catch (error) {
					console.error(`Errore nel leggere ${key}:`, error);
				}
			}
		}

		// Controlla tutte le possibili chiavi
		let templateFound = false;
		for (const key of possibleTemplateKeys) {
			const storedTemplate = sessionStorage.getItem(key);
			if (storedTemplate) {
				try {
					const templateData = JSON.parse(storedTemplate);
					console.log(`=== TEMPLATE DEBUG (${key}) ===`);
					console.log("Template trovato con chiave:", key);
					console.log("Template data:", templateData);
					templateFound = true;

					// Se troviamo un template, salviamolo con la chiave che ci aspettiamo
					if (key !== "selectedTemplate") {
						console.log(
							`Salvando il template trovato con la chiave standard 'selectedTemplate'`,
						);
						sessionStorage.setItem(
							"selectedTemplate",
							storedTemplate,
						);
					}

					break; // Esci dal loop se troviamo un template valido
				} catch (error) {
					console.error(
						`Errore nel parsing del template con chiave ${key}:`,
						error,
					);
				}
			}
		}

		if (!templateFound) {
			console.warn(
				"Nessun template trovato in sessionStorage con nessuna delle chiavi verificate",
			);

			// Controlla se abbiamo informazioni sul template nei dati del manuale
			try {
				if (storedData) {
					const manualData = JSON.parse(storedData);
					if (
						manualData.template ||
						manualData.templateId ||
						manualData.selectedTemplate
					) {
						console.log(
							"Trovate informazioni sul template nei dati del manuale",
							manualData.template ||
								manualData.templateId ||
								manualData.selectedTemplate,
						);
					}
				}
			} catch (error) {
				console.error(
					"Errore nel cercare il template nei dati del manuale:",
					error,
				);
			}
		}

		// Verifica se esistono informazioni sul template manuale nei dati caricati
		// e tenta di caricare il template dal database se necessario
		const fetchTemplateIfNeeded = async () => {
			const storedData = sessionStorage.getItem("manualData");
			if (!storedData) return;

			try {
				const parsedData = JSON.parse(storedData);

				// Verifica se è già presente un template in sessionStorage
				const hasStoredTemplate =
					!!sessionStorage.getItem("selectedTemplate");
				if (hasStoredTemplate) return;

				// Controlla se i dati del manuale contengono un ID template o manuale
				const templateId =
					parsedData.templateId || parsedData.template?.id || null;
				const manualId = parsedData.manualId || parsedData.id || null;

				if (!templateId && !manualId) {
					console.warn(
						"Nessun ID template o manuale trovato nei dati",
					);
					return;
				}

				// Tenta di recuperare il template dal database
				try {
					console.log(
						"Tentativo di recuperare il template dal database...",
					);

					// Determina l'endpoint API in base ai dati disponibili
					let apiUrl = "";
					if (templateId) {
						apiUrl = `/api/templates/${templateId}`;
					} else if (manualId) {
						apiUrl = `/api/manuals/${manualId}/template`;
					}

					if (!apiUrl) return;

					// Effettua la richiesta al database
					const response = await fetch(apiUrl);
					if (response.ok) {
						const templateData = await response.json();
						console.log(
							"Template recuperato dal database:",
							templateData,
						);

						// Salva il template in sessionStorage per uso futuro
						sessionStorage.setItem(
							"selectedTemplate",
							JSON.stringify(templateData),
						);

						// Se ci sono immagini base64, assicurati che abbiano il prefisso corretto
						if (
							templateData.logo_path &&
							!templateData.logo_path.startsWith("data:image") &&
							!templateData.logo_path.startsWith("http")
						) {
							templateData.logo_path = `data:image/png;base64,${templateData.logo_path}`;
						}

						if (
							templateData.logo_footer &&
							!templateData.logo_footer.startsWith(
								"data:image",
							) &&
							!templateData.logo_footer.startsWith("http")
						) {
							templateData.logo_footer = `data:image/png;base64,${templateData.logo_footer}`;
						}

						console.log(
							"Template salvato in sessionStorage con immagini formattate",
						);
					} else {
						console.warn(
							"Impossibile recuperare il template dal database",
							response.status,
						);
					}
				} catch (error) {
					console.error(
						"Errore durante il recupero del template dal database:",
						error,
					);
				}
			} catch (error) {
				console.error(
					"Errore nell'analisi dei dati per il recupero del template:",
					error,
				);
			}
		};

		// Esegui il tentativo di recupero del template
		fetchTemplateIfNeeded();

		// AGGIUNTA: controlla specificamente manualTemplates che abbiamo visto nei log
		try {
			const manualTemplatesData =
				sessionStorage.getItem("manualTemplates");
			if (manualTemplatesData) {
				console.log(
					"Trovati dati in manualTemplates, tentativo di parsing...",
				);
				const templates = JSON.parse(manualTemplatesData);

				// Se è un array, prendiamo il primo template o quello selezionato
				if (Array.isArray(templates) && templates.length > 0) {
					console.log(
						`Trovati ${templates.length} template, utilizzo il primo`,
					);
					const templateToUse = templates[0];

					// Salva in sessionStorage con la chiave che ci aspettiamo
					sessionStorage.setItem(
						"selectedTemplate",
						JSON.stringify(templateToUse),
					);
					console.log(
						"Template salvato in sessionStorage:",
						templateToUse.name || "senza nome",
					);

					// Processa le immagini base64 se presenti
					if (
						templateToUse.logo_path &&
						!templateToUse.logo_path.startsWith("data:image") &&
						!templateToUse.logo_path.startsWith("http")
					) {
						console.log("Formattazione logo_path come base64");
						templateToUse.logo_path = formatBase64Image(
							templateToUse.logo_path,
						);
						console.log(
							"Logo header formattato:",
							templateToUse.logo_path ? "presente" : "assente",
						);
					}

					if (
						templateToUse.logo_footer &&
						!templateToUse.logo_footer.startsWith("data:image") &&
						!templateToUse.logo_footer.startsWith("http")
					) {
						console.log("Formattazione logo_footer come base64");
						templateToUse.logo_footer = formatBase64Image(
							templateToUse.logo_footer,
						);
						console.log(
							"Logo footer formattato:",
							templateToUse.logo_footer ? "presente" : "assente",
						);
					}

					// Aggiorna sessionStorage con il template formattato
					sessionStorage.setItem(
						"selectedTemplate",
						JSON.stringify(templateToUse),
					);
					console.log("Template aggiornato con immagini formattate");
				}
			}
		} catch (error) {
			console.error(
				"Errore nell'elaborazione di manualTemplates:",
				error,
			);
		}
	}, []);

	useEffect(() => {
		// Controlla se è stato selezionato un nuovo template tramite URL
		const templateId = searchParams.get("template");

		if (templateId && templateId !== currentTemplateId) {
			console.log(`Template ID cambiato nell'URL: ${templateId}`);
			setCurrentTemplateId(templateId);

			// Cancella completamente la cache dei template
			const possibleKeys = [
				"selectedTemplate",
				"template",
				"manualTemplate",
				"manualTemplates",
				"templateData",
				"currentTemplate",
				"templateId",
				"selectedTemplateId",
			];

			possibleKeys.forEach((key) => {
				if (sessionStorage.getItem(key)) {
					console.log(`Rimozione di ${key} dalla sessionStorage`);
					sessionStorage.removeItem(key);
				}
			});

			// Carica il nuovo template e mostra un messaggio all'utente
			loadTemplateById(templateId).then((success) => {
				if (success) {
					alert(
						"Template aggiornato con successo! Genera un nuovo PDF per vedere il risultato.",
					);
				} else {
					alert(
						"Non è stato possibile caricare il template richiesto. Riprova più tardi.",
					);
				}
			});
		}
	}, [searchParams, currentTemplateId]);

	// Funzioni di supporto per le traduzioni
	function getIndexTitle(lang: string): string {
		const titles: TranslationTitles = {
			English: "Index",
			French: "Table des matières",
			German: "Inhaltsverzeichnis",
			Spanish: "Índice",
		};
		return titles[lang] || "Index";
	}

	function getExampleTitle(lang: string): string {
		const titles: TranslationTitles = {
			English: "Example",
			French: "Exemple",
			German: "Beispiel",
			Spanish: "Ejemplo",
		};
		return titles[lang] || "Example";
	}

	// Funzione per validare il contenuto tradotto
	function validateTranslatedContent(content: Section[]): boolean {
		if (!Array.isArray(content)) return false;
		return content.every(
			(section) =>
				typeof section === "object" &&
				typeof section.chapter_number === "number" &&
				typeof section.chapter_info === "string" &&
				typeof section.restructured_html === "string",
		);
	}

	// Funzione per formattare il contenuto HTML
	function formatHtmlContent(html: string, template: any): string {
		if (!html) return "";
		console.log("=== DEBUG FORMAT HTML ===");
		console.log("HTML originale:", html);
		console.log("Template:", template);
		const fonts = {
			paragraph: template?.font_paragraph || 'Arial',
			title: template?.font_title || 'Arial'
		};
		console.log("Font utilizzati:", fonts);
		const generateHeadingId = (text: string): string => {
			return text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		};
		const addIdsToHeadings = (html: string): string => {
			const headingRegex = /<h([123])(?![^>]*id=)[^>]*>(.*?)<\/h\1>/g;
			return html.replace(headingRegex, (match, level, content) => {
				const text = content.replace(/<[^>]*>/g, '').trim();
				const id = generateHeadingId(text);
				return `<h${level} id="${id}">${content}</h${level}>`;
			});
		};
		// NON rimuovere le classi custom! Solo aggiungi classi standard se mancano
		const htmlWithIds = addIdsToHeadings(html);
		const formattedHtml = htmlWithIds
			.replace(/<p(?![^>]*class=)/g, '<p class="paragraph"')
			.replace(/<h1(?![^>]*class=)/g, '<h1 class="heading-1"')
			.replace(/<h2(?![^>]*class=)/g, '<h2 class="heading-2"')
			.replace(/<h3(?![^>]*class=)/g, '<h3 class="heading-3"')
			.replace(/<ul(?![^>]*class=)/g, '<ul class="list"')
			.replace(/<ol(?![^>]*class=)/g, '<ol class="list"')
			.replace(/<li(?![^>]*class=)/g, '<li class="list-item"')
			.replace(/<img(?![^>]*class=)/g, '<img class="image"')
			.replace(/<table(?![^>]*class=)/g, '<table class="table"')
			.replace(/<thead(?![^>]*class=)/g, '<thead class="table-header"')
			.replace(/<tbody(?![^>]*class=)/g, '<tbody class="table-body"')
			.replace(/<tr(?![^>]*class=)/g, '<tr class="table-row"')
			.replace(/<th(?![^>]*class=)/g, '<th class="table-header-cell"')
			.replace(/<td(?![^>]*class=)/g, '<td class="table-cell"');
		console.log("HTML formattato:", formattedHtml);
		return formattedHtml;
	}

	// Funzione per estrarre gli heading dal contenuto HTML usando regex
	function extractHeadings(html: string): { id: string; text: string; level: number }[] {
		const headings: { id: string; text: string; level: number }[] = [];
		
		// Regex per trovare h1, h2 e h3 con o senza id
		const headingRegex = /<h([123])(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h\1>/g;
		let match;
		
		while ((match = headingRegex.exec(html)) !== null) {
			const level = parseInt(match[1]);
			const text = match[3].replace(/<[^>]*>/g, '').trim(); // Rimuove eventuali tag HTML dal testo
			const id = match[2] || generateHeadingId(text);
			
			headings.push({ id, text, level });
		}
		
		return headings;
	}

	// Funzione helper per generare ID univoci basati sul testo
	function generateHeadingId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Funzione per ottenere i titoli "Instruction Manual" in tutte le lingue
	function getInstructionManualTitle(lang: string): string {
		const titles: Record<string, string> = {
			'English': 'Instruction Manual',
			'Italian': 'Manuale di istruzioni', 
			'French': 'Manuel d\'instructions',
			'German': 'Bedienungsanleitung',
			'Spanish': 'Manual de instrucciones'
		};
		return titles[lang] || 'Instruction Manual';
	}

	const languageCodes: Record<string, string> = {
		'Italian': 'IT',
		'French': 'FR',
		'German': 'DE',
		'English': 'EN',
		'Spanish': 'ES',
	};

	// DICHIARA additionalStyles QUI, PRIMA DI handlePrintAllLanguages
	const additionalStyles: string = `
		.language-index-custom {
			margin: 0 auto 2rem auto;
			max-width: 700px;
			padding: 2rem 0 1rem 0;
			position: relative;
			min-height: 350px;
			page-break-after: always;
			break-after: page;
		}
		.language-label {
			display: inline-block;
			background: var(--color-primary);
			color: #fff;
			font-weight: bold;
			font-size: 1.1rem;
			border-radius: 0.5rem;
			padding: 0.3rem 1.2rem;
			margin-right: 1.2rem;
			vertical-align: middle;
			letter-spacing: 0.05em;
		}
		.language-index-title {
			display: inline-block;
			font-size: 1.2rem;
			font-weight: bold;
			font-style: italic;
			vertical-align: middle;
			margin-bottom: 1.5rem;
		}
		.language-index-list {
			list-style: decimal inside;
			margin: 2rem 0 1.5rem 0;
			padding: 0;
		}
		.language-index-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 1rem;
			padding: 0.2rem 0;
			border-bottom: 1px solid #eee;
		}
		.index-title {
			flex: 1 1 auto;
			text-align: left;
		}
		.index-page {
			flex: 0 0 auto;
			text-align: right;
			min-width: 3rem;
			color: #888;
		}
		.language-index-divider {
			border: none;
			border-top: 2px solid #222;
			margin: 2rem 0 1rem 0;
		}
		.language-index-pagenum {
			text-align: center;
			font-size: 1.1rem;
			color: #222;
			font-weight: 500;
			margin-top: 0.5rem;
		}
		.language-label-section {
			display: inline-block;
			background: var(--color-primary);
			color: #fff;
			font-weight: bold;
			font-size: 1.1rem;
			border-radius: 0.5rem;
			padding: 0.3rem 1.2rem;
			margin-bottom: 1.5rem;
			margin-right: 1.2rem;
			letter-spacing: 0.05em;
		}
		/* Centra i loghi nelle prime due pagine */
		.first-page-logo,
		.general-index-header {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			text-align: center;
		}
		.first-page-logo img,
		.general-index-header img {
			display: block;
			margin: 0 auto;
			height: auto;
		}
		/* Logo più piccolo in prima pagina */
		.logo-first-page {
			max-width: 100px;
			height: auto;
			margin: 0 auto;
			display: block;
		}
		/* Logo più grande nell'indice generale */
		.logo-general-index {
			max-width: 200px;
			height: auto;
			margin: 0 auto;
			display: block;
		}
		/* Page break tra le sezioni principali */
		.first-page {
			page-break-after: always;
			break-after: page;
		}
		.general-index {
			page-break-after: always;
			break-after: page;
		}
		.language-section {
			page-break-before: always;
			break-before: page;
		}
		.language-index-list a {
			text-decoration: none;
			color: inherit;
			cursor: pointer;
		}
		.language-index-list a:hover {
			text-decoration: underline;
		}
		.languages-list a.language-name {
			text-decoration: none;
			color: inherit;
			cursor: pointer;
		}
		.languages-list a.language-name:hover {
			text-decoration: underline;
		}
		.page-break {
			page-break-before: always;
			break-before: page;
		}
		/* Nascondi il footer nella prima pagina di stampa */
		@media print {
			.footer {
				display: none !important;
			}
			.first-page ~ .footer {
				display: block !important;
			}
			body > .footer:first-of-type {
				display: none !important;
			}
			.first-page-logo {
				display: flex;
				justify-content: center;
				align-items: flex-end;
				width: 100%;
				height: 100px;
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				margin: 0 auto;
			}
		}
		/* --- TIPTAP LAYOUT/COLONNE --- */
		.layout-container,
		.tiptap-editor .layout-container,
		.tiptap-content .layout-container {
			display: grid;
			gap: 1rem;
			margin: 1.5rem 0;
			border: 1px dashed #e5e7eb;
			padding: 1rem;
			background-color: rgba(249, 250, 251, 0.3);
			border-radius: 0.375rem;
		}
		.layout-container.columns-2,
		.tiptap-editor .layout-container.columns-2,
		.tiptap-content .layout-container.columns-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.layout-container.columns-3,
		.tiptap-editor .layout-container.columns-3,
		.tiptap-content .layout-container.columns-3 {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.layout-container.columns-4,
		.tiptap-editor .layout-container.columns-4,
		.tiptap-content .layout-container.columns-4 {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		@media (max-width: 768px) {
			.layout-container.columns-4,
			.tiptap-editor .layout-container.columns-4,
			.tiptap-content .layout-container.columns-4 {
				grid-template-columns: repeat(2, minmax(0, 1fr));
			}
		}
		@media (max-width: 640px) {
			.layout-container,
			.tiptap-editor .layout-container,
			.tiptap-content .layout-container {
				grid-template-columns: 1fr !important;
			}
		}
		/* Allineamento testo TipTap */
		.text-align-left { text-align: left; }
		.text-align-center { text-align: center; }
		.text-align-right { text-align: right; }
		/* --- FINE TIPTAP LAYOUT --- */
		.first-page-logo img,
		.general-index-header img {
			display: block;
			margin: 0 auto;
			height: auto;
		}
		.logo-first-page {
			max-width: 100px !important;
			height: auto !important;
			margin: 0 auto !important;
			display: block !important;
		}
		.logo-general-index {
			max-width: 200px !important;
			height: auto !important;
			margin: 0 auto !important;
			display: block !important;
		}
	`;

	const handlePrintAllLanguages = async () => {
		try {
			setIsExporting(true);
			console.log("=== INIZIO STAMPA MULTILINGUA ===");

			// Recupera i dati del manuale
			const manualResponse = await fetch(`/api/manuals/${manualId}`);
			if (!manualResponse.ok) {
				throw new Error("Errore nel recupero del manuale");
			}
			const manualData = await manualResponse.json();
			const manualTitle = manualData.manual.name || "Manuale";

			// Recupera il template dalla sessione
			const storedTemplate = sessionStorage.getItem('selectedTemplate');
			if (!storedTemplate) {
				throw new Error("Template non trovato nella sessione");
			}
			const template = JSON.parse(storedTemplate);

			// Definisci l'ordine delle lingue con l'inglese sempre primo
			const sortedLanguages: string[] = ['English', 'Italian', 'French', 'German', 'Spanish'];
			
			console.log("=== DEBUG SORTED LANGUAGES ===");
			console.log("sortedLanguages:", sortedLanguages);
			console.log("Prima lingua:", sortedLanguages[0]);
			console.log("Stato traduzioni corrente:", translations);

			// Prepara il contenuto HTML per tutte le lingue
			// Assicurati che l'inglese sia sempre incluso per la prima pagina
			const languages = sortedLanguages.filter(lang => {
				console.log(`Controllo lingua ${lang}:`, {
					isEnglish: lang === 'English',
					translationStatus: translations[lang]?.translation,
					willInclude: lang === 'English' || translations[lang]?.translation === 100
				});
				
				if (lang === 'English') {
					// L'inglese deve essere sempre incluso per la prima pagina
					return true;
				}
				return translations[lang].translation === 100;
			});

			// Assicurati che l'inglese sia sempre il primo
			const englishFirst = languages.filter(lang => lang === 'English');
			const otherLanguages = languages.filter(lang => lang !== 'English');
			const finalLanguages = [...englishFirst, ...otherLanguages];

			console.log("=== DEBUG LINGUE ORDINATE ===");
			console.log("sortedLanguages:", sortedLanguages);
			console.log("languages filtrate:", languages);
			console.log("englishFirst:", englishFirst);
			console.log("otherLanguages:", otherLanguages);
			console.log("finalLanguages:", finalLanguages);

			// Mappa i campi del database per ogni lingua
			const contentFields = {
				'Italian': 'contentIt',
				'French': 'contentFr',
				'German': 'contentDe',
				'English': 'contentEn',
				'Spanish': 'contentEs'
			};

			// Raccogli tutti i contenuti prima di generare l'HTML
			const allLanguageContents: Array<{
				language: string;
				content: Array<{
					chapter_info: string;
					restructured_html: string;
					example_html?: string;
					chapter_number: number;
					missing_information?: string;
					is_empty?: boolean;
				}>;
			}> = [];
			
			for (const language of finalLanguages) {
				const contentKey = contentFields[language as keyof typeof contentFields];
				let content = manualData.manual[contentKey];

				console.log(`=== DEBUG CONTENUTO ${language} ===`);
				console.log(`ContentKey: ${contentKey}`);
				console.log(`Content trovato:`, !!content);
				console.log(`Tipo content:`, typeof content);
				console.log(`È array:`, Array.isArray(content));

				if (!content) {
					console.error(`Nessun contenuto trovato per la lingua ${language}`);
					continue;
				}

				// Gestisci il caso in cui il contenuto è in formato traduzione
				if (typeof content === 'object') {
					if (Array.isArray(content)) {
						console.log(`Contenuto ${language} è già un array`);
					} else if ('capitoli' in content && Array.isArray(content.capitoli)) {
						content = content.capitoli;
						console.log(`Contenuto ${language} estratto da capitoli`);
					} else if (content.status === 'success' && Array.isArray(content.capitoli)) {
						content = content.capitoli;
						console.log(`Contenuto ${language} estratto da status success`);
					} else {
						console.error(`Formato contenuto non riconosciuto per ${language}:`, content);
						continue;
					}
				}

				if (!Array.isArray(content)) {
					console.error(`Il contenuto per ${language} non è un array:`, content);
					continue;
				}

				console.log(`Contenuto finale ${language}:`, content.length, 'capitoli');

				allLanguageContents.push({
					language,
					content
				});
			}

			// Trova il contenuto inglese per la prima pagina
			const englishContent = allLanguageContents.find(lc => lc.language === 'English');
			console.log("=== DEBUG PRIMA PAGINA ===");
			console.log("English content trovato:", !!englishContent);
			console.log("All language contents:", allLanguageContents.map(lc => ({ language: lc.language, chapters: lc.content.length })));
			
			if (!englishContent || !englishContent.content[0]) {
				throw new Error("Contenuto inglese non trovato per la prima pagina");
			}

			console.log("Primo capitolo inglese:", englishContent.content[0].chapter_info);

			// PRIMA PAGINA: Titoli multilingua + primo capitolo inglese + logo IN BASSO
			const firstPageContent = `
				<div class="first-page">
					<div class="multilingual-titles">
						${finalLanguages.map(lang => `
							<h1 class="instruction-title ${lang.toLowerCase()}">${getInstructionManualTitle(lang)}</h1>
						`).join('')}
					</div>
					
					<div class="first-chapter">
						<h2>${englishContent.content[0].chapter_info || 'Capitolo 1'}</h2>
						<div class="chapter-content">
							${formatHtmlContent(englishContent.content[0].restructured_html, template)}
						</div>
					</div>
					
					${template.logo_path ? `
						<div class="first-page-logo">
							<img src="${template.logo_path}" alt="Logo" class="logo-first-page" />
						</div>
					` : ''}
				</div>
			`;

			// SECONDA PAGINA: Indice generale delle lingue, logo IN ALTO
			const generalIndexContent = `
				<div class="general-index">
					${template.logo_path ? `
						<div class="general-index-header">
							<img src="${template.logo_path}" alt="Logo" class="logo-general-index" />
						</div>
					` : ''}
					<h2>Indice</h2>
					<div class="languages-list">
						${finalLanguages.map((language) => {
							const displayName = language === 'English' ? 'Original Instructions' : languageNames[language];
							const langCode = languageCodes[language] || language;
							return `
								<div class="language-index-item">
									<a href="#index-${langCode}" class="language-name">${displayName}</a>
								</div>
							`;
						}).join('')}
					</div>
				</div>
			`;

			// PAGINE SUCCESSIVE: Ogni lingua completa con il proprio indice
			let allContent = firstPageContent + generalIndexContent;

			finalLanguages.forEach((language, languageIdx) => {
				const languageContent = allLanguageContents.find(lc => lc.language === language);
				if (!languageContent) return;

				// Capitoli da stampare: per l'inglese salta il primo (già in prima pagina)
				const chaptersToPrint = language === 'English'
					? languageContent.content.slice(1)
					: languageContent.content.slice(1);
				if (chaptersToPrint.length === 0) return;

				// --- INIZIO INDICE LINGUA ---
				// Estrai voci indice: nome capitolo + tutti gli h2 di ogni capitolo
				let indexEntries: { title: string; page: string; id: string }[] = [];
				chaptersToPrint.forEach((chapter: any, idx: number) => {
					// Capitolo principale
					const chapterId = `${language}-chapter-${chapter.chapter_number}`;
					indexEntries.push({
						title: chapter.chapter_info || `Capitolo ${chapter.chapter_number}`,
						page: `P. ...`,
						id: chapterId
					});
					// Estrai tutti gli h2 dal restructured_html
					if (chapter.restructured_html) {
						const h2Matches = Array.from(chapter.restructured_html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)) as RegExpMatchArray[];
						h2Matches.forEach((match, h2Idx) => {
							const h2Text = match[1]?.replace(/<[^>]+>/g, '').trim();
							if (h2Text) {
								const h2Id = `${chapterId}-h2-${h2Idx+1}`;
								indexEntries.push({
									title: h2Text,
									page: `P. ...`,
									id: h2Id
								});
							}
						});
					}
				});
				// --- FINE ESTRAZIONE INDICE ---

				// Indice della lingua corrente con link e id per ancoraggio
				const languageIndexContent = `
					<div class="language-index-custom" id="index-${languageCodes[language] || language}">
						<div class="language-label">${languageCodes[language] || language}</div>
						<div class="language-index-title"><span>${language === 'English' ? 'ORIGINAL INSTRUCTIONS' : (languageNames[language] || language)}</span></div>
						<ol class="language-index-list">
							${indexEntries.map((entry, idx) => `
								<li class="language-index-item">
									<a href="#${entry.id}" class="index-title">${entry.title}</a>
									<span class="index-page">${entry.page}</span>
								</li>
							`).join('')}
						</ol>
						<hr class="language-index-divider" />
					</div>
				`;

				// Label lingua solo all'inizio della sezione
				const langClass = `language-section-${language.toLowerCase()}`;
				const badgeHtml = `
					<div class="language-label-section ${langClass}">
						${languageCodes[language] || language}
					</div>
				`;
				const languageFullContent = `
					<div class="language-section ${langClass}">
						${badgeHtml}
						<h1>${language === 'English' ? 'Original Instructions' : languageNames[language]}</h1>
						${chaptersToPrint.map((chapter: any) => {
							const chapterId = `${language}-chapter-${chapter.chapter_number}`;
							// RIMUOVO IL TITOLO DEL CAPITOLO QUI
							let chapterHtml = `<div class="chapter" id="${chapterId}">
								<div class="chapter-content">`;
							let html = chapter.restructured_html || '';
							let h2Idx = 1;
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							html = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, ( _match: any, attrs: any, content: any ) => {
								const h2Id = `${chapterId}-h2-${h2Idx++}`;
								return `<h2 id=\"${h2Id}\"${attrs}>${content}</h2>`;
							});
							chapterHtml += `${formatHtmlContent(html, template)}</div></div>`;
							return chapterHtml;
						}).join('')}
					</div>
				`;

				allContent += languageIndexContent + languageFullContent;
				// Inserisco page break tra le sezioni, tranne dopo l'ultima
				if (languageIdx < finalLanguages.length - 1) {
					allContent += '<div class="page-break"></div>';
				}
			});

			// --- CSS DINAMICO PER IL FORMATO PAGINA ---
			const pageCss = `
			  @page {
			    size: ${pageFormat};
			    margin: 2cm;
			    @bottom-center {
			      content: "${manualTitle} - v${manualData.manual.version} - Pagina " counter(page);
			      font-family: var(--font-paragraph);
			      font-size: 10pt;
			      color: var(--color-primary);
			    }
			  }
			`;

			const html = `
			  <html>
			    <head>
			      <style>
			        ${pageCss}
			        :root {
			          --font-title: ${template.font_title || 'Arial'};
			          --font-paragraph: ${template.font_paragraph || 'Arial'};
			          --color-primary: ${template.color || '#000000'};
			        }
			        body {
			          font-family: var(--font-paragraph);
			          color: black;
			          margin: 0;
			          line-height: 1.6;
			          font-size: 0.95rem;
			        }
			        h1 {
			          font-family: var(--font-title);
			          color: black;
			          margin-top: 1.2rem;
			          margin-bottom: 0.7rem;
			          font-size: 1.2rem;
			        }
			        h2 {
			          font-family: var(--font-title);
			          color: black;
			          margin-top: 1rem;
			          margin-bottom: 0.5rem;
			          font-size: 1.05rem;
			        }
			        h3 {
			          font-family: var(--font-title);
			          color: black;
			          margin-top: 0.7rem;
			          margin-bottom: 0.3rem;
			          font-size: 1rem;
			        }
			        .paragraph, .list, .list-item, .table, .table-header-cell, .table-cell, .chapter-content, .example {
			          font-size: 0.95rem;
			        }
			        .header {
			          text-align: center;
			          margin-bottom: 2rem;
			          padding-bottom: 1rem;
			          border-bottom: 2px solid var(--color-primary);
			        }
			        .header h1 {
			          color: var(--color-primary);
			        }
			        .header img {
			          max-width: 200px;
			          height: auto;
			          margin-bottom: 1rem;
			        }
			        .footer {
			          text-align: center;
			          margin-top: 2rem;
			          padding-top: 1rem;
			          border-top: 2px solid var(--color-primary);
			        }
			        .footer img {
			          max-width: 200px;
			          height: auto;
			        }
			        .list {
			          margin: 1rem 0;
			          padding-left: 2rem;
			          color: black;
			        }
			        .list-item {
			          margin-bottom: 0.5rem;
			          color: black;
			        }
			        .image {
			          max-width: 100%;
			          height: auto;
			          margin: 1rem 0;
			        }
			        .table {
			          width: 100%;
			          border-collapse: collapse;
			          margin: 1rem 0;
			          page-break-inside: avoid;
			        }
			        .table-header {
			          background-color: #f8f9fa;
			        }
			        .table-header-cell {
			          padding: 0.75rem;
			          border: 1px solid #dee2e6;
			          font-weight: bold;
			          text-align: left;
			          background-color: #f8f9fa;
			          color: black;
			        }
			        .table-cell {
			          padding: 0.75rem;
			          border: 1px solid #dee2e6;
			          vertical-align: top;
			          color: black;
			        }
			        .table-row:nth-child(even) {
			        }
			        .table-row:hover {
			          background-color: #f2f2f2;
			        }
			        .example {
			          margin: 1rem 0;
			          padding: 1rem;
			          background-color: #f8f9fa;
			          border-radius: 4px;
			        }
			        .example h3 {
			          color: var(--color-primary);
			          margin-bottom: 1rem;
			        }
			        ${additionalStyles}
			      </style>
			    </head>
			    <body>
			      ${allContent}
			      <!-- Il footer viene inserito solo dopo la prima pagina -->
			      ${template.logo_footer ? `
			        <div class="footer">
			          <img src="${template.logo_footer}" alt="Footer Logo">
			        </div>
			      ` : ''}
			    </body>
			  </html>
			`;

			// --- GENERAZIONE PDF/DOCX DAL BACKEND ---
			const fileExtension = exportFormat === "pdf" ? "pdf" : "docx";
			const contentType =
				exportFormat === "pdf"
					? "application/pdf"
					: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			const dbField = exportFormat === "pdf" ? "pdf" : "docx";
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_SITE_FLASK}/flask-api/stampaPdf`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": contentType,
					},
					body: JSON.stringify({
						html_content: html,
						nomemanuale: `${manualTitle}_multilingua`,
						format: exportFormat,
						template: {
							font_title: template.font_title,
							font_paragraph: template.font_paragraph,
							color: template.color,
							logo_path: template.logo_path,
							logo_footer: template.logo_footer
						}
					}),
				},
			);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("Errore generazione file:", errorData);
				throw new Error(`Errore nella generazione del file: ${errorData.message || response.statusText}`);
			}
			// Leggo il numero di pagine dal backend (solo per PDF)
			let pagesCount: number | undefined = undefined;
			if (exportFormat === 'pdf') {
				const pagesCountHeader = response.headers.get('X-Pages-Count');
				if (pagesCountHeader) {
					const parsed = parseInt(pagesCountHeader, 10);
					if (!isNaN(parsed)) pagesCount = parsed;
				}
			}
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${manualTitle}_multilingua.${fileExtension}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			// --- UPLOAD SU AZURE E SALVATAGGIO LINK NEL DB ---
			try {
				const reader = new FileReader();
				reader.onloadend = async () => {
					const base64data = reader.result as string;
					const fileData = base64data.split(",")[1];
					// Upload su Azure
					const uploadResponse = await fetch("/api/storage/azure/upload", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							file: fileData,
							containerName: "manuali",
							blobName: `${manualTitle}_multilingua.${fileExtension}`,
							contentType,
							expiryInDays: 365,
						}),
					});
					if (!uploadResponse.ok) {
						const errorData = await uploadResponse.json().catch(() => ({}));
						toast({
							title: `Errore upload Azure`,
							description: errorData.error || errorData.details || "Errore sconosciuto durante l'upload su Azure",
							variant: "error",
						});
						return;
					}
					const { url: azureUrl } = await uploadResponse.json();
					// Salva il link nel campo giusto e pagesOutput se PDF
					const updateBody: any = {
						[dbField]: azureUrl,
						last_updated: new Date().toISOString(),
					};
					if (exportFormat === 'pdf' && pagesCount) {
						updateBody.pagesOutput = pagesCount;
					}
					const updateResponse = await fetch(`/api/manuals/${manualId}`, {
						method: "PATCH",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(updateBody),
					});
					if (!updateResponse.ok) {
						const errorData = await updateResponse.json().catch(() => ({}));
						toast({
							title: `Errore salvataggio link ${fileExtension.toUpperCase()}`,
							description: errorData.error || errorData.details || `Errore sconosciuto durante il salvataggio del link ${fileExtension.toUpperCase()}`,
							variant: "error",
						});
						return;
					}
					toast({
						title: `${fileExtension.toUpperCase()} multilingua caricato su Azure`,
						description: `Il file ${fileExtension.toUpperCase()} multilingua è stato caricato e il link è stato salvato nel database.`,
					});
				};
				reader.readAsDataURL(blob);
			} catch (error) {
				toast({
					title: `Errore upload Azure`,
					description: error instanceof Error ? error.message : `Errore sconosciuto durante l'upload su Azure`,
					variant: "error",
				});
			}

			// Aggiorna il database con il link del PDF multilingua
			console.log("Aggiornamento database con link PDF multilingua...");
			const updateResponse = await fetch(`/api/manuals/${manualId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					pdf_multilingua: `${manualTitle}_multilingua.pdf`,
					last_updated: new Date().toISOString(),
				}),
			});

			if (!updateResponse.ok) {
				console.error("Errore nell'aggiornamento del database");
			}

			toast({
				title: "Successo",
				description: "File PDF multilingua generato e scaricato con successo",
			});
		} catch (error) {
			console.error("Errore durante la stampa multilingua:", error);
			toast({
				variant: "error",
				title: "Errore",
				description: "Si è verificato un errore durante la stampa multilingua",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const handlePrintAllButtonClick = () => {
		// Apro la modale per la scelta del formato
		setShowPrintDialog(true);
	};

	const handleConfirmPrint = () => {
		setShowPrintDialog(false);
		handlePrintAllLanguages();
	};

	const handleNavigateToProcessing = () => {
		const currentManualId = searchParams.get("manualId");
		if (!currentManualId) {
			toast({
				variant: "error",
				title: "Errore",
				description: "ID manuale non trovato"
			});
			return;
		}

		// Salva solo l'ID del manuale corrente
		sessionStorage.setItem("currentManualId", currentManualId);
		
		// Naviga alla pagina di processing mantenendo l'ID nell'URL
		router.push(`/app/manual/processing?manualId=${currentManualId}`);
	};

	// Funzione per gestire il click del bottone Edit
	const handleEdit = (language: string) => {
		const currentManualId = searchParams.get("manualId");
		if (!currentManualId) {
			toast({
				variant: "error",
				title: "Errore",
				description: "ID manuale non trovato"
			});
			return;
		}

		// Salva l'ID del manuale corrente
		sessionStorage.setItem("currentManualId", currentManualId);
		
		// Salva la lingua selezionata per il processing
		sessionStorage.setItem("selectedLanguage", language);
		
		// Naviga alla pagina di processing con l'ID del manuale
		router.push(`/app/manual/processing?manualId=${currentManualId}&language=${language}`);
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold text-gray-900">
						Traduzioni Manuale
					</h2>
					<div className="flex items-center gap-2">
						<select
							value={exportFormat}
							onChange={e => setExportFormat(e.target.value as 'pdf' | 'docx')}
							className="border rounded px-2 py-1 text-sm"
							aria-label="Formato esportazione"
						>
							<option value="pdf">PDF</option>
							{/* <option value="docx">DOCX</option> */}
						</select>
						<Button
							onClick={handlePrintAllButtonClick}
							disabled={isExporting}
							className="bg-primary hover:bg-primary/90"
						>
							{isExporting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Esportazione in corso...
								</>
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Stampa tutte le lingue
								</>
							)}
						</Button>
					</div>
				</div>
				<p className="text-gray-600">
					Gestisci le traduzioni del tuo manuale in diverse lingue.
					 Ogni traduzione viene verificata automaticamente per
					garantire la massima qualità.
				</p>
			</div>
			<Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Seleziona il formato di stampa</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4">
						<label htmlFor="pageFormat" className="text-sm">Formato pagina:</label>
						<select
							id="pageFormat"
							value={pageFormat}
							onChange={e => setPageFormat(e.target.value as 'A4' | 'A5')}
							className="border rounded px-2 py-1 text-sm"
							aria-label="Formato pagina"
						>
							<option value="A4">A4</option>
							<option value="A5">A5</option>
						</select>
					</div>
					<DialogFooter>
						<Button onClick={handleConfirmPrint} disabled={isExporting} className="bg-primary hover:bg-primary/90 w-full">
							Conferma e stampa
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Object.entries(translations).map(([language, status]) => {
					// Verifica se c'è contenuto per questa lingua
					const hasContent =
						status.status === "completed" ||
						status.translation === 100 ||
						status.status === "edit";

					return (
						<Card
							key={language}
							className="relative overflow-hidden"
						>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>{language}</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												Traduzione
											</span>
											<span className="text-sm text-muted-foreground">
												{status.translation}%
											</span>
										</div>
										<Progress
											value={status.translation}
											className="h-2"
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<div className="flex items-center gap-2">
									{hasContent && (
										<Button
											onClick={() => handleEdit(language)}
											variant="secondary"
											size="sm"
											className="flex-1"
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</Button>
									)}
									<Button
										onClick={() =>
											handleTranslate(language)
										}
										disabled={
											status.status === "processing"
										}
										className="w-full"
										variant={
											status.status === "completed"
												? "outline"
												: "primary"
										}
									>
										{status.status === "processing" ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Traduzione in corso...
											</>
										) : status.status === "completed" ? (
											<>
												<RefreshCw className="mr-2 h-4 w-4" />
												Ritraduci
											</>
										) : (
											<>
												<Languages className="mr-2 h-4 w-4" />
												Traduci
											</>
										)}
									</Button>
								</div>
							</CardFooter>
						</Card>
					);
				})}
			</div>
			<div className="mt-8">
				<Button
					onClick={handleNavigateToProcessing}
						className="w-full"
						variant="primary"
					>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Indietro
				</Button>
			</div>
		</div>
	);
}

// Handler per onloadend del FileReader per upload PDF multilingua su Azure
type SupportedLanguage =
	| "Italian"
	| "French"
	| "German"
	| "English"
	| "Spanish";

interface Logger {
	info: (message: string, data?: any) => void;
	error: (message: string, data?: any) => void;
}

export function getOnLoadEndHandler(
	language: SupportedLanguage,
	blob: Blob,
	dbData: any,
	manualId: string,
	reader: FileReader,
	toast: (args: any) => void,
	logger: Logger,
	linguaToDbKey: Record<SupportedLanguage, string>,
	format: "pdf" | "docx" = "pdf",
) {
	return async () => {
		const base64data = reader.result as string;
		const fileData = base64data.split(",")[1];

		// Prepara i dati per il salvataggio
		const updateData: Record<string, string> = {};
		const fileField = format === "pdf" ? "pdf" : "docx";
		const languageField = `${fileField}_${linguaToDbKey[language].toLowerCase()}`;

		// Salva il file in Azure e ottieni l'URL
		try {
			logger.info("Inizio upload su Azure", {
				manualName: dbData.manual.name,
				language,
				format,
			});

			const response = await fetch("/api/storage/azure/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					file: fileData,
					containerName: "manuali",
					blobName: `${dbData.manual.name}/${dbData.manual.version}/${linguaToDbKey[language].toLowerCase()}_${format}.${format}`,
					contentType:
						format === "pdf"
							? "application/pdf"
							: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					expiryInDays: 365, // Link valido per 1 anno
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				logger.error("Errore nell'upload su Azure", {
					status: response.status,
					statusText: response.statusText,
					errorData,
				});
				throw new Error(
					`Errore nell'upload su Azure: ${errorData.error || errorData.details || "Errore sconosciuto"}`,
				);
			}

			const { url: azureUrl } = await response.json();
			updateData[languageField] = azureUrl;

			logger.info("Upload su Azure completato", {
				url: azureUrl,
				manualName: dbData.manual.name,
				language,
				format,
			});

			// Aggiorna il database
			const updateResponse = await fetch(`/api/manuals/${manualId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			if (!updateResponse.ok) {
				const errorData = await updateResponse.json().catch(() => ({}));
				logger.error("Errore nell'aggiornamento del database", {
					status: updateResponse.status,
					statusText: updateResponse.statusText,
					errorData,
				});
				throw new Error(
					`Errore nell'aggiornamento del database: ${errorData.error || errorData.details || "Errore sconosciuto"}`,
				);
			}

			toast({
				title: "File generato con successo",
				description: `Il file ${format.toUpperCase()} è stato salvato correttamente`,
			});
		} catch (error) {
			console.error("Errore nel salvataggio:", error);
			toast({
				title: "Errore nel salvataggio",
				description:
					error instanceof Error
						? error.message
						: "Si è verificato un errore durante il salvataggio del file",
				variant: "error",
			});
		}
	};
}
			