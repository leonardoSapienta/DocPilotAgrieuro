"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { cn } from "@ui/lib/utils";
import { Lock, Settings2, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ResizableImageComponent(props: NodeViewProps) {
	const imageRef = useRef<HTMLImageElement>(null);
	const [size, setSize] = useState({
		width: props.node.attrs.width || null,
		height: props.node.attrs.height || null,
	});
	const [showSizeControls, setShowSizeControls] = useState(false);
	const [manualWidth, setManualWidth] = useState(
		props.node.attrs.width || "",
	);
	const [manualHeight, setManualHeight] = useState(
		props.node.attrs.height || "",
	);
	const [lockAspectRatio, setLockAspectRatio] = useState(true);
	const [naturalSize, setNaturalSize] = useState({
		width: props.node.attrs.originalWidth || null,
		height: props.node.attrs.originalHeight || null,
	});
	const [isResizing, setIsResizing] = useState(false);
	const [aspectRatio, setAspectRatio] = useState(1);

	const [isSelected, setIsSelected] = useState(props.selected);

	// Update selected status when props change
	useEffect(() => {
		setIsSelected(props.selected);
	}, [props.selected]);

	// Update manual size fields when size changes
	useEffect(() => {
		setManualWidth(size.width?.toString() || "");
		setManualHeight(size.height?.toString() || "");
	}, [size.width, size.height]);

	// When image loads, capture its natural dimensions
	useEffect(() => {
		if (imageRef.current?.complete) {
			const imgEl = imageRef.current;
			const newNaturalSize = {
				width: naturalSize.width || imgEl.naturalWidth,
				height: naturalSize.height || imgEl.naturalHeight,
			};
			setNaturalSize(newNaturalSize);

			const ratio = newNaturalSize.width / newNaturalSize.height;
			setAspectRatio(ratio);

			// If we don't have a width/height already, use natural size
			if (!size.width && !size.height) {
				const newSize = {
					width: imgEl.naturalWidth,
					height: imgEl.naturalHeight,
				};
				setSize(newSize);

				// Update the node attributes in a separate effect to avoid flushSync
				queueMicrotask(() => {
					props.updateAttributes({
						width: imgEl.naturalWidth,
						height: imgEl.naturalHeight,
						originalWidth: imgEl.naturalWidth,
						originalHeight: imgEl.naturalHeight,
					});
				});
			}
		}
	}, []);

	// Handle image load to capture natural dimensions
	const handleImageLoad = () => {
		if (imageRef.current) {
			const imgEl = imageRef.current;
			const newNaturalSize = {
				width: naturalSize.width || imgEl.naturalWidth,
				height: naturalSize.height || imgEl.naturalHeight,
			};
			setNaturalSize(newNaturalSize);

			const ratio = newNaturalSize.width / newNaturalSize.height;
			setAspectRatio(ratio);

			// If we don't have a width/height already, use natural size
			if (!size.width && !size.height) {
				const newSize = {
					width: imgEl.naturalWidth,
					height: imgEl.naturalHeight,
				};
				setSize(newSize);

				// Update the node attributes in a separate effect to avoid flushSync
				queueMicrotask(() => {
					props.updateAttributes({
						width: imgEl.naturalWidth,
						height: imgEl.naturalHeight,
						originalWidth: imgEl.naturalWidth,
						originalHeight: imgEl.naturalHeight,
					});
				});
			}
		}
	};

	// Resize event handlers
	const handleResizeStart = (
		e: React.MouseEvent | React.TouchEvent,
		corner: string,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setIsResizing(true);

		// Capture initial mouse/touch position and size
		const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
		const startWidth = size.width || imageRef.current?.offsetWidth || 0;
		const startHeight = size.height || imageRef.current?.offsetHeight || 0;

		// Mouse move handler
		const handleMouseMove = (e: MouseEvent | TouchEvent) => {
			const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
			const deltaX = currentX - startX;
			const deltaY = currentY - startY;

			let newWidth = startWidth;
			let newHeight = startHeight;

			// Calculate new dimensions based on which resize handle was dragged
			switch (corner) {
				case "se": // bottom right
					newWidth = startWidth + deltaX;
					newHeight = startHeight + deltaY;
					break;
				case "sw": // bottom left
					newWidth = startWidth - deltaX;
					newHeight = startHeight + deltaY;
					break;
				case "ne": // top right
					newWidth = startWidth + deltaX;
					newHeight = startHeight - deltaY;
					break;
				case "nw": // top left
					newWidth = startWidth - deltaX;
					newHeight = startHeight - deltaY;
					break;
				case "n": // top center
					newHeight = startHeight - deltaY;
					newWidth = newHeight * aspectRatio;
					break;
				case "s": // bottom center
					newHeight = startHeight + deltaY;
					newWidth = newHeight * aspectRatio;
					break;
				case "e": // middle right
					newWidth = startWidth + deltaX;
					newHeight = newWidth / aspectRatio;
					break;
				case "w": // middle left
					newWidth = startWidth - deltaX;
					newHeight = newWidth / aspectRatio;
					break;
			}

			// Maintain a minimum size
			newWidth = Math.max(50, newWidth);
			newHeight = Math.max(50, newHeight);

			// Update local state
			setSize({ width: newWidth, height: newHeight });

			// Update the node attributes (which will be saved to the document)
			props.updateAttributes({
				width: Math.round(newWidth),
				height: Math.round(newHeight),
			});
		};

		// Mouse up handler
		const handleMouseUp = () => {
			setIsResizing(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("touchmove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchend", handleMouseUp);
		};

		// Add temporary document-wide event listeners
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("touchmove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("touchend", handleMouseUp);
	};

	// Handle manual width change
	const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setManualWidth(value);

		if (value === "") return;

		const newWidth = Number.parseInt(value, 10);
		if (Number.isNaN(newWidth)) return;

		let newHeight = size.height;

		// Update height if aspect ratio is locked
		if (lockAspectRatio && aspectRatio) {
			newHeight = Math.round(newWidth / aspectRatio);
			setManualHeight(newHeight.toString());
		}

		setSize({ width: newWidth, height: newHeight });
	};

	// Handle manual height change
	const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setManualHeight(value);

		if (value === "") return;

		const newHeight = Number.parseInt(value, 10);
		if (Number.isNaN(newHeight)) return;

		let newWidth = size.width;

		// Update width if aspect ratio is locked
		if (lockAspectRatio && aspectRatio) {
			newWidth = Math.round(newHeight * aspectRatio);
			setManualWidth(newWidth.toString());
		}

		setSize({ width: newWidth, height: newHeight });
	};

	// Apply manual size changes to the image
	const applySizeChanges = () => {
		const width = Number.parseInt(manualWidth, 10);
		const height = Number.parseInt(manualHeight, 10);

		if (!Number.isNaN(width) && !Number.isNaN(height)) {
			props.updateAttributes({
				width: width,
				height: height,
			});
		}
	};

	// Reset to original dimensions
	const resetToOriginal = () => {
		if (naturalSize.width && naturalSize.height) {
			setManualWidth(naturalSize.width.toString());
			setManualHeight(naturalSize.height.toString());

			setSize({
				width: naturalSize.width,
				height: naturalSize.height,
			});

			props.updateAttributes({
				width: naturalSize.width,
				height: naturalSize.height,
			});
		}
	};

	// Handle image delete via keyboard
	useEffect(() => {
		if (!isSelected) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (isSelected && (e.key === "Delete" || e.key === "Backspace")) {
				props.deleteNode();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isSelected, props]);

	return (
		<NodeViewWrapper className="resize-image-wrapper">
			<div
				className={cn(
					"relative inline-block",
					isSelected &&
						"outline outline-2 outline-primary/70 outline-offset-2",
				)}
			>
				<img
					ref={imageRef}
					src={props.node.attrs.src}
					alt={props.node.attrs.alt || ""}
					width={size.width}
					height={size.height}
					onLoad={handleImageLoad}
					className="max-w-full"
					style={{
						width: size.width ? `${size.width}px` : "auto",
						height: size.height ? `${size.height}px` : "auto",
					}}
					data-drag-handle
				/>

				{/* Only show resize handles when selected */}
				{isSelected && (
					<>
						{/* Corner resize handles */}
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full -bottom-1.5 -right-1.5 cursor-se-resize"
							onMouseDown={(e) => handleResizeStart(e, "se")}
							onTouchStart={(e) => handleResizeStart(e, "se")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize"
							onMouseDown={(e) => handleResizeStart(e, "sw")}
							onTouchStart={(e) => handleResizeStart(e, "sw")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full -top-1.5 -right-1.5 cursor-ne-resize"
							onMouseDown={(e) => handleResizeStart(e, "ne")}
							onTouchStart={(e) => handleResizeStart(e, "ne")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full -top-1.5 -left-1.5 cursor-nw-resize"
							onMouseDown={(e) => handleResizeStart(e, "nw")}
							onTouchStart={(e) => handleResizeStart(e, "nw")}
						/>

						{/* Middle resize handles */}
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize"
							onMouseDown={(e) => handleResizeStart(e, "e")}
							onTouchStart={(e) => handleResizeStart(e, "e")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize"
							onMouseDown={(e) => handleResizeStart(e, "w")}
							onTouchStart={(e) => handleResizeStart(e, "w")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full left-1/2 -top-1.5 -translate-x-1/2 cursor-n-resize"
							onMouseDown={(e) => handleResizeStart(e, "n")}
							onTouchStart={(e) => handleResizeStart(e, "n")}
						/>
						<div
							className="absolute w-3 h-3 border-2 border-primary bg-white rounded-full left-1/2 -bottom-1.5 -translate-x-1/2 cursor-s-resize"
							onMouseDown={(e) => handleResizeStart(e, "s")}
							onTouchStart={(e) => handleResizeStart(e, "s")}
						/>

						{/* Settings button */}
						<Button
							size="icon"
							variant="outline"
							className="absolute -top-10 right-0 h-8 w-8 rounded-full bg-white shadow-md"
							onClick={() =>
								setShowSizeControls(!showSizeControls)
							}
						>
							<Settings2 className="h-4 w-4" />
						</Button>

						{/* Manual size controls */}
						{showSizeControls && (
							<div className="absolute min-w-[180px] max-w-[250px] -top-28 right-8 bg-white border rounded-md shadow-md p-2 z-10 flex flex-col gap-2">
								<div className="text-xs text-gray-500 font-medium">
									Image Dimensions
								</div>
								<div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
									<div className="flex items-center gap-1">
										<span className="text-xs text-gray-500">
											W:
										</span>
										<Input
											className="h-7 text-xs"
											value={manualWidth}
											onChange={handleWidthChange}
											onBlur={applySizeChanges}
											onKeyDown={(e) =>
												e.key === "Enter" &&
												applySizeChanges()
											}
										/>
									</div>
									<Button
										size="icon"
										variant="ghost"
										className="h-6 w-6"
										onClick={() =>
											setLockAspectRatio(!lockAspectRatio)
										}
										title={
											lockAspectRatio
												? "Unlock aspect ratio"
												: "Lock aspect ratio"
										}
									>
										{lockAspectRatio ? (
											<Lock className="h-3 w-3" />
										) : (
											<Unlock className="h-3 w-3" />
										)}
									</Button>
									<div className="flex items-center gap-1">
										<span className="text-xs text-gray-500">
											H:
										</span>
										<Input
											className="h-7 text-xs"
											value={manualHeight}
											onChange={handleHeightChange}
											onBlur={applySizeChanges}
											onKeyDown={(e) =>
												e.key === "Enter" &&
												applySizeChanges()
											}
										/>
									</div>
								</div>
								<Button
									size="sm"
									variant="secondary"
									className="h-7 text-xs"
									onClick={resetToOriginal}
								>
									Reset to Original
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</NodeViewWrapper>
	);
}
