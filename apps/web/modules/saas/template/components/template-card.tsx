import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { useToast } from "@ui/hooks/use-toast";
import { Eye, History, Pen, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Template, TemplateRevision } from "../types";
import TemplateDialog from "./template-dialog";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { TemplateRevisionsDialog } from "./template-revisions-dialog";

interface TemplateCardProps {
	template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
	const [revisions, setRevisions] = useState<TemplateRevision[]>([]);
	const [isLoadingRevisions, setIsLoadingRevisions] = useState(false);
	const { toast } = useToast();

	const fetchRevisions = async () => {
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
			toast({
				title: "Errore",
				description: "Errore nel caricamento delle revisioni",
				variant: "error",
			});
		} finally {
			setIsLoadingRevisions(false);
		}
	};

	const handleRevisionsOpen = (open: boolean) => {
		setIsRevisionsOpen(open);
		if (open) {
			fetchRevisions();
		}
	};

	const handleDelete = async () => {
		try {
			const response = await fetch(`/api/templates?id=${template.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Errore durante l'eliminazione",
				);
			}

			toast({
				title: "Successo",
				description: "Template eliminato con successo",
				variant: "success",
			});
		} catch (error) {
			console.error("Errore durante l'eliminazione:", error);
			toast({
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Errore durante l'eliminazione",
				variant: "error",
			});
		}
	};

	const handleRestore = async (revision: TemplateRevision) => {
		try {
			const response = await fetch(
				`/api/templates/${template.id}/restore`,
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

			toast({
				title: "Successo",
				description: "Template ripristinato con successo",
				variant: "success",
			});
			setIsRevisionsOpen(false);
		} catch (error) {
			console.error("Errore:", error);
			toast({
				title: "Errore",
				description: "Errore nel ripristino della revisione",
				variant: "error",
			});
		}
	};

	return (
		<Card className="p-6">
			<Accordion type="single" collapsible className="w-full space-y-2">
				<AccordionItem value="header" className="border rounded-lg">
					<AccordionTrigger className="px-4">Header</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">
									Altezza: 50px
								</p>
								<p className="text-muted-foreground">
									Colore: {template.color || "#FFFFFF"}
								</p>
								<p className="text-muted-foreground">
									Logo: {template.logo_path ? "Sì" : "No"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">
									Posizione logo: X: 0 Y: 0
								</p>
								<p className="text-muted-foreground">
									Dimensioni logo: 100x100px
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="footer" className="border rounded-lg">
					<AccordionTrigger className="px-4">Footer</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">
									Altezza: {template.footer?.height || 50}
									px
								</p>
								<p className="text-muted-foreground">
									Colore:{" "}
									{template.footer?.color || "#FFFFFF"}
								</p>
								<p className="text-muted-foreground">
									Numero pagina:{" "}
									{template.footer?.pageNumberPosition ||
										"Centro"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">
									Email:{" "}
									{template.footer?.email ||
										"Non specificata"}
								</p>
								<p className="text-muted-foreground">
									Indirizzo:{" "}
									{template.footer?.address ||
										"Non specificato"}
								</p>
								<p className="text-muted-foreground">
									Margini: T:
									{template.footer?.marginTop || 0} L:
									{template.footer?.marginLeft || 0} R:
									{template.footer?.marginRight || 0}
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="font" className="border rounded-lg">
					<AccordionTrigger className="px-4">Font</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">
									Titoli:{" "}
									{template.font?.titleFont || "Arial"} (
									{template.font?.titleSize || 14}px)
								</p>
								<p className="text-muted-foreground">
									Testo: {template.font?.textFont || "Arial"}{" "}
									({template.font?.textSize || 11}px)
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">
									Altezza riga:{" "}
									{template.font?.lineHeight || 1.5}
								</p>
								<p className="text-muted-foreground">
									Spaziatura paragrafi:{" "}
									{template.font?.paragraphSpacing || 1.0}
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="cover" className="border rounded-lg">
					<AccordionTrigger className="px-4">Cover</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">
									Posizione foto:{" "}
									{template.cover?.photoPosition || "Centro"}
								</p>
								<p className="text-muted-foreground">
									Dimensioni: {template.cover?.width || 100}x
									{template.cover?.height || 200}px
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">
									Allineamento titolo:{" "}
									{template.cover?.titleAlignment || "Centro"}
								</p>
								<p className="text-muted-foreground">
									Margine: {template.cover?.margin || 20}
									px
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem
					value="title-colors"
					className="border rounded-lg"
				>
					<AccordionTrigger className="px-4">
						Colori Titoli
					</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h1Color ||
											"#000000",
									}}
								/>
								<span className="text-muted-foreground">
									H1
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h2Color ||
											"#333333",
									}}
								/>
								<span className="text-muted-foreground">
									H2
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h3Color ||
											"#555555",
									}}
								/>
								<span className="text-muted-foreground">
									H3
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h4Color ||
											"#777777",
									}}
								/>
								<span className="text-muted-foreground">
									H4
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h5Color ||
											"#999999",
									}}
								/>
								<span className="text-muted-foreground">
									H5
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-4 h-4 rounded-full"
									style={{
										backgroundColor:
											template.titleColors?.h6Color ||
											"#BBBBBB",
									}}
								/>
								<span className="text-muted-foreground">
									H6
								</span>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="final-page" className="border rounded-lg">
					<AccordionTrigger className="px-4">
						Pagina Finale
					</AccordionTrigger>
					<AccordionContent className="px-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">
									Mostra:{" "}
									{template.finalPage?.show ? "Sì" : "No"}
								</p>
								<p className="text-muted-foreground">
									Testo:{" "}
									{template.finalPage?.text || "Nessun testo"}
								</p>
								<p className="text-muted-foreground">
									Colore sfondo:{" "}
									{template.finalPage?.backgroundColor ||
										"#FFFFFF"}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">
									Colore testo:{" "}
									{template.finalPage?.textColor || "#000000"}
								</p>
								<p className="text-muted-foreground">
									Font: {template.finalPage?.font || "Arial"}
								</p>
								<p className="text-muted-foreground">
									Dimensione font:{" "}
									{template.finalPage?.fontSize || 14}px
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className="flex items-center justify-between pt-4">
				<div className="text-sm text-muted-foreground">
					Creato il:{" "}
					{new Date(template.createdAt).toLocaleDateString()}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => handleRevisionsOpen(true)}
						className="relative group"
					>
						<History className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsPreviewOpen(true)}
						className="relative group"
					>
						<Eye className="h-4 w-4" />
						<Pen
							className="h-3 w-3 absolute -top-1 -right-1 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={(e) => {
								e.stopPropagation();
								setIsEditDialogOpen(true);
							}}
						/>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsDeleteDialogOpen(true)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Elimina Template</AlertDialogTitle>
						<AlertDialogDescription>
							Sei sicuro di voler eliminare questo template?
							Questa azione non può essere annullata.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annulla</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Elimina
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<TemplateDialog
				isOpen={isEditDialogOpen}
				setIsOpen={setIsEditDialogOpen}
			/>

			<TemplatePreviewDialog
				template={template}
				open={isPreviewOpen}
				onOpenChange={setIsPreviewOpen}
			/>

			<TemplateRevisionsDialog
				open={isRevisionsOpen}
				onOpenChange={handleRevisionsOpen}
				templateId={template.id}
				onRestore={handleRestore}
				revisions={revisions}
				isLoading={isLoadingRevisions}
			/>
		</Card>
	);
}
