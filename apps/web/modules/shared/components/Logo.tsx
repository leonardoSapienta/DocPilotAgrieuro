import { cn } from "@ui/lib";
import Image from "next/image";

export function Logo({
	withLabel = true,
	className,
}: {
	className?: string;
	withLabel?: boolean;
}) {
	return (
		<span
			className={cn(
				"flex items-center justify-center font-semibold text-foreground leading-none",
				className,
			)}
			style={{ height: "100%", width: "100%" }}
		>
			<Image src="/images/agrieuro-logo.webp" alt="Agrieuro logo" width={230} height={75} className="w-full h-full object-contain" />
			{withLabel && <span className="ml-3 hidden text-lg md:block" />}
		</span>
	);
}
