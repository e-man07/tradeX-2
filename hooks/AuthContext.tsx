"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";

type User = {
  id: string;
  email: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getUserId: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check if we have a user in localStorage
        const storedUser = localStorage.getItem("tradeXUser");
        const userId = localStorage.getItem("userId");
        
        if (storedUser) {
          // If we have a complete user object, use it
          setUser(JSON.parse(storedUser));
        } else if (userId) {
          // If we only have a userId (from wallet login), create a basic user object
          // This ensures user is not null even if only wallet authentication was used
          const email = localStorage.getItem("userEmail") || "";
          const username = email ? email.split('@')[0] : `user_${userId.substring(0, 5)}`;
          
          const userData: User = {
            id: userId,
            email: email,
            username: username
          };
          
          setUser(userData);
          // Store the complete user object for future sessions
          localStorage.setItem("tradeXUser", JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("**********************")
      console.log('login response', data)
      console.log("**********************")

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Create user object from API response
      // The API returns userId directly, not nested in a user object
      const userData: User = {
        id: data.userId,
        // Since the API doesn't return email and username, use email from params
        // and generate a username from the email
        email: email,
        username: email.split('@')[0],
      };

      console.log("Login successful, user data:", userData);
      
      // Store user data in state and localStorage
      setUser(userData);
      localStorage.setItem("tradeXUser", JSON.stringify(userData));
      
      // Also store userId and email separately for wallet integration
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userEmail", email);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem("tradeXUser");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
  };

  const getUserId = (): string | null => {
    return user?.id || null;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
