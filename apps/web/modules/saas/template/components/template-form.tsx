"use client";

import { useToast } from "@ui/hooks/use-toast";
import type { Template } from "../types";
import { TemplateFormFields } from "./template-form-fields";

interface TemplateFormProps {
	onClose: () => void;
	template?: Template | null;
}

export function TemplateForm({ onClose, template }: TemplateFormProps) {
	const { toast } = useToast();

	const handleSubmit = async (data: Partial<Template>) => {
		try {
			if (template) {
				// Salva la revisione del template esistente
				await fetch("/api/template-revisions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						template_id: template.id,
						name: template.name,
						description: template.description,
						isActive: template.isActive,
						logo_path: template.logo_path,
						logo_footer: template.logo_footer,
						color: template.color,
						font_title: template.font_title,
						font_paragraph: template.font_paragraph,
					}),
				});

				// Aggiorna il template
				const response = await fetch(
					`/api/templates?id=${template.id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(data),
					},
				);

				if (!response.ok) {
					throw new Error(
						"Errore durante l'aggiornamento del template",
					);
				}

				toast({
					title: "Successo",
					description: "Template aggiornato con successo",
					variant: "success",
				});
			} else {
				// Crea un nuovo template
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

				toast({
					title: "Successo",
					description: "Template creato con successo",
					variant: "success",
				});
			}

			onClose();
		} catch (error) {
			console.error("Errore:", error);
			toast({
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Errore sconosciuto",
				variant: "error",
			});
		}
	};

	const convertNullToUndefined = (obj: any) => {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key,
				value === null ? undefined : value,
			]),
		);
	};

	return (
		<TemplateFormFields
			onSubmit={handleSubmit}
			onCancel={onClose}
			defaultValues={
				template ? convertNullToUndefined(template) : undefined
			}
		/>
	);
}
