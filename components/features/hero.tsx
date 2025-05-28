"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Loader from "@/components/loader"

export default function Hero() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push("/agent")
  }

  return (
    <div className="relative">
      {isLoading && <Loader />}
      <section className="container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-emerald-400 text-sm md:text-base">AI-Powered On-Chain Actions for Solana</p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            The Ultimate Agent
            <br />
            for On-Chain Operations
          </h1>

          <p className="text-gray-400 text-lg md:text-xl">
            Create wallets, transfer, swap, mint NFTs, and create SPL tokens seamlessly—just give prompts, and let AI Agent handle the on-chain interactions for you.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              Get Started →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
