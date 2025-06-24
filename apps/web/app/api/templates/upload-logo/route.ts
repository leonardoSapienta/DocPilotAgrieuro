import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const logoPath = formData.get("logoPath") as string;

		if (!file || !logoPath) {
			return NextResponse.json(
				{ error: "File e logoPath sono obbligatori" },
				{ status: 400 },
			);
		}

		// Converti il file in buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Costruisci il percorso completo nella cartella public
		const publicPath = join(process.cwd(), "public", logoPath);
		const dirPath = join(process.cwd(), "public", "images", "headers");

		// Crea la cartella se non esiste
		if (!existsSync(dirPath)) {
			await mkdir(dirPath, { recursive: true });
		}

		// Salva il file
		await writeFile(publicPath, buffer);

		return NextResponse.json({ success: true, logoPath });
	} catch (error) {
		console.error("Errore durante l'upload del logo:", error);
		return NextResponse.json(
			{ error: "Errore durante l'upload del logo" },
			{ status: 500 },
		);
	}
}
