"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { conversationsApi } from "@/utils/api";
import { useChatContext } from "@/hooks/ChatContext";

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function ConversationList() {
  const { user, isLoading: authLoading } = useAuth();
  const { loadConversation } = useChatContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Fetch conversations when user is authenticated
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conversationsApi.getAll();
      setConversations(data);
      console.log("This is the conversation", data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const newConversation = await conversationsApi.create(newTitle);
      setConversations([newConversation, ...conversations]);
      setNewTitle("");
      console.log("This is the conversation", newConversation);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
};

  if (authLoading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  if (!user) {
    return <div className="p-4">Please log in to view conversations</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Conversations</h2>
      
      {/* Create new conversation form */}
      <form onSubmit={handleCreateConversation} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New conversation title"
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isLoading || !newTitle.trim()}
          >
            Create
          </button>
        </div>
      </form>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {isLoading ? (
        <div>Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div>No conversations yet. Create your first one!</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li 
              key={conversation.id} 
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={async () => {
                console.log("Loading conversation:", conversation.id);
                try {
                  await loadConversation(conversation.id);
                  console.log("Successfully loaded conversation:", conversation.id);
                } catch (error) {
                  console.error("Failed to load conversation:", error);
                }
              }}
            >
              <h3 className="font-medium">{conversation.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(conversation.updatedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
