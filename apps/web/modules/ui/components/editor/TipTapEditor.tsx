"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@ui/lib/utils";
import { Edit, Eye } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../button";
import EditorSidebar from "./EditorSidebar";
import EditorToolbar from "./EditorToolbar";
import { AlertBlockExtension } from "./extensions/AlertBlockExtension";
import { HTMLPreserve } from "./extensions/HTMLPreserve";
import { HeadingExtension } from "./extensions/HeadingExtension";
import { LayoutExtension } from "./extensions/LayoutExtension";
import { ResizableImageExtension } from "./extensions/ResizableImageExtension";
import { TableComponentExtension } from "./extensions/TableComponentExtension";
import "./tiptap-styles.css";

// Types
export interface TipTapEditorProps {
	className?: string;
	content?: string;
	onChange?: (html: string, editor?: any) => void;
	onImageAdd?: () => void;
	sectionImages?: {
		url: string;
		type?: string;
		mime_type?: string;
		name?: string;
	}[];
	imageRefs?: (string | number)[];
	selectedSectionTitle?: string;
	selectedSectionOriginalContent?: string;
	exampleContent?: string;
}

interface ActiveItemType {
	id: string;
	label: string;
	icon: React.ReactNode;
}

interface DragDataType {
	type: string;
	template: string;
}

export default function TipTapEditor({
	className,
	content = "",
	onChange,
	onImageAdd,
	sectionImages = [],
	imageRefs = [],
	selectedSectionTitle,
	selectedSectionOriginalContent,
	exampleContent,
}: TipTapEditorProps) {
	// State
	const [isEditMode, setIsEditMode] = useState(true);
	const [isDragging, setIsDragging] = useState(false);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [activeItem, setActiveItem] = useState<ActiveItemType | null>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [currentContent, setCurrentContent] = useState(content);
	const [isClient, setIsClient] = useState(false);

	// Refs
	const contentRef = useRef<HTMLDivElement>(null);
	const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);

	// Configure DND sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Minimum distance in pixels before a drag starts
			},
		}),
	);

	// Initialize editor
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: false,
			}),
			Table.configure({ resizable: false }),
			TableRow,
			TableCell,
			TableHeader,
			TextAlign.configure({
				types: ["customHeading", "paragraph"],
			}),
			ResizableImageExtension,
			HeadingExtension,
			HTMLPreserve,
			TableComponentExtension,
			LayoutExtension,
			AlertBlockExtension,
		],
		content,
		editable: isEditMode,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			setCurrentContent(html);
			onChange?.(html, editor);
		},
		onDestroy: () => {
			// Cleanup quando l'editor viene distrutto
			setCurrentContent("");
		},
	});

	// Update editor content when content prop changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			queueMicrotask(() => {
				editor.commands.setContent(content);
			});
		}
	}, [content, editor]);

	// Cleanup dell'editor quando il componente viene smontato
	useEffect(() => {
		return () => {
			if (editor) {
				editor.destroy();
			}
		};
	}, [editor]);

	// Add mouse move listener when dragging
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (contentRef.current) {
				const rect = contentRef.current.getBoundingClientRect();
				if (
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom
				) {
					const relativeY = e.clientY - rect.top;
					setCursorPosition(relativeY);
				}
			}
			setMousePosition({ x: e.clientX, y: e.clientY });
		};

		document.addEventListener("mousemove", handleMouseMove);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isDragging]);

	// Check if mouse is over editor area
	const isMouseOverEditor = useCallback(() => {
		if (!contentRef.current || !isDragging) return false;
		const rect = contentRef.current.getBoundingClientRect();
		return (
			mousePosition.x >= rect.left &&
			mousePosition.x <= rect.right &&
			mousePosition.y >= rect.top &&
			mousePosition.y <= rect.bottom
		);
	}, [isDragging, mousePosition]);

	// Check if the drag distance is far enough to not be considered a click
	const wasDraggedFarEnough = useCallback((): boolean => {
		if (!dragStartPositionRef.current) return false;

		const dx = mousePosition.x - dragStartPositionRef.current.x;
		const dy = mousePosition.y - dragStartPositionRef.current.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		return distance >= 10; // Minimum 10px drag distance
	}, [mousePosition]);

	// Handle drag start event
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setIsDragging(true);

		// Get the active item data for displaying in the drag overlay
		const { id, data } = event.active;

		if (data.current) {
			// Find the matching block in our blocks list
			const blockInfo = {
				id: id as string,
				label: data.current.label || id,
				icon: data.current.icon || null,
			};
			setActiveItem(blockInfo);
		}

		// Store drag start position to measure distance
		if (event.activatorEvent instanceof MouseEvent) {
			dragStartPositionRef.current = {
				x: event.activatorEvent.clientX,
				y: event.activatorEvent.clientY,
			};

			setMousePosition({
				x: event.activatorEvent.clientX,
				y: event.activatorEvent.clientY,
			});

			if (contentRef.current) {
				const rect = contentRef.current.getBoundingClientRect();
				if (
					event.activatorEvent.clientY >= rect.top &&
					event.activatorEvent.clientY <= rect.bottom
				) {
					setCursorPosition(event.activatorEvent.clientY - rect.top);
				}
			}
		}
	}, []);

	// Handle drag end event
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setIsDragging(false);
			setActiveItem(null);
			const { active } = event;

			if (!editor || !active.data.current) {
				return;
			}

			// Check if mouse moved enough to consider it a drag (not a click)
			if (!wasDraggedFarEnough()) {
				dragStartPositionRef.current = null;
				return;
			}

			// Check if mouse is over editor
			if (!isMouseOverEditor()) {
				dragStartPositionRef.current = null;
				return;
			}

			try {
				insertContentIntoEditor(
					editor,
					active.data.current as DragDataType,
				);
			} catch (error) {
				console.error("Error inserting content:", error);
			} finally {
				dragStartPositionRef.current = null;
			}
		},
		[editor, wasDraggedFarEnough, isMouseOverEditor],
	);

	// Insert content into the editor based on type
	const insertContentIntoEditor = (editor: Editor, data: DragDataType) => {
		const { type, template } = data;

		if (type === "table") {
			// For table blocks, we'll use our custom command to insert a table
			editor
				.chain()
				.focus()
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run();
		} else if (type === "layout") {
			// For layout blocks, insert the layout node directly
			const columns = Number.parseInt(template, 10);

			// Create very simple content for each column to ensure single row layout
			const columnContents = Array.from({ length: columns }, (_, i) => ({
				type: "paragraph",
				content: [{ type: "text", text: `Col ${i + 1}` }],
			}));

			editor
				.chain()
				.focus()
				.insertContent({
					type: "layout",
					attrs: {
						columns: columns,
					},
					content: columnContents,
				})
				.run();
		} else if (type === "alert") {
			// For alert blocks, use our custom alertBlock extension
			const alertType = template as any;
			editor
				.chain()
				.focus()
				.insertContent({
					type: "alertBlock",
					attrs: {
						type: alertType,
						title: getAlertDefaultTitle(alertType),
					},
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: getAlertDefaultContent(alertType),
								},
							],
						},
					],
				})
				.run();
		} else if (template.includes("alert-block")) {
			// Legacy support for HTML alert blocks
			editor.commands.insertHtmlBlock(template);
		} else {
			// For other content use regular insertContent
			editor.chain().focus().insertContent(template).run();
		}
	};

	// Helper functions for alert content
	function getAlertDefaultTitle(type: string): string {
		switch (type) {
			case "danger":
				return "DANGER";
			case "warning":
				return "WARNING";
			case "caution":
				return "CAUTION";
			case "important":
			default:
				return "IMPORTANT";
		}
	}

	function getAlertDefaultContent(type: string): string {
		switch (type) {
			case "danger":
				return "This is a danger message that you should pay attention to.";
			case "warning":
				return "This is a warning message that you should be aware of.";
			case "caution":
				return "This is a caution message you should consider carefully.";
			case "important":
			default:
				return "This is an important message that needs your attention.";
		}
	}

	// UI Components
	const renderDragOverlayContent = () => {
		if (!activeItem) return null;

		return (
			<div className="flex items-center gap-3 p-3 bg-white rounded-md shadow-md border border-primary w-64">
				<div className="flex-shrink-0 text-primary">
					{activeItem.icon}
				</div>
				<div className="font-medium text-sm">{activeItem.label}</div>
			</div>
		);
	};

	const renderEditorHeader = () => (
		<div className="border-b bg-gray-50/60 p-2">
			<div className="flex justify-between items-center">
				<div className="inline-flex items-center rounded-md overflow-hidden border shadow-sm">
					<Button
						variant={isEditMode ? "secondary" : "ghost"}
						onClick={() => setIsEditMode(true)}
						className={cn(
							"flex items-center gap-1.5 rounded-r-none border-r",
							!isEditMode && "hover:bg-gray-100/80",
						)}
						size="sm"
					>
						<Edit size={16} />
						<span>Edit</span>
					</Button>
					<Button
						variant={!isEditMode ? "secondary" : "ghost"}
						onClick={() => setIsEditMode(false)}
						className={cn(
							"flex items-center gap-1.5 rounded-l-none",
							isEditMode && "hover:bg-gray-100/80",
						)}
						size="sm"
					>
						<Eye size={16} />
						<span>Preview</span>
					</Button>
				</div>

				{isEditMode && (
					<div className="ml-auto">
						<EditorToolbar
							editor={editor}
							onImageAdd={onImageAdd}
							sectionImages={sectionImages}
							imageRefs={imageRefs}
						/>
					</div>
				)}
			</div>
		</div>
	);

	const renderDropIndicator = () => (
		<>
			{/* Drop zone indicator */}
			<div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded pointer-events-none z-10" />

			{/* Insertion line indicator that follows cursor */}
			<div
				className="absolute left-0 right-0 pointer-events-none z-20 transition-transform duration-75"
				style={{ top: `${cursorPosition}px` }}
			>
				<div className="h-1 w-full bg-primary" />
				<div className="w-3 h-3 rounded-full bg-primary absolute left-0 top-0 -translate-y-1/2 -translate-x-1" />
				<div className="w-3 h-3 rounded-full bg-primary absolute right-0 top-0 -translate-y-1/2 translate-x-1" />
			</div>
		</>
	);

	const renderEditMode = () => (
		isClient ? (
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragMove={() => {}} // Handled by mouse move listener
				onDragEnd={handleDragEnd}
			>
				<div className="flex flex-1 min-w-0">
					<EditorSidebar
						selectedSectionTitle={selectedSectionTitle}
						selectedSectionOriginalContent={selectedSectionOriginalContent}
					/>
					<div
						ref={contentRef}
						className={cn(
							"flex-1 w-full min-w-0 max-w-full p-2 sm:p-4 relative",
							isDragging && isMouseOverEditor() && "bg-primary/5",
						)}
					>
						{isDragging && isMouseOverEditor() && renderDropIndicator()}
						<EditorContent
							editor={editor}
							className="outline-none focus:outline-none w-full h-full tiptap-editor cursor-text"
						/>
					</div>
					{/* Drag overlay to show component following cursor */}
					<DragOverlay>
						{isDragging && renderDragOverlayContent()}
					</DragOverlay>
				</div>
			</DndContext>
		) : null
	);

	const renderPreviewMode = () => {
		// Create a safe HTML string with properly parsed content
		const safeHtml = editor?.getHTML() || "";

		return (
			<div className="w-full p-5 prose max-w-none tiptap-content">
				<div dangerouslySetInnerHTML={{ __html: safeHtml }} />
			</div>
		);
	};

	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className="w-full min-w-0 max-w-full">
			<div
				className={cn(
					"flex flex-col rounded-lg border shadow-sm bg-white",
					className,
				)}
			>
				{renderEditorHeader()}
				<div className="flex flex-1">
					{isEditMode ? renderEditMode() : renderPreviewMode()}
				</div>
			</div>
		</div>
	);
}
