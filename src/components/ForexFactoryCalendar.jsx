import React from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function ForexFactoryCalendar() {
  const { darkMode } = useLanguage();

  const theme = {
    bg: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
  };

  return (
    <div className={`border-2 ${theme.border} rounded-2xl overflow-hidden ${theme.bg}`}>
      <iframe
        src="https://www.forexfactory.com/calendar"
        className="w-full h-[600px]"
        title="Forex Factory Calendar"
        style={{ border: 'none' }}
      />
    </div>
  );
}