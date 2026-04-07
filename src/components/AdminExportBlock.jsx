import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminExportBlock({ darkMode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await base44.functions.invoke('downloadExport', {});
      const blob = new Blob([response.data], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'znpcv-export.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 left-6 z-40`}>
      <div className={`border rounded-xl p-3 flex items-center gap-2 ${
        darkMode
          ? 'bg-zinc-900 border-zinc-800'
          : 'bg-zinc-100 border-zinc-300'
      }`}>
        <span className={`text-[10px] tracking-widest font-bold ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
          EXPORT
        </span>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all disabled:opacity-50 ${
            darkMode
              ? 'bg-white text-black border-white hover:bg-zinc-200'
              : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
          }`}
        >
          <Download className="w-3 h-3" />
          {downloading ? 'Wird exportiert…' : 'Exportieren'}
        </button>
      </div>
    </div>
  );
}