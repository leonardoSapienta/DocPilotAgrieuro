import { Button } from "@ui//components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui//components/dialog";
import { Plus } from "lucide-react";
import type { Template } from "../types";
import { TemplateForm } from "./template-form";

interface TemplateDialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	template?: Template;
}

const TemplateDialog = ({
	isOpen,
	setIsOpen,
	template,
}: TemplateDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Create New Template
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[98vw] max-w-[1800px] h-[98vh] overflow-hidden p-0">
				<div className="flex flex-col h-full">
					<DialogHeader className="px-6 py-4 border-b">
						<DialogTitle className="text-2xl">
							{template
								? "Modifica Template"
								: "Crea Nuovo Template"}
						</DialogTitle>
						<DialogDescription>
							{template
								? "Modifica i dettagli del template esistente."
								: "Inserisci i dettagli per creare un nuovo template."}
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-hidden">
						<TemplateForm
							onClose={() => setIsOpen(false)}
							template={template}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TemplateDialog;
