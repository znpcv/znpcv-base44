import React, { useState, useEffect } from 'react';
import { Bell, Check, Smartphone, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function PushNotificationManager({ darkMode, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);
    } catch (err) {
      console.error('Check subscription failed:', err);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push-Benachrichtigungen werden von diesem Browser nicht unterstützt');
      return;
    }

    setLoading(true);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Benachrichtigungen wurden blockiert');
        setLoading(false);
        return;
      }

      // Get VAPID public key from backend
      const response = await base44.functions.invoke('getVapidPublicKey');
      const vapidPublicKey = response.data?.publicKey;
      
      if (!vapidPublicKey) {
        throw new Error('VAPID Public Key nicht verfügbar');
      }

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Convert VAPID key
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        // Subscribe
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // Get device info
      const deviceInfo = `${navigator.platform} - ${navigator.userAgent.split(' ').pop()}`;

      // Send subscription to backend
      const subscribeResponse = await base44.functions.invoke('subscribePush', {
        subscription: subscription.toJSON(),
        deviceInfo
      });

      if (!subscribeResponse.data?.success) {
        throw new Error('Subscription fehlgeschlagen');
      }

      // Update user settings
      await base44.auth.updateMe({ browser_notifications_enabled: true });

      setSubscribed(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Subscribe failed:', err);
      alert('Fehler beim Aktivieren der Push-Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`flex items-center gap-2 p-3 rounded-xl border-2 ${
          darkMode ? 'bg-emerald-700/20 border-emerald-700' : 'bg-teal-100 border-emerald-700'
        }`}>
        <Check className="w-5 h-5 text-emerald-700" />
        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
          Push-Benachrichtigungen aktiv
        </span>
      </motion.div>
    );
  }

  return (
    <button
      onClick={subscribeToPush}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wider transition-all border-2 ${
        darkMode 
          ? 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white border-transparent'
          : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-transparent'
      } disabled:opacity-50 disabled:cursor-not-allowed`}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Aktiviere...
        </>
      ) : (
        <>
          <Smartphone className="w-4 h-4" />
          Push aktivieren
        </>
      )}
    </button>
  );
}