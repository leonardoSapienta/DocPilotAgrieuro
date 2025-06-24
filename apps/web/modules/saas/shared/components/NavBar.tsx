"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { UserMenu } from "@saas/shared/components/UserMenu";
import { sidebarExpanded } from "@saas/shared/lib/state";
import { Logo } from "@shared/components/Logo";
import { cn } from "@ui/lib";
import { useAtom } from "jotai";
import {
	Archive,
	ArchiveRestore,
	BookOpenIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	FileText,
	HomeIcon,
	LayoutTemplate,
	Palette,
	SettingsIcon,
	UserCog2Icon,
	UserCogIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganzationSelect } from "../../organizations/components/OrganizationSelect";

export function NavBar() {
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization } = useActiveOrganization();
	const [expanded, setExpanded] = useAtom(sidebarExpanded);

	const { useSidebarLayout } = config.ui.saas;

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	const menuItems = [
		{
			label: "Home",
			href: basePath,
			icon: HomeIcon,
			isActive: pathname === basePath,
		},
		{
			label: "Manual",
			href: `${basePath}/manual`,
			icon: BookOpenIcon,
			isActive: pathname.startsWith(`${basePath}/manual`),
		},
		{
			label: "Elaborati",
			href: `${basePath}/elaborati`,
			icon: FileText,
			isActive: pathname.startsWith(`${basePath}/elaborati`),
		},
		{
			label: "Template",
			href: `${basePath}/template`,
			icon: LayoutTemplate,
			isActive: pathname.startsWith(`${basePath}/template`),
		},
		{
			label: "Istruzioni Manuale",
			href: `${basePath}/istruzioni-manuale`,
			icon: ArchiveRestore,
			isActive: pathname.startsWith(`${basePath}/istruzioni-manuale`),
		},
		{
			label: "Sezioni Manuale",
			href: `${basePath}/sezioni-manuale`,
			icon: Archive,
			isActive: pathname.startsWith(`${basePath}/sezioni-manuale`),
		},
		{
			label: "Icone",
			href: `${basePath}/icons`,
			icon: Palette,
			isActive: pathname.startsWith(`${basePath}/icons`),
		},
		...(activeOrganization
			? [
					{
						label: "Impostazioni Organizzazione",
						href: `${basePath}/settings`,
						icon: SettingsIcon,
						isActive: pathname.startsWith(`${basePath}/settings`),
					},
				]
			: [
					{
						label: "Impostazioni Account",
						href: "/app/settings",
						icon: UserCog2Icon,
						isActive: pathname.startsWith("/app/settings"),
					},
				]),
		...(user?.role === "admin"
			? [
					{
						label: "Admin",
						href: "/app/admin",
						icon: UserCogIcon,
						isActive: pathname.startsWith("/app/admin"),
					},
				]
			: []),
	];

	return (
		<nav
			className={cn("w-full border-b transition-all duration-300", {
				"w-full md:fixed md:top-0 md:left-0 md:h-full md:border-r md:border-b-0":
					useSidebarLayout,
				"md:w-[280px]": useSidebarLayout && expanded,
				"md:w-[80px]": useSidebarLayout && !expanded,
			})}
		>
			<div
				className={cn("container max-w-6xl py-4", {
					"container max-w-6xl py-4 md:flex md:h-full md:flex-col md:px-6 md:pt-6 md:pb-0":
						useSidebarLayout,
				})}
			>
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div
						className={cn("flex items-center gap-4 md:gap-2", {
							"md:flex md:w-full md:flex-col md:items-stretch md:align-stretch":
								useSidebarLayout,
						})}
					>
						<div className="flex items-center justify-between w-full">
							<Link href="/app" className="block">
								<Logo />
							</Link>

							{useSidebarLayout && (
								<button
									onClick={() => setExpanded(!expanded)}
									className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
									aria-label={
										expanded
											? "Chiudi sidebar"
											: "Apri sidebar"
									}
									type="button"
								>
									{expanded ? (
										<ChevronLeftIcon className="size-4" />
									) : (
										<ChevronRightIcon className="size-4" />
									)}
								</button>
							)}
						</div>

						{config.organizations.enable &&
							!config.organizations.hideOrganization && (
								<>
									<span
										className={cn(
											"hidden opacity-30 md:block",
											{
												"md:hidden": useSidebarLayout,
											},
										)}
									>
										<ChevronRightIcon className="size-4" />
									</span>

									<OrganzationSelect
										className={cn({
											"md:-mx-2 md:mt-2":
												useSidebarLayout,
											hidden:
												useSidebarLayout && !expanded,
										})}
									/>
								</>
							)}
					</div>

					<div
						className={cn(
							"mr-0 ml-auto flex items-center justify-end gap-4",
							{
								"md:hidden": useSidebarLayout,
							},
						)}
					>
						<UserMenu />
					</div>
				</div>

				<ul
					className={cn(
						"no-scrollbar -mx-4 -mb-4 mt-6 flex list-none items-center justify-start gap-4 overflow-x-auto px-4 text-sm",
						{
							"md:mx-0 md:my-4 md:flex md:flex-col md:items-stretch md:gap-1 md:px-0":
								useSidebarLayout,
						},
					)}
				>
					{menuItems.map((menuItem) => (
						<li key={menuItem.href}>
							<Link
								href={menuItem.href}
								className={cn(
									"flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3",
									[
										menuItem.isActive
											? "border-primary font-bold"
											: "border-transparent",
									],
									{
										"md:-mx-6 md:border-b-0 md:border-l-2 md:px-6 md:py-2":
											useSidebarLayout,
										"md:justify-center":
											useSidebarLayout && !expanded,
									},
								)}
								title={!expanded ? menuItem.label : undefined}
							>
								<menuItem.icon
									className={`size-4 shrink-0 ${
										menuItem.isActive
											? "text-[#479a36]"
											: "opacity-50"
									}`}
								/>
								<span
									className={cn({
										"md:hidden":
											useSidebarLayout && !expanded,
									})}
								>
									{menuItem.label}
								</span>
							</Link>
						</li>
					))}
				</ul>

				<div
					className={cn(
						"-mx-4 md:-mx-6 mt-auto mb-0 hidden p-4 md:p-4",
						{
							"md:block": useSidebarLayout,
							"md:hidden": useSidebarLayout && !expanded,
						},
					)}
				>
					<UserMenu showUserName />
				</div>
			</div>
		</nav>
	);
}
