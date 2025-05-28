import React, { createContext, useContext, useState } from "react";

interface ChatContextType {
  clearMessages: boolean;
  setClearMessages: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentConversationId: string | null;
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  loadConversation: (conversationId: string) => Promise<void>;
  shouldRefreshConversations: boolean;
  setShouldRefreshConversations: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface Message {
  id: string;
  sender: "User" | "System";
  content: string;
  chatId?: string;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);

import { conversationsApi } from '@/utils/api';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [clearMessages, setClearMessages] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [shouldRefreshConversations, setShouldRefreshConversations] = useState<boolean>(false);

  // Function to load a conversation by ID - shared between components
  const loadConversation = async (conversationId: string) => {
    try {
      console.log('ChatContext: Loading conversation:', conversationId);
      
      // Set the current conversation ID immediately for UI feedback
      setCurrentConversationId(conversationId);
      
      // Use the conversationsApi utility to fetch conversation data
      const data = await conversationsApi.getById(conversationId);
      console.log('ChatContext: Loaded conversation data:', data);
      
      // Convert the messages to the format expected by the chat context
      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          sender: msg.senderType, // Make sure this matches the expected enum values
          content: msg.content,
          chatId: msg.conversationId || conversationId,
          createdAt: new Date(msg.createdAt)
        }));
        
        console.log('ChatContext: Setting formatted messages:', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.warn('ChatContext: No messages found in conversation or invalid format');
        // Even if there are no messages, we still want to set the current conversation
        setMessages([]);
      }
    } catch (error) {
      console.error('ChatContext: Error loading conversation:', error);
      // Clear messages but keep the conversation ID
      setMessages([]);
    }
  };

  return (
    <ChatContext.Provider
      value={{ 
        clearMessages, 
        setClearMessages, 
        messages, 
        setMessages, 
        currentConversationId, 
        setCurrentConversationId,
        loadConversation,
        shouldRefreshConversations,
        setShouldRefreshConversations
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
