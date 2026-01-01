import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, BarChart3, History, User } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

export default function BottomNav({ darkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { page: 'Home', icon: Home, label: 'HOME' },
    { page: 'Checklist', icon: ClipboardCheck, label: 'NEU' },
    { page: 'Dashboard', icon: BarChart3, label: 'STATS' },
    { page: 'TradeHistory', icon: History, label: 'HISTORY' },
    { page: 'Account', icon: User, label: 'PROFIL' },
  ];

  const currentPath = location.pathname;
  const isActive = (page) => currentPath.includes(page.toLowerCase());

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-2",
      darkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"
    )}>
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const active = isActive(item.page);
          return (
            <button
              key={item.page}
              onClick={() => navigate(createPageUrl(item.page))}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 touch-manipulation"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={cn(
                    "absolute top-0 left-0 right-0 h-0.5 rounded-full",
                    darkMode ? "bg-white" : "bg-zinc-900"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon 
                className={cn(
                  "w-5 h-5 transition-colors",
                  active 
                    ? darkMode ? "text-white" : "text-zinc-900"
                    : darkMode ? "text-zinc-600" : "text-zinc-400"
                )}
              />
              <span className={cn(
                "text-[9px] font-bold tracking-wider transition-colors",
                active 
                  ? darkMode ? "text-white" : "text-zinc-900"
                  : darkMode ? "text-zinc-600" : "text-zinc-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}