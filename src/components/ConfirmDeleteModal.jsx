import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConfirmDeleteModal — serious, minimal confirmation for destructive actions.
 * Usage:
 *   <ConfirmDeleteModal
 *     open={showDelete}
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowDelete(false)}
 *     darkMode={darkMode}
 *   />
 */
export default function ConfirmDeleteModal({ open, onConfirm, onCancel, darkMode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "w-full max-w-xs rounded-2xl border-2 overflow-hidden",
              darkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-300"
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-rose-600/10 border-2 border-rose-600/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className={cn(
                "text-base tracking-widest font-bold mb-2",
                darkMode ? "text-white" : "text-zinc-900"
              )}>
                ANALYSE LÖSCHEN
              </h2>
              <p className={cn(
                "text-xs font-sans leading-relaxed",
                darkMode ? "text-zinc-400" : "text-zinc-600"
              )}>
                Diese Analyse wird unwiderruflich gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.
              </p>
            </div>

            {/* Actions */}
            <div className={cn(
              "px-4 pb-5 flex flex-col gap-2"
            )}>
              <button
                onClick={onConfirm}
                className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold tracking-widest text-xs border-2 border-rose-600 transition-colors"
              >
                ENDGÜLTIG LÖSCHEN
              </button>
              <button
                onClick={onCancel}
                className={cn(
                  "w-full h-10 rounded-xl font-bold tracking-widest text-xs border-2 transition-colors",
                  darkMode
                    ? "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900"
                    : "border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400"
                )}
              >
                ABBRECHEN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}