"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@ui/components/accordion";
import { Button } from "@ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@ui/components/sheet";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	HelpCircle,
	Image,
	Lock,
	Redo,
	Settings,
	Table,
	Type,
	Undo,
} from "lucide-react";

export function EditorHelpWidget() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					title="Editor Help"
					className="rounded-full h-9 w-9"
				>
					<HelpCircle className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent className="overflow-y-auto">
				<SheetHeader className="mb-4">
					<SheetTitle>Editor Help</SheetTitle>
					<SheetDescription>
						Learn how to use the rich text editor's features
					</SheetDescription>
				</SheetHeader>

				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="basics">
						<AccordionTrigger className="text-base font-medium">
							Basic Text Formatting
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Bold:</strong> Select text and press{" "}
									<kbd>Ctrl+B</kbd> (or <kbd>⌘+B</kbd> on Mac)
								</p>
								<p>
									<strong>Italic:</strong> Select text and
									press <kbd>Ctrl+I</kbd> (or <kbd>⌘+I</kbd>{" "}
									on Mac)
								</p>
								<p>
									<strong>Undo/Redo:</strong> Use the{" "}
									<Undo className="inline h-4 w-4" /> and{" "}
									<Redo className="inline h-4 w-4" /> buttons
									in the toolbar, or press <kbd>Ctrl+Z</kbd> /{" "}
									<kbd>⌘+Z</kbd> to undo and{" "}
									<kbd>Ctrl+Shift+Z</kbd> /{" "}
									<kbd>⌘+Shift+Z</kbd> to redo
								</p>
								<p>
									<strong>Heading:</strong> Use the{" "}
									<Type className="inline h-4 w-4" /> dropdown
									in the toolbar to select a heading level
								</p>
								<p>
									<strong>Text Alignment:</strong> Use the
									alignment buttons
									<span className="inline-flex items-center gap-1 mx-1">
										<AlignLeft className="h-4 w-4" />
										<AlignCenter className="h-4 w-4" />
										<AlignRight className="h-4 w-4" />
										<AlignJustify className="h-4 w-4" />
									</span>
									in the toolbar
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="images">
						<AccordionTrigger className="text-base font-medium">
							Working with Images
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Insert Image:</strong> Click the{" "}
									<Image className="inline h-4 w-4" /> button
									in the toolbar
								</p>
								<p>
									<strong>Resize Image:</strong> Click on an
									image and drag any of the 8 resize handles
									that appear on the corners and edges
								</p>
								<p>
									<strong>Manual Size:</strong> Click on an
									image, then click the{" "}
									<Settings className="inline h-4 w-4" />{" "}
									button that appears above it to set exact
									dimensions
								</p>
								<p>
									<strong>Lock Aspect Ratio:</strong> When
									resizing, toggle the{" "}
									<Lock className="inline h-4 w-4" /> button
									to maintain or release aspect ratio
								</p>
								<p>
									<strong>Delete Image:</strong> Select an
									image and press <kbd>Delete</kbd> or{" "}
									<kbd>Backspace</kbd>
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="tables">
						<AccordionTrigger className="text-base font-medium">
							Working with Tables
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Insert Table:</strong> Click the{" "}
									<Table className="inline h-4 w-4" /> button
									in the toolbar
								</p>
								<p>
									<strong>Navigate Cells:</strong> Use{" "}
									<kbd>Tab</kbd> to move to the next cell or{" "}
									<kbd>Shift+Tab</kbd> to move to the previous
									cell
								</p>
								<p>
									<strong>Add Row:</strong> Press{" "}
									<kbd>Tab</kbd> in the last cell to add a new
									row
								</p>
								<p>
									<strong>Delete Table:</strong> Place cursor
									in the table and use the context menu or
									toolbar table options
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="layouts">
						<AccordionTrigger className="text-base font-medium">
							Column Layouts
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Create Columns:</strong> Drag a
									column layout (2 or 4-column) from the
									sidebar into the editor
								</p>
								<p>
									<strong>Add Content:</strong> Click inside
									each column to add text, images or other
									content
								</p>
								<p>
									<strong>Column Arrangement:</strong> Content
									flows naturally in a grid layout with the
									specified number of columns
								</p>
								<p>
									<strong>Responsive Behavior:</strong> On
									small screens, columns will automatically
									stack for better readability
								</p>
								<p>
									<strong>Delete Layout:</strong> Click to
									select the entire layout and press{" "}
									<kbd>Delete</kbd> or <kbd>Backspace</kbd>
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="alerts">
						<AccordionTrigger className="text-base font-medium">
							Alert Blocks
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Insert Alert:</strong> Drag an alert
									block (Danger, Warning, Caution, or
									Important) from the sidebar into the editor
								</p>
								<p>
									<strong>Edit Alert Title:</strong> Click on
									the alert title to edit it
								</p>
								<p>
									<strong>Edit Alert Content:</strong> Click
									on the content area to add or modify text
								</p>
								<p>
									<strong>Delete Alert:</strong> Select the
									entire alert block and press{" "}
									<kbd>Delete</kbd> or <kbd>Backspace</kbd>
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="drag-drop">
						<AccordionTrigger className="text-base font-medium">
							Drag & Drop
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<p>
									<strong>Add Components:</strong> Drag items
									from the sidebar and drop them into the
									editor where you want to place them
								</p>
								<p>
									<strong>Indicator:</strong> A blue line
									shows where the component will be inserted
								</p>
								<p>
									<strong>Tip:</strong> For precision
									placement, use the mouse to position the
									insertion line
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="keyboard">
						<AccordionTrigger className="text-base font-medium">
							Keyboard Shortcuts
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-3 text-sm">
								<div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-2">
									<h4 className="font-medium mb-2 text-primary">
										Common Actions
									</h4>
									<p className="flex items-center mb-1">
										<strong>Undo:</strong>{" "}
										<kbd className="mx-1 px-2 py-1 bg-white border rounded text-xs">
											Ctrl+Z
										</kbd>{" "}
										/{" "}
										<kbd className="mx-1 px-2 py-1 bg-white border rounded text-xs">
											⌘+Z
										</kbd>
									</p>
									<p className="flex items-center">
										<strong>Redo:</strong>{" "}
										<kbd className="mx-1 px-2 py-1 bg-white border rounded text-xs">
											Ctrl+Shift+Z
										</kbd>{" "}
										/{" "}
										<kbd className="mx-1 px-2 py-1 bg-white border rounded text-xs">
											⌘+Shift+Z
										</kbd>
									</p>
								</div>

								<p>
									<strong>Bold:</strong> <kbd>Ctrl+B</kbd> /{" "}
									<kbd>⌘+B</kbd>
								</p>
								<p>
									<strong>Italic:</strong> <kbd>Ctrl+I</kbd> /{" "}
									<kbd>⌘+I</kbd>
								</p>
								<p>
									<strong>Heading 1:</strong>{" "}
									<kbd>Ctrl+Alt+1</kbd> /{" "}
									<kbd>⌘+Option+1</kbd>
								</p>
								<p>
									<strong>Heading 2:</strong>{" "}
									<kbd>Ctrl+Alt+2</kbd> /{" "}
									<kbd>⌘+Option+2</kbd>
								</p>
								<p>
									<strong>Heading 3:</strong>{" "}
									<kbd>Ctrl+Alt+3</kbd> /{" "}
									<kbd>⌘+Option+3</kbd>
								</p>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</SheetContent>
		</Sheet>
	);
}
