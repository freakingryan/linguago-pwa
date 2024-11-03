import { ConversationMessage } from '../types/conversation';

export class IndexedDBService {
    private readonly DB_NAME = 'translatorApp';
    private readonly DB_VERSION = 2;
    private readonly CONVERSATION_STORE = 'conversations';
    private readonly CURRENT_CONVERSATION_STORE = 'currentConversation';
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    async initialize(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open database');
                this.initPromise = null;
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                console.log('Database opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed');
                const db = (event.target as IDBOpenDBRequest).result;

                if (db.objectStoreNames.contains(this.CONVERSATION_STORE)) {
                    db.deleteObjectStore(this.CONVERSATION_STORE);
                }
                if (db.objectStoreNames.contains(this.CURRENT_CONVERSATION_STORE)) {
                    db.deleteObjectStore(this.CURRENT_CONVERSATION_STORE);
                }

                const conversationStore = db.createObjectStore(this.CONVERSATION_STORE, {
                    keyPath: 'id'
                });
                conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
                conversationStore.createIndex('startTime', 'startTime', { unique: false });

                db.createObjectStore(this.CURRENT_CONVERSATION_STORE, {
                    keyPath: 'id'
                });

                console.log('Object stores created successfully');
            };
        });

        return this.initPromise;
    }

    async ensureInitialized(): Promise<void> {
        if (!this.db) {
            await this.initialize();
        }
    }

    async getAllConversations(): Promise<any[]> {
        await this.ensureInitialized();

        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.CONVERSATION_STORE], 'readonly');
            const store = transaction.objectStore(this.CONVERSATION_STORE);
            const request = store.getAll();

            request.onerror = () => {
                reject(new Error('Failed to get conversations'));
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }

    async addConversation(conversation: any): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.CONVERSATION_STORE], 'readwrite');
            const store = transaction.objectStore(this.CONVERSATION_STORE);
            const request = store.add(conversation);

            request.onerror = () => {
                reject(new Error('Failed to add conversation'));
            };

            request.onsuccess = () => {
                resolve();
            };
        });
    }

    async deleteConversations(ids: string[]): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.CONVERSATION_STORE], 'readwrite');
            const store = transaction.objectStore(this.CONVERSATION_STORE);

            let completed = 0;
            let errors = 0;

            ids.forEach(id => {
                const request = store.delete(id);

                request.onsuccess = () => {
                    completed++;
                    if (completed + errors === ids.length) {
                        if (errors > 0) {
                            reject(new Error(`Failed to delete ${errors} conversations`));
                        } else {
                            resolve();
                        }
                    }
                };

                request.onerror = () => {
                    errors++;
                    if (completed + errors === ids.length) {
                        reject(new Error(`Failed to delete ${errors} conversations`));
                    }
                };
            });
        });
    }

    async clearAllConversations(): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.CONVERSATION_STORE], 'readwrite');
            const store = transaction.objectStore(this.CONVERSATION_STORE);
            const request = store.clear();

            request.onerror = () => {
                reject(new Error('Failed to clear conversations'));
            };

            request.onsuccess = () => {
                resolve();
            };
        });
    }

    async getCurrentConversation(): Promise<ConversationMessage[]> {
        await this.ensureInitialized();

        if (!this.db) {
            console.log('Database not initialized');
            return [];
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([this.CURRENT_CONVERSATION_STORE], 'readonly');
                const store = transaction.objectStore(this.CURRENT_CONVERSATION_STORE);
                const request = store.get('current');

                request.onerror = () => {
                    console.error('Failed to get current conversation');
                    resolve([]);
                };

                request.onsuccess = () => {
                    const result = request.result?.messages || [];
                    console.log('Retrieved current conversation:', result);
                    resolve(result);
                };
            });
        } catch (error) {
            console.error('Error getting current conversation:', error);
            return [];
        }
    }

    async saveCurrentConversation(messages: ConversationMessage[]): Promise<void> {
        await this.ensureInitialized();

        if (!this.db) {
            console.log('Database not initialized');
            return;
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([this.CURRENT_CONVERSATION_STORE], 'readwrite');
                const store = transaction.objectStore(this.CURRENT_CONVERSATION_STORE);
                const request = store.put({
                    id: 'current',
                    messages
                });

                request.onerror = () => {
                    console.error('Failed to save current conversation');
                    resolve();
                };

                request.onsuccess = () => {
                    console.log('Saved current conversation successfully');
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error saving current conversation:', error);
        }
    }
}

export const indexedDBService = new IndexedDBService();