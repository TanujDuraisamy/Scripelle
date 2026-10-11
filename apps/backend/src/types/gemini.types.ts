export interface ChatHistoryEntry {
    role: 'user' | 'ai';
    message: string;
    timestamp?: Date;
}

export interface DocumentChatRequest {
    message: string;
    documentId: string;
    model?: string;
}

export interface DocumentChatResponse {
    success: boolean;
    response: string;
    model: string;
    documentId: string;
    chatHistoryLength: number;
}

export interface DocumentChatHistoryResponse {
    success: boolean;
    documentId: string;
    chatHistory: string[];
    chatHistoryLength: number;
    lastUpdated: Date;
}

export interface GenerateProtectedRequest {
    prompt: string;
    model?: string;
    documentId?: string;
}

export interface GenerateProtectedResponse {
    success: boolean;
    response: string;
    model: string;
    userId: number;
    documentId?: string | null;
    chatHistoryLength?: number | null;
}
