"use client";

import { useDraggable } from "@dnd-kit/core";
import { Input } from "@ui/components/input";
import { cn } from "@ui/lib/utils";
import {
	AlertCircle,
	AlertOctagon,
	AlertTriangle,
	Check,
	Columns,
	GripVertical,
	Heading1,
	Image,
	Info,
	LayoutGrid,
	Minus,
	Move,
	Pilcrow,
	SearchIcon,
	Table as TableIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DraggableBlockProps {
	id: string;
	type: string;
	template: string;
	children: React.ReactNode;
	icon: React.ReactNode;
	description?: string;
	label: string;
}

function DraggableBlock({
	id,
	type,
	template,
	children,
	icon,
	description,
	label,
}: DraggableBlockProps) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id,
		data: {
			type,
			template,
			label,
			icon,
		},
	});

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={cn(
				"flex items-center gap-3 p-4 mb-3 border rounded-md cursor-move transition-all duration-200 select-none",
				"group relative hover:shadow-sm hover:border-primary/30 dark:hover:border-primary/40",
				isDragging
					? "opacity-80 shadow-md scale-105 border-primary bg-primary/5 rotate-1"
					: "hover:bg-gray-50 dark:hover:bg-gray-800/40",
			)}
		>
			{isDragging && (
				<div className="absolute inset-0 bg-primary/5 rounded-md pointer-events-none" />
			)}
			<div
				className={cn(
					"flex-shrink-0 text-gray-400 group-hover:text-primary/70 transition-colors",
					isDragging && "text-primary",
				)}
			>
				{isDragging ? (
					<Move size={18} />
				) : (
					<GripVertical size={18} className="opacity-80" />
				)}
			</div>
			<div
				className={cn(
					"flex-shrink-0 text-primary transition-transform",
					isDragging && "scale-110",
				)}
			>
				{icon}
			</div>
			<div className="flex-1">
				<div className="font-medium text-sm">{children}</div>
				{description && (
					<div className="text-xs text-gray-500 mt-1">
						{description}
					</div>
				)}
			</div>
		</div>
	);
}

interface EditorSidebarProps {
	selectedSectionTitle?: string;
	selectedSectionOriginalContent?: string;
}

export default function EditorSidebar({
	selectedSectionTitle,
	selectedSectionOriginalContent,
}: EditorSidebarProps) {
	const [activeCategory, setActiveCategory] = useState("components");
	const [icone, setIcone] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		// Carica le icone dal database
		const loadIcone = async () => {
			try {
				console.log("Caricamento icone...");
				const response = await fetch("/api/icone");
				if (!response.ok) {
					throw new Error("Errore nel caricamento delle icone");
				}
				const data = await response.json();
				console.log("Icone caricate:", data);
				setIcone(data);
			} catch (error) {
				console.error("Errore nel caricamento delle icone:", error);
			}
		};

		loadIcone();
	}, []);

	// Filtra le icone in base alla ricerca
	const filteredIcons = useMemo(() => {
		if (!searchQuery.trim()) {
			return icone;
		}
		const query = searchQuery.toLowerCase();
		return icone.filter(
			(icona) =>
				icona.nome.toLowerCase().includes(query) ||
				icona.descrizione?.toLowerCase().includes(query),
		);
	}, [icone, searchQuery]);

	const componentBlocks = [
		{
			id: "title",
			type: "heading",
			label: "Title",
			description: "Major section heading",
			icon: <Heading1 size={20} />,
			template: "<h1>Your Title Here</h1>",
		},
		{
			id: "paragraph",
			type: "paragraph",
			label: "Paragraph",
			description: "Text with support for lists",
			icon: <Pilcrow size={20} />,
			template: "<p>Your can add your paragraph text here</p>",
		},
		{
			id: "table",
			type: "table",
			label: "Table",
			description: "Data in rows and columns",
			icon: <TableIcon size={20} />,
			template: `<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
      <th>Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <td>Cell 4</td>
      <td>Cell 5</td>
      <td>Cell 6</td>
    </tr>
  </tbody>
</table>`,
		},
		{
			id: "divider",
			type: "custom",
			label: "Divider",
			description: "Horizontal line to separate content",
			icon: <Minus size={20} />,
			template: `<hr class="border-t border-gray-200 dark:border-gray-700 my-6" />`,
		},
		{
			id: "danger",
			type: "alert",
			label: "Danger",
			description: "Critical warning information",
			icon: <AlertOctagon size={20} className="text-red-500" />,
			template: "danger",
		},
		{
			id: "warning",
			type: "alert",
			label: "Warning",
			description: "Important advisory information",
			icon: <AlertTriangle size={20} className="text-amber-500" />,
			template: "warning",
		},
		{
			id: "caution",
			type: "alert",
			label: "Caution",
			description: "Careful consideration needed",
			icon: <AlertCircle size={20} className="text-yellow-500" />,
			template: "caution",
		},
		{
			id: "important",
			type: "alert",
			label: "Important",
			description: "Key information to note",
			icon: <Info size={20} className="text-blue-500" />,
			template: "important",
		},
	];

	const layoutBlocks = [
		{
			id: "two-column-layout",
			type: "layout",
			label: "Two Columns",
			description: "Content arranged in two equal columns",
			icon: <Columns size={20} />,
			template: "2", // We'll use this value for the columns attribute
		},
		{
			id: "four-column-layout",
			type: "layout",
			label: "Four Columns",
			description: "Content arranged in four equal columns",
			icon: <LayoutGrid size={20} />,
			template: "4", // We'll use this value for the columns attribute
		},
	];

	// Funzione per controllare se il nome dell'icona è presente nel titolo o contenuto della sezione
	const isIconInSectionContent = (iconName: string): boolean => {
		if (!iconName) return false;

		const iconNameLower = iconName.toLowerCase();

		// Controlla se è presente nel titolo della sezione
		if (selectedSectionTitle) {
			const titleLower = selectedSectionTitle.toLowerCase();
			if (titleLower.includes(iconNameLower)) {
				return true;
			}
		}

		// Controlla se è presente nel contenuto originale della sezione
		if (selectedSectionOriginalContent) {
			// Rimuove i tag HTML e cerca il nome dell'icona nel testo
			const textContent = selectedSectionOriginalContent
				.replace(/<[^>]*>/g, "")
				.toLowerCase();
			if (textContent.includes(iconNameLower)) {
				return true;
			}
		}

		return false;
	};

	return (
		<div className="w-72 border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50/30 dark:bg-gray-800/10 overflow-y-auto flex-shrink-0">
			<div className="flex flex-col items-center justify-between mb-3">
				<div className="w-full flex items-center border rounded-md overflow-hidden">
					<button
						type="button"
						className={cn(
							"w-full px-3 py-1.5 text-sm focus:outline-none transition-colors",
							activeCategory === "components"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50",
						)}
						onClick={() => setActiveCategory("components")}
					>
						Components
					</button>
					<button
						type="button"
						className={cn(
							"w-full px-3 py-1.5 text-sm focus:outline-none transition-colors",
							activeCategory === "layouts"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50",
						)}
						onClick={() => setActiveCategory("layouts")}
					>
						Layouts
					</button>
					<button
						type="button"
						className={cn(
							"w-full px-3 py-1.5 text-sm focus:outline-none transition-colors",
							activeCategory === "icone"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50",
						)}
						onClick={() => setActiveCategory("icone")}
					>
						Icone
					</button>
				</div>
				<div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
					Drag & Drop
				</div>
			</div>

			{activeCategory === "components" ? (
				<div className="space-y-3">
					{componentBlocks.map((block) => (
						<DraggableBlock
							key={block.id}
							id={block.id}
							type={block.type}
							template={block.template}
							icon={block.icon}
							description={block.description}
							label={block.label}
						>
							{block.label}
						</DraggableBlock>
					))}
				</div>
			) : activeCategory === "layouts" ? (
				<div className="space-y-3">
					{layoutBlocks.map((block) => (
						<DraggableBlock
							key={block.id}
							id={block.id}
							type={block.type}
							template={block.template}
							icon={block.icon}
							description={block.description}
							label={block.label}
						>
							{block.label}
						</DraggableBlock>
					))}
				</div>
			) : (
				<div className="space-y-3">
					{/* Barra di ricerca */}
					<div className="relative mb-4">
						<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
							<SearchIcon className="h-4 w-4 text-gray-400" />
						</div>
						<Input
							type="search"
							placeholder="Cerca icone..."
							className="pl-9"
							value={searchQuery}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) => setSearchQuery(e.target.value)}
						/>
					</div>

					{filteredIcons.length === 0 ? (
						<div className="text-center text-gray-500 py-4">
							{searchQuery
								? "Nessuna icona trovata"
								: "Nessuna icona disponibile"}
						</div>
					) : (
						(() => {
							// Separa le icone in due gruppi
							const iconeConMatch = filteredIcons.filter(
								(icona) => isIconInSectionContent(icona.nome),
							);
							const iconeSenzaMatch = filteredIcons.filter(
								(icona) => !isIconInSectionContent(icona.nome),
							);

							// Ordina alfabeticamente entrambi i gruppi
							iconeConMatch.sort((a, b) =>
								a.nome.localeCompare(b.nome),
							);
							iconeSenzaMatch.sort((a, b) =>
								a.nome.localeCompare(b.nome),
							);

							const renderIcona = (icona: any) => {
								const hasMatch = isIconInSectionContent(
									icona.nome,
								);
								return (
									<DraggableBlock
										key={icona.id}
										id={`icon-${icona.id}`}
										type="image"
										template={`<img src="${icona.urlicona}" alt="${icona.nome}" class="w-8 h-8 object-contain" />`}
										icon={<Image size={20} />}
										description={icona.descrizione || ""}
										label={icona.nome}
									>
										<div className="flex items-center gap-2 relative">
											<div className="w-6 h-6 flex items-center justify-center bg-gray-50 rounded relative">
												<img
													src={icona.urlicona}
													alt={icona.nome}
													className="w-full h-full object-contain"
													onError={(e) => {
														console.error(
															"Errore caricamento icona:",
															icona.urlicona,
														);
														const target =
															e.target as HTMLImageElement;
														target.src =
															"/placeholder-icon.png";
													}}
												/>
												{hasMatch && (
													<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
														<Check className="w-2.5 h-2.5 text-white" />
													</div>
												)}
											</div>
											<span
												className={cn(
													hasMatch &&
														"font-medium text-green-700",
												)}
											>
												{icona.nome}
											</span>
										</div>
									</DraggableBlock>
								);
							};

							return (
								<>
									{iconeConMatch.length > 0 && (
										<div className="space-y-2">
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
												Icone nel contenuto
											</div>
											{iconeConMatch.map(renderIcona)}
										</div>
									)}

									{iconeSenzaMatch.length > 0 && (
										<div className="space-y-2">
											<div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
												Tutte le icone
											</div>
											{iconeSenzaMatch.map(renderIcona)}
										</div>
									)}
								</>
							);
						})()
					)}
				</div>
			)}
		</div>
	);
}
