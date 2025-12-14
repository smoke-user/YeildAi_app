
import { Field, ChatMessage, RAGDocument, RAGChunk } from '../types';

const DB_NAME = 'YieldAIDB_V4'; // Bump version for new stores
const STORE_FIELDS = 'fields';
const STORE_CHATS = 'chats';
const STORE_DOCS = 'documents';
const STORE_CHUNKS = 'chunks';
const DB_VERSION = 4;

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

        // RAG Document Store
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        }

        // RAG Chunks (Vectors) Store
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
          chunkStore.createIndex('docId', 'docId', { unique: false });
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
                const msgs = request.result || [];
                msgs.sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
                resolve(msgs);
            };
            request.onerror = () => reject(request.error);
        });
      } catch (e) {
          return [];
      }
  },

  // RAG METHODS

  saveDocument: async (doc: RAGDocument): Promise<void> => {
    const db = await DB.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_DOCS, 'readwrite');
      const store = transaction.objectStore(STORE_DOCS);
      const request = store.put(doc);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  saveChunks: async (chunks: RAGChunk[]): Promise<void> => {
    const db = await DB.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_CHUNKS, 'readwrite');
      const store = transaction.objectStore(STORE_CHUNKS);
      // Bulk add
      chunks.forEach(chunk => store.put(chunk));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  getAllDocuments: async (): Promise<RAGDocument[]> => {
    try {
      const db = await DB.open();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_DOCS, 'readonly');
        const store = transaction.objectStore(STORE_DOCS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  },

  deleteDocument: async (docId: string): Promise<void> => {
      const db = await DB.open();
      return new Promise((resolve, reject) => {
          const transaction = db.transaction([STORE_DOCS, STORE_CHUNKS], 'readwrite');
          const docStore = transaction.objectStore(STORE_DOCS);
          const chunkStore = transaction.objectStore(STORE_CHUNKS);
          const chunkIndex = chunkStore.index('docId');

          // Delete Doc
          docStore.delete(docId);

          // Delete associated chunks
          const chunkReq = chunkIndex.getAllKeys(IDBKeyRange.only(docId));
          chunkReq.onsuccess = () => {
              const keys = chunkReq.result;
              keys.forEach(key => chunkStore.delete(key));
          };

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
      });
  },

  getAllChunks: async (): Promise<RAGChunk[]> => {
      try {
          const db = await DB.open();
          return new Promise((resolve, reject) => {
             const transaction = db.transaction(STORE_CHUNKS, 'readonly');
             const store = transaction.objectStore(STORE_CHUNKS);
             const request = store.getAll();
             request.onsuccess = () => resolve(request.result || []);
             request.onerror = () => reject(request.error);
          });
      } catch (e) {
          return [];
      }
  }
};
