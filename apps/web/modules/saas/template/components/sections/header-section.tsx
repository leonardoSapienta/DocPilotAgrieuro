"use client";
import { useSession } from "@saas/auth/hooks/use-session";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import {} from "@ui/components/form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Switch } from "@ui/components/switch";
import { useToast } from "@ui/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { EditableLogo } from "../editable-logo";

interface HeaderSectionProps {
	onPreviewUrlChange?: (url: string | null) => void;
}

export function HeaderSection({ onPreviewUrlChange }: HeaderSectionProps) {
	const form = useFormContext();
	const { user } = useSession();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();

	const handleFileChange = async (file: File) => {
		if (!file || !user) {
			return;
		}

		setUploading(true);
		try {
			// Crea un URL per l'anteprima
			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);
			onPreviewUrlChange?.(objectUrl);

			// Genera un nome file unico
			const fileName = `${Date.now()}-${file.name}`;
			const logoPath = `/images/headers/${fileName}`;

			console.log("Logo path generato:", logoPath);

			// Crea il FormData per l'upload
			const formData = new FormData();
			formData.append("file", file);
			formData.append("logoPath", logoPath);

			console.log("Dati inviati all'endpoint upload-logo:", {
				file: file.name,
				logoPath,
			});

			// Carica il file
			const response = await fetch("/api/templates/upload-logo", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Errore durante il caricamento del logo");
			}

			const result = await response.json();
			console.log("Risposta dall'endpoint upload-logo:", result);

			// Salva il percorso nel form
			form.setValue("header.logoPath", logoPath, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});

			// Imposta showLogo a true
			form.setValue("header.showLogo", true, {
				shouldValidate: true,
				shouldDirty: true,
				shouldTouch: true,
			});

			// Verifica che il logoPath sia stato salvato correttamente
			const savedLogoPath = form.getValues("header.logoPath");
			console.log("Logo path salvato nel form:", savedLogoPath);

			// Forza l'aggiornamento del form
			form.trigger("header.logoPath");

			toast({
				title: "Successo",
				description: "Logo caricato con successo",
				variant: "success",
			});
		} catch (error) {
			console.error("Errore durante il caricamento del logo:", error);
			setPreviewUrl(null);
			onPreviewUrlChange?.(null);
			form.setValue("header.logoPath", null);
			form.setValue("header.showLogo", false);
			toast({
				title: "Errore",
				description:
					error instanceof Error
						? error.message
						: "Errore durante il caricamento del logo",
				variant: "error",
			});
		} finally {
			setUploading(false);
		}
	};

	// Gestione del click sul pulsante di caricamento
	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	// Gestione del cambio file tramite input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			handleFileChange(e.target.files[0]);
		}
	};

	// Rimuovi il logo
	const handleRemoveLogo = () => {
		setPreviewUrl(null);
		onPreviewUrlChange?.(null);
		form.setValue("header.logoPath", null);
		form.setValue("header.showLogo", false);
	};

	// Ottieni il valore corrente del logo dal form
	const currentLogoPath = form.watch("header.logoPath");
	const showLogo = form.watch("header.showLogo");

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div
					className="relative w-full h-32 border rounded-lg overflow-hidden"
					ref={headerRef}
				>
					{previewUrl && (
						<EditableLogo
							logoPath={previewUrl}
							containerRef={headerRef}
							initialX={form.getValues("header.logoPositionX")}
							initialY={form.getValues("header.logoPositionY")}
							initialWidth={form.getValues("header.logoWidth")}
							initialHeight={form.getValues("header.logoHeight")}
						/>
					)}
				</div>

				<div className="space-y-2">
					<Label>Height (px)</Label>
					<Input
						type="number"
						{...form.register("header.height", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Background Color</Label>
					<Input type="color" {...form.register("header.color")} />
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label>Logo</Label>
						<Switch
							checked={showLogo}
							onCheckedChange={(checked) => {
								form.setValue("header.showLogo", checked);
								if (!checked) {
									setPreviewUrl(null);
									onPreviewUrlChange?.(null);
									form.setValue("header.logoPath", null);
								}
							}}
						/>
					</div>

					{showLogo && (
						<div className="flex flex-col space-y-2">
							<div className="flex items-center space-x-2">
								<Input
									type="text"
									{...form.register("header.logoPath")}
									placeholder="Enter logo path"
									className="flex-1"
									readOnly
								/>
								<Button
									type="button"
									variant="outline"
									onClick={handleButtonClick}
									disabled={uploading || !user}
								>
									<Upload className="h-4 w-4 mr-2" />
									{uploading ? "Uploading..." : "Choose File"}
								</Button>
								<input
									type="file"
									ref={fileInputRef}
									className="hidden"
									accept="image/png,image/jpeg,image/svg+xml"
									onChange={handleInputChange}
								/>
							</div>

							{(previewUrl || currentLogoPath) && (
								<div className="relative border rounded-md p-4 mt-2">
									<img
										src={previewUrl || currentLogoPath}
										alt="Logo preview"
										className="max-h-32 mx-auto"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute top-2 right-2 h-8 w-8"
										onClick={handleRemoveLogo}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					)}
				</div>

				<FormField
					control={form.control}
					name="header.logoWidth"
					defaultValue={100}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo Width (px)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Logo width"
									{...field}
									value={field.value || 100}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="header.logoHeight"
					defaultValue={100}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo Height (px)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Logo height"
									{...field}
									value={field.value || 100}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="header.logoPositionX"
					defaultValue={20}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo X Position (px)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="X position"
									{...field}
									value={field.value || 20}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="header.logoPositionY"
					defaultValue={20}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo Y Position (px)</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Y position"
									{...field}
									value={field.value || 20}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label>Top Margin (px)</Label>
						<Input
							type="number"
							{...form.register("header.marginTop", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Left Margin (px)</Label>
						<Input
							type="number"
							{...form.register("header.marginLeft", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Right Margin (px)</Label>
						<Input
							type="number"
							{...form.register("header.marginRight", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
