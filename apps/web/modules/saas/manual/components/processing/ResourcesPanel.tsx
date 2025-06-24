import type { Template } from "./types";

interface ResourcesPanelProps {
	templates: Template[];
	selectedTemplate: string;
	onSelectTemplate: (templateId: string) => void;
}

export function ResourcesPanel({
	templates,
	selectedTemplate,
	onSelectTemplate,
}: ResourcesPanelProps) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-gray-900">Resources</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 className="text-sm font-medium text-gray-700 mb-2">
						Templates
					</h3>
					<select
						className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md shadow-sm focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50 text-sm"
						value={selectedTemplate}
						onChange={(e) => onSelectTemplate(e.target.value)}
					>
						<option value="">Select a template</option>
						{templates.map((template) => (
							<option key={template.id} value={template.id}>
								{template.name}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
}
