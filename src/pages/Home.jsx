import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, ClipboardCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* White Header with Logo */}
      <header className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/2f200c537_PNGZNPCVLOGOwei.png" 
              alt="ZNPCV" 
              className="h-32 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl tracking-widest mb-4">TRADING SUITE</h1>
          <p className="text-zinc-500 text-xl tracking-wider mb-12">
            PROFESSIONELLE ANALYSE. MAXIMALE DISZIPLIN.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => navigate(createPageUrl('Checklist'))}
                className="w-full h-auto py-8 bg-white hover:bg-zinc-100 text-black rounded-none flex flex-col items-center gap-3"
              >
                <ClipboardCheck className="w-10 h-10" />
                <span className="text-2xl tracking-widest">NEUE ANALYSE</span>
                <span className="text-sm text-zinc-500 tracking-wider">CHECKLIST STARTEN</span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                variant="outline"
                className="w-full h-auto py-8 border-zinc-700 hover:bg-zinc-900 text-white rounded-none flex flex-col items-center gap-3"
              >
                <BarChart3 className="w-10 h-10" />
                <span className="text-2xl tracking-widest">DASHBOARD</span>
                <span className="text-sm text-zinc-500 tracking-wider">ÜBERSICHT & STATS</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { label: 'FOREX', desc: '27+ PAARE' },
            { label: 'KRYPTO', desc: '24+ COINS' },
            { label: 'STOCKS', desc: '35+ AKTIEN' },
            { label: 'COMMODITIES', desc: 'GOLD, ÖL & MEHR' },
          ].map((item, index) => (
            <div key={item.label}>
              <div className="text-2xl tracking-widest text-white mb-1">{item.label}</div>
              <div className="text-sm text-zinc-500 tracking-wider">{item.desc}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-sm tracking-widest">WWW.ZNPCV.COM</p>
      </footer>
    </div>
  );
}