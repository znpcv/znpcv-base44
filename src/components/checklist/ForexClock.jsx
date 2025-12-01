import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SESSIONS = [
  { name: 'TOKYO', timezone: 'Asia/Tokyo', color: '#E11D48', openHour: 9, closeHour: 18 },
  { name: 'LONDON', timezone: 'Europe/London', color: '#2563EB', openHour: 8, closeHour: 17 },
  { name: 'NEW YORK', timezone: 'America/New_York', color: '#4A5D23', openHour: 9, closeHour: 17 },
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
          second: '2-digit'
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
    
    // Forex closed on weekends
    if (day === 0 || day === 6) return false;
    
    return hour >= session.openHour && hour < session.closeHour;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Market Sessions</span>
        <span className="text-xs text-zinc-600">
          {currentTime.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {SESSIONS.map((session) => {
          const isOpen = isSessionOpen(session);
          return (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <div 
                  className={`w-2 h-2 rounded-full ${isOpen ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: isOpen ? session.color : '#3f3f46' }}
                />
                <span className="text-xs font-bold text-zinc-400 tracking-wider">
                  {session.name}
                </span>
              </div>
              <div 
                className="text-lg font-mono font-bold"
                style={{ color: isOpen ? session.color : '#71717a' }}
              >
                {times[session.name] || '--:--:--'}
              </div>
              <span className={`text-xs ${isOpen ? 'text-green-500' : 'text-zinc-600'}`}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}