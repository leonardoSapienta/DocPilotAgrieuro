"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	CategoryScale,
	Chart as ChartJS,
	type ChartOptions,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

// Registra i componenti Chart.js necessari
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

interface ManualData {
	date: Date;
	pagesInput: number;
	pagesOutput: number;
	userId: string;
	userName: string;
}

interface User {
	id: string;
	name: string;
}

// Funzione per formattare data e ora
function formatDateTime(date: Date): string {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Funzione per formattare solo la data (per il grafico)
function formatDateOnly(date: Date): string {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

// Funzione per formattare data per l'input
function formatDateForInput(date: Date): string {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
}

// Funzione per verificare se due date rappresentano lo stesso giorno
function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

// Funzione per generare gli intervalli orari di un giorno
function getHoursInDay(date: Date): Date[] {
	const hours: Date[] = [];
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	for (let i = 0; i < 24; i++) {
		const hourDate = new Date(startOfDay);
		hourDate.setHours(i, 0, 0, 0);
		hours.push(hourDate);
	}

	return hours;
}

// Funzione per formattare l'ora (HH:00)
function formatHour(date: Date): string {
	const hours = date.getHours().toString().padStart(2, "0");
	return `${hours}:00`;
}

// Funzione per generare tutte le date in un intervallo
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
	const dates: Date[] = [];

	// Controlliamo se è lo stesso giorno
	if (isSameDay(startDate, endDate)) {
		// Se è lo stesso giorno, restituiamo gli intervalli orari
		return getHoursInDay(startDate);
	}

	const currentDate = new Date(startDate);

	// Imposta l'ora a mezzanotte per una corretta comparazione
	currentDate.setHours(0, 0, 0, 0);
	const endDateTime = new Date(endDate);
	endDateTime.setHours(23, 59, 59, 999);

	while (currentDate <= endDateTime) {
		dates.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

// Funzione per formattare l'etichetta in base al tipo di visualizzazione
function formatLabel(date: Date, isSingleDay: boolean): string {
	if (isSingleDay) {
		return formatHour(date);
	}
	return formatDateOnly(date);
}

// Funzione per riempire i dati mancanti
function fillMissingDates(
	data: ManualData[],
	startDate: Date,
	endDate: Date,
	userId: string | null = null,
): ManualData[] {
	// Verifica se stiamo visualizzando un singolo giorno
	const isSingleDay = isSameDay(startDate, endDate);

	// Genera tutte le date o ore nell'intervallo
	const allDates = getDatesInRange(startDate, endDate);

	// Mappa per tenere traccia dei dati esistenti
	const dataMap = new Map<string, ManualData>();

	// Formatta la data come stringa YYYY-MM-DD o YYYY-MM-DD-HH per usarla come chiave
	const formatDateKey = (date: Date): string => {
		const baseKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

		if (isSingleDay) {
			// Se è lo stesso giorno, includiamo anche l'ora nella chiave
			return `${baseKey}-${String(date.getHours()).padStart(2, "0")}`;
		}

		return baseKey;
	};

	// Adatta le date dei dati esistenti al formato appropriato
	const adaptedData = data.map((item) => {
		const newItem = { ...item };

		if (isSingleDay) {
			// Se è lo stesso giorno, arrotondiamo all'ora
			const hourDate = new Date(item.date);
			hourDate.setMinutes(0, 0, 0);
			newItem.date = hourDate;
		} else {
			// Altrimenti arrotondiamo al giorno
			const dayDate = new Date(item.date);
			dayDate.setHours(0, 0, 0, 0);
			newItem.date = dayDate;
		}

		return newItem;
	});

	// Popola la mappa con i dati esistenti per ogni intervallo
	adaptedData.forEach((item) => {
		const key = formatDateKey(item.date);

		// Se è già presente un record per questa data, somma le pagine
		if (dataMap.has(key)) {
			const existing = dataMap.get(key)!;
			existing.pagesInput = (existing.pagesInput || 0) + (item.pagesInput || 0);
			existing.pagesOutput = (existing.pagesOutput || 0) + (item.pagesOutput || 0);
		} else {
			dataMap.set(key, { ...item });
		}
	});

	// Crea un array con tutti gli intervalli, inserendo 0 per quelli senza dati
	return allDates.map((date) => {
		const key = formatDateKey(date);

		if (dataMap.has(key)) {
			return dataMap.get(key)!;
		}

		// Crea un record vuoto per questa data/ora
		return {
			date: date,
			pagesInput: 0,
			pagesOutput: 0,
			userId: userId || "",
			userName: "Nessuna stampa",
		};
	});
}

// Funzione per ottenere la mezzanotte in orario italiano (Europe/Rome)
function toRomeMidnight(date: Date): Date {
	const rome = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
	rome.setHours(0, 0, 0, 0);
	return rome;
}

export default function GraficoManuali() {
	const [allData, setAllData] = useState<ManualData[]>([]);
	const [filteredData, setFilteredData] = useState<ManualData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [totalPagesAllTime, setTotalPagesAllTime] = useState<number>(0);
	const [totalPagesInput, setTotalPagesInput] = useState<number>(0);
	const [totalPagesOutput, setTotalPagesOutput] = useState<number>(0);
	const [users, setUsers] = useState<User[]>([]);
	// Stato per forzare l'aggiornamento del grafico
	const [forceUpdate, setForceUpdate] = useState<number>(0);

	// Stati per i filtri
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [selectedUserId, setSelectedUserId] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				// Utilizziamo l'API per ottenere i dati
				const response = await fetch("/api/manuali/grafico");

				if (!response.ok) {
					throw new Error("Errore durante il recupero dei dati");
				}

				const result = await response.json();

				// Salva la lista degli utenti
				setUsers(result.users || []);

				// Trasforma i dati - convertiamo le stringhe di date in oggetti Date
				const manualData = result.data.map((manual: any) => ({
					date: toRomeMidnight(new Date(manual.createdAt)),
					pagesInput: manual.pagesInput || 0,
					pagesOutput: manual.pagesOutput || 0,
					userId: manual.userId,
					userName: manual.userName || "Utente sconosciuto",
				}));

				// Ordina per data
				manualData.sort(
					(a: ManualData, b: ManualData) =>
						a.date.getTime() - b.date.getTime(),
				);

				// Calcola il totale delle pagine (input)
				const total = manualData.reduce(
					(sum: number, item: ManualData) => sum + (item.pagesInput || 0),
					0,
				);
				setTotalPages(total);
				setTotalPagesAllTime(total);

				setAllData(manualData);

				// Imposta i nuovi totali
				setTotalPagesInput(result.totalPagesInput || 0);
				setTotalPagesOutput(result.totalPagesOutput || 0);

				// Imposta come default l'ultimo giorno disponibile nei dati
				if (manualData.length > 0) {
					const maxDate = new Date(Math.max(...manualData.map((d: ManualData) => d.date.getTime())));
					const maxDateISO = formatDateForInput(maxDate);
					setStartDate(maxDateISO);
					setEndDate(maxDateISO);
				}

				setIsLoading(false);
			} catch (err) {
				console.error("Errore durante il recupero dei dati:", err);
				setError("Impossibile caricare i dati. Riprova più tardi.");
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Applica i filtri automaticamente quando cambiano le date
	useEffect(() => {
		if (allData.length > 0 && startDate && endDate) {
			applyFilters();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allData, startDate, endDate, selectedUserId]);

	// Funzione per applicare i filtri
	const applyFilters = () => {
		let filtered = [...allData];

		if (startDate) {
			const startDateObj = toRomeMidnight(new Date(startDate));
			filtered = filtered.filter((item) => item.date >= startDateObj);
		}

		if (endDate) {
			let endDateObj = toRomeMidnight(new Date(endDate));
			endDateObj.setHours(23, 59, 59, 999); // fine giornata italiana
			filtered = filtered.filter((item) => item.date <= endDateObj);
		}

		// Filtra per utente se è selezionato
		if (selectedUserId) {
			filtered = filtered.filter(
				(item) => item.userId === selectedUserId,
			);
		}

		// Verifica se stiamo visualizzando un singolo giorno
		const isSingleDayView = startDate && endDate && startDate === endDate;

		// Debug: Visualizza quanti elementi sono stati filtrati
		console.log(
			`Elementi filtrati: ${filtered.length} su ${allData.length}`,
		);
		console.log(`Date range: ${startDate} - ${endDate}`);
		console.log(`Visualizzazione giornaliera: ${isSingleDayView}`);

		// Calcola il totale delle pagine filtrate (prima del riempimento dei dati mancanti)
		const filteredTotal = filtered.reduce(
			(sum: number, item: ManualData) => sum + (item.pagesInput || 0),
			0,
		);
		setTotalPages(filteredTotal);

		// Riempi i giorni o le ore mancanti con valori zero
		if (startDate && endDate) {
			const startDateObj = new Date(startDate);
			const endDateObj = new Date(endDate);

			// Riempi i dati mancanti solo se abbiamo un intervallo valido
			if (startDateObj <= endDateObj) {
				filtered = fillMissingDates(
					filtered,
					startDateObj,
					endDateObj,
					selectedUserId || null,
				);
				console.log(
					`Date riempite: ora abbiamo ${filtered.length} punti dati`,
				);
			}
		}

		// Ordina i dati per data
		filtered.sort((a, b) => a.date.getTime() - b.date.getTime());

		// Sempre aggiorna i dati filtrati, anche se sono vuoti
		setFilteredData(filtered);

		// Forza l'aggiornamento del grafico
		setForceUpdate((prev) => prev + 1);
	};

	// Funzione per resettare i filtri
	const resetFilters = () => {
		if (allData.length > 0) {
			const minDate = new Date(
				Math.min(...allData.map((d) => d.date.getTime())),
			);
			const maxDate = new Date(
				Math.max(...allData.map((d) => d.date.getTime())),
			);

			setStartDate(formatDateForInput(minDate));
			setEndDate(formatDateForInput(maxDate));

			// Se le date sono molto distanti, non ha senso mostrare ore
			const isSingleDay = isSameDay(minDate, maxDate);

			// Riempi i giorni o le ore mancanti con valori zero quando resettiamo
			let filtered = [...allData];
			filtered = fillMissingDates(filtered, minDate, maxDate);
			filtered.sort((a, b) => a.date.getTime() - b.date.getTime());

			// Ripristina il conteggio totale originale
			const total = allData.reduce(
				(sum: number, item: ManualData) => sum + (item.pagesInput || 0),
				0,
			);
			setTotalPages(total);

			setFilteredData(filtered);
			console.log(
				`Reset filtri: ${filtered.length} punti dati, visualizzazione oraria: ${isSingleDay}`,
			);
		} else {
			setStartDate("");
			setEndDate("");
			setFilteredData([]);
		}

		setSelectedUserId("");

		// Forza l'aggiornamento del grafico
		setForceUpdate((prev) => prev + 1);
	};

	// Verifica se stiamo visualizzando un singolo giorno
	const isSingleDayView = startDate && endDate && startDate === endDate;

	// Prepariamo i dati per Chart.js
	const chartData = {
		// Formatta le label in base al tipo di visualizzazione (giornaliera o normale)
		labels: filteredData.map((d) =>
			isSingleDayView ? formatHour(d.date) : formatDateOnly(d.date),
		),
		datasets: [
			{
				label: "Pagine in ingresso",
				data: filteredData.map((d) => d.pagesInput),
				borderColor: "#3b82f6",
				backgroundColor: "rgba(59, 130, 246, 0.2)",
				borderWidth: 2,
				pointBackgroundColor: "#3b82f6",
				pointRadius: 4,
				pointHoverRadius: 6,
				tension: 0.3,
			},
			{
				label: "Pagine stampate",
				data: filteredData.map((d) => d.pagesOutput),
				borderColor: "#22c55e",
				backgroundColor: "rgba(34, 197, 94, 0.2)",
				borderWidth: 2,
				pointBackgroundColor: "#22c55e",
				pointRadius: 4,
				pointHoverRadius: 6,
				tension: 0.3,
			},
		],
	};

	// Opzioni per il grafico
	const options: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 10,
				titleFont: {
					size: 14,
				},
				bodyFont: {
					size: 13,
				},
				callbacks: {
					title: (items) => {
						if (
							items.length > 0 &&
							filteredData.length > items[0].dataIndex
						) {
							const idx = items[0].dataIndex;
							if (isSingleDayView) {
								return `Ora: ${formatHour(filteredData[idx].date)}`;
							}
							return `Data: ${formatDateOnly(filteredData[idx].date)}`;
						}
						return "";
					},
					label: (context) => {
						if (filteredData.length > context.dataIndex) {
							const idx = context.dataIndex;
							const item = filteredData[idx];
							const labels = [`Pagine: ${context.parsed.y}`];

							// Mostra l'utente solo se non è un giorno vuoto
							if (item.pagesInput && item.pagesInput > 0) {
								labels.push(`Utente: ${item.userName}`);
							} else {
								labels.push("Nessuna stampa in questo periodo");
							}

							return labels;
						}
						return [];
					},
				},
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: isSingleDayView ? "Ora" : "Data",
					font: {
						size: 12,
					},
				},
				ticks: {
					font: {
						size: 10,
					},
					maxRotation: 45,
					minRotation: 45,
					// Limita il numero di etichette visualizzate per evitare sovrapposizioni
					callback: function (val, index) {
						// Se è visualizzazione giornaliera, mostriamo più etichette
						if (isSingleDayView) {
							// Mostra un'etichetta ogni 2 ore
							return index % 2 === 0
								? this.getLabelForValue(val as number)
								: "";
						}
						// Altrimenti mostra solo alcune etichette in base al numero totale di punti dati
						return index %
							Math.max(
								1,
								Math.floor(filteredData.length / 15),
							) ===
							0
							? this.getLabelForValue(val as number)
							: "";
					},
				},
			},
			y: {
				title: {
					display: true,
					text: "Pagine",
					font: {
						size: 12,
					},
				},
				beginAtZero: true,
				ticks: {
					font: {
						size: 10,
					},
				},
			},
		},
		interaction: {
			mode: "nearest",
			intersect: false,
			axis: "xy",
		},
		animations: {
			tension: {
				duration: 1000,
				easing: "linear",
			},
		},
	};

	if (isLoading) {
		return (
			<Card className="w-full shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="text-base">
						Pagine dei Manuali nel Tempo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center items-center h-48">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="w-full shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="text-base">
						Pagine dei Manuali nel Tempo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center items-center h-48">
						<div className="text-red-500 text-center">
							<p className="text-sm">{error}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full shadow-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">
					Pagine dei Manuali nel Tempo
				</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Filtri per data e utente */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
					<div>
						<Label htmlFor="start-date">Data inizio</Label>
						<Input
							id="start-date"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full"
						/>
					</div>
					<div>
						<Label htmlFor="end-date">Data fine</Label>
						<Input
							id="end-date"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full"
						/>
					</div>
					<div>
						<Label htmlFor="user-select">Utente</Label>
						<select
							id="user-select"
							value={selectedUserId}
							onChange={(e) => setSelectedUserId(e.target.value)}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Tutti gli utenti</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-end space-x-2">
						<Button
							onClick={(e) => {
								e.preventDefault();
								applyFilters();
							}}
							className="flex-1"
						>
							Applica Filtri
						</Button>
						<Button
							onClick={(e) => {
								e.preventDefault();
								resetFilters();
							}}
							variant="outline"
							className="flex-1"
						>
							Reset
						</Button>
					</div>
				</div>

				{/* Contatore delle pagine totali */}
				<div className="bg-blue-50 p-3 rounded-md mb-4 text-center">
					<div className="flex flex-col md:flex-row justify-center items-center gap-4">
						<div>
							<span className="font-semibold">Pagine in ingresso totali: </span>
							<span className="text-blue-700 font-bold">{totalPagesInput}</span>
						</div>
						<div className="hidden md:block w-px h-6 bg-blue-200" />
						<div>
							<span className="font-semibold">Pagine stampate totali: </span>
							<span className="text-green-700 font-bold">{totalPagesOutput}</span>
						</div>
					</div>
					{selectedUserId && (
						<div className="text-sm mt-1">
							Utente:{" "}
							{users.find((u) => u.id === selectedUserId)?.name ||
								"Sconosciuto"}
						</div>
					)}
				</div>

				{/* Grafico */}
				<div style={{ height: "250px" }}>
					{filteredData.length > 0 ? (
						<Line
							key={forceUpdate}
							data={chartData}
							options={options}
						/>
					) : (
						<div className="flex items-center justify-center h-full">
							<p className="text-gray-500">
								Nessun dato disponibile nel periodo selezionato
							</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
