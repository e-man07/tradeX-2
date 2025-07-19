/**
 * Advanced Error Handling and Recovery System
 * Provides intelligent error analysis and actionable recovery suggestions
 */

export interface ErrorRecovery {
  error: string;
  category: 'network' | 'balance' | 'validation' | 'blockchain' | 'user' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  actionable: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  helpUrl?: string;
  quickFix?: {
    label: string;
    action: string;
    params?: any;
  };
}

export class ErrorRecoverySystem {
  private static errorPatterns: Array<{
    pattern: RegExp;
    category: ErrorRecovery['category'];
    severity: ErrorRecovery['severity'];
    getSuggestion: (match: RegExpMatchArray) => string;
    actionable: boolean;
    autoRetry?: boolean;
    retryDelay?: number;
    quickFix?: (match: RegExpMatchArray) => ErrorRecovery['quickFix'];
  }> = [
    // Network and Connection Errors
    {
      pattern: /network|connection|timeout|fetch/i,
      category: 'network',
      severity: 'medium',
      getSuggestion: () => "Network issue detected. I'll retry automatically in a few seconds. Check your internet connection if this persists.",
      actionable: true,
      autoRetry: true,
      retryDelay: 3000
    },
    {
      pattern: /rpc|endpoint|503|502|500/i,
      category: 'network',
      severity: 'medium',
      getSuggestion: () => "RPC endpoint is having issues. I'll try a different endpoint automatically.",
      actionable: true,
      autoRetry: true,
      retryDelay: 2000
    },

    // Balance and Fund Errors
    {
      pattern: /insufficient.*funds?|not enough.*balance|insufficient.*sol/i,
      category: 'balance',
      severity: 'high',
      getSuggestion: (match) => {
        const isSol = match[0].toLowerCase().includes('sol');
        return isSol 
          ? "You need more SOL for transaction fees. Get free devnet SOL from the faucet, or I can help you with that!"
          : "Insufficient token balance. Check your wallet balance or try a smaller amount.";
      },
      actionable: true,
      quickFix: (match) => ({
        label: match[0].toLowerCase().includes('sol') ? "Get Devnet SOL" : "Check Balance",
        action: match[0].toLowerCase().includes('sol') ? "getFaucetSOL" : "fetchBalance",
      })
    },
    {
      pattern: /balance.*(\d+\.?\d*)/i,
      category: 'balance',
      severity: 'medium',
      getSuggestion: (match) => `Your current balance is ${match[1]}. Try using a smaller amount or get more tokens first.`,
      actionable: true,
      quickFix: () => ({
        label: "Check Full Balance",
        action: "fetchBalance"
      })
    },

    // Address and Validation Errors
    {
      pattern: /invalid.*address|malformed.*address|invalid.*public.*key/i,
      category: 'validation',
      severity: 'high',
      getSuggestion: () => "The address format looks incorrect. Solana addresses are 32-44 characters long and use base58 encoding. Double-check and try again!",
      actionable: true,
      quickFix: () => ({
        label: "Validate Address",
        action: "validateAddress"
      })
    },
    {
      pattern: /account.*not.*found|mint.*not.*found/i,
      category: 'blockchain',
      severity: 'high',
      getSuggestion: () => "This account or token doesn't exist on the current network. Make sure you're using the right address and network (devnet/mainnet).",
      actionable: true,
      quickFix: () => ({
        label: "Check Network",
        action: "checkNetwork"
      })
    },

    // Token and Mint Errors
    {
      pattern: /token.*not.*found|unknown.*token/i,
      category: 'validation',
      severity: 'medium',
      getSuggestion: () => "Token not recognized. Try using the full mint address instead of the symbol, or check if the token exists on this network.",
      actionable: true,
      quickFix: () => ({
        label: "Search Token",
        action: "searchToken"
      })
    },

    // Transaction Errors
    {
      pattern: /transaction.*failed|tx.*failed|simulation.*failed/i,
      category: 'blockchain',
      severity: 'high',
      getSuggestion: () => "Transaction simulation failed. This usually means insufficient funds, invalid parameters, or network congestion. Let me help you troubleshoot!",
      actionable: true,
      quickFix: () => ({
        label: "Retry Transaction",
        action: "retryTransaction"
      })
    },
    {
      pattern: /slippage|price.*impact/i,
      category: 'blockchain',
      severity: 'medium',
      getSuggestion: () => "Price moved too much during the swap. Try a smaller amount or increase slippage tolerance.",
      actionable: true,
      quickFix: () => ({
        label: "Adjust Slippage",
        action: "adjustSlippage"
      })
    },

    // Permission and Authority Errors
    {
      pattern: /unauthorized|permission.*denied|authority/i,
      category: 'user',
      severity: 'high',
      getSuggestion: () => "Permission denied. Make sure your wallet is connected and you have the necessary permissions for this action.",
      actionable: true,
      quickFix: () => ({
        label: "Reconnect Wallet",
        action: "reconnectWallet"
      })
    },

    // Generic Blockchain Errors
    {
      pattern: /blockhash.*expired|recent.*blockhash/i,
      category: 'blockchain',
      severity: 'low',
      getSuggestion: () => "Transaction took too long and the blockhash expired. I'll retry with a fresh blockhash automatically.",
      actionable: true,
      autoRetry: true,
      retryDelay: 1000
    },

    // User Input Errors
    {
      pattern: /invalid.*amount|amount.*required/i,
      category: 'validation',
      severity: 'medium',
      getSuggestion: () => "The amount format is invalid. Use numbers only (e.g., '1.5' or '100'). Avoid commas or special characters.",
      actionable: true
    },

    // System Errors
    {
      pattern: /internal.*error|unexpected.*error|500/i,
      category: 'system',
      severity: 'critical',
      getSuggestion: () => "Oops! Something went wrong on our end. I'll retry automatically, but if this persists, please refresh the page.",
      actionable: true,
      autoRetry: true,
      retryDelay: 5000
    }
  ];

  static analyzeError(error: string | Error): ErrorRecovery {
    const errorMessage = error instanceof Error ? error.message : error;
    
    // Find matching pattern
    for (const pattern of this.errorPatterns) {
      const match = errorMessage.match(pattern.pattern);
      if (match) {
        return {
          error: errorMessage,
          category: pattern.category,
          severity: pattern.severity,
          suggestion: pattern.getSuggestion(match),
          actionable: pattern.actionable,
          autoRetry: pattern.autoRetry,
          retryDelay: pattern.retryDelay,
          quickFix: pattern.quickFix ? pattern.quickFix(match) : undefined
        };
      }
    }

    // Default fallback
    return {
      error: errorMessage,
      category: 'system',
      severity: 'medium',
      suggestion: "Something unexpected happened. Try again, or rephrase your request if the issue persists.",
      actionable: true,
      quickFix: {
        label: "Try Again",
        action: "retry"
      }
    };
  }

  static formatErrorMessage(recovery: ErrorRecovery): string {
    const severityEmojis = {
      low: '💡',
      medium: '⚠️',
      high: '🚨',
      critical: '🔴'
    };

    const categoryEmojis = {
      network: '🌐',
      balance: '💰',
      validation: '✅',
      blockchain: '⛓️',
      user: '👤',
      system: '⚙️'
    };

    let message = `${severityEmojis[recovery.severity]} **${categoryEmojis[recovery.category]} ${recovery.category.toUpperCase()} ISSUE**\n\n`;
    message += `❌ **Problem:** ${recovery.error}\n\n`;
    message += `✅ **Solution:** ${recovery.suggestion}`;

    if (recovery.quickFix) {
      message += `\n\n🔧 **Quick Fix Available:** ${recovery.quickFix.label}`;
    }

    if (recovery.autoRetry) {
      message += `\n\n🔄 **Auto-retry:** I'll try again in ${(recovery.retryDelay || 1000) / 1000} seconds...`;
    }

    return message;
  }

  static getRecoveryActions(): Record<string, () => Promise<void> | void> {
    return {
      getFaucetSOL: async () => {
        // Open devnet faucet or implement faucet request
        window.open('https://faucet.solana.com/', '_blank');
      },
      fetchBalance: () => {
        // Trigger balance fetch
        console.log('Triggering balance fetch...');
      },
      validateAddress: () => {
        // Implement address validation UI
        console.log('Opening address validator...');
      },
      checkNetwork: () => {
        // Show network status
        console.log('Checking network status...');
      },
      searchToken: () => {
        // Open token search
        console.log('Opening token search...');
      },
      retryTransaction: () => {
        // Retry last transaction
        console.log('Retrying transaction...');
      },
      adjustSlippage: () => {
        // Open slippage settings
        console.log('Opening slippage settings...');
      },
      reconnectWallet: () => {
        // Trigger wallet reconnection
        console.log('Reconnecting wallet...');
      },
      retry: () => {
        // Generic retry
        console.log('Retrying last action...');
      }
    };
  }

  // Smart error context analysis
  static getErrorContext(error: string, userHistory?: string[]): {
    isRecurring: boolean;
    possibleCause: string;
    preventionTip: string;
  } {
    const recurring = userHistory?.some(msg => msg.includes(error.substring(0, 20))) || false;
    
    let possibleCause = "Unknown cause";
    let preventionTip = "Double-check your inputs before submitting.";

    if (error.includes('insufficient')) {
      possibleCause = "Low balance or high transaction fees";
      preventionTip = "Always keep some SOL for transaction fees and check balances before trading.";
    } else if (error.includes('network') || error.includes('timeout')) {
      possibleCause = "Network connectivity or RPC endpoint issues";
      preventionTip = "Use a stable internet connection and try during off-peak hours.";
    } else if (error.includes('invalid')) {
      possibleCause = "Incorrect input format or parameters";
      preventionTip = "Copy-paste addresses instead of typing them manually.";
    }

    return {
      isRecurring: recurring,
      possibleCause,
      preventionTip
    };
  }
}
