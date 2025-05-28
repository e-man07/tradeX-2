//TODO: to access the wallet of the user so that we can ask the agent the balance of the user
"use client";

import {
  Connection,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "./useWallet";

import { programs } from "@metaplex/js";

const {
  metadata: { Metadata },
} = programs;
import { AccountLayout, TOKEN_PROGRAM_ID} from "@solana/spl-token";


// Define the shape of the context data
export interface BalanceContextProps {
  balance: string;
  tokens: {
    address: string;
    mint:string;
    decimal:string;
    amount: number;
    symbol: string;
    name: string;
    uri: string | null;
    price:number;
  }[];
  fetchAllTokens: () => void;
  listenForChanges:()=>void;
  tokenFetchError: string;
  totalBalance:number;
  solBalance:number;
  isFetching:boolean;
}

// Create the context with a default null value
export const BalanceContext = createContext<BalanceContextProps | null>(null);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const connection = new Connection(
    `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
    "confirmed"
  );
  const { pubKey, isAuthenticated, walletExists } = useWallet();
  const [balance, setBalance] = useState<string>("");
  const [tokenFetchError, setTokenFetchError] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<
    {
      address: string;
      mint:string;
      decimal:string;
      amount: number;
      symbol: string;
      name: string;
      uri: string | null;
      price:number;
    }[]
  >([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // Get Balance in Sol
  const getBalance = async () => {
    setIsFetching(true);
    try {
      const publicKey = new PublicKey(pubKey);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setSolBalance(solBalance);
      const response = await fetch(
        "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112"
      );
      const priceData = await response.json();
      const solPrice =
        priceData.data?.So11111111111111111111111111111111111111112?.price
      const solValueInUSD = solBalance*solPrice
      setTotalBalance((prev)=>prev+solValueInUSD);
      const bal = `${solBalance.toFixed(4)} SOL ($ ${solValueInUSD.toFixed(3)})`
      

      setBalance(bal);
      connection.onAccountChange(publicKey, async (accountInfo) => {
        setTotalBalance(0);
        const lamports = accountInfo.lamports || 0;
        const updatedSolBalance = lamports / LAMPORTS_PER_SOL;
        setSolBalance(updatedSolBalance);
        const response = await fetch(
          "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112"
        );
        const priceData = await response.json();
        const updateSolPrice =
          priceData.data?.So11111111111111111111111111111111111111112?.price;
        const updatedSolValueInUSD = (updateSolPrice * updatedSolBalance);
        setTotalBalance((prev)=>prev+updatedSolValueInUSD);
        const updatedBal = `${updatedSolBalance.toFixed(2)} SOL ($ ${updatedSolValueInUSD.toFixed(2)})`

        setBalance(updatedBal);
      });
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Fetch token accounts and balances
  const fetchAllTokens = async () => {
    setIsFetching(true);
  try {
    const allAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey(pubKey),
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log("All accounts fetched:", allAccounts);

    const fetchedTokens = await Promise.all(
      allAccounts.value.map(async ({ pubkey, account }) => {
        try {
          const accountInfo = AccountLayout.decode(account.data);

          const mintAddress = new PublicKey(accountInfo.mint);

          // Fetch mint information for decimals
          const mintInfo = await connection.getParsedAccountInfo(mintAddress);
          let decimals = 9;
          if (mintInfo.value) {
            const parsedInfo = (mintInfo.value.data as ParsedAccountData).parsed;
            decimals = parsedInfo?.info?.decimals || 9;
          }

          // Fetch price from Jupiter API
          const response = await fetch(
            `https://api.jup.ag/price/v2?ids=${mintAddress}`
          );
          const priceData = await response.json();
          const tokenPrice = priceData?.data?.[mintAddress.toBase58()]?.price;

          // Fetch metadata
          let metadata = null;
          try {
            const metadataPDA = await Metadata.getPDA(mintAddress);
            metadata = await Metadata.load(connection, metadataPDA);
          } catch (metadataError) {
            console.warn(`Metadata fetch failed for ${pubkey}:`, metadataError);
          }

          const rawAmount = Number(accountInfo.amount) / 10 ** decimals;
          const userPrice = tokenPrice ? rawAmount * tokenPrice : 0;

          setTotalBalance((prev) => prev + userPrice);
          
          return {
            address: pubkey.toString(),
            mint: mintAddress.toString(),
            decimal: decimals.toString(),
            amount: Number(rawAmount.toFixed(2)), 
            symbol: metadata?.data?.data?.symbol || "Unknown",
            name: metadata?.data?.data?.name || "Unknown",
            uri: metadata?.data?.data?.uri || null,
            price: userPrice,
          };
          
        } catch (error) {
          console.error(`Error processing account ${pubkey}:`, error);
          return null;
        }
      })
    );
    
    setTokens(fetchedTokens.filter((token) => token !== null));
    setIsFetching(false);
  } catch (err) {
    console.error("Error fetching token accounts:", err);
    setTokenFetchError("Failed to load tokens. Please try again.");
  }
};


  const listenForChanges = async () => {
    setTotalBalance(0);
    getBalance();
    fetchAllTokens();
    const pbk = new PublicKey(pubKey);
    connection.onAccountChange(pbk, async (accountInfo) => {listenForChanges()});
    
  };

  useEffect(() => {
    if (isAuthenticated && pubKey && walletExists) {
      getBalance();
      fetchAllTokens();
    }
  }, [isAuthenticated, walletExists, pubKey]);

  return (
    <BalanceContext.Provider
      value={{ balance, tokens, tokenFetchError, fetchAllTokens ,listenForChanges,totalBalance,isFetching,solBalance}}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context)
    throw new Error("useBalance must be used within a BalanceProvider");
  return context;
};
