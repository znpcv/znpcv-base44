import React, { useState, useEffect } from 'react';
import { useEffect as useReactEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, Smartphone, CheckCircle, Shield, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useLanguage, DarkModeToggle } from '@/components/LanguageContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function CheckoutForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const { darkMode } = useLanguage();

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please wait...');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + createPageUrl('PaymentSuccess'),
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await base44.auth.updateMe({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          stripe_payment_intent: paymentIntent.id
        });
        onSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {errorMessage}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || !isReady || isProcessing}
        className={`w-full py-4 text-lg tracking-widest font-bold rounded-xl ${darkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
      >
        {isProcessing ? 'PROCESSING...' : !isReady ? 'LOADING...' : 'PAY $99 NOW'}
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { darkMode } = useLanguage();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Check if already paid
        if (currentUser.payment_status === 'paid') {
          navigate(createPageUrl('Home'));
          return;
        }

        // NOTE: You need to create a backend function to generate a real Stripe payment intent
        // For now, using a demo client secret - replace this with actual Stripe integration
        
        // Demo mode: Create a test payment intent
        // In production, call your backend: const { clientSecret } = await base44.functions.createPaymentIntent({ amount: 9900 });
        
        setErrorMessage('DEMO MODE: Configure Stripe backend integration to enable real payments');
        setClientSecret('demo_test_secret_placeholder');
      } catch (error) {
        console.error('Payment init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [navigate]);

  const handleSuccess = () => {
    navigate(createPageUrl('Home'));
  };

  const theme = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-zinc-900',
    textSecondary: darkMode ? 'text-zinc-400' : 'text-zinc-600',
    border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
    bgCard: darkMode ? 'bg-zinc-950' : 'bg-zinc-50',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className={theme.textSecondary}>Loading payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.bg} border-b ${theme.border}`}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <img 
            src={darkMode 
              ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png"
              : "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e396a6edd_ZNPCVWebseiteWeisshihtergrundLogo.png"
            }
            alt="ZNPCV" 
            className="h-12 w-auto"
          />
          <DarkModeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl tracking-widest mb-4">GET FULL ACCESS</h1>
              <p className={`text-lg ${theme.textSecondary}`}>One-time payment. Lifetime access.</p>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bgCard} mb-6`}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-light">$99</span>
                <span className={theme.textSecondary}>USD</span>
              </div>
              <p className={`text-sm ${theme.textSecondary}`}>One-time payment • No subscription</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: 'Unlimited Analyses' },
                { icon: Zap, text: 'All Trading Tools' },
                { icon: Shield, text: 'Lifetime Updates' },
                { icon: Lock, text: 'Secure & Private' },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-zinc-900'}`}>
                    <feature.icon className={`w-5 h-5 ${darkMode ? 'text-black' : 'text-white'}`} />
                  </div>
                  <span className="tracking-wider">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className={`mt-8 p-4 rounded-xl border ${theme.border} ${theme.bgCard}`}>
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold tracking-widest">SECURE PAYMENT</span>
              </div>
              <div className="flex items-center gap-4">
                <CreditCard className={`w-6 h-6 ${theme.textSecondary}`} />
                <Smartphone className={`w-6 h-6 ${theme.textSecondary}`} />
                <span className={`text-xs ${theme.textSecondary}`}>256-bit SSL encryption</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Payment Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`border ${theme.border} rounded-2xl p-6 md:p-8 ${theme.bgCard}`}
          >
            <h2 className="text-2xl tracking-widest mb-6">PAYMENT DETAILS</h2>
            
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: darkMode ? 'night' : 'stripe' } }}>
                <CheckoutForm onSuccess={handleSuccess} />
              </Elements>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className={theme.textSecondary}>Initializing payment...</p>
              </div>
            )}

            <div className={`mt-6 pt-6 border-t ${theme.border} text-center`}>
              <p className={`text-xs ${theme.textSecondary}`}>
                Mit dem Kauf akzeptieren Sie unsere{' '}
                <button type="button" onClick={() => navigate(createPageUrl('AGB'))} className={`${theme.text} underline`}>AGB</button>
                {' '}und{' '}
                <button type="button" onClick={() => navigate(createPageUrl('Datenschutz'))} className={`${theme.text} underline`}>Datenschutzerklärung</button>.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}