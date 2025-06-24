"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@ui/lib/utils";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	ChevronDown,
	ColumnsIcon,
	Heading,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Image,
	Italic,
	List,
	ListOrdered,
	MinusCircle,
	Plus,
	RowsIcon,
	Table,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import CustomImageDialog from "../../../saas/manual/components/processing/ImageDialog";
import { Button } from "../button";
import {} from "../dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../tooltip";
import { EditorHelpWidget } from "./components/EditorHelpWidget";

interface EditorToolbarProps {
	editor: Editor | null;
	sectionImages?: {
		url: string;
		type?: string;
		mime_type?: string;
		name?: string;
	}[];
	imageRefs?: (string | number)[];
	onImageAdd?: () => void;
}

// Toolbar button component
function ToolbarButton({
	onClick,
	isActive,
	icon,
	tooltip,
}: {
	onClick: () => void;
	isActive?: boolean;
	icon: React.ReactNode;
	tooltip: string;
}) {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClick}
						className={cn(
							"relavite h-8 w-8 p-0 rounded-md",
							isActive &&
								"bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
						)}
					>
						{/* <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span> */}
						{icon}
					</Button>
				</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default function EditorToolbar({
	editor,
	sectionImages = [],
	imageRefs = [],
	onImageAdd,
}: EditorToolbarProps) {
	const [imageDialogOpen, setImageDialogOpen] = useState(false);

	if (!editor) {
		return null;
	}

	const isTableSelected = editor.isActive("table");

	// Handle image selection from ImageDialog
	const handleImageSelect = (imageUrl: string) => {
		if (imageUrl) {
			editor.chain().focus().setImage({ src: imageUrl }).run();
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-1 px-1">
			<div className="flex items-center gap-1 mr-1 border-r pr-1">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive("bold")}
					tooltip="Bold"
					icon={<Bold className="h-4 w-4" />}
				/>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive("italic")}
					tooltip="Italic"
					icon={<Italic className="h-4 w-4" />}
				/>
			</div>

			<div className="flex items-center gap-1 mr-1 border-r pr-1">
				<DropdownMenu>
					<TooltipProvider>
						<Tooltip delayDuration={300}>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className={cn(
											"h-8 gap-1 px-2 rounded-md",
											(editor.isActive("customHeading", {
												level: 1,
											}) ||
												editor.isActive(
													"customHeading",
													{ level: 2 },
												) ||
												editor.isActive(
													"customHeading",
													{ level: 3 },
												) ||
												editor.isActive(
													"customHeading",
													{ level: 4 },
												) ||
												editor.isActive(
													"customHeading",
													{ level: 5 },
												) ||
												editor.isActive(
													"customHeading",
													{ level: 6 },
												)) &&
												"bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
										)}
									>
										<Heading className="h-4 w-4" />
										<span className="text-xs">Heading</span>
										<ChevronDown className="h-3 w-3 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent>Heading</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<DropdownMenuContent align="start">
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 1 })
									.run()
							}
						>
							<Heading1 className="h-4 w-4 mr-2" />
							<span>Heading 1</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 2 })
									.run()
							}
						>
							<Heading2 className="h-4 w-4 mr-2" />
							<span>Heading 2</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 3 })
									.run()
							}
						>
							<Heading3 className="h-4 w-4 mr-2" />
							<span>Heading 3</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 4 })
									.run()
							}
						>
							<Heading4 className="h-4 w-4 mr-2" />
							<span>Heading 4</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 5 })
									.run()
							}
						>
							<Heading5 className="h-4 w-4 mr-2" />
							<span>Heading 5</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.toggleHeading({ level: 6 })
									.run()
							}
						>
							<Heading6 className="h-4 w-4 mr-2" />
							<span>Heading 6</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex items-center gap-1 mr-1 border-r pr-1">
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleBulletList().run()
					}
					isActive={editor.isActive("bulletList")}
					tooltip="Bullet List"
					icon={<List className="h-4 w-4" />}
				/>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleOrderedList().run()
					}
					isActive={editor.isActive("orderedList")}
					tooltip="Numbered List"
					icon={<ListOrdered className="h-4 w-4" />}
				/>
			</div>

			<div className="flex items-center gap-1 mr-1 border-r pr-1">
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("left").run()
					}
					isActive={editor.isActive({ textAlign: "left" })}
					tooltip="Align Left"
					icon={<AlignLeft className="h-4 w-4" />}
				/>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("center").run()
					}
					isActive={editor.isActive({ textAlign: "center" })}
					tooltip="Align Center"
					icon={<AlignCenter className="h-4 w-4" />}
				/>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("right").run()
					}
					isActive={editor.isActive({ textAlign: "right" })}
					tooltip="Align Right"
					icon={<AlignRight className="h-4 w-4" />}
				/>
			</div>

			{/* Table Management Dropdown */}
			{isTableSelected ? (
				<div className="flex items-center gap-1 mr-1 border-r pr-1">
					<DropdownMenu>
						<TooltipProvider>
							<Tooltip delayDuration={300}>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 px-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
										>
											<Table className="h-4 w-4" />
											<span className="text-xs">
												Table
											</span>
											<ChevronDown className="h-3 w-3 opacity-50" />
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>Table</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<DropdownMenuContent align="start">
							<DropdownMenuLabel>
								Table Management
							</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<RowsIcon className="h-4 w-4 mr-2" />
										<span>Rows</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.addRowBefore()
													.run()
											}
										>
											<Plus className="h-4 w-4 mr-2" />
											<span>Add Row Before</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.addRowAfter()
													.run()
											}
										>
											<Plus className="h-4 w-4 mr-2" />
											<span>Add Row After</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.deleteRow()
													.run()
											}
										>
											<MinusCircle className="h-4 w-4 mr-2" />
											<span>Delete Row</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuSub>

								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<ColumnsIcon className="h-4 w-4 mr-2" />
										<span>Columns</span>
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.addColumnBefore()
													.run()
											}
										>
											<Plus className="h-4 w-4 mr-2" />
											<span>Add Column Before</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.addColumnAfter()
													.run()
											}
										>
											<Plus className="h-4 w-4 mr-2" />
											<span>Add Column After</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												editor
													.chain()
													.focus()
													.deleteColumn()
													.run()
											}
										>
											<MinusCircle className="h-4 w-4 mr-2" />
											<span>Delete Column</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() =>
									editor.chain().focus().deleteTable().run()
								}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								<span>Delete Table</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				<div className="flex items-center gap-1 mr-1 border-r pr-1">
					<ToolbarButton
						onClick={() =>
							editor
								.chain()
								.focus()
								.insertTable({
									rows: 3,
									cols: 3,
									withHeaderRow: true,
								})
								.run()
						}
						tooltip="Insert Table"
						icon={<Table className="h-4 w-4" />}
					/>
				</div>
			)}

			<div className="flex items-center gap-1">
				<ToolbarButton
					onClick={() => setImageDialogOpen(true)}
					tooltip="Insert Image"
					icon={<Image className="h-4 w-4" />}
				/>

				{/* Add Help widget */}
				<div className="ml-auto">
					<EditorHelpWidget />
				</div>

				{/* Image Dialog */}
				<CustomImageDialog
					isOpen={imageDialogOpen}
					onClose={() => setImageDialogOpen(false)}
					onImageSelect={handleImageSelect}
					sectionImages={sectionImages}
					imageRefs={imageRefs}
				/>
			</div>
		</div>
	);
}
