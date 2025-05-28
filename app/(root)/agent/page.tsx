"use client";

import React, { useState } from "react";
import TempLogin from "@/components/TempLogin";
import { useWallet } from "@/hooks/useWallet";
import Chat from "@/components/Chat";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";
export default function Agent() {
  const { isAuthenticated } = useWallet();

  console.log("isAuthenticated", isAuthenticated);
  if (isAuthenticated) {
    useSolanaAgent();
    return <Chat />;
  } else {
    return <TempLogin />;
  }
}
