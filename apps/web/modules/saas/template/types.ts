export interface Template {
	id: number;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	userId: string;
	user: {
		name: string;
		email: string;
	};
	logo_path: string | null;
	logo_footer: string | null;
	color: string;
	font_title: string;
	font_paragraph: string;
	cover: {
		photoPosition: string;
		width: number;
		height: number;
		titleAlignment: string;
		margin: number;
		backgroundColor?: string;
		backgroundImage?: string;
	};
	footer: {
		height: number;
		color: string;
		pageNumberPosition: string;
		email: string | null;
		address: string | null;
		marginTop: number;
		marginLeft: number;
		marginRight: number;
	};
	font: {
		titleFont: string;
		textFont: string;
		titleSize: number;
		textSize: number;
		lineHeight: number;
		paragraphSpacing: number;
	};
	titleColors: {
		h1Color: string;
		h2Color: string;
		h3Color: string;
		h4Color: string;
		h5Color: string;
		h6Color: string;
	};
	finalPage: {
		show: boolean;
		text: string | null;
		backgroundColor: string;
		textColor: string;
		font: string;
		fontSize: number;
		textAlignment: string;
		marginTop: number;
		marginBottom: number;
		imagePath?: string | null;
		imageX?: number;
		imageY?: number;
		imageWidth?: number;
		imageHeight?: number;
		logoPath?: string | null;
		logoX?: number;
		logoY?: number;
		logoWidth?: number;
		logoHeight?: number;
	};
}

export interface TemplateRevision {
	id: number;
	templateId: number;
	userId: string;
	user: {
		name: string;
		email: string;
	};
	name: string;
	description: string | null;
	createdAt: string;
	logo_path: string | null;
	logo_footer: string | null;
	color: string;
	font_title: string;
	font_paragraph: string;
	version: number;
}
