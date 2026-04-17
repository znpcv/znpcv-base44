import React from 'react';
import { base44 } from '@/api/base44Client';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="max-w-md w-full p-8 rounded-2xl border-2 border-zinc-800 bg-zinc-950 mx-4">
        <div className="text-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
            alt="ZNPCV"
            className="h-12 w-auto mx-auto mb-6 opacity-70"
          />
          <h1 className="text-2xl font-light tracking-widest text-white mb-4">KEIN ZUGANG</h1>
          <p className="text-zinc-400 font-sans text-sm leading-relaxed mb-6">
            Dein Account hat noch keinen Zugang zu dieser Plattform.
            Bitte überprüfe, ob du mit der richtigen E-Mail-Adresse eingeloggt bist.
          </p>
          <div className="p-4 bg-zinc-900 rounded-xl text-sm text-zinc-500 font-sans text-left space-y-2 mb-6">
            <p className="font-bold text-zinc-400 tracking-wider text-xs mb-2">MÖGLICHE URSACHEN</p>
            <ul className="space-y-1.5">
              <li>· Falsches Konto verwendet</li>
              <li>· Kauf noch nicht abgeschlossen</li>
              <li>· Session abgelaufen — bitte neu einloggen</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => base44.auth.logout('/')}
              className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold tracking-widest hover:bg-zinc-200 transition-colors"
            >
              NEU EINLOGGEN
            </button>
            <a
              href="mailto:support@znpcv.com"
              className="w-full py-3 rounded-xl border-2 border-zinc-800 text-zinc-400 text-xs font-bold tracking-widest hover:border-zinc-700 transition-colors text-center"
            >
              SUPPORT KONTAKTIEREN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;