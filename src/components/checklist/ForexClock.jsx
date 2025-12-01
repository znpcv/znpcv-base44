import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const SESSIONS = [
  { name: 'TOKYO', timezone: 'Asia/Tokyo', emoji: '🇯🇵', color: 'rose', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', emoji: '🇬🇧', color: 'blue', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', emoji: '🇺🇸', color: 'emerald', openHour: 9, closeHour: 17 },
];

export default function ForexClock() {
  const [times, setTimes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now);
      const newTimes = {};
      SESSIONS.forEach(session => {
        newTimes[session.name] = now.toLocaleTimeString('de-DE', {
          timeZone: session.timezone,
          hour: '2-digit',
          minute: '2-digit',
        });
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSessionOpen = (session) => {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: session.timezone }));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    if (day === 0 || day === 6) return false;
    return hour >= session.openHour && hour < session.closeHour;
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Market Sessions</h3>
          <p className="text-xs text-slate-500">
            {currentTime.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {SESSIONS.map((session, index) => {
          const isOpen = isSessionOpen(session);
          return (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isOpen ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{session.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-300 tracking-wider">
                    {session.name}
                  </div>
                  <div className={`text-xs ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isOpen ? '● OPEN' : '○ CLOSED'}
                  </div>
                </div>
              </div>
              <div className={`text-xl font-mono font-bold ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                {times[session.name] || '--:--'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}