export type ManualSection = string;

export interface TokenUsage {
	input_tokens: number;
	output_tokens: number;
	total_tokens: number;
}

export interface TokenUsageStats {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	estimated_cost: number;
}

export interface ChapterInfo {
	chapter_number: number;
	chapter_info: string;
	restructured_html: string;
	example_html?: string;
	missing_information?: string;
	is_empty: boolean;
	error: string | null;
}

export interface ImageInfo {
	name: string;
	url: string;
	mime_type: string;
	size: number;
	version?: string;
	dimensions?: {
		width: number;
		height: number;
	};
}

export interface ManualAnalysisResult {
	sections: {
		found: Record<string, string>;
		missing: string[];
		non_conformities: string[];
		compliance_score: number;
	};
	images?: Array<{
		url: string;
	}>;
	table_of_contents: string;
}

export interface ManualAnalysisResponse {
	status: "success" | "error";
	token_usage: TokenUsageStats;
	file_count: number;
	files: string[];
	chapter_titles: string[];
	restructured_content: ChapterInfo[];
	missing_chapters: ChapterInfo[];
	images: ImageInfo[];
	example_manual_used: string;
	metadata: {
		processing_time: number;
		model_used: string;
		iso_compliance: {
			score: number;
			non_conformities: string[];
		};
	};
	total_processed_pages: number;
	results: ManualAnalysisResult[];
}

export interface Section {
	title: string;
	content: string;
	hasContent: boolean;
	images: Array<{
		url: string;
		type: string;
		mime_type?: string;
	}>;
	imageRefs: string[];
	isMissing: boolean;
	existsInDb: boolean;
	isManuallyAdded: boolean;
}

export interface ManualFormData {
	manualName: string;
	version: string;
	sectionId: number;
	exampleManualUrl?: string;
}

export interface ManualAnalysisData {
	manualName: string;
	version: string;
	sections: Array<{
		title: string;
		content: string;
		hasContent: boolean;
		imageRefs: string[];
	}>;
	missingSections: string[];
	nonConformities: string[];
	complianceScore: number;
	tableOfContents: string;
	imageRefs: string[];
}

export interface SectionImage {
	url: string;
	mime_type: string;
}

export interface SectionContent {
	text: string;
	images: SectionImage[];
}
