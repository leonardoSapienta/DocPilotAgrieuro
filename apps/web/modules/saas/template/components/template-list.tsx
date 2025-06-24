"use client";
import {} from "lucide-react";
import type { Template } from "../types";
import { TemplateCard } from "./template-card";

interface TemplateListProps {
	templates: Template[];
	onEdit: (template: Template) => void;
	onDelete: (id: number) => void;
}

export function TemplateList({
	templates,
	onEdit,
	onDelete,
}: TemplateListProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{templates.map((template) => (
				<TemplateCard key={template.id} template={template} />
			))}
		</div>
	);
}
