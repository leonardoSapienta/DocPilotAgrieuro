import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { ScrollArea } from "@ui/components/scroll-area";
import { cn } from "@ui/lib/utils";
import {
	AlertTriangleIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import type { Section } from "./types";

interface SectionSelectorProps {
	sections: Section[];
	selectedSection: string | null;
	onSelectSection: (sectionTitle: string) => void;
	onDeleteSection: (sectionTitle: string) => void;
}

export function SectionSelector({
	sections,
	selectedSection,
	onSelectSection,
	onDeleteSection,
}: SectionSelectorProps) {
	// Ordina le sezioni per numero
	const sortedSections = useMemo(() => {
		return [...sections].sort((a, b) => {
			// Estrai il numero dal titolo
			const getNumber = (title: string) => {
				const match = title.match(/^(\d+)[\.\s]/);
				return match ? Number.parseInt(match[1], 10) : 9999;
			};

			const numA = getNumber(a.title);
			const numB = getNumber(b.title);

			// Ordina per numero
			return numA - numB;
		});
	}, [sections]);

	const selectedSectionData = sections.find(
		(s) => s.title === selectedSection,
	);

	const getSectionStatusIcon = (section: Section) => {
		if (section.isMissing) {
			return <AlertTriangleIcon className="h-3.5 w-3.5 text-red-500" />;
		}
		return <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />;
	};

	// Handle section select with a callback to prevent flushSync errors
	const handleSectionSelect = useCallback(
		(sectionTitle: string) => {
			setTimeout(() => {
				onSelectSection(sectionTitle);
			}, 0);
		},
		[onSelectSection],
	);

	return (
		<div className="w-full md:w-3/5 flex flex-col sm:flex-row items-start gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="w-full sm:w-auto sm:min-w-[220px] h-10 flex items-center justify-between bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
					>
						<div className="flex items-center gap-2 truncate">
							{selectedSection && selectedSectionData ? (
								getSectionStatusIcon(selectedSectionData)
							) : (
								<AlertTriangleIcon className="h-3.5 w-3.5 text-gray-400" />
							)}
							<span className="font-medium truncate max-w-[160px] sm:max-w-[180px]">
								{selectedSection || "Seleziona una sezione"}
							</span>
						</div>
						<ChevronDownIcon className="h-4 w-4 ml-2 opacity-70 flex-shrink-0" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full max-w-auto max-h-[40vh] bg-white border border-gray-200 shadow-lg rounded-md p-0 overflow-hidden">
					<div className="py-1.5 px-3 border-b border-gray-100">
						<div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
							Sezioni del Documento
						</div>
					</div>
					<ScrollArea className="h-[calc(40vh-30px)] p-1 overflow-y-auto">
						{sections.length === 0 ? (
							<div className="px-3 py-4 text-center text-sm text-gray-500">
								Nessuna sezione disponibile
							</div>
						) : (
							sortedSections.map((section, index) => (
								<DropdownMenuItem
									key={`${section.title}-${index}`}
									className={cn(
										"flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
										selectedSection === section.title
											? "bg-gray-100 font-medium"
											: "hover:bg-gray-50",
									)}
									onClick={() =>
										handleSectionSelect(section.title)
									}
								>
									<div className="flex items-center gap-2 w-full">
										<div className="flex-shrink-0">
											{getSectionStatusIcon(section)}
										</div>
										<span className="truncate flex-1">
											{section.title}
										</span>
									</div>
								</DropdownMenuItem>
							))
						)}
					</ScrollArea>
				</DropdownMenuContent>
			</DropdownMenu>

			<Button
				variant="outline"
				className="h-10 px-3 sm:px-4 bg-white text-sm flex items-center gap-1.5 w-full sm:w-auto"
				onClick={() =>
					document.dispatchEvent(
						new CustomEvent("openAddSectionDialog"),
					)
				}
			>
				<PlusIcon className="h-3.5 w-3.5" />
				<span>Nuova Sezione</span>
			</Button>
		</div>
	);
}

interface SectionItemProps {
	section: Section;
	isSelected: boolean;
	onSelect: () => void;
	onDelete: (e: React.MouseEvent) => void;
	statusIcon: React.ReactNode;
	statusColor: string;
}

function SectionItem({
	section,
	isSelected,
	onSelect,
	onDelete,
	statusIcon,
	statusColor,
}: SectionItemProps) {
	return (
		<DropdownMenuItem
			className={cn(
				"flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors group",
				isSelected ? "bg-gray-100 font-medium" : "hover:bg-gray-50",
			)}
			onClick={onSelect}
		>
			<div className="flex items-center gap-2 w-full">
				<div className="flex-shrink-0">{statusIcon}</div>
				<span className="truncate flex-1">{section.title}</span>

				{section.isManuallyAdded && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
						onClick={onDelete}
					>
						<TrashIcon className="h-3 w-3" />
					</Button>
				)}
			</div>
		</DropdownMenuItem>
	);
}
