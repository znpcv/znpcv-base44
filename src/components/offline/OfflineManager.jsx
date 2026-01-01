import React, { useState, useEffect, createContext, useContext } from 'react';
import { WifiOff, Wifi, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// IndexedDB Setup
const DB_NAME = 'ZNPCV_Offline';
const DB_VERSION = 1;
const STORES = {
  CHECKLISTS: 'checklists',
  PENDING_OPS: 'pending_operations',
  CACHED_DATA: 'cached_data'
};

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORES.CHECKLISTS)) {
          db.createObjectStore(STORES.CHECKLISTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.PENDING_OPS)) {
          const store = db.createObjectStore(STORES.PENDING_OPS, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
          db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'key' });
        }
      };
    });
  }

  async save(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return store.put(data);
  }

  async saveMany(storeName, dataArray) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const data of dataArray) {
      store.put(data);
    }
    return tx.complete;
  }

  async get(storeName, id) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.get(id);
  }

  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return store.delete(id);
  }

  async clear(storeName) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return store.clear();
  }

  async addPendingOperation(operation) {
    const op = {
      ...operation,
      timestamp: Date.now()
    };
    return this.save(STORES.PENDING_OPS, op);
  }

  async getPendingOperations() {
    return this.getAll(STORES.PENDING_OPS);
  }

  async clearPendingOperations() {
    return this.clear(STORES.PENDING_OPS);
  }
}

const storage = new OfflineStorage();

const OfflineContext = createContext({
  isOnline: true,
  pendingCount: 0,
  syncInProgress: false
});

export const useOffline = () => useContext(OfflineContext);

export default function OfflineManager({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    initOfflineStorage();
    updatePendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      showNotification('Verbindung wiederhergestellt', 'success');
      await syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Offline-Modus aktiviert', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initOfflineStorage = async () => {
    try {
      await storage.init();
      console.log('Offline storage initialized');
    } catch (err) {
      console.error('Failed to init offline storage:', err);
    }
  };

  const updatePendingCount = async () => {
    try {
      const pending = await storage.getPendingOperations();
      setPendingCount(pending.length);
    } catch (err) {
      console.error('Failed to get pending count:', err);
    }
  };

  const syncPendingOperations = async () => {
    if (!isOnline || syncInProgress) return;

    try {
      setSyncInProgress(true);
      const pending = await storage.getPendingOperations();
      
      if (pending.length === 0) {
        setSyncInProgress(false);
        return;
      }

      showNotification(`Synchronisiere ${pending.length} Änderungen...`, 'info');

      for (const op of pending) {
        try {
          await executeOperation(op);
          await storage.delete(STORES.PENDING_OPS, op.id);
        } catch (err) {
          console.error('Failed to sync operation:', err);
        }
      }

      await updatePendingCount();
      showNotification('Synchronisation abgeschlossen', 'success');
    } catch (err) {
      console.error('Sync failed:', err);
      showNotification('Synchronisation fehlgeschlagen', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

  const executeOperation = async (op) => {
    const { base44 } = await import('@/api/base44Client');
    
    switch (op.type) {
      case 'CREATE':
        return base44.entities[op.entity].create(op.data);
      case 'UPDATE':
        return base44.entities[op.entity].update(op.id, op.data);
      case 'DELETE':
        return base44.entities[op.entity].delete(op.id);
      default:
        throw new Error('Unknown operation type');
    }
  };

  const showNotification = (message, type) => {
    setToastMessage({ text: message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, syncInProgress, storage, updatePendingCount }}>
      {children}
      
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold">
            <WifiOff className="w-4 h-4" />
            OFFLINE-MODUS
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Badge */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={syncPendingOperations}
            disabled={!isOnline || syncInProgress}
            className="fixed bottom-4 right-4 z-[100] bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-xs font-bold disabled:opacity-50">
            {syncInProgress ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {pendingCount}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-20 right-4 z-[100] rounded-xl p-4 shadow-xl text-white text-sm font-bold flex items-center gap-2 ${
              toastMessage.type === 'success' ? 'bg-emerald-600' :
              toastMessage.type === 'error' ? 'bg-rose-600' :
              toastMessage.type === 'warning' ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
            {toastMessage.type === 'success' ? <Wifi className="w-4 h-4" /> :
             toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
             <WifiOff className="w-4 h-4" />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </OfflineContext.Provider>
  );
}

export { storage, STORES };