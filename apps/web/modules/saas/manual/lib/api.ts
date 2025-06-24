import { db } from "@repo/database";
import { useMutation, useQuery } from "@tanstack/react-query";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

// URL del servizio Flask
const FLASK_URL = process.env.NEXT_PUBLIC_SITE_FLASK || "http://localhost:5000";

export const analyzeManualMutationKey = ["analyze-manual"] as const;

interface AnalyzeManualParams {
	file: File;
	manualName: string;
	version: string;
	exampleManualUrl: string;
}

export const useAnalyzeManualMutation = () => {
	return useMutation({
		mutationKey: analyzeManualMutationKey,
		mutationFn: async ({
			file,
			manualName,
			version,
			exampleManualUrl,
		}: AnalyzeManualParams) => {
			const startTime = Date.now();

			if (file.size > MAX_FILE_SIZE) {
				throw new Error("Il file non può superare 1GB");
			}

			const manualId = sessionStorage.getItem("currentManualId");
			if (!manualId) {
				console.error("ID manuale non trovato nel sessionStorage");
				throw new Error("ID manuale non trovato");
			}

			// Salviamo i dati del form in sessionStorage
			sessionStorage.setItem("currentManualName", manualName);
			sessionStorage.setItem("currentManualVersion", version);
			sessionStorage.setItem("analysisStartTime", startTime.toString());

			const formData = new FormData();
			formData.append("files[]", file);
			formData.append("manualName", manualName);
			formData.append("version", version);
			if (exampleManualUrl) {
				formData.append("exampleManualUrl", exampleManualUrl);
			}

			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 14400000);

				// Iniziamo l'analisi
				const response = await fetch(`${FLASK_URL}/api/process-pdf`, {
					method: "POST",
					body: formData,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						errorData.message ||
							errorData.error ||
							"Errore durante l'analisi del manuale",
					);
				}

				const data = await response.json();
				const processingTime = Math.round((Date.now() - startTime) / 1000);

				// Log per debug - vediamo cosa restituisce il servizio Python
				console.log("Risposta del servizio Python:", data);
				console.log("restructured_content:", data.restructured_content);

				// Salviamo i dati dell'analisi nel sessionStorage
				sessionStorage.setItem("lastAnalysisData", JSON.stringify({
					data,
					timestamp: Date.now(),
					processingTime
				}));

				// Aggiorniamo il manuale nel database
				const updateResponse = await fetch(`/api/manuals/${manualId}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contentEn: data.restructured_content || [],
						images: data.images || [],
					}),
				});

				if (!updateResponse.ok) {
					throw new Error("Errore nell'aggiornamento del manuale");
				}

				return data;
			} catch (error) {
				console.error("Errore durante l'analisi:", error);
				throw error;
			}
		},
	});
};

export interface Section {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	cards: Array<{
		id: number;
		title: string;
		description: string;
	}>;
}

export async function getSectionsManual(): Promise<Section[]> {
	const sections = await db.sectionsManual.findMany({
		include: {
			cards: true,
		},
	});
	return sections;
}

export const updateManualMutationKey = ["update-manual"] as const;

interface UpdateManualParams {
	id: number;
	contentEn: any;
	images: string[];
	pagesInput: number;
}

export const useUpdateManualMutation = () => {
	return useMutation({
		mutationKey: updateManualMutationKey,
		mutationFn: async ({
			id,
			contentEn,
			images,
			pagesInput,
		}: UpdateManualParams) => {
			const response = await fetch(`/api/manuals/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contentEn,
					images,
					pagesInput,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					error.message ||
						"Errore durante l'aggiornamento del manuale",
				);
			}

			return response.json();
		},
	});
};

export const getManualVersionsKey = ["manual-versions"] as const;

export const useGetManualVersions = (manualId: number) => {
	return useQuery({
		queryKey: [...getManualVersionsKey, manualId],
		queryFn: async () => {
			const response = await fetch(
				`/api/manual-versions?manualId=${manualId}`,
			);
			if (!response.ok) {
				throw new Error(
					"Errore nel recupero delle versioni del manuale",
				);
			}
			const data = await response.json();
			return data.versions;
		},
	});
};
