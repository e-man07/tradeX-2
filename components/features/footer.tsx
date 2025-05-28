import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TwitterIcon, GithubIcon, DiscIcon as DiscordIcon } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">tradeX</h3>
            <p className="text-gray-400">
            AI-Driven On-Chain Actions for 
            Solana
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <TwitterIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <GithubIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <DiscordIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
              <li><Link href="#use-cases" className="text-gray-400 hover:text-white">Use Cases</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><Link href="/api" className="text-gray-400 hover:text-white">API</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} tradeX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
