/**
 * Enhanced Agent Personality System
 * Makes the Solana trading agent more conversational, helpful, and engaging
 */

export interface PersonalityResponse {
  message: string;
  emoji: string;
  tone: 'friendly' | 'professional' | 'encouraging' | 'celebratory' | 'helpful';
}

export class AgentPersonality {
  private static greetings = [
    "Hey there! 👋 Ready to explore Solana together?",
    "Welcome back! 🚀 What amazing thing shall we build today?",
    "Hello! 😊 I'm your friendly Solana assistant. How can I help?",
    "Hi! 🌟 Let's make some magic happen on Solana!"
  ];

  private static successMessages = [
    "Awesome! 🎉 Your transaction went through perfectly!",
    "Success! 🚀 That was smooth as butter!",
    "Boom! 💥 Transaction confirmed and looking great!",
    "Perfect! ✨ Everything executed flawlessly!",
    "Amazing! 🌟 Your Solana skills are on fire!"
  ];

  private static encouragingMessages = [
    "You're doing great! 🚀 What's next on your Solana journey?",
    "Nice work! 💪 Ready for the next challenge?",
    "Excellent! 🎯 You're becoming a Solana pro!",
    "Fantastic! 🌟 Keep up the momentum!",
    "Outstanding! 🏆 Your blockchain game is strong!"
  ];

  private static helpfulTips = [
    "💡 Pro tip: Always check your SOL balance before transactions!",
    "🎯 Hint: You can use token symbols instead of full addresses!",
    "⚡ Quick tip: Devnet SOL is free - perfect for testing!",
    "🔥 Did you know: You can create collections for your NFTs!",
    "💎 Fun fact: Lower decimals work great for gaming tokens!"
  ];

  static getGreeting(): PersonalityResponse {
    return {
      message: this.getRandomMessage(this.greetings),
      emoji: "👋",
      tone: 'friendly'
    };
  }

  static getSuccessMessage(action: string, details?: string): PersonalityResponse {
    const baseMessage = this.getRandomMessage(this.successMessages);
    const actionSpecific = this.getActionSpecificSuccess(action);
    const fullMessage = details 
      ? `${baseMessage}\n\n${actionSpecific}\n\n${details}`
      : `${baseMessage}\n\n${actionSpecific}`;

    return {
      message: fullMessage,
      emoji: "🎉",
      tone: 'celebratory'
    };
  }

  static getEncouragingMessage(): PersonalityResponse {
    return {
      message: this.getRandomMessage(this.encouragingMessages),
      emoji: "🚀",
      tone: 'encouraging'
    };
  }

  static getHelpfulTip(): PersonalityResponse {
    return {
      message: this.getRandomMessage(this.helpfulTips),
      emoji: "💡",
      tone: 'helpful'
    };
  }

  static getErrorMessage(error: string, suggestion?: string): PersonalityResponse {
    const empathetic = [
      "Oops! 😅 Don't worry, this happens to everyone.",
      "No worries! 🤗 Let's fix this together.",
      "Hmm! 🤔 I see what happened here.",
      "Oh! 😊 Easy fix coming right up!"
    ];

    const baseMessage = this.getRandomMessage(empathetic);
    const fullMessage = suggestion 
      ? `${baseMessage}\n\n❌ **Issue:** ${error}\n\n✅ **Solution:** ${suggestion}`
      : `${baseMessage}\n\n❌ **Issue:** ${error}`;

    return {
      message: fullMessage,
      emoji: "😅",
      tone: 'helpful'
    };
  }

  static getThinkingMessage(): PersonalityResponse {
    const thinking = [
      "Let me work on that for you... 🤔",
      "Processing your request... ⚡",
      "Working some Solana magic... ✨",
      "Crunching the numbers... 🧮",
      "Connecting to the blockchain... 🔗"
    ];

    return {
      message: this.getRandomMessage(thinking),
      emoji: "🤔",
      tone: 'professional'
    };
  }

  static getActionSpecificSuccess(action: string): string {
    const actionMessages: Record<string, string> = {
      'swap': "🔄 Your tokens have been swapped successfully!",
      'transfer': "📤 Transfer completed - your tokens are on their way!",
      'createSPLToken': "🪙 Your new SPL token is live on Solana!",
      'mintNFT': "🎨 Your NFT has been minted and is ready to shine!",
      'createCollection': "📚 Collection created - time to fill it with amazing NFTs!",
      'fetchBalance': "💰 Balance fetched - you're all set!",
      'default': "🎯 Operation completed successfully!"
    };

    return actionMessages[action] || actionMessages['default'];
  }

  static getContextualResponse(context: {
    isFirstTime?: boolean;
    hasLowBalance?: boolean;
    recentSuccess?: boolean;
    errorCount?: number;
  }): PersonalityResponse {
    if (context.isFirstTime) {
      return {
        message: "Welcome to Solana! 🌟 I'm here to make your blockchain journey smooth and fun. Let's start with something simple - how about checking your balance?",
        emoji: "🌟",
        tone: 'friendly'
      };
    }

    if (context.hasLowBalance) {
      return {
        message: "Heads up! 💡 Your SOL balance is getting low. You might want to get some devnet SOL before your next transaction. I can help you with that!",
        emoji: "💡",
        tone: 'helpful'
      };
    }

    if (context.recentSuccess) {
      return this.getEncouragingMessage();
    }

    if (context.errorCount && context.errorCount > 2) {
      return {
        message: "Hey, I notice we've hit a few bumps! 🤗 No worries at all - that's how we learn! Want me to walk you through the basics, or shall we tackle this step by step?",
        emoji: "🤗",
        tone: 'encouraging'
      };
    }

    return this.getHelpfulTip();
  }

  private static getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Voice command specific responses
  static getVoiceCommandResponse(command: string): PersonalityResponse {
    return {
      message: `🎤 Got it! I heard "${command}". Let me process that for you...`,
      emoji: "🎤",
      tone: 'professional'
    };
  }

  static getVoiceErrorResponse(): PersonalityResponse {
    return {
      message: "🎤 Sorry, I didn't catch that clearly. Could you try speaking again? Or feel free to type your request!",
      emoji: "🎤",
      tone: 'helpful'
    };
  }
}

// Utility function to add personality to any message
export const addPersonality = (message: string, context?: any): string => {
  // Add contextual emojis and formatting
  if (message.includes('successful') || message.includes('Success')) {
    return `🎉 ${message}`;
  }
  if (message.includes('Error') || message.includes('Failed')) {
    return `😅 ${message}`;
  }
  if (message.includes('Transaction')) {
    return `⚡ ${message}`;
  }
  if (message.includes('Balance')) {
    return `💰 ${message}`;
  }
  return message;
};
