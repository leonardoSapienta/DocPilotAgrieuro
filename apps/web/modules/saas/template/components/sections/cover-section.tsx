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

export function CoverSection() {
	const form = useFormContext();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div className="space-y-2">
					<Label>Photo Position</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("cover.photoPosition", value)
						}
						defaultValue={form.getValues("cover.photoPosition")}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select position" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="top">Top</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="bottom">Bottom</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Width (%)</Label>
						<Input
							type="number"
							{...form.register("cover.width", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Height (px)</Label>
						<Input
							type="number"
							{...form.register("cover.height", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>Title Alignment</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("cover.titleAlignment", value)
						}
						defaultValue={form.getValues("cover.titleAlignment")}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select alignment" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Margin (px)</Label>
					<Input
						type="number"
						{...form.register("cover.margin", {
							valueAsNumber: true,
						})}
					/>
				</div>
			</div>
		</Card>
	);
}
