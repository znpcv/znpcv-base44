import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, LogOut, Settings } from 'lucide-react';
import { createPageUrl } from "@/utils";
import { useLanguage } from '@/components/LanguageContext';

export default function AccountButton() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (err) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Home'));
  };

  if (!user) {
    return (
      <button
        onClick={() => base44.auth.redirectToLogin()}
        className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
          darkMode 
            ? 'bg-white text-black border-white hover:bg-zinc-200' 
            : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
        }`}
      >
        <User className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline tracking-widest">LOGIN</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all w-full h-full ${
          darkMode 
            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-white' 
            : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-black'
        }`}
      >
        <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center overflow-hidden ${
          darkMode ? 'bg-white' : 'bg-zinc-900'
        }`}>
          {user.profile_image ? (
            <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className={`text-xs font-bold tracking-wider ${darkMode ? 'text-white' : 'text-black'} truncate max-w-[100px] sm:max-w-[120px]`}>
            {user.full_name || 'User'}
          </div>
          <div className={`text-[9px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {user.role?.toUpperCase()}
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 mt-2 w-48 sm:w-56 rounded-lg sm:rounded-xl border-2 shadow-2xl z-20 overflow-hidden ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'
          }`}>
            <button
              onClick={() => {
                navigate(createPageUrl('Account'));
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 transition-colors ${
                darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
              }`}
            >
              <Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <div className="text-left">
                <div className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                  Account
                </div>
                <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Einstellungen
                </div>
              </div>
            </button>
            <div className={`border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`} />
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 transition-colors text-red-500 ${
                darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
              }`}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-bold">Ausloggen</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}