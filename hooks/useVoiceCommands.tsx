/**
 * Voice Command System for Solana Trading
 * Enables users to execute trades and operations using voice commands
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentPersonality } from '../utils/agentPersonality';

interface VoiceCommand {
  action: 'swap' | 'transfer' | 'balance' | 'create_token' | 'mint_nft' | 'create_collection';
  params: Record<string, any>;
  confidence: number;
  originalText: string;
}

interface VoiceCommandHook {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  processVoiceCommand: (text: string) => VoiceCommand | null;
  lastCommand: VoiceCommand | null;
  error: string | null;
}

export const useVoiceCommands = (): VoiceCommandHook => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          setTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          const confidence = event.results[current][0].confidence;
          
          setTranscript(transcript);
          setConfidence(confidence);

          if (event.results[current].isFinal) {
            const command = processVoiceCommand(transcript);
            if (command) {
              setLastCommand(command);
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError('Speech recognition not supported in this browser');
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start speech recognition');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Voice command processing patterns
  const commandPatterns = [
    // Swap commands
    {
      pattern: /swap\s+(\d+\.?\d*)\s+(sol|SOL)\s+to\s+(\w+)/i,
      action: 'swap' as const,
      extract: (match: RegExpMatchArray) => ({
        from: 'SOL',
        to: match[3].toUpperCase(),
        amount: match[1]
      })
    },
    {
      pattern: /swap\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(sol|SOL)/i,
      action: 'swap' as const,
      extract: (match: RegExpMatchArray) => ({
        from: match[2].toUpperCase(),
        to: 'SOL',
        amount: match[1]
      })
    },
    {
      pattern: /swap\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(\w+)/i,
      action: 'swap' as const,
      extract: (match: RegExpMatchArray) => ({
        from: match[2].toUpperCase(),
        to: match[3].toUpperCase(),
        amount: match[1]
      })
    },

    // Transfer commands
    {
      pattern: /send\s+(\d+\.?\d*)\s+(sol|SOL)\s+to\s+([A-Za-z0-9]{32,44})/i,
      action: 'transfer' as const,
      extract: (match: RegExpMatchArray) => ({
        token: 'SOL',
        amount: match[1],
        recipient: match[3]
      })
    },
    {
      pattern: /transfer\s+(\d+\.?\d*)\s+(\w+)\s+to\s+([A-Za-z0-9]{32,44})/i,
      action: 'transfer' as const,
      extract: (match: RegExpMatchArray) => ({
        token: match[2].toUpperCase(),
        amount: match[1],
        recipient: match[3]
      })
    },

    // Balance commands
    {
      pattern: /check\s+(my\s+)?balance|what('s|s)\s+(my\s+)?balance|show\s+(my\s+)?balance/i,
      action: 'balance' as const,
      extract: () => ({})
    },

    // Token creation commands
    {
      pattern: /create\s+(a\s+)?token\s+called\s+(\w+)\s+with\s+symbol\s+(\w+)/i,
      action: 'create_token' as const,
      extract: (match: RegExpMatchArray) => ({
        name: match[2],
        symbol: match[3],
        description: `${match[2]} token created via voice command`
      })
    },
    {
      pattern: /make\s+(a\s+)?token\s+named\s+(\w+)/i,
      action: 'create_token' as const,
      extract: (match: RegExpMatchArray) => ({
        name: match[2],
        symbol: match[2].substring(0, 4).toUpperCase(),
        description: `${match[2]} token created via voice command`
      })
    },

    // NFT commands
    {
      pattern: /mint\s+(an\s+)?nft\s+called\s+(.+)/i,
      action: 'mint_nft' as const,
      extract: (match: RegExpMatchArray) => ({
        name: match[2],
        description: `NFT created via voice command: ${match[2]}`
      })
    },

    // Collection commands
    {
      pattern: /create\s+(a\s+)?collection\s+called\s+(.+)/i,
      action: 'create_collection' as const,
      extract: (match: RegExpMatchArray) => ({
        name: match[2],
        description: `Collection created via voice command: ${match[2]}`
      })
    }
  ];

  const processVoiceCommand = useCallback((text: string): VoiceCommand | null => {
    const cleanText = text.trim().toLowerCase();
    
    for (const pattern of commandPatterns) {
      const match = cleanText.match(pattern.pattern);
      if (match) {
        return {
          action: pattern.action,
          params: pattern.extract(match),
          confidence: confidence,
          originalText: text
        };
      }
    }

    return null;
  }, [confidence]);

  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    startListening,
    stopListening,
    processVoiceCommand,
    lastCommand,
    error
  };
};

// Voice Command UI Component
export const VoiceCommandButton: React.FC<{
  onCommand: (command: VoiceCommand) => void;
  onTranscript?: (transcript: string) => void;
}> = ({ onCommand, onTranscript }) => {
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    startListening,
    stopListening,
    lastCommand,
    error
  } = useVoiceCommands();

  useEffect(() => {
    if (lastCommand) {
      onCommand(lastCommand);
    }
  }, [lastCommand, onCommand]);

  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return (
      <div className="text-gray-500 text-sm">
        🎤 Voice commands not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`
          relative p-4 rounded-full transition-all duration-200 shadow-lg
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          text-white font-medium
        `}
        disabled={!!error}
      >
        {isListening ? (
          <>
            <span className="text-2xl">🔴</span>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
          </>
        ) : (
          <span className="text-2xl">🎤</span>
        )}
      </button>
      
      <div className="text-center min-h-[60px]">
        {isListening && (
          <div className="text-sm text-blue-600 font-medium">
            🎤 Listening... Speak your command!
          </div>
        )}
        
        {transcript && (
          <div className="text-sm mt-2 p-2 bg-gray-100 rounded-lg">
            <div className="font-medium">"{transcript}"</div>
            {confidence > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 mt-2">
            ❌ {error}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 text-center max-w-xs">
        Try saying: "Swap 0.1 SOL to USDC" or "Check my balance"
      </div>
    </div>
  );
};

// Voice command examples for users
export const VoiceCommandExamples = {
  swap: [
    "Swap 0.1 SOL to USDC",
    "Swap 100 USDC to SOL",
    "Swap 50 BONK to USDT"
  ],
  transfer: [
    "Send 0.5 SOL to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "Transfer 100 USDC to 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  ],
  balance: [
    "Check my balance",
    "What's my balance",
    "Show my balance"
  ],
  token: [
    "Create a token called GameCoin with symbol GAME",
    "Make a token named MyToken"
  ],
  nft: [
    "Mint an NFT called Cool Dragon",
    "Create NFT called Space Explorer"
  ],
  collection: [
    "Create a collection called My Art Collection"
  ]
};

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
