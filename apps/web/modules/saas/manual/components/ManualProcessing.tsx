"use client";

import { Alert, AlertDescription } from "@ui/components/alert";
import { useToast } from "@ui/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUpdateManualMutation } from "../lib/api";
import { ProcessingClient } from "./processing";

export function ManualProcessing() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const updateManual = useUpdateManualMutation();

	useEffect(() => {
		async function loadManualData() {
			try {
				// Recupera l'ID del manuale dall'URL
				const manualId = searchParams.get("manualId");
				if (!manualId) {
					throw new Error("ID manuale non trovato nell'URL");
				}

				// Carica i dati del manuale dal database
				const response = await fetch(`/api/manuals/${manualId}`);
				if (!response.ok) {
					throw new Error("Errore nel recupero dei dati del manuale");
				}
				const data = await response.json();
				console.log("Dati manuale ricevuti:", data);

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
						manualId: manualId,
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

				setIsLoading(false);
			} catch (error) {
				console.error("Errore nel caricamento del manuale:", error);
				setError(
					error instanceof Error
						? error.message
						: "Errore nel caricamento del manuale",
				);
				toast({
					title: "Errore",
					description:
						"Si è verificato un errore durante il caricamento del manuale",
					variant: "error",
				});
				setIsLoading(false);
			}
		}

		loadManualData();
	}, [searchParams, toast]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="error">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return <ProcessingClient />;
}
