const loadImagesAndCreateSections = async (manualName: string) => {
	try {
		const images = JSON.parse(
			sessionStorage.getItem("manualImages") || "[]",
		);
		const sections = [];

		for (const image of images) {
			try {
				// Converti base64 in blob
				const base64Data = image.data;
				const mimeType = base64Data.split(";")[0].split(":")[1];
				const binaryString = atob(base64Data.split(",")[1]);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				const blob = new Blob([bytes], { type: mimeType });

				// Crea un file dal blob
				const file = new File([blob], image.name, { type: mimeType });

				// Crea il formData
				const formData = new FormData();
				formData.append("file", file);
				formData.append("manualName", manualName);

				// Upload su Azure
				const response = await fetch("/api/manual/upload-image", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Errore durante l'upload dell'immagine");
				}

				const { url } = await response.json();
				sections.push({
					title: image.name,
					content: `![${image.name}](${url})`,
				});
			} catch (error) {
				console.error("Errore durante il caricamento dell'immagine:", {
					error:
						error instanceof Error
							? error.message
							: "Errore sconosciuto",
					imageName: image.name,
					timestamp: new Date().toISOString(),
				});
			}
		}

		return sections;
	} catch (error) {
		console.error("Errore durante il caricamento delle immagini:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			timestamp: new Date().toISOString(),
		});
		return [];
	}
};
