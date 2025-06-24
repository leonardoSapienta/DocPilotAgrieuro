"use client";

import { config } from "@repo/config";
import { NavBar } from "@saas/shared/components/NavBar";
import { sidebarExpanded } from "@saas/shared/lib/state";
import { cn } from "@ui/lib";
import { useAtom } from "jotai";
import type { PropsWithChildren } from "react";
// import { usePathname } from "next/navigation";

export function AppWrapper({ children }: PropsWithChildren) {
	// const pathname = usePathname();
	const [expanded] = useAtom(sidebarExpanded);

	return (
		<div
			className={cn(
				"bg-[radial-gradient(farthest-corner_at_0%_0%,rgba(var(--colors-primary-rgb),0.075)_0%,var(--colors-background)_50%)] dark:bg-[radial-gradient(farthest-corner_at_0%_0%,rgba(var(--colors-primary-rgb),0.1)_0%,var(--colors-background)_50%)]",
				[config.ui.saas.useSidebarLayout ? "" : ""],
			)}
		>
			<NavBar />
			<div
				className={cn("px-0 transition-all duration-300", [
					config.ui.saas.useSidebarLayout
						? "min-h-[calc(100vh-1rem)]"
						: "",
					config.ui.saas.useSidebarLayout && expanded
						? "md:ml-[280px]"
						: "",
					config.ui.saas.useSidebarLayout && !expanded
						? "md:ml-[80px]"
						: "",
				])}
			>
				<main
					className={cn("container max-w-6xl py-6", [
						config.ui.saas.useSidebarLayout ? "" : "",
					])}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
