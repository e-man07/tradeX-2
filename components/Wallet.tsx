"use client";

import {useWallet} from '@/hooks/useWallet';
import React, { useState } from 'react'
const Wallet = () => {
  const [password,setPassword]=useState("");
  const [secretInput, setSecretInput]= useState("");
    const {
        walletExists,
        createWallet,
        importWallet,
        authenticate,
      } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        {walletExists ? (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-semibold mb-4">Welcome Back!</h1>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={()=>authenticate(password)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Unlock Wallet
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">Create Wallet</h2>
              <input
                type="password"
                placeholder="Set a password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={()=>createWallet(password)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Create Wallet
              </button>
            </div>
            <div>
              <h2 className="text-xl font-medium mb-4">Import Wallet</h2>
              <input
                type="text"
                placeholder="Enter your secret key"
                onChange={(e) => setSecretInput(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Set a password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={()=>importWallet(secretInput,password)}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Import Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet