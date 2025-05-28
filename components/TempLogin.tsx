"use client";

import { Apple, Mail, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import axios from "axios";
import { UserDataInterface } from "@/app/types/UserDataInterface";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export default function TempLogin() {
  const [sign, setSign] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [importMode, setImportMode] = useState(false);

  const {
    createWallet,
    importWallet,
    setIsAuthenticated,
    isAuthenticated,
    walletExists,
    authenticate,
  } = useWallet();

  const toggleMode = () => setSign(!sign);

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const walletResponse = createWallet(password);

      const data: UserDataInterface = {
        email: email,
        password: password,
        pubKey: walletResponse.pubKey,
        secretKey: walletResponse.secKey,
      };

      console.log("User data:", JSON.stringify(data));

      const response = await axios.post("/api/auth/register", data);

      console.log(" -----------> Response data: --->", response.data);

      if (response.status === 400) {
        throw new Error("User already exists");
      } else if (response.status === 500) {
        throw new Error("Server not running!");
      }

        localStorage.setItem("userId", response.data.token.userId);
        setIsAuthenticated(true);
      console.log("isAuthenticated:", isAuthenticated);
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const data = {
        email: email,
        password: password,
      };

      console.log("User data:", data);

      const response = await axios.post("/api/auth/login", data);
      console.log("Response data:", response.data);

      if (response.status === 200) {
        importWallet(response.data.secretKey, password);
        localStorage.setItem("userId", response.data.userId);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleImportWallet = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      importWallet(secretKey, password);
      console.log("Wallet imported successfully!");
    } catch (error) {
      console.error("Error during wallet import:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      {walletExists ? (
        <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            Welcome Back!
          </h1>
          <form className="space-y-4">
            <div className="relative">
              <Lock className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95 w-full px-4 py-2 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full shadow-inner shadow-black/30 transition-all duration-300"
              onClick={() => authenticate(password)}
            >
              Unlock Wallet
            </Button>
          </form>
        </div>
      ) : importMode ? (
        <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            Import Wallet
          </h1>
          <form onSubmit={handleImportWallet} className="space-y-4">
            <div className="relative">
              <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your secret key"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <Button
              type="submit"
              className="w-full shadow-inner shadow-black/30 transition-all duration-300"
            >
              Import Wallet
            </Button>
          </form>
          <div className="mt-4">
            <Button
              onClick={() => setImportMode(false)}
              className="w-full shadow-inner shadow-white/10 hover:shadow-none"
              variant="outline"
            >
              Back
            </Button>
          </div>
        </div>
      ) : !sign ? (
        <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            Get Started
          </h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <Button
              type="submit"
              className="w-full shadow-inner shadow-black/30 transition-all duration-300"
            >
              Create new Wallet
            </Button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="px-4 text-sm text-zinc-500">OR</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>
          <Button
            onClick={toggleMode}
            className="w-full shadow-inner shadow-white/10 hover:shadow-none"
            variant="outline"
          >
            Sign in
          </Button>
          <div className="mt-4">
            <Button
              onClick={() => setImportMode(true)}
              className="w-full shadow-inner shadow-white/10 hover:shadow-none"
              variant="outline"
            >
              Import Wallet
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          <h1 className="text-2xl font-semibold text-white text-center mb-2">
            Welcome Back
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <Button
              type="submit"
              className="w-full shadow-inner shadow-black/30 transition-all duration-300"
            >
              Sign in
            </Button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="px-4 text-sm text-zinc-500">OR</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>
          <Button
            onClick={toggleMode}
            className="w-full shadow-inner shadow-white/10 hover:shadow-none"
            variant="outline"
          >
            Create new wallet
          </Button>
          <div className="mt-4">
            <Button
              onClick={() => setImportMode(true)}
              className="w-full shadow-inner shadow-white/10 hover:shadow-none"
              variant="outline"
            >
              Import Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
