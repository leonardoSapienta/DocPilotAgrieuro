"use client";
import { Dialog, DialogContent } from "@ui/components/dialog";
import type { Template } from "../types";

interface TemplatePreviewDialogProps {
	template: Template;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({
	template,
	open,
	onOpenChange,
}: TemplatePreviewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[90vw] h-[90vh] p-0">
				<div className="w-full h-full flex items-center justify-center">
					<div className="w-[160mm] h-[226mm] scale-100 bg-white shadow-lg p-8">
						{/* Header con logo */}
						{template.logo_path && (
							<div className="flex justify-center mb-8">
								<img
									src={template.logo_path}
									alt="Logo Header"
									className="max-h-24 object-contain"
								/>
							</div>
						)}

						{/* Titolo di esempio */}
						<h1
							className="text-4xl font-bold text-center mb-8"
							style={{ fontFamily: template.font_title }}
						>
							Titolo di Esempio
						</h1>

						{/* Barra del colore */}
						<div
							className="w-full h-2 mb-8"
							style={{ backgroundColor: template.color }}
						/>

						{/* Paragrafi di esempio */}
						<div
							className="space-y-4"
							style={{ fontFamily: template.font_paragraph }}
						>
							<p>
								Lorem ipsum dolor sit amet, consectetur
								adipiscing elit. Sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua.
							</p>
							<p>
								Ut enim ad minim veniam, quis nostrud
								exercitation ullamco laboris nisi ut aliquip ex
								ea commodo consequat.
							</p>
							<p>
								Duis aute irure dolor in reprehenderit in
								voluptate velit esse cillum dolore eu fugiat
								nulla pariatur.
							</p>
						</div>

						{/* Footer con logo */}
						{template.logo_footer && (
							<div className="absolute bottom-8 left-0 right-0 flex justify-center">
								<img
									src={template.logo_footer}
									alt="Logo Footer"
									className="max-h-24 object-contain"
								/>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
