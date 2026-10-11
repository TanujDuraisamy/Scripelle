// Frontend TypeScript types for Autocompletion API

export interface AutocompletionRequest {
  text: string;
  cursorPosition?: number;
  context?: string;
  documentType?: 'email' | 'article' | 'code' | 'general';
  maxSuggestions?: number;
  strategy?: 'ai' | 'contextual' | 'hybrid';
}

export interface SuggestionItem {
  id: string;
  text: string;
  type: 'completion' | 'continuation' | 'replacement';
  confidence: number;
  context?: string;
  preview?: string;
}

export interface AutocompletionResponse {
  suggestions: SuggestionItem[];
  strategy: string;
  processingTime: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Frontend utility class for autocompletion
export class AutocompletionClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getSuggestions(request: AutocompletionRequest): Promise<AutocompletionResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/autocompletion/suggestions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<AutocompletionResponse> = await response.json();
    return result.data;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }
}

// React Hook for autocompletion
export function useAutocompletion(baseUrl: string, authToken?: string) {
  const client = new AutocompletionClient(baseUrl, authToken);

  const getSuggestions = async (
    text: string,
    cursorPosition?: number,
    options?: Partial<AutocompletionRequest>
  ): Promise<SuggestionItem[]> => {
    try {
      const request: AutocompletionRequest = {
        text,
        cursorPosition,
        strategy: 'hybrid',
        maxSuggestions: 5,
        documentType: 'general',
        ...options,
      };

      const response = await client.getSuggestions(request);
      return response.suggestions;
    } catch (error) {
      console.error('Autocompletion error:', error);
      return [];
    }
  };

  return { getSuggestions };
}

// Example usage for frontend:
/*
// In your React component:
import { useAutocompletion, SuggestionItem } from './types/autocompletion';

function MyTextEditor() {
  const { getSuggestions } = useAutocompletion('http://localhost:5000');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [text, setText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleTextChange = async (newText: string, newCursorPos: number) => {
    setText(newText);
    setCursorPosition(newCursorPos);

    // Get suggestions when user stops typing
    const newSuggestions = await getSuggestions(newText, newCursorPos, {
      documentType: 'email',
      strategy: 'hybrid'
    });
    setSuggestions(newSuggestions);
  };

  const applySuggestion = (suggestion: SuggestionItem) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    const newText = beforeCursor + suggestion.text + afterCursor;
    setText(newText);
    setCursorPosition(cursorPosition + suggestion.text.length);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value, e.target.selectionStart)}
        onSelect={(e) => setCursorPosition(e.target.selectionStart)}
      />

      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => applySuggestion(suggestion)}
              className="suggestion-item"
            >
              {suggestion.text}
              <small>({Math.round(suggestion.confidence * 100)}%)</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
*/
