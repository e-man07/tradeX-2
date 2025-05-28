'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BrainCircuitIcon, ShieldCheckIcon, SendIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'AI-Driven Transactions',
    description: 'Send SOL, swap tokens, and mint NFTs with simple natural language commands.',
    icon: BrainCircuitIcon,
  },
  {
    title: 'Secure & Non-Custodial',
    description: 'Wallets are created instantly with full user control—no third-party access.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Effortless Token Management',
    description: 'Easily create and manage Solana tokens without writing a single line of code.',
    icon: SendIcon,
  },
  {
    title: 'Seamless Web3 Experience',
    description: 'AI simplifies your interaction with Solana, making blockchain accessible to all.',
    icon: SparklesIcon,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 relative bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Why Choose Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            AI-powered Web3 assistant that makes Solana transactions effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4 inline-block p-3 bg-blue-500/20 rounded-full transition-all duration-300 group-hover:bg-blue-500/30">
                      <feature.icon className="w-8 h-8 text-blue-400 transition-all duration-300 group-hover:text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-gray-100">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
