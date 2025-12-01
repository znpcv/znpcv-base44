import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export default function MiniCalendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  const startDay = monthStart.getDay();
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-white tracking-wider uppercase">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </span>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs text-zinc-500 font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: adjustedStartDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Actual days */}
        {days.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          const isDayToday = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          
          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => onDateSelect(format(day, 'yyyy-MM-dd'))}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                isSelected && "bg-[#4A5D23] text-white font-bold",
                !isSelected && isDayToday && "bg-zinc-800 text-white font-bold ring-1 ring-[#4A5D23]",
                !isSelected && !isDayToday && "text-zinc-400 hover:bg-zinc-800",
                isWeekend && !isSelected && "text-zinc-600"
              )}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>
      
      {/* Today button */}
      <button
        onClick={() => {
          setCurrentMonth(new Date());
          onDateSelect(format(new Date(), 'yyyy-MM-dd'));
        }}
        className="w-full mt-3 py-2 text-xs text-[#4A5D23] hover:bg-[#4A5D23]/10 rounded-lg transition-colors uppercase tracking-wider font-medium"
      >
        Heute
      </button>
    </div>
  );
}