import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import { NextResponse } from "next/server";

const AZURE_STORAGE_CONNECTION_STRING =
	process.env.AZURE_STORAGE_CONNECTION_STRING ||
	"DefaultEndpointsProtocol=https;AccountName=agrieuro;AccountKey=y6nga6CfojjZp5g8Md/j9QK/WGkVXl2SDoy57Rm2EJFqQyD+05KO9/H8LfU/Mk4IOefyflwZaI/O+ASt5MUIMA==;EndpointSuffix=core.windows.net";
const CONTAINER_NAME = "agrieuro-photo";

// Funzione per sanitizzare il nome del manuale come nel backend Python
function sanitizeManualName(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const manualName = searchParams.get("manualName");
		const version = searchParams.get("version") || "1.0"; // Versione predefinita 1.0

		if (!manualName) {
			console.error("Nome del manuale mancante nella richiesta");
			return NextResponse.json(
				{ error: "Nome del manuale richiesto" },
				{ status: 400 },
			);
		}

		// Sanitizza il nome del manuale come nel backend Python
		const safeManualName = sanitizeManualName(manualName);
		console.log("Nome manuale sanitizzato:", safeManualName);
		console.log("Versione:", version);

		// Inizializza il client Azure
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			AZURE_STORAGE_CONNECTION_STRING,
		);
		const containerClient =
			blobServiceClient.getContainerClient(CONTAINER_NAME);

		// Verifica che il container esista
		const containerExists = await containerClient.exists();
		console.log("Container esiste:", containerExists);

		if (!containerExists) {
			console.error("Container non trovato:", CONTAINER_NAME);
			return NextResponse.json(
				{ error: "Container non trovato" },
				{ status: 404 },
			);
		}

		// Lista tutti i blob nella cartella del manuale, includendo la versione
		const prefix = `${safeManualName}/v${version}/`;
		console.log("Cercando immagini con prefisso:", prefix);

		const blobs = [];
		for await (const blob of containerClient.listBlobsFlat({ prefix })) {
			console.log("Trovato blob:", blob.name);

			try {
				// Genera un URL SAS valido per 1 ora
				const sasUrl = await containerClient
					.getBlobClient(blob.name)
					.generateSasUrl({
						permissions: BlobSASPermissions.parse("r"),
						expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 ora
					});

				// Estrai il tipo MIME dall'estensione del file
				const extension =
					blob.name.split(".").pop()?.toLowerCase() || "jpeg";
				const mimeType = `image/${extension}`;

				blobs.push({
					url: sasUrl,
					name: blob.name.split("/").pop() || "",
					type: mimeType,
					version: version,
				});

				console.log("URL SAS generato per:", blob.name);
			} catch (error) {
				console.error(
					"Errore nella generazione dell'URL SAS per:",
					blob.name,
					error,
				);
			}
		}

		console.log("Immagini trovate:", blobs.length);
		return NextResponse.json({ images: blobs });
	} catch (error) {
		console.error("Errore nel recupero delle immagini:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero delle immagini" },
			{ status: 500 },
		);
	}
}
