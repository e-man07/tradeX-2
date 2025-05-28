/**
 * Utility functions for making API requests with authentication
 */

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

/**
 * Get the user ID from localStorage
 */
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get userId directly as a string - no need to parse JSON
    const userId = localStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Make an authenticated API request with the user ID in headers
 */
export const fetchWithAuth = async (url: string, options: ApiOptions = {}) => {
  const userId = getUserId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add user ID to headers if available
  if (userId) {
    headers['user-id'] = userId;
  }
  

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };
  
  return fetch(url, fetchOptions);
};

/**
 * API functions for conversations
 */
export const conversationsApi = {
  // Get all conversations
  getAll: async () => {
    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');
    
    const response = await fetchWithAuth('/api/conversations');
    console.log("Response data:", response);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return response.json();
  },
  
  // Get a single conversation by ID
  getById: async (conversationId: string) => {
    const response = await fetchWithAuth(`/api/conversations/${conversationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  },
  
  // Create a new conversation
  create: async (title: string) => {
    const response = await fetchWithAuth('/api/conversations', {
      method: 'POST',
      body: { title }
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
  },
  
  // Add messages to a conversation
  addMessages: async (conversationId: string, messages: any[]) => {
    console.log('Sending messages to API:', { conversationId, messages });
    const response = await fetchWithAuth(`/api/conversations/${conversationId}`, {
      method: 'POST',
      body: { content: messages }
    });
    if (!response.ok) {
      throw new Error('Failed to add messages');
    }
    return response.json();
  },
  
  // Update a conversation title
  updateTitle: async (conversationId: string, title: string) => {
    const response = await fetchWithAuth(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      body: { title }
    });
    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }
    return response.json();
  },
  
  // Delete a conversation
  delete: async (conversationId: string) => {
    const response = await fetchWithAuth(`/api/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
    return response.json();
  }
};
