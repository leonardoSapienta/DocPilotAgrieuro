"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { useFormContext } from "react-hook-form";
import type { TemplateFormValues } from "./template-form-fields";

export function TemplatePreview() {
	const { watch } = useFormContext<TemplateFormValues>();
	const formValues = watch();

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Anteprima</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center space-y-8">
						{/* Logo Header */}
						<div className="w-48 h-24 relative border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
							{formValues.logo_path ? (
								<img
									src={formValues.logo_path}
									alt="Logo Header"
									className="w-full h-full object-contain"
								/>
							) : (
								<span className="text-gray-400">
									Logo Header
								</span>
							)}
						</div>

						{/* Titolo e Paragrafo */}
						<div className="text-center space-y-6 w-full max-w-2xl">
							<h1
								className="text-2xl font-bold mb-4 text-black"
								style={{
									fontFamily: formValues.font_title,
								}}
							>
								Lorem Ipsum Dolor Sit Amet Consectetur
								Adipiscing Elit
							</h1>

							<div className="space-y-4">
								<p
									className="text-sm leading-relaxed"
									style={{
										fontFamily: formValues.font_paragraph,
									}}
								>
									Lorem ipsum dolor sit amet, consectetur
									adipiscing elit. Sed do eiusmod tempor
									incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam, quis nostrud
									exercitation ullamco laboris nisi ut aliquip
									ex ea commodo consequat. Duis aute irure
									dolor in reprehenderit in voluptate velit
									esse cillum dolore eu fugiat nulla pariatur.
								</p>

								<p
									className="text-sm leading-relaxed"
									style={{
										fontFamily: formValues.font_paragraph,
									}}
								>
									Excepteur sint occaecat cupidatat non
									proident, sunt in culpa qui officia deserunt
									mollit anim id est laborum. Sed ut
									perspiciatis unde omnis iste natus error sit
									voluptatem accusantium doloremque
									laudantium, totam rem aperiam, eaque ipsa
									quae ab illo inventore veritatis et quasi
									architecto beatae vitae dicta sunt
									explicabo.
								</p>

								<p
									className="text-sm leading-relaxed"
									style={{
										fontFamily: formValues.font_paragraph,
									}}
								>
									Nemo enim ipsam voluptatem quia voluptas sit
									aspernatur aut odit aut fugit, sed quia
									consequuntur magni dolores eos qui ratione
									voluptatem sequi nesciunt. Neque porro
									quisquam est, qui dolorem ipsum quia dolor
									sit amet, consectetur, adipisci velit, sed
									quia non numquam eius modi tempora incidunt
									ut labore et dolore magnam aliquam quaerat
									voluptatem.
								</p>
							</div>
						</div>

						{/* Barra del colore */}
						<div
							className="w-full h-4 rounded-full"
							style={{ backgroundColor: formValues.color }}
						/>

						{/* Logo Footer */}
						<div className="w-48 h-24 relative border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
							{formValues.logo_footer ? (
								<img
									src={formValues.logo_footer}
									alt="Logo Footer"
									className="w-full h-full object-contain"
								/>
							) : (
								<span className="text-gray-400">
									Logo Footer
								</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
