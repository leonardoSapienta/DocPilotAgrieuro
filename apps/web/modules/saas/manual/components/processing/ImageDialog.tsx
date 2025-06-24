import { useMemo, useRef, useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { SearchIcon, UploadIcon } from "lucide-react";
import type { ImageDialogProps } from "./types";

function ImageDialog({
	isOpen,
	onClose,
	onImageSelect,
	sectionImages,
	manualId,
}: ImageDialogProps) {
	const [activeTab, setActiveTab] = useState<string>("gallery");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Filtra le immagini in base alla ricerca
	const filteredImages = useMemo(() => {
		if (!searchQuery.trim()) {
			return sectionImages;
		}
		const query = searchQuery.toLowerCase();
		return sectionImages.filter((img) => {
			const filename = img.name?.toLowerCase() || "";
			const url = img.url.toLowerCase();
			return filename.includes(query) || url.includes(query);
		});
	}, [sectionImages, searchQuery]);

	// Funzione per caricare immagine dal PC e inserirla come base64
	const uploadToBase64 = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64Data = e.target?.result as string;
			if (!base64Data) {
				alert("Errore nella lettura del file.");
				return;
			}
			onImageSelect(base64Data); // Passa il base64 direttamente all'editor
			onClose();
		};
		reader.readAsDataURL(file);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			uploadToBase64(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file?.type?.startsWith("image/")) {
			uploadToBase64(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl overflow-hidden flex flex-col h-[80vh]">
				<DialogHeader>
					<DialogTitle>Seleziona un'immagine</DialogTitle>
				</DialogHeader>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="gallery">Galleria</TabsTrigger>
						<TabsTrigger value="upload">
							Carica Immagine
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="gallery"
						className="flex-1 flex flex-col overflow-hidden"
					>
						{/* Barra di ricerca */}
						<div className="relative px-4 py-2">
							<div className="absolute inset-y-0 left-4 flex items-center pl-3 pointer-events-none">
								<SearchIcon className="w-4 h-4 text-gray-400" />
							</div>
							<Input
								type="search"
								placeholder="Cerca immagini..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Area scrollabile delle immagini */}
						<div className="flex-1 overflow-y-auto px-4 pb-4">
							{filteredImages.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									{searchQuery ? (
										<p>
											Nessun risultato trovato per "
											{searchQuery}"
										</p>
									) : (
										<p>Nessuna immagine disponibile</p>
									)}
								</div>
							) : (
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{filteredImages.map((img, idx) => (
										<button
											type="button"
											key={img.name || idx}
											className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left"
											onClick={() =>
												onImageSelect(img.url)
											}
										>
											<div className="aspect-square relative">
												<img
													src={img.url}
													alt={`Immagine ${img.name || idx + 1}`}
													className="w-full h-full object-cover"
												/>
											</div>
											{img.name && (
												<div className="p-2 text-xs truncate text-gray-600 bg-gray-50">
													{img.name}
												</div>
											)}
										</button>
									))}
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent
						value="upload"
						className="flex-1 overflow-y-auto"
					>
						<div
							className="h-full flex items-center justify-center p-4"
							onDrop={handleDrop}
							onDragOver={handleDragOver}
						>
							<button
								type="button"
								className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors w-full disabled:opacity-50"
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}
							>
								<UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
								<p className="text-sm text-gray-600 font-medium">
									Trascina un'immagine qui
								</p>
								<p className="text-xs text-gray-500 mt-2">
									oppure clicca per selezionare
								</p>
								{isUploading && (
									<p className="text-xs text-blue-500 mt-2">Caricamento in corso...</p>
								)}
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileChange}
									disabled={isUploading}
								/>
							</button>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

export default ImageDialog;
