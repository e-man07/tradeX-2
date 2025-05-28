"use client";

import { useWallet } from "@/hooks/useWallet";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function NavUser() {
  const { logout } = useWallet();

  return (
    <Button onClick={logout}>
      <LogOut />
      Log out
    </Button>
  );
}
