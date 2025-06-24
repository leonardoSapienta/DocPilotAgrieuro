import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import { logger } from "@repo/logs";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
	throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined");
}

let blobServiceClient: BlobServiceClient;

try {
	blobServiceClient =
		BlobServiceClient.fromConnectionString(connectionString);
	logger.info("Connessione ad Azure Storage inizializzata", {
		accountName: blobServiceClient.accountName,
	});
} catch (error) {
	logger.error("Errore nella connessione ad Azure Storage:", {
		error: error instanceof Error ? error.message : "Errore sconosciuto",
	});
	throw new Error("Connessione ad Azure Storage non valida");
}

export function getContainerClient(containerName: string) {
	return blobServiceClient.getContainerClient(containerName);
}

export function getBlobClient(containerName: string, blobName: string) {
	return blobServiceClient
		.getContainerClient(containerName)
		.getBlobClient(blobName);
}

export function getSasUrl(
	containerName: string,
	blobName: string,
	expiresIn = 3600,
) {
	const blobClient = getBlobClient(containerName, blobName);
	return blobClient.generateSasUrl({
		permissions: BlobSASPermissions.parse("r"),
		expiresOn: new Date(new Date().valueOf() + expiresIn * 1000),
	});
}

async function ensureContainerExists(containerName: string): Promise<void> {
	try {
		const containerClient =
			blobServiceClient.getContainerClient(containerName);
		const exists = await containerClient.exists();

		logger.info("Verifica container:", {
			containerName,
			exists,
			timestamp: new Date().toISOString(),
		});

		if (!exists) {
			logger.info("Container non trovato, tentativo di creazione...");
			const createResponse = await containerClient.createIfNotExists({
				access: "blob",
			});
			logger.info("Container creato con successo:", {
				containerName,
				response: createResponse,
				timestamp: new Date().toISOString(),
			});
		}
	} catch (error) {
		logger.error("Errore durante la verifica/creazione del container:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			containerName,
			timestamp: new Date().toISOString(),
		});
		throw error;
	}
}

// Assicurati che i container necessari esistano
try {
	await ensureContainerExists("agrieuro-photo");
	logger.info("Container agrieuro-photo verificato/creato con successo");
	await ensureContainerExists("manuali");
	logger.info("Container manuali verificato/creato con successo");
} catch (error) {
	logger.error("Errore durante l'inizializzazione dei container:", {
		error: error instanceof Error ? error.message : "Errore sconosciuto",
		timestamp: new Date().toISOString(),
	});
	throw error;
}

function base64ToBlob(base64Data: string, mimeType: string): Blob {
	try {
		// Rimuovi il prefisso data:image/...;base64, se presente
		const base64WithoutPrefix = base64Data.includes(",")
			? base64Data.split(",")[1]
			: base64Data;

		// Decodifica la stringa base64
		const binaryString = atob(base64WithoutPrefix);
		const bytes = new Uint8Array(binaryString.length);

		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Crea il blob con il tipo MIME corretto
		return new Blob([bytes], { type: mimeType });
	} catch (error) {
		logger.error("Errore nella conversione da base64 a blob:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			mimeType,
			base64Length: base64Data.length,
			timestamp: new Date().toISOString(),
		});
		throw new Error("Errore nella conversione da base64 a blob");
	}
}

export async function uploadImageToAzure(
	blob: Blob,
	mimeType: string,
	manualName: string,
	imageName: string,
): Promise<string> {
	try {
		logger.info("Inizio upload su Azure:", {
			manualName,
			imageName,
			mimeType,
			blobSize: blob.size,
			timestamp: new Date().toISOString(),
		});

		if (!connectionString) {
			logger.error("Stringa di connessione Azure non configurata");
			throw new Error("Stringa di connessione Azure non configurata");
		}

		// Verifica la connessione ad Azure
		try {
			const containers = await blobServiceClient.listContainers().next();
			logger.info("Connessione ad Azure verificata:", {
				firstContainer: containers.value?.name,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			logger.error("Errore nella connessione ad Azure:", {
				error:
					error instanceof Error
						? error.message
						: "Errore sconosciuto",
				timestamp: new Date().toISOString(),
			});
			throw error;
		}

		if (
			!manualName ||
			typeof manualName !== "string" ||
			manualName.trim() === ""
		) {
			logger.error("Nome del manuale non valido", { manualName });
			throw new Error("Nome del manuale non valido");
		}

		// Sanitizzazione del nome del manuale per il path
		const sanitizedManualName = manualName
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9-]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		if (sanitizedManualName.length === 0) {
			logger.error("Nome del manuale non valido dopo la sanitizzazione", {
				manualName,
				sanitizedManualName,
			});
			throw new Error(
				"Nome del manuale non valido dopo la sanitizzazione",
			);
		}

		// Container fisso per tutte le immagini
		const containerName = "agrieuro-photo";
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Verifica che il container esista
		const containerExists = await containerClient.exists();
		logger.info("Verifica container prima dell'upload:", {
			containerName,
			exists: containerExists,
			timestamp: new Date().toISOString(),
		});

		if (!containerExists) {
			logger.info("Container non trovato, tentativo di creazione...");
			const createResponse = await containerClient.createIfNotExists({
				access: "blob",
			});
			logger.info("Risultato creazione container:", {
				containerName,
				response: createResponse,
				timestamp: new Date().toISOString(),
			});
		}

		// Crea il path del blob includendo il nome del manuale
		const blobName = `${sanitizedManualName}/${imageName}`;
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		logger.info("Preparazione blob:", {
			blobName,
			contentType: mimeType,
			containerName,
			fullPath: `${containerName}/${blobName}`,
			timestamp: new Date().toISOString(),
		});

		try {
			const uploadResponse = await blockBlobClient.upload(
				blob,
				blob.size,
				{
					blobHTTPHeaders: {
						blobContentType: mimeType,
					},
				},
			);

			logger.info("Risposta upload:", {
				status: uploadResponse._response.status,
				response: uploadResponse,
				timestamp: new Date().toISOString(),
			});

			if (uploadResponse._response.status !== 201) {
				logger.error("Upload fallito:", {
					status: uploadResponse._response.status,
					containerName,
					blobName,
					response: uploadResponse,
					timestamp: new Date().toISOString(),
				});
				throw new Error(
					`Upload fallito con status ${uploadResponse._response.status}`,
				);
			}

			const imageUrl = blockBlobClient.url;
			logger.info("Upload completato con successo:", {
				url: imageUrl,
				containerName,
				blobName,
				timestamp: new Date().toISOString(),
			});

			return imageUrl;
		} catch (error) {
			logger.error("Errore durante l'upload del blob:", {
				error:
					error instanceof Error
						? error.message
						: "Errore sconosciuto",
				stack: error instanceof Error ? error.stack : undefined,
				containerName,
				blobName,
				timestamp: new Date().toISOString(),
			});
			throw error;
		}
	} catch (error) {
		logger.error("Errore generale durante l'upload:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			stack: error instanceof Error ? error.stack : undefined,
			manualName,
			imageName,
			timestamp: new Date().toISOString(),
		});
		throw error;
	}
}

export async function getImageUrlFromAzure(
	manualName: string,
	imageName: string,
): Promise<string> {
	try {
		const containerName = "agrieuro-photo";
		const sanitizedManualName = manualName
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9-]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		const containerClient =
			blobServiceClient.getContainerClient(containerName);
		const blobName = `${sanitizedManualName}/${imageName}`;
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);
		return blockBlobClient.url;
	} catch (error) {
		logger.error("Error getting image URL from Azure:", error);
		throw new Error("Failed to get image URL from Azure");
	}
}

export async function deleteManualFolder(manualName: string): Promise<void> {
	try {
		const containerName = "agrieuro-photo";
		const sanitizedManualName = manualName
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9-]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		logger.info("Inizio eliminazione cartella manuale:", {
			originalName: manualName,
			sanitizedName: sanitizedManualName,
			containerName,
		});

		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Verifica che il container esista
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			logger.error("Container non trovato", { containerName });
			throw new Error(`Container ${containerName} non trovato`);
		}

		// Lista tutti i blob nella cartella del manuale
		const prefix = `${sanitizedManualName}/`;
		logger.info("Ricerca blob nella cartella:", { prefix });

		let deletedCount = 0;
		const blobList: string[] = [];

		// Prima raccogliamo tutti i blob nella cartella
		for await (const blob of containerClient.listBlobsFlat({ prefix })) {
			blobList.push(blob.name);
		}

		logger.info("Blob trovati nella cartella:", {
			count: blobList.length,
			blobs: blobList,
			folderName: sanitizedManualName,
		});

		// Eliminiamo tutti i blob nella cartella
		for (const blobName of blobList) {
			try {
				const blobClient = containerClient.getBlobClient(blobName);
				const deleteResponse = await blobClient.deleteIfExists();

				if (deleteResponse.succeeded) {
					deletedCount++;
					logger.info("Blob eliminato:", {
						blobName,
						folderName: sanitizedManualName,
						timestamp: new Date().toISOString(),
					});
				} else {
					logger.warn("Blob non trovato o già eliminato:", {
						blobName,
						folderName: sanitizedManualName,
					});
				}
			} catch (error) {
				logger.error("Errore durante l'eliminazione del blob:", {
					error:
						error instanceof Error
							? error.message
							: "Errore sconosciuto",
					blobName,
					folderName: sanitizedManualName,
				});
				// Continuiamo con gli altri blob anche se uno fallisce
			}
		}

		if (deletedCount === 0) {
			logger.warn("Nessun blob trovato nella cartella", {
				folderName: sanitizedManualName,
				prefix,
			});
		} else {
			logger.info("Cartella manuale eliminata con successo:", {
				folderName: sanitizedManualName,
				blobsEliminati: deletedCount,
				timestamp: new Date().toISOString(),
			});
		}
	} catch (error) {
		logger.error(
			"Errore durante l'eliminazione della cartella del manuale:",
			{
				error:
					error instanceof Error
						? error.message
						: "Errore sconosciuto",
				manualName,
				timestamp: new Date().toISOString(),
			},
		);
		throw error;
	}
}
