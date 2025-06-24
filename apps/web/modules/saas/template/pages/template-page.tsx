"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useToast } from "@ui/components/use-toast";
import { useEffect, useState } from "react";
import {
	createTemplate,
	deleteTemplate,
	getTemplates,
	updateTemplate,
} from "../api";
import { TemplateDialog } from "../components/template-dialog";
import { TemplateList } from "../components/template-list";
import type { Template } from "../types";

export default function TemplatePage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		loadTemplates();
	}, []);

	async function loadTemplates() {
		try {
			const data = await getTemplates();
			setTemplates(data);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load templates",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}

	async function handleCreate(values: any) {
		try {
			await createTemplate(values);
			await loadTemplates();
			toast({
				title: "Success",
				description: "Template created successfully",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create template",
				variant: "destructive",
			});
		}
	}

	async function handleEdit(template: Template) {
		try {
			await updateTemplate(template);
			await loadTemplates();
			toast({
				title: "Success",
				description: "Template updated successfully",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update template",
				variant: "destructive",
			});
		}
	}

	async function handleDelete(template: Template) {
		try {
			await deleteTemplate(template.id);
			await loadTemplates();
			toast({
				title: "Success",
				description: "Template deleted successfully",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete template",
				variant: "destructive",
			});
		}
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle>Templates</CardTitle>
				<TemplateDialog onSubmit={handleCreate} />
			</CardHeader>
			<CardContent>
				<TemplateList
					templates={templates}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</CardContent>
		</Card>
	);
}
