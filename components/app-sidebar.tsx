"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Trash2, MoreVertical, Copy, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { useBalance } from "@/hooks/useBalance";
import { RefreshCcw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useChatContext } from "@/hooks/ChatContext";
import { useAuth } from "@/hooks/AuthContext";
import { conversationsApi } from "@/utils/api";
import { useEffect } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state: sidebarState } = useSidebar();
  const {
    balance,
    tokens,
    totalBalance,
    tokenFetchError,
    listenForChanges,
    isFetching,
  } = useBalance();
  const { pubKey } = useWallet();
  const publickey = pubKey.slice(0, 5) + "..." + pubKey.slice(-5);
  const { clearMessages, setClearMessages, messages, setMessages, currentConversationId, setCurrentConversationId, loadConversation, shouldRefreshConversations, setShouldRefreshConversations } =
    useChatContext();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newTitle, setNewTitle] = React.useState("");
  // Now using the shared currentConversationId from ChatContext instead of local state

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await listenForChanges();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pubKey);
    setCopied(true);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Fetch conversations when component mounts or user changes
  React.useEffect(() => {
    if (user || pubKey) {
      fetchConversations();
    }
  }, [user, pubKey]);


  // function to fetch all the conversation 
  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      // Debug information
      console.log("Fetching conversations...");
      console.log("Current user or pubKey:", {user, pubKey});
      const storedUserId = localStorage.getItem('userId');
      console.log("Stored userId in localStorage:", storedUserId);
      const storedUser = localStorage.getItem('tradeXUser');
      console.log("Stored user in localStorage:", storedUser);
      
      // Check if we have a valid userId before making the API call
      if (!storedUserId) {
        throw new Error("No user ID available for API requests");
      }
      
      // Use the conversationsApi utility from utils/api.ts
      const data = await conversationsApi.getAll();
      console.log("Fetched conversations:", data);
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
      
      // If the API call fails, ensure we have a valid user ID
      if (!localStorage.getItem('userId') && pubKey) {
        // Try to get user ID from context or create one from pubKey
        const userId = user?.id || `wallet_${pubKey.substring(0, 8)}`;
        localStorage.setItem('userId', userId);
        console.log("Created and stored user ID for future requests:", userId);
        
        // Also create a minimal user object if none exists
        if (!localStorage.getItem('tradeXUser')) {
          const userEmail = localStorage.getItem('userEmail') || '';
          const username = userEmail ? userEmail.split('@')[0] : `user_${userId.substring(0, 5)}`;
          
          const userData = {
            id: userId,
            email: userEmail,
            username: username
          };
          
          localStorage.setItem('tradeXUser', JSON.stringify(userData));
          console.log("Created and stored user object:", userData);
        }
      }
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Function to delete a conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      // Try to use the conversationsApi first
      try {
        await conversationsApi.delete(conversationId);
      } catch (err) {
        // Fall back to direct fetch with pubKey
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'user-id': pubKey
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete conversation');
        }
      }
      
      // Remove the conversation from the state
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      
      // If the deleted conversation was the active one, reset the current conversation
      if (currentConversationId === conversationId) {
        setCurrentConversationId('');
        setMessages([]);
      }
      
      console.log('Conversation deleted successfully');
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Failed to delete conversation");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Function for loading the conversation when clicked - now just a wrapper around the shared loadConversation
  const handleLoadConversation = async (conversationId: string) => {
    try {
      setIsLoadingConversations(true);
      await loadConversation(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation. Please try again.");
    } finally {
      setIsLoadingConversations(false);
    }
  }

  useEffect(() => {
    console.log("Fetching conversations...");
    console.log("Current user or pubKey:", { user, pubKey });
    
    // Check if userId is in localStorage
    const storedUserId = localStorage.getItem('userId');
    console.log("Stored userId in localStorage:", storedUserId);
    
    // If no userId in localStorage but we have pubKey, store it
    if (!storedUserId && pubKey) {
      console.log("Storing pubKey as userId:", pubKey);
      localStorage.setItem('userId', user?.id || '');
    }
    
    fetchConversations();
  }, [user, pubKey]); // Re-run when user or pubKey changes
  
  // Listen for conversation refresh signals from ChatContext
  useEffect(() => {
    if (shouldRefreshConversations) {
      console.log('Refreshing conversations due to signal from ChatContext');
      fetchConversations();
      setShouldRefreshConversations(false);
    }
  }, [shouldRefreshConversations]);
  
  // Function to create a new conversation
  const createNewConversation = async () => {
    try {
      setIsLoadingConversations(true);
      setError(null);
      
      // Create a new conversation with default title
      const defaultTitle = `Conversation ${new Date().toLocaleString()}`;
      let newConversation;
      
      try {
        // Try to use the conversationsApi first
        newConversation = await conversationsApi.create(defaultTitle);
      } catch (err) {
        // Fall back to direct fetch with pubKey
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': pubKey
          },
          body: JSON.stringify({
            title: defaultTitle
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }
        
        newConversation = await response.json();
      }
      
      setConversations([newConversation, ...conversations]);
      console.log('New conversation created:', newConversation);
      
      // Set the newly created conversation as the active chat
      setCurrentConversationId(newConversation.id);
      
      // Load the conversation to update the chat area
      await loadConversation(newConversation.id);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-2 py-3">
        {sidebarState === 'expanded' ? (
          <div className="flex items-center gap-3 px-2">
            <div className="size-8 bg-gradient-to-br from-[#EAE4D5] to-[#B6B09F] flex items-center justify-center rounded-lg shadow-lg flex-shrink-0">
              <div className="size-5 rounded-full border-2 border-[#000000] shadow-[0_0_6px_1px_rgba(0,0,0,0.6)]" />
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-[#000000]" style={{ fontFamily: "'Space Grotesk', 'Josefin Sans', 'Ubuntu', sans-serif" }}>tradeX</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-12">
            <div className="size-8 bg-gradient-to-br from-[#EAE4D5] to-[#B6B09F] flex items-center justify-center rounded-lg shadow-lg">
              <div className="size-5 rounded-full border-2 border-[#000000] shadow-[0_0_6px_1px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Main content - only visible when expanded */}
      {sidebarState === 'expanded' && (
        <SidebarContent className="flex flex-col h-full overflow-hidden">
          {/* Wallet info - Compact version at the top */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">{publickey}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={copyToClipboard}
                      className="p-1 rounded hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-zinc-800 text-white border-zinc-700">
                    {copied ? 'Copied!' : 'Copy address'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button
                onClick={handleRefresh}
                className="p-1 rounded hover:bg-zinc-700"
                disabled={isRefreshing}
              >
                <RefreshCcw
                  size={14}
                  className={`transition-transform duration-1000 ease-in-out ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-gray-400 text-xs">{balance}</p>
            </div>
          </div>
          
          {/* Conversations section - Takes most of the space */}
          <div className="flex-grow overflow-hidden flex flex-col w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Conversations</h2>
              <button
                className="text-sm font-bold text-white p-2 bg-[#131313] rounded-lg backdrop-blur-sm shadow-inner shadow-white/10 hover:bg-white hover:text-black"
                onClick={async () => {
                // Reset the chat interface
                setMessages([]);
                setClearMessages(false);
                
                // Create a new conversation with default title
                const defaultTitle = `Conversation ${new Date().toLocaleString()}`;
                setIsLoadingConversations(true);
                setError(null);
                try {
                  let newConversation;
                  try {
                    // Try to use the conversationsApi first
                    newConversation = await conversationsApi.create(defaultTitle);
                  } catch (err) {
                    // Fall back to direct fetch with pubKey
                    const response = await fetch('/api/conversations', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'user-id': pubKey
                      },
                      body: JSON.stringify({
                        title: defaultTitle
                      }),
                    });
            
                    if (!response.ok) {
                      throw new Error('Failed to create conversation');
                    }
                    
                    newConversation = await response.json();
                  }
                  
                  setConversations([newConversation, ...conversations]);
                  console.log('New conversation created:', newConversation);
                  
                  // Set the newly created conversation as the active chat
                  setCurrentConversationId(newConversation.id);
                  
                  // Load the conversation to update the chat area
                  await loadConversation(newConversation.id);
                } catch (err) {
                  console.error("Error creating conversation:", err);
                  setError("Failed to create conversation");
                } finally {
                  setIsLoadingConversations(false);
                }
              }}
              disabled={isLoadingConversations}
            >
              New Conversation
            </button>
          </div>
          
          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          
          <div className="mt-2 space-y-2 flex-grow overflow-y-auto h-full">
            {isLoadingConversations ? (
              <p className="text-gray-400 text-sm">Loading conversations...</p>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`flex flex-col p-3 rounded-lg mb-2 cursor-pointer ${conversation.id === currentConversationId ? 'bg-[#262626]' : 'hover:bg-[#1a1a1a]'}`}
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1"
                      onClick={() => handleLoadConversation(conversation.id)}
                    >
                      <h3 className="text-white font-medium truncate">{conversation.title}</h3>
                      <p className="text-gray-400 text-xs">
                        {new Date(conversation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 text-gray-400 hover:text-white focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-[#1a1a1a] border-zinc-800">
                        <DropdownMenuItem 
                          className="text-red-500 focus:text-red-500 focus:bg-[#262626]"
                          onClick={() => deleteConversation(conversation.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-gray-300 text-sm truncate mt-1">
                    {conversation.messages && conversation.messages.length > 0 
                      ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + (conversation.messages[conversation.messages.length - 1].content.length > 50 ? '...' : '')
                      : 'No messages'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No conversations found. Create your first one!</p>
            )}
            </div>
          </div>
        
          {/* Holdings section - Collapsed into a dropdown */}
          <SidebarContent className="mt-2">
            <div className="w-full max-w-md p-4 bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-t border-zinc-800">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h2 className="text-sm font-bold text-white">Your Holdings</h2>
                  <svg className="w-5 h-5 text-white group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                <div className="mt-3 max-h-[200px] overflow-y-auto">
                  {tokenFetchError ? (
                    <p className="text-red-500 text-sm">{tokenFetchError}</p>
                  ) : isFetching ? (
                    <p className="text-gray-400 text-sm">Loading tokens...</p>
                  ) : tokens.length > 0 ? (
                    <ul className="space-y-2">
                      {tokens.map((token, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 backdrop-blur-sm shadow-inner bg-[#262626] shadow-white/10 border-zinc-800 rounded-lg"
                        >
                          <div>
                            <p className="text-white text-sm">{token.name}</p>
                            <p className="text-gray-400 text-xs">
                              {token.amount} {token.symbol}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-sm">
                              ${token.price.toFixed(3)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No tokens found.</p>
                  )}
                </div>
              </details>
            </div>
          </SidebarContent>
        </SidebarContent>
      )}

      {/* Collapsed state buttons */}
      {sidebarState === 'collapsed' && (
        <SidebarContent className="flex flex-col items-center gap-4 mt-4">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#131313] text-white hover:bg-zinc-700 transition-colors"
            onClick={createNewConversation}
            disabled={isLoadingConversations}
            title="New Conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </SidebarContent>
      )}
      
      <SidebarFooter>
        {sidebarState === 'expanded' ? (
          <NavUser />
        ) : (
          <button
            className="flex items-center justify-center w-full p-2 text-red-500 hover:bg-zinc-800 transition-colors"
            onClick={() => useWallet().logout()}
            title="Log out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
