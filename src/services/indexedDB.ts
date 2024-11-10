import { ConversationMessage } from '../types/conversation';
import { Lyrics } from '../types/lyrics';
import { ClipboardItem } from '../types/clipboard';

export class IndexedDBService {
    private readonly DB_NAME = 'translatorApp';
    private readonly DB_VERSION = 4;
    private readonly CONVERSATION_STORE = 'conversations';
    private readonly CURRENT_CONVERSATION_STORE = 'currentConversation';
    private readonly VOCABULARY_STORE = 'vocabulary';
    private readonly LYRICS_STORE = 'lyrics';
    private readonly CLIPBOARD_STORE = 'clipboard';
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

                if (!db.objectStoreNames.contains(this.CONVERSATION_STORE)) {
                    const conversationStore = db.createObjectStore(this.CONVERSATION_STORE, {
                        keyPath: 'id'
                    });
                    conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
                    conversationStore.createIndex('startTime', 'startTime', { unique: false });
                }

                if (!db.objectStoreNames.contains(this.CURRENT_CONVERSATION_STORE)) {
                    db.createObjectStore(this.CURRENT_CONVERSATION_STORE, {
                        keyPath: 'id'
                    });
                }

                if (!db.objectStoreNames.contains(this.VOCABULARY_STORE)) {
                    const vocabularyStore = db.createObjectStore(this.VOCABULARY_STORE, {
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    vocabularyStore.createIndex('level', 'level', { unique: false });
                    vocabularyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    vocabularyStore.createIndex('word', 'word', { unique: false });
                    console.log('Vocabulary store created');
                }

                if (!db.objectStoreNames.contains(this.LYRICS_STORE)) {
                    const lyricsStore = db.createObjectStore(this.LYRICS_STORE, {
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    lyricsStore.createIndex('createdAt', 'createdAt', { unique: false });
                    lyricsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    lyricsStore.createIndex('title', 'title', { unique: false });
                    console.log('Lyrics store created');
                }

                if (!db.objectStoreNames.contains(this.CLIPBOARD_STORE)) {
                    const clipboardStore = db.createObjectStore(this.CLIPBOARD_STORE, {
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    clipboardStore.createIndex('createdAt', 'createdAt', { unique: false });
                    clipboardStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    clipboardStore.createIndex('title', 'title', { unique: false });
                    console.log('Clipboard store created');
                }
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

    async getAllVocabulary(): Promise<any[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db!.transaction([this.VOCABULARY_STORE], 'readonly');
                const store = transaction.objectStore(this.VOCABULARY_STORE);
                const request = store.getAll();

                request.onerror = () => {
                    reject(new Error('Failed to get vocabulary'));
                };

                request.onsuccess = () => {
                    resolve(request.result || []);
                };
            } catch (error) {
                console.error('Error in getAllVocabulary:', error);
                reject(error);
            }
        });
    }

    async addVocabularyWord(word: any): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db!.transaction([this.VOCABULARY_STORE], 'readwrite');
                const store = transaction.objectStore(this.VOCABULARY_STORE);

                if (!word.id) {
                    reject(new Error('Word object must have an id'));
                    return;
                }

                const request = store.add(word);

                request.onerror = (event) => {
                    console.error('Error in addVocabularyWord:', event);
                    reject(new Error('Failed to add word'));
                };

                request.onsuccess = () => {
                    resolve();
                };
            } catch (error) {
                console.error('Error in addVocabularyWord:', error);
                reject(error);
            }
        });
    }

    async updateVocabularyWord(word: any): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.VOCABULARY_STORE], 'readwrite');
            const store = transaction.objectStore(this.VOCABULARY_STORE);
            const request = store.put(word);

            request.onerror = () => {
                reject(new Error('Failed to update word'));
            };

            request.onsuccess = () => {
                resolve();
            };
        });
    }

    async deleteVocabularyWord(id: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.VOCABULARY_STORE], 'readwrite');
            const store = transaction.objectStore(this.VOCABULARY_STORE);
            const request = store.delete(id);

            request.onerror = () => {
                reject(new Error('Failed to delete word'));
            };

            request.onsuccess = () => {
                resolve();
            };
        });
    }

    async addLyrics(lyrics: Lyrics): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.LYRICS_STORE, 'readwrite');
            const store = transaction.objectStore(this.LYRICS_STORE);
            const request = store.add(lyrics);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getAllLyrics(): Promise<Lyrics[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.LYRICS_STORE, 'readonly');
            const store = transaction.objectStore(this.LYRICS_STORE);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async deleteLyrics(id: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.LYRICS_STORE, 'readwrite');
            const store = transaction.objectStore(this.LYRICS_STORE);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async addClipboardItem(item: ClipboardItem): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.CLIPBOARD_STORE, 'readwrite');
            const store = transaction.objectStore(this.CLIPBOARD_STORE);
            const request = store.add(item);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getAllClipboardItems(): Promise<ClipboardItem[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.CLIPBOARD_STORE, 'readonly');
            const store = transaction.objectStore(this.CLIPBOARD_STORE);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async updateClipboardItem(item: ClipboardItem): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.CLIPBOARD_STORE, 'readwrite');
            const store = transaction.objectStore(this.CLIPBOARD_STORE);
            const request = store.put(item);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async deleteClipboardItem(id: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(this.CLIPBOARD_STORE, 'readwrite');
            const store = transaction.objectStore(this.CLIPBOARD_STORE);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

export const indexedDBService = new IndexedDBService();