"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

export type SolanaNetwork = 'devnet' | 'mainnet-beta';

interface NetworkContextType {
  network: SolanaNetwork;
  setNetwork: (network: SolanaNetwork) => void;
  rpcEndpoint: string;
  chainId: number;
  isMainnet: boolean;
  isDevnet: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [network, setNetworkState] = useState<SolanaNetwork>('devnet');

  // Get RPC endpoint based on network
  const getRpcEndpoint = (net: SolanaNetwork): string => {
    if (net === 'mainnet-beta') {
      return process.env.NEXT_PUBLIC_HELIUS_API_KEY 
        ? `https://mainnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
        : clusterApiUrl('mainnet-beta');
    } else {
      return process.env.NEXT_PUBLIC_HELIUS_API_KEY
        ? `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
        : clusterApiUrl('devnet');
    }
  };

  // Get chain ID for token filtering
  const getChainId = (net: SolanaNetwork): number => {
    return net === 'mainnet-beta' ? 101 : 103;
  };

  const setNetwork = (newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
    // Save to localStorage for persistence
    localStorage.setItem('solana-network', newNetwork);
    
    // Log network change
    console.log(`🔄 Network switched to: ${newNetwork.toUpperCase()}`);
  };

  // Load network from localStorage on mount
  useEffect(() => {
    const savedNetwork = localStorage.getItem('solana-network') as SolanaNetwork;
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'mainnet-beta')) {
      setNetworkState(savedNetwork);
    }
  }, []);

  const contextValue: NetworkContextType = {
    network,
    setNetwork,
    rpcEndpoint: getRpcEndpoint(network),
    chainId: getChainId(network),
    isMainnet: network === 'mainnet-beta',
    isDevnet: network === 'devnet'
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
