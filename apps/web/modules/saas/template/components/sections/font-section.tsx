"use client";

import { Card } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { useFormContext } from "react-hook-form";

export function FontSection() {
	const form = useFormContext();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div className="space-y-2">
					<Label>Title Font</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("font.titleFont", value)
						}
						defaultValue={form.getValues("font.titleFont")}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select font" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Arial">Arial</SelectItem>
							<SelectItem value="Times New Roman">
								Times New Roman
							</SelectItem>
							<SelectItem value="Helvetica">Helvetica</SelectItem>
							<SelectItem value="Verdana">Verdana</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Title Size (px)</Label>
					<Input
						type="number"
						{...form.register("font.titleSize", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Text Font</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("font.textFont", value)
						}
						defaultValue={form.getValues("font.textFont")}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select font" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Arial">Arial</SelectItem>
							<SelectItem value="Times New Roman">
								Times New Roman
							</SelectItem>
							<SelectItem value="Helvetica">Helvetica</SelectItem>
							<SelectItem value="Verdana">Verdana</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Text Size (px)</Label>
					<Input
						type="number"
						{...form.register("font.textSize", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Line Height</Label>
					<Input
						type="number"
						step="0.1"
						{...form.register("font.lineHeight", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Paragraph Spacing</Label>
					<Input
						type="number"
						step="0.1"
						{...form.register("font.paragraphSpacing", {
							valueAsNumber: true,
						})}
					/>
				</div>
			</div>
		</Card>
	);
}
