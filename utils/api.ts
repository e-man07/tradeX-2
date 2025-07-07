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
export const getUserId = () : string | null => {
 
  try {
    const userId = localStorage.getItem('userId');
    if (userId) return userId;
    return null;
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
  
  // Debug information
  console.log('\n\n\nMaking authenticated request to:', url);
  console.log('User ID for request:', userId);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add user ID to headers if available
  if (userId) {
    headers['userId'] = userId;
    
    // Also try adding as Authorization header in case the API expects it there
    if (!headers['Authorization']) {
      headers['Authorization'] = `Bearer ${userId}`;
    }
  }

  // Check for token in localStorage
  const token = localStorage.getItem('authToken');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };
  
   console.log('Request headers:', headers);
   console.log('Request options:', {
    method: fetchOptions.method,
    hasBody: !!options.body
  });
  
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
    
    try {
      console.log('Fetching conversations for user:', userId);
      
      // Try with query parameter as fallback
      const url = `/api/conversations?userId=${encodeURIComponent(userId)}`;
      console.log("This is the URL, for fetching the conversations with auth", url);
      const response = await fetchWithAuth(url);
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to fetch conversations: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getAll conversations:', error);
      // Return empty array as fallback to prevent UI errors
      return [];
    }
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
