"use client";

import { Alert, AlertDescription } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { ScrollArea } from "@ui/components/scroll-area";
import { } from "@ui/components/select";
import { Eye, History, Loader2, Pen, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { TemplateForm } from "../../../../../modules/saas/template/components/template-form";
import { Metadata } from "next";




interface Template {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	userId: string;
	user: {
		name: string;
		email: string;
	};
	cover: {
		photoPosition: string;
		width: number;
		height: number;
		titleAlignment: string;
		margin: number;
		backgroundColor?: string;
		backgroundImage?: string;
	};
	footer: {
		height: number;
		color: string;
		pageNumberPosition: string;
		email: string | null;
		address: string | null;
		marginTop: number;
		marginLeft: number;
		marginRight: number;
	};
	font: {
		titleFont: string;
		textFont: string;
		titleSize: number;
		textSize: number;
		lineHeight: number;
		paragraphSpacing: number;
	};
	titleColors: {
		h1Color: string;
		h2Color: string;
		h3Color: string;
		h4Color: string;
		h5Color: string;
		h6Color: string;
	};
	finalPage: {
		show: boolean;
		text: string | null;
		backgroundColor: string;
		textColor: string;
		font: string;
		fontSize: number;
		textAlignment: string;
		marginTop: number;
		marginBottom: number;
		imagePath?: string | null;
		imageX?: number;
		imageY?: number;
		imageWidth?: number;
		imageHeight?: number;
		logoPath?: string | null;
		logoX?: number;
		logoY?: number;
		logoWidth?: number;
		logoHeight?: number;
	};
	logo_path: string | null;
	logo_footer: string | null;
	color: string;
	font_title: string;
	font_paragraph: string;
}

interface TemplateFormData {
	logo_path?: string;
	color: string;
}


export default function TemplatePage() {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [previewData, setPreviewData] = useState<Template | null>(null);
	const [editingTemplate, setEditingTemplate] = useState<Template | null>(
		null,
	);
	const [formData, setFormData] = useState<Partial<Template>>({
		name: "",
		description: "",
		isActive: true,
		cover: {
			photoPosition: "top",
			width: 100,
			height: 200,
			titleAlignment: "center",
			margin: 20,
			backgroundColor: "#ffffff",
			backgroundImage: undefined,
		},
		footer: {
			height: 80,
			color: "#f3f4f6",
			pageNumberPosition: "center",
			email: null,
			address: null,
			marginTop: 20,
			marginLeft: 20,
			marginRight: 20,
		},
		font: {
			titleFont: "Arial",
			textFont: "Arial",
			titleSize: 24,
			textSize: 14,
			lineHeight: 1.5,
			paragraphSpacing: 1,
		},
		titleColors: {
			h1Color: "#000000",
			h2Color: "#1a1a1a",
			h3Color: "#333333",
			h4Color: "#4d4d4d",
			h5Color: "#666666",
			h6Color: "#808080",
		},
		finalPage: {
			show: false,
			text: null,
			backgroundColor: "#ffffff",
			textColor: "#000000",
			font: "Arial",
			fontSize: 16,
			textAlignment: "center",
			marginTop: 40,
			marginBottom: 40,
		},
	});
	const [error, setError] = useState<string | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [showPreview, setShowPreview] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
		null,
	);
	const headerRef = useRef<HTMLDivElement>(null);
	const form = useForm<TemplateFormData>();
	const router = useRouter();
	const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
	const [revisions, setRevisions] = useState<any[]>([]);
	const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
	const [isRestoring, setIsRestoring] = useState(false);

	useEffect(() => {
		fetchTemplates();
	}, []);

	const fetchTemplates = async () => {
		try {
			const response = await fetch("/api/templates");
			if (!response.ok) {
				throw new Error("Errore nel caricamento dei template");
			}
			const data = await response.json();
			setTemplates(data);
		} catch (error) {
			console.error("Errore:", error);
			setError("Errore nel caricamento dei template");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);

		try {
			const url = editingTemplate
				? `/api/templates?id=${editingTemplate.id}`
				: "/api/templates";
			const method = editingTemplate ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				body: form,
			});

			if (!response.ok) {
				throw new Error("Error saving template");
			}

			const template = await response.json();
			if (editingTemplate) {
				setTemplates((prev) =>
					prev.map((t) => (t.id === template.id ? template : t)),
				);
			} else {
				setTemplates((prev) => [template, ...prev]);
			}
			setPreviewData(template);
			setFormData({
				name: "",
				description: "",
				isActive: true,
				cover: {
					photoPosition: "top",
					width: 100,
					height: 200,
					titleAlignment: "center",
					margin: 20,
					backgroundColor: "#ffffff",
					backgroundImage: undefined,
				},
				footer: {
					height: 80,
					color: "#f3f4f6",
					pageNumberPosition: "center",
					email: null,
					address: null,
					marginTop: 20,
					marginLeft: 20,
					marginRight: 20,
				},
				font: {
					titleFont: "Arial",
					textFont: "Arial",
					titleSize: 24,
					textSize: 14,
					lineHeight: 1.5,
					paragraphSpacing: 1,
				},
				titleColors: {
					h1Color: "#000000",
					h2Color: "#1a1a1a",
					h3Color: "#333333",
					h4Color: "#4d4d4d",
					h5Color: "#666666",
					h6Color: "#808080",
				},
				finalPage: {
					show: false,
					text: null,
					backgroundColor: "#ffffff",
					textColor: "#000000",
					font: "Arial",
					fontSize: 16,
					textAlignment: "center",
					marginTop: 40,
					marginBottom: 40,
				},
			});
			setEditingTemplate(null);
			setShowForm(false);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`/api/templates?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Error deleting template");
			}

			setTemplates((prev) =>
				prev.filter((template) => template.id !== id),
			);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const handleEdit = (template: Template) => {
		setEditingTemplate(template);
		setShowForm(true);
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handlePreview = (template: Template) => {
		setSelectedTemplate(template);
		setShowPreview(true);

		// Inizializza il form con i valori del template
		form.setValue("logo_path", template.logo_path || "");
		form.setValue("color", template.color);
	};

	const handleRevisionsOpen = async (template: Template, open: boolean) => {
		setIsRevisionsOpen(open);
		if (open) {
			setSelectedTemplate(template);
			try {
				setIsLoadingRevisions(true);
				const response = await fetch(
					`/api/templates/${template.id}/revisions`,
				);
				if (!response.ok) {
					throw new Error("Errore nel caricamento delle revisioni");
				}
				const data = await response.json();
				setRevisions(data);
			} catch (error) {
				console.error("Errore:", error);
			} finally {
				setIsLoadingRevisions(false);
			}
		}
	};

	const handleRestore = async (revision: any) => {
		if (!selectedTemplate) return;
		setIsRestoring(true);
		try {
			const response = await fetch(
				`/api/templates/${selectedTemplate.id}/restore`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ revisionId: revision.id }),
				},
			);

			if (!response.ok) {
				throw new Error("Errore nel ripristino della revisione");
			}

			await fetchTemplates();
			setIsRevisionsOpen(false);
		} catch (error) {
			console.error("Errore:", error);
		} finally {
			setIsRestoring(false);
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Templates</h1>
				<Button
					onClick={() => {
						setEditingTemplate(null);
						setShowForm(true);
					}}
					className="bg-[#22c55e] hover:bg-[#16a34a]"
				>
					<Plus className="w-4 h-4 mr-2" />
					New Template
				</Button>
			</div>

			{error && (
				<Alert variant="error" className="mb-6">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent className="max-w-[80vw] h-[80vh] flex flex-col p-0">
					<div className="p-6 flex-1 overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Template</DialogTitle>
						</DialogHeader>
						<div className="mt-6">
							<TemplateForm
								onClose={() => setShowForm(false)}
								template={editingTemplate}
							/>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent className="max-w-6xl h-[90vh] p-0">
					<DialogHeader className="px-6 py-4 border-b">
						<DialogTitle className="text-xl font-semibold">
							Anteprima Template: {selectedTemplate?.name}
						</DialogTitle>
					</DialogHeader>
					{selectedTemplate && (
						<div className="h-full overflow-y-auto p-6">
							<div className="flex justify-center">
								<div className="w-[160mm] h-[226mm] bg-white shadow-lg border border-gray-200 p-8 relative rounded-none scale-90">
									{/* Header con logo */}
									{selectedTemplate.logo_path && (
										<div className="flex justify-center mb-8">
											<div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
												<img
													src={
														selectedTemplate.logo_path
													}
													alt="Logo Header"
													className="max-w-full max-h-full object-contain"
												/>
											</div>
										</div>
									)}

									{/* Titolo */}
									<h1
										className="text-4xl font-bold mb-6 text-black"
										style={{
											fontFamily:
												selectedTemplate.font_title,
										}}
									>
										Lorem Ipsum Dolor Sit Amet Consectetur
										Adipiscing Elit
									</h1>

									{/* Barra colorata */}
									<div
										className="h-2 w-full mb-8"
										style={{
											backgroundColor:
												selectedTemplate.color ||
												"#000000",
										}}
									/>

									{/* Paragrafi di esempio */}
									<div className="space-y-6 max-w-2xl">
										<p
											className="leading-relaxed"
											style={{
												fontFamily:
													selectedTemplate.font_paragraph,
											}}
										>
											Lorem ipsum dolor sit amet,
											consectetur adipiscing elit. Sed do
											eiusmod tempor incididunt ut labore
											et dolore magna aliqua. Ut enim ad
											minim veniam, quis nostrud
											exercitation ullamco laboris nisi ut
											aliquip ex ea commodo consequat.
										</p>
										<p
											className="leading-relaxed"
											style={{
												fontFamily:
													selectedTemplate.font_paragraph,
											}}
										>
											Duis aute irure dolor in
											reprehenderit in voluptate velit
											esse cillum dolore eu fugiat nulla
											pariatur. Excepteur sint occaecat
											cupidatat non proident, sunt in
											culpa qui officia deserunt mollit
											anim id est laborum.
										</p>
										<p
											className="leading-relaxed"
											style={{
												fontFamily:
													selectedTemplate.font_paragraph,
											}}
										>
											Sed ut perspiciatis unde omnis iste
											natus error sit voluptatem
											accusantium doloremque laudantium,
											totam rem aperiam, eaque ipsa quae
											ab illo inventore veritatis et quasi
											architecto beatae vitae dicta sunt
											explicabo.
										</p>
									</div>

									{/* Footer con logo */}
									{selectedTemplate.logo_footer && (
										<div className="absolute bottom-8 left-0 right-0 flex justify-center">
											<div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
												<img
													src={
														selectedTemplate.logo_footer
													}
													alt="Logo Footer"
													className="max-w-full max-h-full object-contain"
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{templates.map((template) => (
					<Card key={template.id} className="p-6 relative">
						<div className="absolute top-2 right-2 flex gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() =>
									handleRevisionsOpen(template, true)
								}
								className="relative group text-gray-500 hover:text-gray-700 hover:bg-gray-50"
							>
								<History className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handlePreview(template)}
								className="relative group text-gray-500 hover:text-gray-700 hover:bg-gray-50"
							>
								<Eye className="h-4 w-4" />
								<Pen className="h-3 w-3 absolute -top-1 -right-1 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
								onClick={() => handleEdit(template)}
							>
								<Pen className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-red-500 hover:text-red-700 hover:bg-red-50"
								onClick={() => handleDelete(template.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
						<div className="space-y-4">
							{/* Informazioni Base */}
							<div>
								<h2 className="text-xl font-semibold mb-2">
									{template.name}
								</h2>
								<p className="text-sm text-gray-600">
									{template.description}
								</p>
							</div>

							{/* Cover */}
							{template.cover && (
								<div className="border-t pt-2">
									<h3 className="font-medium mb-2">Cover</h3>
									<div className="space-y-1 text-sm">
										<p>
											Photo Position:{" "}
											{template.cover.photoPosition}
										</p>
										<p>
											Dimensions: {template.cover.width}x
											{template.cover.height}px
										</p>
										<p>
											Title Alignment:{" "}
											{template.cover.titleAlignment}
										</p>
										<p>Margin: {template.cover.margin}px</p>
									</div>
								</div>
							)}

							{/* Footer */}
							{template.footer && (
								<div className="border-t pt-2">
									<h3 className="font-medium mb-2">Footer</h3>
									<div className="space-y-1 text-sm">
										<p>
											Height: {template.footer.height}px
										</p>
										<p>Color: {template.footer.color}</p>
										<p>
											Page Number Position:{" "}
											{template.footer.pageNumberPosition}
										</p>
										<p>
											Email:{" "}
											{template.footer.email ||
												"Not specified"}
										</p>
										<p>
											Address:{" "}
											{template.footer.address ||
												"Not specified"}
										</p>
										<p>
											Margins: Top:
											{template.footer.marginTop}px Left:
											{template.footer.marginLeft}px
											Right:{template.footer.marginRight}
											px
										</p>
									</div>
								</div>
							)}

							{/* Font */}
							{template.font && (
								<div className="border-t pt-2">
									<h3 className="font-medium mb-2">Font</h3>
									<div className="space-y-1 text-sm">
										<p>
											Titles: {template.font.titleFont} (
											{template.font.titleSize}px)
										</p>
										<p>
											Text: {template.font.textFont} (
											{template.font.textSize}px)
										</p>
										<p>
											Line Height:{" "}
											{template.font.lineHeight}
										</p>
										<p>
											Paragraph Spacing:{" "}
											{template.font.paragraphSpacing}
										</p>
									</div>
								</div>
							)}

							{/* Title Colors */}
							{template.titleColors && (
								<div className="border-t pt-2">
									<h3 className="font-medium mb-2">
										Title Colors
									</h3>
									<div className="grid grid-cols-2 gap-2">
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h1Color,
												}}
											/>
											<span>H1</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h2Color,
												}}
											/>
											<span>H2</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h3Color,
												}}
											/>
											<span>H3</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h4Color,
												}}
											/>
											<span>H4</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h5Color,
												}}
											/>
											<span>H5</span>
										</div>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor:
														template.titleColors
															.h6Color,
												}}
											/>
											<span>H6</span>
										</div>
									</div>
								</div>
							)}

							{/* Final Page */}
							{template.finalPage && (
								<div className="border-t pt-2">
									<h3 className="font-medium mb-2">
										Final Page
									</h3>
									<div className="space-y-1 text-sm">
										<p>
											Image:{" "}
											{template.finalPage.imagePath ||
												"Not specified"}
										</p>
										<p>
											Image Position: X:
											{template.finalPage.imageX} Y:
											{template.finalPage.imageY}
										</p>
										<p>
											Image Size:{" "}
											{template.finalPage.imageWidth}x
											{template.finalPage.imageHeight}px
										</p>
										<p>
											Logo:{" "}
											{template.finalPage.logoPath ||
												"Not specified"}
										</p>
										<p>
											Logo Position: X:
											{template.finalPage.logoX} Y:
											{template.finalPage.logoY}
										</p>
										<p>
											Logo Size:{" "}
											{template.finalPage.logoWidth}x
											{template.finalPage.logoHeight}px
										</p>
										<p>
											Margins: Top:{" "}
											{template.finalPage.marginTop}px
											Bottom:{" "}
											{template.finalPage.marginBottom}px
										</p>
									</div>
								</div>
							)}

							{/* Template Information */}
							<div className="border-t pt-2 text-xs text-gray-500">
								<p>
									Created:{" "}
									{new Date(
										template.createdAt,
									).toLocaleDateString()}
								</p>
								<div className="text-sm text-muted-foreground">
									{template.updatedAt && (
										<p>
											Updated:{" "}
											{new Date(
												template.updatedAt,
											).toLocaleDateString()}
										</p>
									)}
									{template.user && (
										<p>
											Created by: {template.user.name} (
											{template.user.email})
										</p>
									)}
									<p>
										Status:{" "}
										{template.isActive
											? "Active"
											: "Inactive"}
									</p>
								</div>
							</div>
						</div>
					</Card>
				))}
			</div>

			<Dialog
				open={isRevisionsOpen}
				onOpenChange={(open) =>
					handleRevisionsOpen(selectedTemplate!, open)
				}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Cronologia Template</DialogTitle>
					</DialogHeader>
					<ScrollArea className="h-[400px] pr-4">
						{isLoadingRevisions ? (
							<div>Caricamento revisioni...</div>
						) : (
							<div className="space-y-4">
								{revisions.map((revision) => (
									<div
										key={revision.id}
										className="border rounded-lg p-4 space-y-2"
									>
										<div className="flex justify-between items-start">
											<div className="space-y-1">
												<h3 className="font-medium">
													Versione {revision.version}
												</h3>
												<p className="text-sm text-muted-foreground">
													{new Date(
														revision.createdAt,
													).toLocaleDateString()}
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleRestore(revision)
												}
												disabled={isRestoring}
											>
												{isRestoring ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Ripristinando...
													</>
												) : (
													"Ripristina"
												)}
											</Button>
										</div>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div className="space-y-1">
												<p>
													<span className="font-medium">
														Nome:
													</span>{" "}
													{revision.name}
												</p>
												{revision.description && (
													<p>
														<span className="font-medium">
															Descrizione:
														</span>{" "}
														{revision.description}
													</p>
												)}
												<p>
													<span className="font-medium">
														Modificato da:
													</span>{" "}
													{revision.user.name}
												</p>
											</div>
											<div className="space-y-1">
												<p>
													<span className="font-medium">
														Font Titolo:
													</span>{" "}
													{revision.font_title}
												</p>
												<p>
													<span className="font-medium">
														Font Paragrafo:
													</span>{" "}
													{revision.font_paragraph}
												</p>
												<p>
													<span className="font-medium">
														Colore:
													</span>{" "}
													<span className="inline-flex items-center gap-1">
														<span
															className="w-3 h-3 rounded-full inline-block"
															style={{
																backgroundColor:
																	revision.color,
															}}
														/>
														{revision.color}
													</span>
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	);
}
