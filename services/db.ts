
import { Field, ChatMessage } from '../types';

const DB_NAME = 'YieldAIDB_V3'; // Version bump to ensure fresh schema
const STORE_FIELDS = 'fields';
const STORE_CHATS = 'chats';
const DB_VERSION = 3;

export const DB = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Fields Store
        if (!db.objectStoreNames.contains(STORE_FIELDS)) {
          db.createObjectStore(STORE_FIELDS, { keyPath: 'id' });
        }

        // Chat History Store
        if (!db.objectStoreNames.contains(STORE_CHATS)) {
          db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        console.error("DB Open Error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  },

  getAllFields: async (): Promise<Field[]> => {
    try {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_FIELDS, 'readonly');
        const store = transaction.objectStore(STORE_FIELDS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("DB getAllFields Failed", e);
        return [];
    }
  },

  saveField: async (field: Field): Promise<void> => {
    const db = await DB.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FIELDS, 'readwrite');
      const store = transaction.objectStore(STORE_FIELDS);
      const request = store.put(field); 

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteField: async (id: string): Promise<void> => {
    const db = await DB.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FIELDS, 'readwrite');
      const store = transaction.objectStore(STORE_FIELDS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  // CHAT HISTORY METHODS
  
  saveMessage: async (msg: ChatMessage): Promise<void> => {
      const db = await DB.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_CHATS, 'readwrite');
        const store = transaction.objectStore(STORE_CHATS);
        const request = store.put(msg);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
  },

  getAllMessages: async (): Promise<ChatMessage[]> => {
      try {
        const db = await DB.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_CHATS, 'readonly');
            const store = transaction.objectStore(STORE_CHATS);
            const request = store.getAll();
            
            request.onsuccess = () => {
                // Sort by timestamp just in case
                const msgs = request.result || [];
                msgs.sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
                resolve(msgs);
            };
            request.onerror = () => reject(request.error);
        });
      } catch (e) {
          return [];
      }
  }
};
