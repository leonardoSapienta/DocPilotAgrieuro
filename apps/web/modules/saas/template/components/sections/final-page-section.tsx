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
import { Switch } from "@ui/components/switch";
import { Textarea } from "@ui/components/textarea";
import { useFormContext } from "react-hook-form";

export function FinalPageSection() {
	const form = useFormContext();

	return (
		<Card className="p-6">
			<div className="space-y-6">
				<div className="flex items-center space-x-2">
					<Switch {...form.register("finalPage.show")} />
					<Label>Show Final Page</Label>
				</div>

				<div className="space-y-2">
					<Label>Text</Label>
					<Textarea
						{...form.register("finalPage.text")}
						placeholder="Enter final page text"
						rows={4}
					/>
				</div>

				<div className="space-y-2">
					<Label>Background Color</Label>
					<Input
						type="color"
						{...form.register("finalPage.backgroundColor")}
					/>
				</div>

				<div className="space-y-2">
					<Label>Text Color</Label>
					<Input
						type="color"
						{...form.register("finalPage.textColor")}
					/>
				</div>

				<div className="space-y-2">
					<Label>Font</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("finalPage.font", value)
						}
						defaultValue={form.getValues("finalPage.font")}
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
					<Label>Font Size (px)</Label>
					<Input
						type="number"
						{...form.register("finalPage.fontSize", {
							valueAsNumber: true,
						})}
					/>
				</div>

				<div className="space-y-2">
					<Label>Text Alignment</Label>
					<Select
						onValueChange={(value) =>
							form.setValue("finalPage.textAlignment", value)
						}
						defaultValue={form.getValues("finalPage.textAlignment")}
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
					<Label>Logo</Label>
					<Input
						type="text"
						{...form.register("finalPage.logoPath")}
						placeholder="Enter logo path"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Logo X Position (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.logoX", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Logo Y Position (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.logoY", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Logo Width (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.logoWidth", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Logo Height (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.logoHeight", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>

				<div className="grid grid-cols-4 gap-4">
					<div className="space-y-2">
						<Label>Top Margin (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.topMargin", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Bottom Margin (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.bottomMargin", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Left Margin (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.leftMargin", {
								valueAsNumber: true,
							})}
						/>
					</div>

					<div className="space-y-2">
						<Label>Right Margin (px)</Label>
						<Input
							type="number"
							{...form.register("finalPage.rightMargin", {
								valueAsNumber: true,
							})}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>Message</Label>
					<Input
						type="text"
						{...form.register("finalPage.message")}
						placeholder="Enter final page message"
					/>
				</div>
			</div>
		</Card>
	);
}
