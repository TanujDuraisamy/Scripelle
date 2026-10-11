import type { StoredDocument, StoredChatMessage } from "../types/customTypes";
import { create } from 'zustand';
import { auth } from '../utils/handleHttp';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Document {
  id: string | null;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    firstName: string;
    lastName: string;
  };
}

interface EditorState {
  // Document data
  document: Document;
  chatHistory: ChatMessage[];
  contextText: string;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  setDocument: (document: Partial<Document>) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setContextText: (context: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  removeLastAssistantMessage: () => void;
  clearChatHistory: () => void;

  loadDocument: (documentId: string) => Promise<void>;
  saveDocument: () => Promise<void>;
  createNewDocument: () => Promise<string | null>;

  resetEditor: () => void;
}

let titleSaveTimeout: ReturnType<typeof setTimeout>;
let contentSaveTimeout: ReturnType<typeof setTimeout>;

const initialDocument: Document = {
  id: null,
  title: 'Untitled',
  content: '',
};

const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  document: initialDocument,
  chatHistory: [],
  contextText: '',
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  setDocument: (documentData) =>
    set((state) => ({
      document: { ...state.document, ...documentData }
    })),

  setTitle: (title) => {
    set((state) => ({
      document: { ...state.document, title }
    }));

    const { saveDocument } = get();
    clearTimeout(titleSaveTimeout);
    titleSaveTimeout = setTimeout(() => {
      saveDocument();
    }, 1000);
  },

  setContent: (content) => {
    set((state) => ({
      document: { ...state.document, content }
    }));

    const { saveDocument } = get();
    clearTimeout(contentSaveTimeout);
    contentSaveTimeout = setTimeout(() => {
      saveDocument();
    }, 2000);
  },

  setContextText: (contextText) => set({ contextText }),

  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => {
      const updatedChatHistory = [...state.chatHistory, newMessage];

      // Auto-save the document with updated chat history
      setTimeout(() => {
        const { saveDocument } = get();
        saveDocument();
      }, 500);

      return {
        chatHistory: updatedChatHistory
      };
    });
  },

  removeLastAssistantMessage: () => {
    set((state) => {
      const reversedHistory = [...state.chatHistory].reverse();
      const lastAssistantIndex = reversedHistory.findIndex(msg => msg.role === 'assistant');

      if (lastAssistantIndex !== -1) {
        const actualIndex = state.chatHistory.length - 1 - lastAssistantIndex;
        const updatedChatHistory = state.chatHistory.filter((_, index) => index !== actualIndex);

        return {
          chatHistory: updatedChatHistory
        };
      }

      return { chatHistory: state.chatHistory };
    });
  },

  clearChatHistory: () => {

    set({ chatHistory: [] });
  },

  loadDocument: async (documentId: string) => {
    set({ isLoading: true });

    try {
      const response = await auth<{ data: StoredDocument }>({
        method: 'GET',
        url: `documents/${documentId}`,
      });


      if (response.type === 'success' && response.data?.data) {
        const doc = response.data?.data;

        let parsedChatHistory: ChatMessage[] = [];
        try {
          if (Array.isArray(doc.chatHistory)) {
            const chatArray = doc.chatHistory;

            if (chatArray.length > 0 && typeof chatArray[0] === 'string') {
              parsedChatHistory = chatArray.filter((msg): msg is string => typeof msg === "string").map((msg: string, index: number) => {
                const isUser = msg.startsWith('User:') || msg.startsWith('user:');
                const isAI = msg.startsWith('AI:') || msg.startsWith('Assistant:') || msg.startsWith('ai:');

                let role: 'user' | 'assistant' = 'user';
                let content = msg;

                if (isUser) {
                  role = 'user';
                  content = msg.replace(/^User:\s?/i, '').trim();
                } else if (isAI) {
                  role = 'assistant';
                  content = msg.replace(/^(AI|Assistant):\s?/i, '').trim();
                } else {
                  // If no prefix, alternate between user and assistant
                  role = index % 2 === 0 ? 'user' : 'assistant';
                }

                return {
                  id: `legacy-${index}`,
                  role,
                  content,
                  timestamp: new Date(),
                };
              });
            }
            else if (chatArray.length > 0 && typeof chatArray[0] === 'object') {
              parsedChatHistory = chatArray.filter((msg): msg is StoredChatMessage => typeof msg === "object" && msg !== null).map((msg: StoredChatMessage, index: number) => ({
                id: msg.id || `msg-${index}`,
                role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: msg.content || '',
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));
            }
          }
          else if (doc.chatHistory && typeof doc.chatHistory === 'string' && doc.chatHistory.trim() !== '') {
            const parsed = JSON.parse(doc.chatHistory);

            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
              parsedChatHistory = parsed.map((msg: string, index: number) => {
                const isUser = msg.startsWith('User:') || msg.startsWith('user:');
                const isAI = msg.startsWith('AI:') || msg.startsWith('Assistant:') || msg.startsWith('ai:');

                let role: 'user' | 'assistant' = 'user';
                let content = msg;

                if (isUser) {
                  role = 'user';
                  content = msg.replace(/^User:\s?/i, '').trim();
                } else if (isAI) {
                  role = 'assistant';
                  content = msg.replace(/^(AI|Assistant):\s?/i, '').trim();
                } else {
                  role = index % 2 === 0 ? 'user' : 'assistant';
                }

                return {
                  id: `legacy-${index}`,
                  role,
                  content,
                  timestamp: new Date(),
                };
              });
            }
            else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
              parsedChatHistory = parsed.map((msg: StoredChatMessage, index: number) => ({
                id: msg.id || `msg-${index}`,
                role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: msg.content || '',
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse chat history:', parseError);
          parsedChatHistory = [];
        }

        set({
          document: {
            id: doc.id,
            title: doc.title || 'Untitled',
            content: doc.content || '',
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            owner: doc.owner,
          },
          contextText: doc.context || '',
          chatHistory: parsedChatHistory,
          lastSaved: new Date(doc.updatedAt),
        });
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveDocument: async () => {
    const { document, contextText, chatHistory, isSaving } = get();


    if (isSaving || !document.id) {

      return;
    }

    set({ isSaving: true });

    try {
      const formattedChatHistory = chatHistory.map(msg =>
        `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
      );

      const response = await auth<{ data: StoredDocument }>({
        method: 'PUT',
        url: `documents/${document.id}`,
        data: {
          title: document.title,
          content: document.content,
          context: contextText,
          chatHistory: formattedChatHistory,
        },
      });


      if (response.type === 'success') {
        set({
          lastSaved: new Date(),
          document: { ...get().document, updatedAt: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      set({ isSaving: false });
    }
  },

  createNewDocument: async () => {
    set({ isLoading: true });

    try {
      const response = await auth<{ data: StoredDocument }>({
        method: 'POST',
        url: 'documents',
        data: {
          title: 'Untitled',
          content: '',
          context: '',
          chatHistory: [],
        },
      });


      if (response.type === 'success' && response.data?.data) {
        const doc = response.data.data;
        set({
          document: {
            id: doc.id,
            title: doc.title || 'Untitled',
            content: doc.content || '',
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            owner: doc.owner,
          },
          contextText: doc.context || '',
          chatHistory: [],
          lastSaved: new Date(doc.createdAt),
        });

        return doc.id;
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      set({ isLoading: false });
    }

    return null;
  },

  resetEditor: () => {
    set({
      document: initialDocument,
      chatHistory: [],
      contextText: '',
      isLoading: false,
      isSaving: false,
      lastSaved: null,
    });
  },
}));

export default useEditorStore;
