import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="max-w-md w-full p-8 bg-zinc-950 rounded-2xl border-2 border-zinc-800 mx-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-xl bg-zinc-900 border border-zinc-700">
            <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-xs tracking-widest text-zinc-500 mb-3">ZUGRIFF NICHT MÖGLICH</div>
          <h1 className="text-2xl font-light text-white tracking-wider mb-4">Kein Zugriff</h1>
          <p className="text-zinc-400 text-sm font-sans leading-relaxed mb-8">
            Dein Konto ist für diese Anwendung nicht registriert. Bitte kontaktiere den Administrator für Zugang.
          </p>
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-left">
            <p className="text-xs text-zinc-500 font-sans mb-2">Mögliche Ursachen:</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-zinc-400 font-sans flex items-start gap-2">
                <span className="text-zinc-600 mt-0.5">—</span>
                <span>Du bist mit einer anderen E-Mail-Adresse angemeldet</span>
              </li>
              <li className="text-xs text-zinc-400 font-sans flex items-start gap-2">
                <span className="text-zinc-600 mt-0.5">—</span>
                <span>Der Zugang wurde noch nicht freigeschaltet</span>
              </li>
              <li className="text-xs text-zinc-400 font-sans flex items-start gap-2">
                <span className="text-zinc-600 mt-0.5">—</span>
                <span>Einmalig aus- und wieder einloggen kann helfen</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-zinc-600 font-sans mt-6">
            Fragen? <a href="mailto:support@znpcv.com" className="text-zinc-400 underline">support@znpcv.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;