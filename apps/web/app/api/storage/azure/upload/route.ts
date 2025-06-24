import { logger } from "@repo/logs";
import { getContainerClient, getSasUrl } from "@repo/storage/provider/azure";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { file, containerName, blobName, contentType } =
			await request.json();

		if (!file || !containerName || !blobName || !contentType) {
			logger.error("Parametri mancanti nella richiesta di upload", {
				hasFile: Boolean(file),
				containerName,
				blobName,
				contentType,
			});
			return NextResponse.json(
				{ error: "Parametri mancanti" },
				{ status: 400 },
			);
		}

		logger.info("Inizio upload su Azure", {
			containerName,
			blobName,
			contentType,
			fileSize: file.length,
		});

		// Converti il file da base64 a Buffer
		const buffer = Buffer.from(file, "base64");

		// Ottieni il container client
		const containerClient = getContainerClient(containerName);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		// Verifica se il blob esiste già
		const exists = await blockBlobClient.exists();
		logger.info("Verifica esistenza blob", {
			exists,
			containerName,
			blobName,
		});

		// Carica il file (sovrascrive se esiste già)
		const uploadResponse = await blockBlobClient.upload(
			buffer,
			buffer.length,
			{
				blobHTTPHeaders: {
					blobContentType: contentType,
				},
			},
		);

		logger.info("Risposta upload", {
			status: uploadResponse._response.status,
			containerName,
			blobName,
		});

		if (uploadResponse._response.status !== 201) {
			logger.error("Upload fallito", {
				status: uploadResponse._response.status,
				containerName,
				blobName,
			});
			throw new Error(
				`Upload fallito con status ${uploadResponse._response.status}`,
			);
		}

		// Genera un link con scadenza annuale (365 giorni)
		const sasUrl = await getSasUrl(
			containerName,
			blobName,
			365 * 24 * 60 * 60,
		);

		logger.info("Upload completato con successo", {
			containerName,
			blobName,
			url: sasUrl,
		});

		return NextResponse.json({
			url: sasUrl,
			wasOverwritten: exists,
		});
	} catch (error) {
		logger.error("Errore durante l'upload:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json(
			{
				error: "Errore durante l'upload",
				details:
					error instanceof Error
						? error.message
						: "Errore sconosciuto",
			},
			{ status: 500 },
		);
	}
}
