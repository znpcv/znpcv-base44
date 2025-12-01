import React from 'react';
import { motion } from 'framer-motion';

export default function ChecklistSection({ title, subtitle, children, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-8"
    >
      <div className="mb-4 px-4">
        <h3 className="text-[#4A5D23] text-sm font-bold tracking-[0.2em] uppercase">
          {title}
        </h3>
        {subtitle && (
          <p className="text-zinc-500 text-xs mt-1 italic">{subtitle}</p>
        )}
      </div>
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}