"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

interface EditableLogoProps {
	logoPath: string;
	containerRef: React.RefObject<HTMLDivElement | null>;
	initialX?: number;
	initialY?: number;
	initialWidth?: number;
	initialHeight?: number;
}

export function EditableLogo({
	logoPath,
	containerRef,
	initialX = 20,
	initialY = 20,
	initialWidth = 100,
	initialHeight = 100,
}: EditableLogoProps) {
	const form = useFormContext();
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeHandle, setResizeHandle] = useState<string | null>(null);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [resizeStart, setResizeStart] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});
	const logoRef = useRef<HTMLDivElement>(null);

	// Get current values from form or use initial values
	const logoX = form?.watch("header.logoPositionX") ?? initialX;
	const logoY = form?.watch("header.logoPositionY") ?? initialY;
	const logoWidth = form?.watch("header.logoWidth") ?? initialWidth;
	const logoHeight = form?.watch("header.logoHeight") ?? initialHeight;

	// Handle drag start
	const handleDragStart = useCallback((e: React.MouseEvent) => {
		if ((e.target as HTMLElement).classList.contains("resize-handle")) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
		const rect = logoRef.current?.getBoundingClientRect();
		if (rect) {
			setDragStart({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		}
	}, []);

	// Handle drag
	const handleDrag = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			const containerRect = containerRef.current.getBoundingClientRect();
			const x = e.clientX - containerRect.left - dragStart.x;
			const y = e.clientY - containerRect.top - dragStart.y;

			// Limit movement within container
			const maxX = containerRect.width - logoWidth;
			const maxY = containerRect.height - logoHeight;

			const boundedX = Math.max(0, Math.min(x, maxX));
			const boundedY = Math.max(0, Math.min(y, maxY));

			if (form) {
				form.setValue("header.logoPositionX", boundedX);
				form.setValue("header.logoPositionY", boundedY);
			}
		},
		[isDragging, containerRef, dragStart, form, logoWidth, logoHeight],
	);

	// Handle resize start
	const handleResizeStart = useCallback(
		(e: React.MouseEvent, handle: string) => {
			e.preventDefault();
			e.stopPropagation();
			setIsResizing(true);
			setResizeHandle(handle);
			setResizeStart({
				x: e.clientX,
				y: e.clientY,
				width: logoWidth,
				height: logoHeight,
			});
		},
		[logoWidth, logoHeight],
	);

	// Handle resize
	const handleResize = useCallback(
		(e: MouseEvent) => {
			if (!isResizing || !resizeHandle || !containerRef.current) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			const deltaX = e.clientX - resizeStart.x;
			const deltaY = e.clientY - resizeStart.y;

			let newWidth = resizeStart.width;
			let newHeight = resizeStart.height;

			switch (resizeHandle) {
				case "se":
					newWidth = Math.max(20, resizeStart.width + deltaX);
					newHeight = Math.max(20, resizeStart.height + deltaY);
					break;
				case "sw":
					newWidth = Math.max(20, resizeStart.width - deltaX);
					newHeight = Math.max(20, resizeStart.height + deltaY);
					break;
				case "ne":
					newWidth = Math.max(20, resizeStart.width + deltaX);
					newHeight = Math.max(20, resizeStart.height - deltaY);
					break;
				case "nw":
					newWidth = Math.max(20, resizeStart.width - deltaX);
					newHeight = Math.max(20, resizeStart.height - deltaY);
					break;
			}

			if (form) {
				form.setValue("header.logoWidth", newWidth);
				form.setValue("header.logoHeight", newHeight);
			}
		},
		[isResizing, resizeHandle, resizeStart, form, containerRef],
	);

	// Handle drag and resize end
	const handleEnd = useCallback(() => {
		setIsDragging(false);
		setIsResizing(false);
		setResizeHandle(null);
	}, []);

	// Add and remove event listeners
	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleDrag);
			window.addEventListener("mouseup", handleEnd);
			window.addEventListener("mouseleave", handleEnd);
		}

		if (isResizing) {
			window.addEventListener("mousemove", handleResize);
			window.addEventListener("mouseup", handleEnd);
			window.addEventListener("mouseleave", handleEnd);
		}

		return () => {
			window.removeEventListener("mousemove", handleDrag);
			window.removeEventListener("mousemove", handleResize);
			window.removeEventListener("mouseup", handleEnd);
			window.removeEventListener("mouseleave", handleEnd);
		};
	}, [isDragging, isResizing, handleDrag, handleResize, handleEnd]);

	return (
		<div
			ref={logoRef}
			className="absolute select-none"
			style={{
				left: `${logoX}px`,
				top: `${logoY}px`,
				width: `${logoWidth}px`,
				height: `${logoHeight}px`,
				cursor: isDragging ? "grabbing" : "grab",
				zIndex: 10,
				userSelect: "none",
				WebkitUserSelect: "none",
				MozUserSelect: "none",
				msUserSelect: "none",
				touchAction: "none",
			}}
			onMouseDown={handleDragStart}
		>
			<img
				src={logoPath}
				alt="Logo"
				className="w-full h-full object-contain"
				draggable={false}
				onDragStart={(e) => e.preventDefault()}
			/>

			{/* Resize handles */}
			<div
				className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-se-resize"
				onMouseDown={(e) => handleResizeStart(e, "se")}
			/>
			<div
				className="resize-handle absolute bottom-0 left-0 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-sw-resize"
				onMouseDown={(e) => handleResizeStart(e, "sw")}
			/>
			<div
				className="resize-handle absolute top-0 right-0 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-ne-resize"
				onMouseDown={(e) => handleResizeStart(e, "ne")}
			/>
			<div
				className="resize-handle absolute top-0 left-0 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-nw-resize"
				onMouseDown={(e) => handleResizeStart(e, "nw")}
			/>
		</div>
	);
}
