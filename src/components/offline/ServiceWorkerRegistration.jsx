import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Create service worker inline
      const swCode = `
        const CACHE_NAME = 'znpcv-v1';
        
        self.addEventListener('install', (event) => {
          console.log('SW installing...');
          self.skipWaiting();
        });
        
        self.addEventListener('activate', (event) => {
          console.log('SW activated');
          event.waitUntil(self.clients.claim());
        });
        
        self.addEventListener('push', (event) => {
          console.log('Push received:', event);
          
          let data = {
            title: 'ZNPCV Trading',
            body: 'Neue Benachrichtigung',
            icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
            badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692d8f74cb6d9152b3880015/e14bd7c71_ZNPCVSchwarzhintergrundlogochecklisteweb.png',
            tag: 'znpcv-notification',
            data: {}
          };
          
          if (event.data) {
            try {
              data = event.data.json();
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
          
          event.waitUntil(
            self.registration.showNotification(data.title, {
              body: data.body,
              icon: data.icon,
              badge: data.badge,
              tag: data.tag,
              vibrate: [200, 100, 200],
              data: data.data,
              actions: [
                { action: 'snooze', title: '💤 Snooze' },
                { action: 'close', title: '✕ Schließen' }
              ]
            })
          );
        });
        
        self.addEventListener('notificationclick', (event) => {
          const notification = event.notification;
          const action = event.action;

          if (action === 'snooze') {
            notification.close();
            const snoozeDuration = (notification.data && notification.data.snoozeDuration) || 30;
            console.log('Snoozed for ' + snoozeDuration + ' minutes');
          } else if (action === 'close') {
            notification.close();
          } else {
            notification.close();
            event.waitUntil(clients.openWindow('/'));
          }
        });
      `;
      
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}