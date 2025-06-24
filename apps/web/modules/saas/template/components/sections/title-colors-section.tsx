"use client";

import { Card } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { useFormContext } from "react-hook-form";

export function TitleColorsSection() {
	const form = useFormContext();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div className="space-y-2">
					<Label>Colore H1</Label>
					<Input type="color" {...form.register("titleColors.h1")} />
				</div>

				<div className="space-y-2">
					<Label>Colore H2</Label>
					<Input type="color" {...form.register("titleColors.h2")} />
				</div>

				<div className="space-y-2">
					<Label>Colore H3</Label>
					<Input type="color" {...form.register("titleColors.h3")} />
				</div>

				<div className="space-y-2">
					<Label>Colore H4</Label>
					<Input type="color" {...form.register("titleColors.h4")} />
				</div>

				<div className="space-y-2">
					<Label>Colore H5</Label>
					<Input type="color" {...form.register("titleColors.h5")} />
				</div>

				<div className="space-y-2">
					<Label>Colore H6</Label>
					<Input type="color" {...form.register("titleColors.h6")} />
				</div>
			</div>
		</Card>
	);
}
