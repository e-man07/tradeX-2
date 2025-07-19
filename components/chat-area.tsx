"use client";

import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { Bot, Send, User, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState, useContext } from "react";
import { Message as PrismaMessage, Conversation } from '@prisma/client';
import { conversationsApi } from '@/utils/api';
import { useChatContext, Message as ChatMessage } from '@/hooks/ChatContext';
import { AgentPersonality } from '@/utils/agentPersonality';
import { ErrorRecoverySystem } from '@/utils/errorRecovery';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BalanceContext, BalanceContextProps } from "@/hooks/useBalance";

interface ConversationWithMessages extends Conversation {
  isArchived?: boolean;
  messages?: PrismaMessage[];
}

interface ChatAreaProps {
  currentChat: ConversationWithMessages | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<ConversationWithMessages | null>>;
}

export function ChatArea({ currentChat, setCurrentChat }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  // Voice commands hook
  const { startListening, stopListening, transcript, isListening, error: voiceError, lastCommand } = useVoiceCommands();
  
  // Handle transcript updates
  useEffect(() => {
    if (transcript) {
      setVoiceTranscript(transcript);
      setInputValue(transcript);
    }
  }, [transcript]);
  
  // Handle voice commands
  useEffect(() => {
    if (lastCommand) {
      handleVoiceCommand(lastCommand);
    }
  }, [lastCommand]);
  
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { pubKey } = useWallet();
  const { processSwap, processTransfer, processNFTMint, processcreateCollection, processSPLTokenCreation } = useSolanaAgent();
  const balanceContext = useContext(BalanceContext);
  // Get shared state from ChatContext
  const { clearMessages, setClearMessages, messages, setMessages, currentConversationId, setCurrentConversationId, loadConversation, setShouldRefreshConversations } = useChatContext();
  
  if (!balanceContext) {
    return <div>Loading balance context...</div>; 
  }
  const { totalBalance } = balanceContext;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {  
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Listen for changes in the currentConversationId from ChatContext
  useEffect(() => {
    if (currentConversationId) {
      console.log('Current conversation ID changed:', currentConversationId);
      
      // Fetch conversation details to update the currentChat
      const fetchConversationDetails = async () => {
        try {
          const conversationData = await conversationsApi.getById(currentConversationId);
          
          setCurrentChat({
            id: currentConversationId,
            title: conversationData.title || 'Conversation',
            userId: localStorage.getItem('userId') || pubKey || '',
            createdAt: new Date(conversationData.createdAt || new Date()),
            updatedAt: new Date(conversationData.updatedAt || new Date()),
            isArchived: false,
            messages: messages.map((msg: ChatMessage) => ({
              id: msg.id,
              content: msg.content,
              senderType: msg.sender === 'User' ? 'User' : 'System',
              conversationId: msg.chatId || currentConversationId,
              senderId: null,
              createdAt: new Date(),
              updatedAt: new Date()
            })) as PrismaMessage[]
          });
        } catch (error) {
          console.error('Failed to fetch conversation details:', error);
        }
      };
      
      fetchConversationDetails();
    } else if (!currentConversationId && currentChat) {
      // If currentConversationId is cleared, clear the current chat too
      setCurrentChat(null);
    }
  }, [currentConversationId, messages]);
  
  // Update currentChat when messages change but keep the same conversation
  useEffect(() => {
    if (currentChat && currentConversationId === currentChat.id) {
      // Update currentChat with messages from context
      setCurrentChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: messages.map((msg: ChatMessage) => ({
            id: msg.id,
            content: msg.content,
            senderType: msg.sender === 'User' ? 'User' : 'System',
            conversationId: msg.chatId || prev.id,
            senderId: null,
            createdAt: new Date(),
            updatedAt: new Date()
          })) as PrismaMessage[]
        };
      });
    }
  }, [messages]);


  const createNewMessage = (content: string, sender: 'User' | 'System', metadata?: any): PrismaMessage => {
    return {
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      content,
      senderType: sender,
      conversationId: currentChat?.id || Math.random().toString(36).substr(2, 9), // Use a fallback ID if currentChat.id is undefined
      senderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...metadata
    } as PrismaMessage;
  };

  // Helper function to generate a title from the first message
  const generateTitleFromMessage = (message: string): string => {
    // Get the first 5 words or 30 characters, whichever is shorter
    const words = message.trim().split(/\s+/);
    const titleWords = words.slice(0, 5).join(' ');
    
    // Ensure the title isn't too long (max 30 chars)
    if (titleWords.length > 30) {
      return titleWords.substring(0, 27) + '...';
    }
    
    return titleWords;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setInputValue("");
    setIsTyping(true);

    try {
      // Create new chat if none exists
      if (!currentChat) {
        try {
          // Generate a title from the first message
          const initialTitle = generateTitleFromMessage(inputValue);
          
          // Create a new conversation via API with the generated title
          const newConversation = await conversationsApi.create(initialTitle);
          
          // Set the current conversation ID in the shared context
          setCurrentConversationId(newConversation.id);
          
          const newChat: ConversationWithMessages = {
            id: newConversation.id,
            title: initialTitle, // Use the generated title
            userId: newConversation.userId,
            createdAt: new Date(newConversation.createdAt),
            updatedAt: new Date(newConversation.updatedAt),
            isArchived: false,
            messages: []
          };
          setCurrentChat(newChat);
          
          // Signal to the sidebar that conversations should be refreshed
          setShouldRefreshConversations(true);
        } catch (error) {
          console.error('Failed to create new conversation:', error);
          // Fallback to local chat creation if API fails
          const randomId = Math.random().toString(36).substr(2, 9);
          
          // Set the current conversation ID in the shared context even for local chats
          setCurrentConversationId(randomId);
          
          // Generate a title from the first message for local chats too
          const initialTitle = generateTitleFromMessage(inputValue);
          
          const newChat: ConversationWithMessages = {
            id: randomId,
            title: initialTitle, // Use the generated title
            userId: pubKey || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false,
            messages: []
          };
          setCurrentChat(newChat);
          
          // Signal to the sidebar that conversations should be refreshed
          setShouldRefreshConversations(true);
        }
      }

      // Add user message to both local state and ChatContext
      const userMessage = createNewMessage(inputValue, 'User');
      
      // Update currentChat state
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return { messages: [userMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), userMessage]
        } as ConversationWithMessages;
      });
      
      // Update messages in ChatContext
      setMessages((prevMessages: ChatMessage[]) => {
        const newMessages = [...prevMessages, {
          id: userMessage.id,
          content: userMessage.content,
          sender: userMessage.senderType as 'User' | 'System',
          chatId: currentChat?.id
        }];
        
        // Check if this is the first message and update the title
        // The condition has been simplified to ensure it runs for the first message
        if (prevMessages.length === 0 && currentChat?.id) {
          const newTitle = generateTitleFromMessage(inputValue);
          console.log('Updating conversation title to:', newTitle);
          
          // Update the title in the UI immediately
          if (currentChat) {
            setCurrentChat({
              ...currentChat,
              title: newTitle
            });
          }
          
          // Update the title in the database
          conversationsApi.updateTitle(currentChat.id, newTitle)
            .then(() => {
              console.log('Successfully updated conversation title');
              // Signal to the sidebar that conversations should be refreshed to show the new title
              setShouldRefreshConversations(true);
            })
            .catch(error => {
              console.error('Failed to update conversation title:', error);
            });
        }
        
        return newMessages;
      });
      
      // If we have a valid conversation ID, send the message to the API
      if (currentChat?.id && isValidObjectId(currentChat.id)) {
        try {
          // Send the message to the API
          await conversationsApi.addMessages(currentChat.id, [{
            content: inputValue,
            senderType: 'User'
          }]);
          
          // If this is the first message, ensure we update the title after the message is sent
          if (messages.length === 0) {
            const newTitle = generateTitleFromMessage(inputValue);
            console.log('Updating conversation title after sending first message:', newTitle);
            
            try {
              await conversationsApi.updateTitle(currentChat.id, newTitle);
              console.log('Successfully updated conversation title after sending message');
              
              // Update the title in the UI
              if (currentChat) {
                setCurrentChat({
                  ...currentChat,
                  title: newTitle
                });
              }
              
              // Signal to the sidebar that conversations should be refreshed
              setShouldRefreshConversations(true);
            } catch (titleError) {
              console.error('Failed to update conversation title after sending message:', titleError);
            }
          }
        } catch (error) {
          console.error('Failed to save message to API:', error);
          // Continue with local message handling
        }
      }

      // Get AI response
      const result = await axios.post("/api/generate", {
        prompt: inputValue,
      });

      let signature;
      console.log("case ----> ", result.data.response.interface);
      switch (result.data.response.interface) {
        case "regularPrompt":
          // Add personality to the response
          const enhancedContent = addPersonality(result.data.response.message.content);
          const systemMessage = createNewMessage(enhancedContent, 'System');
          
          // Update currentChat state
          setCurrentChat((prev: ConversationWithMessages | null) => {
            if (!prev) return { messages: [systemMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
            return { 
              ...prev, 
              messages: [...(prev.messages || []), systemMessage]
            } as ConversationWithMessages;
          });
          
          // Update messages in ChatContext
          setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
            id: systemMessage.id,
            content: systemMessage.content,
            sender: systemMessage.senderType as 'User' | 'System',
            chatId: currentChat?.id
          }]);
          
          // If we have a valid conversation ID, send the system message to the API
          if (currentChat?.id && isValidObjectId(currentChat.id)) {
            try {
              // Send the message to the API
              await conversationsApi.addMessages(currentChat.id, [{
                content: enhancedContent,
                senderType: 'System'
              }]);
            } catch (error) {
              console.error('Failed to save system message to API:', error);
              // Continue with local message handling
            }
          }
          break;
        case "SwapData":
          console.log(
            "This is the data response", result.data.response
          )
          signature = await processSwap(result.data.response);
          break;
        case "TransferData":
          signature = await processTransfer(result.data.response);
          break;
        // case "pumpFunTokenData":
        //   signature = await processPumpFunToken(result.data.response);
        //   break;
        case "mintNFT":
          await handleAction(result.data.response);
          break;
        case "createCollection":
          await handleCreateCollection(result.data.response);
          break;
        case "createSPLToken":
          await handleCreateSPLToken(result.data.response);
          break;
        case "fetchBalance": 
          await handleFetchBalance(result.data.response);
          break;
        default:
          console.error("Unexpected interface:", result.data.response.interface);
          throw new Error("Please refine your prompt!");
      }

      if (signature) {
        const signatureMessage = createNewMessage(
          `Transaction successful! Signature: ${signature}`,
          'System',
          { signature }
        );
        setCurrentChat((prev: ConversationWithMessages | null) => {
          if (!prev) return { messages: [signatureMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
          return { 
            ...prev, 
            messages: [...(prev.messages || []), signatureMessage]
          } as ConversationWithMessages;
        });
        
        // Update messages in ChatContext
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
          id: signatureMessage.id,
          content: signatureMessage.content,
          sender: signatureMessage.senderType as 'User' | 'System',
          chatId: currentChat?.id
        }]);
        
        // If we have a valid conversation ID, send the signature message to the API
        if (currentChat?.id && isValidObjectId(currentChat.id)) {
          try {
            // Send the message to the API
            await conversationsApi.addMessages(currentChat.id, [{
              content: `Transaction successful! Signature: ${signature}`,
              senderType: 'System'
            }]);
          } catch (error) {
            console.error('Failed to save signature message to API:', error);
            // Continue with local message handling
          }
        }
      }
    } catch (error: any) {
      const errorMessage = createNewMessage(`Error: ${error.message}`, 'System');
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return { messages: [errorMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), errorMessage]
        } as ConversationWithMessages;
      });
      
      // If we have a valid conversation ID, send the error message to the API
      if (currentChat?.id && isValidObjectId(currentChat.id)) {
        try {
          // Send the message to the API
          await conversationsApi.addMessages(currentChat.id, [{
            content: `Error: ${error.message}`,
            senderType: 'System'
          }]);
        } catch (apiError) {
          console.error('Failed to save error message to API:', apiError);
          // Continue with local message handling
        }
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to save system messages to database
  const saveSystemMessageToDatabase = async (content: string) => {
    if (currentChat?.id && isValidObjectId(currentChat.id)) {
      try {
        await conversationsApi.addMessages(currentChat.id, [{
          content,
          senderType: 'System'
        }]);
        console.log('Successfully saved system message to database');
      } catch (error) {
        console.error('Failed to save system message to database:', error);
      }
    } else {
      console.warn('System message NOT saved to database - invalid conversation ID');
    }
  };

  // Enhanced error handling with personality and recovery suggestions
  const handleEnhancedError = async (error: any, context?: string) => {
    const recovery = ErrorRecoverySystem.analyzeError(error);
    const personalityResponse = AgentPersonality.getErrorMessage(
      recovery.error, 
      recovery.suggestion
    );
    
    const enhancedMessage = ErrorRecoverySystem.formatErrorMessage(recovery);
    const errorMessage = createNewMessage(enhancedMessage, 'System');
    
    // Update local state
    setCurrentChat((prev: ConversationWithMessages | null) => {
      if (!prev) return { messages: [errorMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
      return { 
        ...prev, 
        messages: [...(prev.messages || []), errorMessage]
      } as ConversationWithMessages;
    });
    
    // Save to database
    await saveSystemMessageToDatabase(enhancedMessage);
    
    // Auto-retry if suggested
    if (recovery.autoRetry && recovery.retryDelay) {
      setTimeout(() => {
        console.log('Auto-retrying after error...');
        // Could implement retry logic here
      }, recovery.retryDelay);
    }
    
    return recovery;
  };

  // Voice command handler
  const handleVoiceCommand = async (command: any) => {
    const personalityResponse = AgentPersonality.getVoiceCommandResponse(command.originalText);
    
    // Show voice command acknowledgment
    const voiceMessage = createNewMessage(personalityResponse.message, 'System');
    setCurrentChat((prev: ConversationWithMessages | null) => {
      if (!prev) return { messages: [voiceMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
      return { 
        ...prev, 
        messages: [...(prev.messages || []), voiceMessage]
      } as ConversationWithMessages;
    });
    
    await saveSystemMessageToDatabase(personalityResponse.message);
    
    // Execute the command
    try {
      switch (command.action) {
        case 'swap':
          await handleSwapVoiceCommand(command.params);
          break;
        case 'transfer':
          await handleTransferVoiceCommand(command.params);
          break;
        case 'balance':
          await handleFetchBalance({});
          break;
        case 'create_token':
          await handleCreateSPLToken(command.params);
          break;
        case 'mint_nft':
          await handleAction({ type: 'mintNFT', ...command.params });
          break;
        case 'create_collection':
          await handleCreateCollection(command.params);
          break;
        default:
          throw new Error(`Unknown voice command: ${command.action}`);
      }
    } catch (error) {
      await handleEnhancedError(error, `Voice command: ${command.originalText}`);
    }
  };

  // Voice command specific handlers
  const handleSwapVoiceCommand = async (params: any) => {
    const signature = await processSwap(params);
    const successResponse = AgentPersonality.getSuccessMessage('swap', 
      `🎉 Successfully swapped ${params.amount} ${params.from} to ${params.to}!\n\n📝 **Transaction Signature:** ${signature}`);
    
    const successMessage = createNewMessage(successResponse.message, 'System');
    setCurrentChat((prev: ConversationWithMessages | null) => {
      if (!prev) return { messages: [successMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
      return { 
        ...prev, 
        messages: [...(prev.messages || []), successMessage]
      } as ConversationWithMessages;
    });
    
    await saveSystemMessageToDatabase(successResponse.message);
  };

  const handleTransferVoiceCommand = async (params: any) => {
    const signature = await processTransfer(params);
    const successResponse = AgentPersonality.getSuccessMessage('transfer', 
      `🎉 Successfully sent ${params.amount} ${params.token} to ${params.recipient}!\n\n📝 **Transaction Signature:** ${signature}`);
    
    const successMessage = createNewMessage(successResponse.message, 'System');
    setCurrentChat((prev: ConversationWithMessages | null) => {
      if (!prev) return { messages: [successMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
      return { 
        ...prev, 
        messages: [...(prev.messages || []), successMessage]
      } as ConversationWithMessages;
    });
    
    await saveSystemMessageToDatabase(successResponse.message);
  };

  // Helper function to add personality to regular responses
  const addPersonality = (content: string): string => {
    // Add helpful tips occasionally
    const shouldAddTip = Math.random() < 0.3;
    if (shouldAddTip) {
      const tip = AgentPersonality.getHelpfulTip();
      return `${content}\n\n💡 ${tip.message}`;
    }
    
    // Add encouraging remarks for certain keywords
    if (content.toLowerCase().includes('success') || content.toLowerCase().includes('completed')) {
      const encouragement = AgentPersonality.getEncouragingMessage();
      return `${encouragement.message}\n\n${content}`;
    }
    
    return content;
  };

  const handleAction = async (action: any) => {
    try {
      let signature = "";
      let tokenAddress = "";
      let metadataURI = "";

      switch (action.type) {
        case "mintNFT": {
          const { name, description, image, collectionMint } = action.data;
          const result = await processNFTMint({
            name,
            description,
            image,
            collectionMint
          });
          
          // Add success message
          const successContent = `✅ NFT minted successfully!\nMint Address: ${result.mint.toString()}\nMetadata Address: ${result.metadata.toString()}`;
          const successMessage = createNewMessage(successContent, 'System');
          
          setCurrentChat((prev: ConversationWithMessages | null) => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...(prev.messages || []), successMessage]
            };
          });
          
          // Update messages in ChatContext
          setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
            id: successMessage.id,
            content: successMessage.content,
            sender: successMessage.senderType as 'User' | 'System',
            chatId: currentChat?.id
          }]);
          
          // Save to database
          await saveSystemMessageToDatabase(successContent);
          break;
        }
        default:
          console.error("Unexpected action type:", action.type);
          throw new Error("Please refine your prompt!");
      }
    } catch (error: any) {
      const errorMessage = createNewMessage(`Error: ${error.message}`, 'System');
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return { messages: [errorMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), errorMessage]
        } as ConversationWithMessages;
      });
    }
  };

  const handleCreateCollection = async (action: any) => {
    try {
      const collectionData = action.data;
      const result = await processcreateCollection({
        name: collectionData.name,
        symbol: collectionData.symbol,
        description: collectionData.description,
        image: collectionData.image,
        royaltyBasisPoints: collectionData.royaltyBasisPoints,
        creators: collectionData.creators
      });
      
      // Add success message with collection address using personality
      const personalityResponse = AgentPersonality.getSuccessMessage('createCollection', 
        `📚 **Collection Name:** ${collectionData.name}\n🏷️ **Collection Address:** ${result.collectionAddress.toString()}\n📝 **Transaction:** ${result.signature}`);
      const successMessage = createNewMessage(personalityResponse.message, 'System');
      
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), successMessage]
        };
      });
      
      // Update messages in ChatContext
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
        id: successMessage.id,
        content: successMessage.content,
        sender: successMessage.senderType as 'User' | 'System',
        chatId: currentChat?.id
      }]);
      
      // Save to database
      await saveSystemMessageToDatabase(personalityResponse.message);
    } catch (error: any) {
      await handleEnhancedError(error, 'Collection creation');
    }
  };

  const handleCreateSPLToken = async (action: any) => {
    try {
      const tokenData = action.data;
      const result = await processSPLTokenCreation({
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        image: tokenData.image,
        decimals: tokenData.decimals || 9,
        initialSupply: tokenData.initialSupply || 1000000
      });
      
      // Add success message with token details
      const successMessage = createNewMessage(
        `🪙 SPL Token created successfully!\n` +
        `📛 Name: ${tokenData.name}\n` +
        `🔖 Symbol: ${tokenData.symbol}\n` +
        `📍 Token Address: ${result.tokenAddress.toString()}\n` +
        `🔗 Transaction: ${result.signature}\n` +
        `📊 Initial Supply: ${tokenData.initialSupply || 1000000} tokens\n` +
        `🎯 Decimals: ${tokenData.decimals || 9}\n` +
        `📝 Metadata: ${result.metadataUri}`,
        'System'
      );
      
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), successMessage]
        };
      });
      
      // Update messages in ChatContext
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
        id: successMessage.id,
        content: successMessage.content,
        sender: successMessage.senderType as 'User' | 'System',
        chatId: currentChat?.id
      }]);
      
      // If we have a valid conversation ID, send the success message to the API
      if (currentChat?.id && isValidObjectId(currentChat.id)) {
        try {
          await conversationsApi.addMessages(currentChat.id, [{
            content: successMessage.content,
            senderType: 'System'
          }]);
        } catch (error) {
          console.error('Failed to save SPL token success message to API:', error);
        }
      }
    } catch (error: any) {
      const errorMessage = createNewMessage(`❌ SPL Token creation failed: ${error.message}`, 'System');
      setCurrentChat((prev: ConversationWithMessages | null) => {
        if (!prev) return { messages: [errorMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), errorMessage]
        } as ConversationWithMessages;
      });
      
      // Update messages in ChatContext
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
        id: errorMessage.id,
        content: errorMessage.content,
        sender: errorMessage.senderType as 'User' | 'System',
        chatId: currentChat?.id
      }]);
      
      // If we have a valid conversation ID, send the error message to the API
      if (currentChat?.id && isValidObjectId(currentChat.id)) {
        try {
          await conversationsApi.addMessages(currentChat.id, [{
            content: errorMessage.content,
            senderType: 'System'
          }]);
        } catch (apiError) {
          console.error('Failed to save SPL token error message to API:', apiError);
        }
      }
    }
  };

  /**
   * Function to fetch the user wallet balance whenever asked by LLM 
   * @param response 
   */
  const handleFetchBalance = async (response: any) => {
    console.log("Balance fetch requested by LLM:", response); // Keep for debugging
    const balanceMessage: PrismaMessage = {
      id: `balance-${Date.now()}`,
      content: `Your total wallet balance is approximately $${totalBalance.toFixed(2)}. Please note this is an estimate based on current token prices.`,
      senderType: 'System',
      senderId: null,
      conversationId: currentChat?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    } as PrismaMessage;

    // Update currentChat state
    setCurrentChat((prev: ConversationWithMessages | null) => {
      if (!prev) return { messages: [balanceMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ConversationWithMessages;
      return { 
        ...prev, 
        messages: [...(prev.messages || []), balanceMessage]
      } as ConversationWithMessages;
    });
    
    // Update messages in ChatContext
    setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
      id: balanceMessage.id,
      content: balanceMessage.content,
      sender: balanceMessage.senderType as 'User' | 'System',
      chatId: currentChat?.id
    }]);
    
    // If we have a valid conversation ID, send the balance message to the API
    if (currentChat?.id && isValidObjectId(currentChat.id)) {
      try {
        // Send the message to the API
        await conversationsApi.addMessages(currentChat.id, [{
          content: balanceMessage.content,
          senderType: 'System'
        }]);
      } catch (error) {
        console.error('Failed to save balance message to API:', error);
        // Continue with local message handling
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-[75vh] bg-[#000000] rounded-lg border border-[#B6B09F] shadow-lg">
      {/* Chat Header */}
      <div className="p-3 border-b border-[#B6B09F]">
        <h1 className="font-medium tracking-tight text-lg text-[#F2F2F2]" style={{ fontFamily: "'Space Grotesk', 'Josefin Sans', 'Ubuntu', sans-serif" }}>
          tradeX AI Assistant
        </h1>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatWindowRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-[#B6B09F] scrollbar-track-transparent bg-[#000000]"
        style={{ fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}
      >
        {currentChat?.messages?.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2 items-start",
              message.senderType === "User" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
              message.senderType === "User" ? "bg-[#EAE4D5]" : "bg-[#B6B09F]"
            )}>
              {message.senderType === "User" ? (
                <User className="w-3.5 h-3.5 text-[#000000]" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-[#000000]" />
              )}
            </div>

            {/* Message */}
            <div
              className={cn(
                "px-3 py-2 rounded-lg text-sm max-w-[80%] break-words",
                message.senderType === "User" 
                  ? "bg-[#EAE4D5] text-[#000000] rounded-tr-none ml-auto" 
                  : "bg-[#B6B09F] text-[#000000] rounded-tl-none"
              )}
              style={{ overflowWrap: 'break-word', fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B6B09F] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#000000]" />
            </div>
            <div className="px-3 py-2 rounded-lg text-sm bg-[#B6B09F] text-[#000000]">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#000000] rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-[#000000] rounded-full animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-[#000000] rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative p-3 border-t border-[#B6B09F] bg-[#000000]">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={voiceTranscript || "Ask anything about Solana tokens..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-[#111111] text-[#F2F2F2] text-sm px-3 py-2.5 rounded-lg outline-none border border-[#B6B09F] focus:border-[#EAE4D5] focus:ring-1 focus:ring-[#EAE4D5]/30 transition-colors"
            style={{ fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}
          />
          
          {/* Voice Command Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`p-2.5 rounded-lg transition-colors border border-[#B6B09F] ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-[#2D2D2D] text-[#F2F2F2] hover:bg-[#3D3D3D]'
            }`}
            title={isListening ? "Stop Listening" : "Start Voice Command"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            type="submit"
            className="p-2.5 rounded-lg bg-[#EAE4D5] text-[#000000] hover:bg-[#F2F2F2] transition-colors disabled:opacity-50 border border-[#B6B09F]"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
