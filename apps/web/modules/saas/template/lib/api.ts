import { authClient } from "@repo/auth/client";
import { db } from "@repo/database";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface TemplateData {
	name: string;
	description?: string;
	isActive: boolean;
	logo_path?: string;
	logo_footer?: string;
	color: string;
	font_title: string;
	font_paragraph: string;
}

interface TemplateCreateData {
	name: string;
	titleFont: string;
	titleSize: number;
	titleColor: string;
	subtitleFont: string;
	subtitleSize: number;
	subtitleColor: string;
	paragraphFont: string;
	paragraphSize: number;
	paragraphColor: string;
	userId: string;
	imageType?: string;
	logo?: Buffer;
}

async function fileToBuffer(file: File): Promise<Buffer> {
	const arrayBuffer = await file.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

export async function createTemplate(data: TemplateData) {
	const response = await fetch("/api/templates", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Errore durante la creazione del template");
	}

	return response.json();
}

export async function getTemplates() {
	const response = await fetch("/api/templates");
	if (!response.ok) {
		throw new Error("Errore durante il recupero dei template");
	}
	return response.json();
}

// Query key per la lista dei template
export const templateListQueryKey = () => ["template-list"] as const;

// Hook per ottenere la lista dei template
export const useTemplateListQuery = () =>
	useQuery({
		queryKey: templateListQueryKey(),
		queryFn: async () => {
			const { data: session, error } = await authClient.getSession();

			if (error || !session?.user?.id) {
				throw new Error("User not authenticated");
			}

			const templates = await db.template.findMany({
				where: {
					userId: session.user.id,
				},
				include: {
					user: {
						select: {
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return templates;
		},
	});

// Mutation per creare un nuovo template
export function useCreateTemplateMutation() {
	return useMutation({
		mutationFn: createTemplate,
	});
}

// Mutation per eliminare un template
export const useDeleteTemplateMutation = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/templates/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete template");
			}
		},
	});
};

export function useTemplatesQuery() {
	return useQuery({
		queryKey: ["templates"],
		queryFn: getTemplates,
	});
}
