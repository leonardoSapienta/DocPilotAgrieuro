interface EmptyStateSectionProps {
  isAfterDeletion?: boolean;
}

export function EmptyStateSection({ isAfterDeletion = false }: EmptyStateSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 text-center h-[300px]">
      <div className="mb-4 bg-gray-100 p-4 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 w-6 h-6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {isAfterDeletion
          ? "Sezione eliminata correttamente"
          : "Nessuna sezione selezionata"}
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        {isAfterDeletion
          ? "La sezione è stata eliminata. Seleziona un'altra sezione dal menu o crea una nuova sezione."
          : "Seleziona una sezione dal menu per visualizzarla o crea una nuova sezione con il pulsante \"Nuova Sezione\""}
      </p>
    </div>
  );
} 