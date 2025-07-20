"use client";

import { useWallet } from "@/hooks/useWallet";
import React, { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatArea } from "./chat-area";
import { ArrowUp, ArrowUpRight, Sparkles } from "lucide-react";
import { ChatProvider } from "@/hooks/ChatContext";
import { Message, Conversation } from '@prisma/client';
import NetworkToggle from "./NetworkToggle";

interface ConversationWithMessages extends Conversation {
  messages?: Message[];
}

export default function Chat() {
  const { processTransfer, processSwap } = useSolanaAgent();
  const { balance } = useBalance();
  const wallet = useWallet();
  const [currentChat, setCurrentChat] = useState<ConversationWithMessages | null>(null);
  
  // States for modals
  const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Form states
  const [tokenData, setTokenData] = useState({
    tokenName: '',
    tokenTicker: '',
    tokenDescription: '',
    tokenImage: null as File | null
  });
  
  const [swapData, setSwapData] = useState({
    from: 'SOL',
    to: 'USDC',
    amount: ''
  });
  
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    token: 'SOL'
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handler functions for quick actions
  const handleCreateToken = () => {
    // Show modal to collect token data
    setShowCreateTokenModal(true);
  };
  
  const handleSwapTokens = () => {
    // Show modal to collect swap data
    setShowSwapModal(true);
  };
  
  const handleTransferSOL = () => {
    // Show modal to collect transfer data
    setShowTransferModal(true);
  };
  
  // Submit handlers for forms
  // const submitCreateToken = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!tokenData.tokenName || !tokenData.tokenTicker || !tokenData.tokenDescription || !tokenData.tokenImage) {
  //     alert('Please fill all fields');
  //     return;
  //   }
    
  //   try {
  //     setIsLoading(true);
  //     const result = await processPumpFunToken({
  //       tokenName: tokenData.tokenName,
  //       tokenTicker: tokenData.tokenTicker,
  //       tokenDescription: tokenData.tokenDescription,
  //       tokenImage: tokenData.tokenImage
  //     });
  //     alert(`Token created successfully! Token address: ${result.tokenAddress}`);
  //     setShowCreateTokenModal(false);
  //   } catch (error: any) {
  //     alert(`Error creating token: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  const submitSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapData.from || !swapData.to || !swapData.amount) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      const signature = await processSwap({
        from: swapData.from,
        to: swapData.to,
        amount: swapData.amount
      });
      alert(`Swap successful! Transaction signature: ${signature}`);
      setShowSwapModal(false);
    } catch (error: any) {
      alert(`Error swapping tokens: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const submitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.recipient || !transferData.amount || !transferData.token) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      const signature = await processTransfer({
        recipient: transferData.recipient,
        amount: transferData.amount,
        token: transferData.token
      });
      alert(`Transfer successful! Transaction signature: ${signature}`);
      setShowTransferModal(false);
    } catch (error: any) {
      alert(`Error transferring tokens: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckBalance = () => {
    // Display balance information
    alert(`Your current balance: ${balance ? balance.toString() : 'Loading...'} SOL`);
  };
  
  const handleViewTransactionHistory = () => {
    // Placeholder for transaction history functionality
    alert('Transaction history feature coming soon!');
  };

  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#B6B09F] px-4 transition-[width,height] ease-linear bg-[#000000] text-[#F2F2F2]">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-[#EAE4D5]" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-[#B6B09F]" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="flex items-center gap-2 text-[#EAE4D5] hover:text-[#F2F2F2]">
                      <Sparkles className="h-4 w-4 text-[#EAE4D5]" />
                      tradeX AI Assistant
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-[#B6B09F]" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-[#F2F2F2]">Chat Session</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto">
              <NetworkToggle />
            </div>
          </header>

          {/* Main Content */}
          <section className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] p-2 md:p-3 bg-[#000000] text-[#F2F2F2]">
            {/* Chat Area */}
            <div className="w-full max-w-6xl mx-auto">
              <ChatArea 
                currentChat={currentChat}
                setCurrentChat={setCurrentChat}
              />
            </div>

            {/* Quick Actions - Removed functionality */}
            <div className="w-full max-w-4xl mx-auto mt-6 space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                <QuickAction text="Create a new token" />
                <QuickAction text="Swap tokens" />
                <QuickAction text="Transfer SOL" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <QuickAction text="Check balance" />
                <QuickAction text="View transaction history" />
              </div>
            </div>
            
            {/* Modals */}
            {/* Create Token Modal */}
            {/* {showCreateTokenModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" style={{ fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}>
                <div className="bg-[#000000] rounded-lg shadow-xl w-full max-w-md p-6 border border-[#B6B09F]">
                  <h2 className="text-xl font-bold mb-4 text-[#EAE4D5]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create New Token</h2>
                  <form onSubmit={submitCreateToken}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Token Name</label>
                        <input 
                          type="text" 
                          value={tokenData.tokenName}
                          onChange={(e) => setTokenData({...tokenData, tokenName: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="My Token"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Token Ticker</label>
                        <input 
                          type="text" 
                          value={tokenData.tokenTicker}
                          onChange={(e) => setTokenData({...tokenData, tokenTicker: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="MTK"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Description</label>
                        <textarea 
                          value={tokenData.tokenDescription}
                          onChange={(e) => setTokenData({...tokenData, tokenDescription: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="Describe your token"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Token Image</label>
                        <input 
                          type="file" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setTokenData({...tokenData, tokenImage: e.target.files[0]});
                            }
                          }}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          accept="image/*"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateTokenModal(false)}
                        className="px-4 py-2 bg-[#111111] text-[#F2F2F2] rounded-md hover:bg-[#222222] transition-colors border border-[#B6B09F]"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#EAE4D5] text-[#000000] font-medium rounded-md hover:bg-[#F2F2F2] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Creating...' : 'Create Token'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )} */}
            
            {/* Swap Tokens Modal */}
            {showSwapModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" style={{ fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}>
                <div className="bg-[#000000] rounded-lg shadow-xl w-full max-w-md p-6 border border-[#B6B09F]">
                  <h2 className="text-xl font-bold mb-4 text-[#EAE4D5]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Swap Tokens</h2>
                  <form onSubmit={submitSwap}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">From</label>
                        <select 
                          value={swapData.from}
                          onChange={(e) => setSwapData({...swapData, from: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">To</label>
                        <select 
                          value={swapData.to}
                          onChange={(e) => setSwapData({...swapData, to: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Amount</label>
                        <input 
                          type="number" 
                          step="0.000001"
                          value={swapData.amount}
                          onChange={(e) => setSwapData({...swapData, amount: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowSwapModal(false)}
                        className="px-4 py-2 bg-[#111111] text-[#F2F2F2] rounded-md hover:bg-[#222222] transition-colors border border-[#B6B09F]"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#B6B09F] text-[#000000] font-medium rounded-md hover:bg-[#EAE4D5] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Swapping...' : 'Swap Tokens'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Transfer Modal */}
            {showTransferModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" style={{ fontFamily: "'Josefin Sans', 'Space Grotesk', 'Ubuntu', sans-serif" }}>
                <div className="bg-[#000000] rounded-lg shadow-xl w-full max-w-md p-6 border border-[#B6B09F]">
                  <h2 className="text-xl font-bold mb-4 text-[#F2F2F2]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Transfer SOL</h2>
                  <form onSubmit={submitTransfer}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Recipient Address</label>
                        <input 
                          type="text" 
                          value={transferData.recipient}
                          onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="Enter recipient address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Token</label>
                        <select 
                          value={transferData.token}
                          onChange={(e) => setTransferData({...transferData, token: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                        >
                          <option value="SOL">SOL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#F2F2F2] mb-1">Amount</label>
                        <input 
                          type="number" 
                          step="0.000001"
                          value={transferData.amount}
                          onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                          className="w-full px-3 py-2 bg-[#111111] border border-[#B6B09F] rounded-md text-[#F2F2F2] focus:outline-none focus:ring-2 focus:ring-[#EAE4D5]"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowTransferModal(false)}
                        className="px-4 py-2 bg-[#111111] text-[#F2F2F2] rounded-md hover:bg-[#222222] transition-colors border border-[#B6B09F]"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#F2F2F2] text-[#000000] font-medium rounded-md hover:bg-[#EAE4D5] transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Transferring...' : 'Transfer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}

// Quick action button component (display only, no functionality)
function QuickAction({ text }: { text: string }) {
  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 text-sm text-black bg-[#EAE4D5] rounded-full border border-[#B6B09F] cursor-default transition-all duration-200 font-sans"
      style={{ fontFamily: "'Space Grotesk', 'Josefin Sans', 'Ubuntu', sans-serif" }}
    >
      {text}
      <ArrowUpRight className="w-3 h-3" />
    </div>
  );
}
