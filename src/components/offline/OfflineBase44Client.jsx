import { base44 } from '@/api/base44Client';
import { storage, STORES } from './OfflineManager';

// Wrapper für base44 Client mit Offline-Support
export class OfflineBase44Client {
  constructor() {
    this.isOnline = navigator.onLine;
    this.updatePendingCount = null;
    
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  setUpdateCallback(callback) {
    this.updatePendingCount = callback;
  }

  async TradeChecklist() {
    return {
      filter: async (query = {}) => {
        if (this.isOnline) {
          try {
            const data = await base44.entities.TradeChecklist.filter(query);
            await storage.saveMany(STORES.CHECKLISTS, data);
            return data;
          } catch (err) {
            console.warn('Online fetch failed, using cache:', err);
            return this.getFromCache(query);
          }
        }
        return this.getFromCache(query);
      },

      list: async (sort, limit) => {
        if (this.isOnline) {
          try {
            const data = await base44.entities.TradeChecklist.list(sort, limit);
            await storage.saveMany(STORES.CHECKLISTS, data);
            return data;
          } catch (err) {
            console.warn('Online fetch failed, using cache:', err);
            return this.getFromCache({});
          }
        }
        return this.getFromCache({});
      },

      create: async (data) => {
        const tempId = 'temp_' + Date.now();
        const checklist = { ...data, id: tempId, created_date: new Date().toISOString() };
        
        await storage.save(STORES.CHECKLISTS, checklist);
        
        if (this.isOnline) {
          try {
            const result = await base44.entities.TradeChecklist.create(data);
            await storage.delete(STORES.CHECKLISTS, tempId);
            await storage.save(STORES.CHECKLISTS, result);
            return result;
          } catch (err) {
            await storage.addPendingOperation({
              type: 'CREATE',
              entity: 'TradeChecklist',
              data,
              tempId
            });
            if (this.updatePendingCount) this.updatePendingCount();
            return checklist;
          }
        } else {
          await storage.addPendingOperation({
            type: 'CREATE',
            entity: 'TradeChecklist',
            data,
            tempId
          });
          if (this.updatePendingCount) this.updatePendingCount();
          return checklist;
        }
      },

      update: async (id, data) => {
        const existing = await storage.get(STORES.CHECKLISTS, id);
        const updated = { ...existing, ...data, updated_date: new Date().toISOString() };
        await storage.save(STORES.CHECKLISTS, updated);
        
        if (this.isOnline) {
          try {
            const result = await base44.entities.TradeChecklist.update(id, data);
            await storage.save(STORES.CHECKLISTS, result);
            return result;
          } catch (err) {
            await storage.addPendingOperation({
              type: 'UPDATE',
              entity: 'TradeChecklist',
              id,
              data
            });
            if (this.updatePendingCount) this.updatePendingCount();
            return updated;
          }
        } else {
          await storage.addPendingOperation({
            type: 'UPDATE',
            entity: 'TradeChecklist',
            id,
            data
          });
          if (this.updatePendingCount) this.updatePendingCount();
          return updated;
        }
      },

      delete: async (id) => {
        await storage.delete(STORES.CHECKLISTS, id);
        
        if (this.isOnline) {
          try {
            return await base44.entities.TradeChecklist.delete(id);
          } catch (err) {
            await storage.addPendingOperation({
              type: 'DELETE',
              entity: 'TradeChecklist',
              id
            });
            if (this.updatePendingCount) this.updatePendingCount();
          }
        } else {
          await storage.addPendingOperation({
            type: 'DELETE',
            entity: 'TradeChecklist',
            id
          });
          if (this.updatePendingCount) this.updatePendingCount();
        }
      }
    };
  }

  async getFromCache(query) {
    let data = await storage.getAll(STORES.CHECKLISTS);
    
    // Filter deleted items
    data = data.filter(item => !item.deleted);
    
    // Apply query filters
    if (Object.keys(query).length > 0) {
      data = data.filter(item => {
        return Object.entries(query).every(([key, value]) => {
          if (key === 'id') return item.id === value;
          return item[key] === value;
        });
      });
    }
    
    return data;
  }
}

export const offlineClient = new OfflineBase44Client();