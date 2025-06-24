export interface AzureImage {
	url: string;
	type?: string;
	name?: string;
	mime_type?: string;
}

export interface Image {
	url: string;
	type?: string;
	mime_type?: string;
	name?: string;
	version?: string;
}

export interface Section {
	title: string;
	content: string;
	hasContent: boolean;
	images: Image[];
	imageRefs?: (string | number)[];
	isMissing: boolean;
	existsInDb: boolean;
	isManuallyAdded?: boolean;
	missing_information?: string;
	example_html?: string;
	chapter_number?: number | null;
	error?: string | null;
	is_empty?: boolean;
	doubleColumnContent?: string;
	doubleColumnImage?: string;
}

export type Template = {
	id: number;
	name: string;
};

export interface ProcessingData {
	status: "success" | "error";
	total_files: number;
	results: Array<{
		filename: string;
		status: "success" | "error";
		sections: {
			found: Record<string, string>;
			missing: string[];
			non_conformities: string[];
			compliance_score: number;
			content: Record<string, string>;
		};
		table_of_contents: string;
		imageRefs: number[];
	}>;
	manualName: string;
	version: string;
	sections: Array<{
		title: string;
		content: string;
		hasContent: boolean;
		imageRefs: number[];
	}>;
	missingSections: string[];
	nonConformities: string[];
	complianceScore: number;
	tableOfContents: string;
	imageRefs: number[];
}

export interface ImageDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onImageSelect: (imageUrl: string) => void;
	sectionImages: Image[];
	imageRefs?: (string | number)[];
	manualId?: string | number;
}
