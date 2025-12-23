import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BulkDeletePanel({ selectedCount, onDelete, onCancel, darkMode }) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl border-2 animate-in slide-in-from-bottom-4",
      darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-300")}>
      <div className={cn("text-sm sm:text-base font-bold", darkMode ? "text-white" : "text-black")}>
        {selectedCount} Trade{selectedCount > 1 ? 's' : ''} ausgewählt
      </div>
      <Button
        onClick={onDelete}
        className="bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-600 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-bold"
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        Löschen
      </Button>
      <button
        onClick={onCancel}
        className={cn("p-2 rounded-lg transition-colors", darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-200")}
      >
        <X className={cn("w-4 h-4", darkMode ? "text-zinc-400" : "text-zinc-600")} />
      </button>
    </div>
  );
}