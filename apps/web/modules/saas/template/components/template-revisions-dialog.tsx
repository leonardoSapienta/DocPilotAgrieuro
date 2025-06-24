import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { ScrollArea } from "@ui/components/scroll-area";
import type { TemplateRevision } from "../types";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface TemplateRevisionsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	templateId: number;
	onRestore: (revision: TemplateRevision) => void;
	revisions: TemplateRevision[];
	isLoading: boolean;
}

export function TemplateRevisionsDialog({
	open,
	onOpenChange,
	templateId,
	onRestore,
	revisions,
	isLoading,
}: TemplateRevisionsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Cronologia Template</DialogTitle>
				</DialogHeader>
				<ScrollArea className="h-[400px] pr-4">
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<p>Caricamento...</p>
						</div>
					) : (
						<div className="space-y-4">
							{revisions.map((revision) => (
								<div
									key={revision.id}
									className="border rounded-lg p-4 space-y-2"
								>
									<div className="flex justify-between items-start">
										<div>
											<h3 className="font-medium">
												Versione {revision.version}
											</h3>
											<p className="text-sm text-muted-foreground">
												{format(new Date(revision.createdAt), "dd/MM/yyyy", { locale: it })}
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onRestore(revision)}
										>
											Ripristina
										</Button>
									</div>
									<div className="space-y-1 text-sm">
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
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
