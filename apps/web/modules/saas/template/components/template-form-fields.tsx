"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Switch } from "@ui/components/switch";
import { useToast } from "@ui/hooks/use-toast";
import { cn } from "@ui/lib";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import type { Template } from "../types";
import { TemplatePreview } from "./template-preview";

const formSchema = z.object({
	name: z.string().min(1, "Il nome del template è obbligatorio"),
	description: z.string().optional(),
	isActive: z.boolean().default(true),
	logo_path: z.string().optional(),
	logo_footer: z.string().optional(),
	color: z.string().default("#000000"),
	font_title: z.string().default("Arial"),
	font_paragraph: z.string().default("Arial"),
});

export type TemplateFormValues = z.infer<typeof formSchema>;

interface TemplateFormFieldsProps {
	onSubmit: (data: Partial<Template>) => Promise<void>;
	onCancel: () => void;
	defaultValues?: Partial<TemplateFormValues>;
}

export function TemplateFormFields({
	onSubmit,
	onCancel,
	defaultValues,
}: TemplateFormFieldsProps) {
	const { toast } = useToast();
	const [headerLogo, setHeaderLogo] = useState<File | null>(null);
	const [coverLogo, setCoverLogo] = useState<File | null>(null);

	const methods = useForm<TemplateFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues || {
			name: "",
			description: "",
			isActive: true,
			logo_path: "",
			logo_footer: "",
			color: "#000000",
			font_title: "Arial",
			font_paragraph: "Arial",
		},
	});

	async function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	async function handleSubmit(data: TemplateFormValues) {
		try {
			let logoPath = data.logo_path;
			let logoFooterPath = data.logo_footer;

			if (headerLogo) {
				logoPath = await fileToBase64(headerLogo);
			}

			if (coverLogo) {
				logoFooterPath = await fileToBase64(coverLogo);
			}

			await onSubmit({
				...data,
				logo_path: logoPath,
				logo_footer: logoFooterPath,
			});
		} catch (error) {
			console.error("Errore durante il salvataggio:", error);
			toast({
				title: "Errore",
				description: "Errore durante il salvataggio del template",
				variant: "error",
			});
		}
	}

	return (
		<FormProvider {...methods}>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Form {...methods}>
					<form
						onSubmit={methods.handleSubmit(handleSubmit)}
						className="space-y-8"
					>
						<FormField
							control={methods.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome Template</FormLabel>
									<FormControl>
										<Input
											placeholder="Inserisci il nome del template"
											{...field}
											className={cn(
												"focus:outline-none",
												"focus:ring-0",
												"whitespace-pre-wrap",
												"p-2",
												"text-xs",
												"leading-normal",
												"tracking-normal",
											)}
											onKeyDown={(e) => {
												if (e.key === " ") {
													e.preventDefault();
													const target =
														e.target as HTMLInputElement;
													const start =
														target.selectionStart ??
														0;
													const end =
														target.selectionEnd ??
														0;
													const value =
														field.value as string;
													const newValue = `${value.substring(0, start)} ${value.substring(end)}`;
													field.onChange(newValue);
													// Ripristina la posizione del cursore immediatamente
													target.setSelectionRange(
														start + 1,
														start + 1,
													);
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descrizione</FormLabel>
									<FormControl>
										<Input
											placeholder="Inserisci una descrizione"
											{...field}
											className={cn(
												"focus:outline-none",
												"focus:ring-0",
												"whitespace-pre-wrap",
												"p-2",
												"text-xs",
												"leading-normal",
												"tracking-normal",
											)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Template Attivo
										</FormLabel>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="logo_path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Logo Header</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept="image/*"
											className="cursor-pointer"
											onChange={async (e) => {
												const file =
													e.target.files?.[0];
												if (file) {
													setHeaderLogo(file);
													const base64 =
														await fileToBase64(
															file,
														);
													methods.setValue(
														"logo_path",
														base64,
														{
															shouldValidate: true,
														},
													);
												}
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="logo_footer"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Logo Footer</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept="image/*"
											className="cursor-pointer"
											onChange={async (e) => {
												const file =
													e.target.files?.[0];
												if (file) {
													setCoverLogo(file);
													const base64 =
														await fileToBase64(
															file,
														);
													methods.setValue(
														"logo_footer",
														base64,
														{
															shouldValidate: true,
														},
													);
												}
											}}
										/>
									</FormControl>
									<FormDescription>
										Carica il logo per il footer del
										template
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Colore Primario</FormLabel>
									<div className="flex gap-4">
										<FormControl>
											<Input
												type="color"
												value={field.value || "#000000"}
												onChange={(e) => {
													field.onChange(
														e.target.value,
													);
													methods.setValue(
														"color",
														e.target.value,
														{
															shouldValidate: true,
														},
													);
												}}
											/>
										</FormControl>
										<FormControl>
											<Input
												type="text"
												placeholder="#000000"
												value={field.value || "#000000"}
												onChange={(e) => {
													const value =
														e.target.value;
													if (
														/^#[0-9A-Fa-f]{6}$/.test(
															value,
														)
													) {
														field.onChange(value);
														methods.setValue(
															"color",
															value,
															{
																shouldValidate: true,
															},
														);
													}
												}}
											/>
										</FormControl>
									</div>
									<FormDescription>
										Seleziona un colore o inserisci il
										codice esadecimale (es. #FF0000)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="font_title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Font Titoli</FormLabel>
									<FormControl>
										<Input
											placeholder="Font per i titoli"
											{...field}
											className={cn(
												"focus:outline-none",
												"focus:ring-0",
												"whitespace-pre-wrap",
												"p-2",
												"text-xs",
												"leading-normal",
												"tracking-normal",
											)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={methods.control}
							name="font_paragraph"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Font Paragrafi</FormLabel>
									<FormControl>
										<Input
											placeholder="Font per i paragrafi"
											{...field}
											className={cn(
												"focus:outline-none",
												"focus:ring-0",
												"whitespace-pre-wrap",
												"p-2",
												"text-xs",
												"leading-normal",
												"tracking-normal",
											)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
							>
								Annulla
							</Button>
							<Button type="submit">Salva Template</Button>
						</div>
					</form>
				</Form>
				<TemplatePreview />
			</div>
		</FormProvider>
	);
}
