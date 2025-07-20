"use client";

import React from 'react';
import { useNetwork } from '../contexts/NetworkContext';

const NetworkToggle: React.FC = () => {
  const { network, setNetwork, isMainnet, isDevnet } = useNetwork();

  const handleToggle = () => {
    const newNetwork = isMainnet ? 'devnet' : 'mainnet-beta';
    setNetwork(newNetwork);
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
      {/* Network Status Indicator */}
      <div className="flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            isMainnet ? 'bg-green-500' : 'bg-orange-500'
          } animate-pulse`}
        />
        <span className="text-sm font-medium text-gray-300">
          {network === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="relative">
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isMainnet ? 'bg-green-600' : 'bg-orange-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isMainnet ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Network Labels */}
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <span className={isDevnet ? 'text-orange-400 font-medium' : ''}>
          DEV
        </span>
        <span>|</span>
        <span className={isMainnet ? 'text-green-400 font-medium' : ''}>
          MAIN
        </span>
      </div>

      {/* Warning for Mainnet */}
      {isMainnet && (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-yellow-400">Real funds</span>
        </div>
      )}
    </div>
  );
};

export default NetworkToggle;
