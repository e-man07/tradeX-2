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
import { ChartNoAxesColumnDecreasing } from "lucide-react";


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
  const [solValueInUSD, setSolValueInUSD] = useState<number>(0);
  const [tokensValueInUSD, setTokensValueInUSD] = useState<number>(0);

  useEffect(() => {
    setTotalBalance(solValueInUSD + tokensValueInUSD);
  }, [solValueInUSD, tokensValueInUSD]);

  // Get Balance in Sol
const getBalance = async () => {
    try {
      const publicKey = new PublicKey(pubKey);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setSolBalance(solBalance);
      const response = await fetch(
        "https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112"
      );
      const priceData = await response.json();
      const solPrice =
        priceData.So11111111111111111111111111111111111111112?.usdPrice || 0;
   
      console.log("This is the price data", priceData);
      const solValue = solBalance * solPrice;
      setSolValueInUSD(solValue);

      const bal = `${solBalance.toFixed(3)} SOL ($ ${solValue.toFixed(3)})`;
      console.log("This is the balance in dollars", solValue);
      setBalance(bal);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };
 
  const fetchAllTokens = async () => {
    try {
      const allAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(pubKey),
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );

      let totalTokensValue = 0;

      const fetchedTokens = await Promise.all(
        allAccounts.value.map(async ({ pubkey, account }) => {
          try {
            const accountInfo = AccountLayout.decode(account.data);
            const mintAddress = new PublicKey(accountInfo.mint);

            const mintInfo = await connection.getParsedAccountInfo(mintAddress);
            let decimals = 9;
            if (mintInfo.value) {
              const parsedInfo = (mintInfo.value.data as ParsedAccountData).parsed;
              decimals = parsedInfo?.info?.decimals || 9;
            }

            const response = await fetch(
              `https://api.jup.ag/price/v2?ids=${mintAddress}`
            );
            const priceData = await response.json();
            const tokenPrice = priceData?.data?.[mintAddress.toBase58()]?.price || 0;

            let metadata = null;
            try {
              const metadataPDA = await Metadata.getPDA(mintAddress);
              metadata = await Metadata.load(connection, metadataPDA);
            } catch (metadataError) {
              console.warn(`Metadata fetch failed for ${pubkey}:`, metadataError);
            }

            const rawAmount = Number(accountInfo.amount) / 10 ** decimals;
            const userPrice = tokenPrice * rawAmount;
            totalTokensValue += userPrice;

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
      setTokensValueInUSD(totalTokensValue);
    } catch (err) {
      console.error("Error fetching token accounts:", err);
      setTokenFetchError("Failed to load tokens. Please try again.");
    }
  };

  const listenForChanges = async () => {
    if (isAuthenticated && pubKey && walletExists) {
      setIsFetching(true);
      Promise.all([getBalance(), fetchAllTokens()]).finally(() => {
        setIsFetching(false);
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && pubKey && walletExists) {
      listenForChanges(); // Initial fetch

      const publicKey = new PublicKey(pubKey);
      const subscriptionId = connection.onAccountChange(publicKey, () => {
        console.log("Account change detected, re-fetching balances...");
        listenForChanges();
      });

      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [isAuthenticated, walletExists, pubKey]);;

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
  console.log("This is the context", context);
  if (!context)
    throw new Error("useBalance must be used within a BalanceProvider");
  return context;
};
