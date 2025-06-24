"use client";

import {
	CheckIcon,
	ChevronRight,
	FileText,
	Languages,
	Pencil,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Step {
	name: string;
	href: string;
	icon: React.ReactNode;
	current: boolean;
	completed: boolean;
}

export function StepIndicator() {
	const pathname = usePathname();

	// Define the steps based on the current path
	const steps: Step[] = [
		{
			name: "Manual Entry",
			href: "/app/manual",
			icon: <Pencil className="h-5 w-5" />,
			current: pathname === "/app/manual",
			completed:
				pathname === "/app/manual/processing" ||
				pathname === "/app/manual/translations",
		},
		{
			name: "Processing",
			href: "/app/manual/processing",
			icon: <FileText className="h-5 w-5" />,
			current: pathname === "/app/manual/processing",
			completed: pathname === "/app/manual/translations",
		},
		{
			name: "Translation",
			href: "/app/manual/translations",
			icon: <Languages className="h-5 w-5" />,
			current: pathname === "/app/manual/translations",
			completed: false,
		},
	];

	// Find the current step index
	const currentStepIndex = steps.findIndex((step) => step.current);
	const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1; // Default to 1 if not found
	const totalSteps = steps.length;

	// Calculate the progress percentage, handling the case where current step index isn't found
	const progressPercentage =
		currentStepIndex >= 0
			? ((currentStepIndex + 1) / steps.length) * 100
			: 33.33; // Default to first step (33.33%) if not found

	return (
		<div className="w-full mb-6">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-gray-500">
					Step {currentStep} of {totalSteps}
				</div>
				<nav aria-label="Progress" className="hidden sm:block">
					<ol className="flex items-center space-x-4">
						{steps.map((step, stepIdx) => (
							<li key={step.name} className="flex items-center">
								{step.completed ? (
									<Link
										href={step.href}
										className="group flex h-9 items-center"
									>
										<span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white">
											<CheckIcon className="h-5 w-5" />
										</span>
										<span className="ml-3 text-sm font-medium text-gray-900">
											{step.name}
										</span>
									</Link>
								) : step.current ? (
									<div
										className="flex items-center"
										aria-current="step"
									>
										<span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-primary">
											<span className="text-primary">
												{stepIdx + 1}
											</span>
										</span>
										<span className="ml-3 text-sm font-medium text-primary">
											{step.name}
										</span>
									</div>
								) : (
									<div className="flex items-center">
										<span className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 border-gray-300">
											<span className="text-gray-500">
												{stepIdx + 1}
											</span>
										</span>
										<span className="ml-3 text-sm font-medium text-gray-500">
											{step.name}
										</span>
									</div>
								)}

								{stepIdx !== steps.length - 1 && (
									<div className="ml-4 flex-shrink-0 h-0.5 w-12 bg-gray-200" />
								)}
							</li>
						))}
					</ol>
				</nav>

				{/* Mobile breadcrumb-style indicator */}
				<nav
					aria-label="Progress"
					className="sm:hidden flex items-center"
				>
					<ol className="flex items-center">
						{steps.map(
							(step, stepIdx) =>
								stepIdx <= currentStepIndex && (
									<li
										key={step.name}
										className="flex items-center"
									>
										{step.completed ? (
											<Link
												href={step.href}
												className="flex items-center text-primary"
											>
												<span className="h-6 w-6 flex items-center justify-center rounded-full bg-primary text-white mr-1">
													<CheckIcon className="h-3 w-3" />
												</span>
												{stepIdx ===
													currentStepIndex && (
													<span className="text-xs font-medium">
														{step.name}
													</span>
												)}
											</Link>
										) : step.current ? (
											<span className="flex items-center text-primary">
												<span className="h-6 w-6 flex items-center justify-center rounded-full border-2 border-primary mr-1">
													<span className="text-primary text-xs">
														{stepIdx + 1}
													</span>
												</span>
												<span className="text-xs font-medium">
													{step.name}
												</span>
											</span>
										) : null}

										{stepIdx < currentStepIndex && (
											<ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
										)}
									</li>
								),
						)}
					</ol>
				</nav>
			</div>

			{/* Progress bar for visual indication */}
			<div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
				<div
					className="h-2 bg-primary transition-all duration-500 rounded-full"
					style={{ width: `${progressPercentage}%` }}
				/>
			</div>
		</div>
	);
}
