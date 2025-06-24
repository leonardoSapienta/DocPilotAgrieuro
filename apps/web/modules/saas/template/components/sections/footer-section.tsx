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

export function FooterSection() {
	const form = useFormContext();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div className="space-y-2">
					<Label>Height (px)</Label>
					<Input
						type="number"
						{...form.register("footer.height", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Background Color</Label>
					<Input type="color" {...form.register("footer.color")} />
				</div>

				<div className="space-y-2">
					<Label>Page Number Position</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("footer.pageNumberPosition", value)
						}
						defaultValue={form.getValues(
							"footer.pageNumberPosition",
						)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select position" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="left">Left</SelectItem>
							<SelectItem value="center">Center</SelectItem>
							<SelectItem value="right">Right</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label>Email</Label>
					<Input
						type="email"
						{...form.register("footer.email")}
						placeholder="Enter email"
					/>
				</div>

				<div className="space-y-2">
					<Label>Address</Label>
					<Input
						type="text"
						{...form.register("footer.address")}
						placeholder="Enter address"
					/>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<div className="space-y-2">
						<Label>Top Margin (px)</Label>
						<Input
							type="number"
							{...form.register("footer.marginTop", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Left Margin (px)</Label>
						<Input
							type="number"
							{...form.register("footer.marginLeft", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Right Margin (px)</Label>
						<Input
							type="number"
							{...form.register("footer.marginRight", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
