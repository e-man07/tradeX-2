"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import CryptoJS from "crypto-js";

interface WalletContextProps {
  pubKey: string;
  secKey: string;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  walletExists: boolean;
  showKey: boolean;
  createWallet: (password: string) => { pubKey: string; secKey: string };
  importWallet: (
    secretKey: string,
    password: string
  ) => { pubKey: string; secKey: string };
  authenticate: (password: string) => void;
  logout: () => void;
  toggleKeyVisibility: () => void;
  keyPair: Keypair | undefined;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pubKey, setPubKey] = useState<string>("");
  const [secKey, setSecKey] = useState<string>("");
  const [keyPair, setKeyPair] = useState<Keypair | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [walletExists, setWalletExists] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  useEffect(() => {
    const encryptedWallet = localStorage.getItem("encryptedKeypair");
    setWalletExists(!!encryptedWallet);
  }, []);

  const createWallet = (password: string) => {
    if (!password) throw new Error("Password is required to create a wallet!");
    const keypair = Keypair.generate();
    const secretKey = bs58.encode(keypair.secretKey);
    const encryptedKeypair = CryptoJS.AES.encrypt(
      secretKey,
      password
    ).toString();

    localStorage.setItem("encryptedKeypair", encryptedKeypair);
    setPubKey(keypair.publicKey.toString());
    setSecKey(secretKey);
    setWalletExists(true);
    setKeyPair(keypair);
    return { pubKey: keypair.publicKey.toString(), secKey: secretKey };
  };

  const importWallet = (secretKey: string, password: string) => {
    if (!secretKey || !password)
      throw new Error("Both secret key and password are required!");
    const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
    const encryptedKeypair = CryptoJS.AES.encrypt(
      secretKey,
      password
    ).toString();

    localStorage.setItem("encryptedKeypair", encryptedKeypair);
    setPubKey(keypair.publicKey.toString());
    setSecKey(secretKey);
    setWalletExists(true);
    setIsAuthenticated(true);
    setKeyPair(keypair);
    return { pubKey: keypair.publicKey.toString(), secKey: secretKey };
  };

  const authenticate = (password: string) => {
    const encryptedWallet = localStorage.getItem("encryptedKeypair");
    if (!encryptedWallet)
      throw new Error("No wallet found. Please create or import one.");
    const decryptedKey = CryptoJS.AES.decrypt(
      encryptedWallet,
      password
    ).toString(CryptoJS.enc.Utf8);

    if (!decryptedKey) throw new Error("Incorrect password!");
    const keypair = Keypair.fromSecretKey(bs58.decode(decryptedKey));
    setPubKey(keypair.publicKey.toString());
    setSecKey(decryptedKey);
    setIsAuthenticated(true);
    setKeyPair(keypair);
  };

  const logout = () => {
    localStorage.removeItem("encryptedKeypair");
    setPubKey("");
    setSecKey("");
    setIsAuthenticated(false);
    setWalletExists(false);
  };

  const toggleKeyVisibility = () => setShowKey(!showKey);

  return (
    <WalletContext.Provider
      value={{
        setIsAuthenticated,
        pubKey,
        secKey,
        isAuthenticated,
        walletExists,
        showKey,
        createWallet,
        importWallet,
        authenticate,
        logout,
        toggleKeyVisibility,
        keyPair,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
