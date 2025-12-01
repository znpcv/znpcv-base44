import React from 'react';
import { motion } from 'framer-motion';

export default function PrincipleCard({ title, subtitle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className="p-6 bg-[#4A5D23]/10 border border-[#4A5D23]/30 rounded-lg text-center"
    >
      <h3 className="text-white font-bold tracking-wider text-sm uppercase mb-2">
        {title}
      </h3>
      <p className="text-zinc-500 text-xs">
        {subtitle}
      </p>
    </motion.div>
  );
}