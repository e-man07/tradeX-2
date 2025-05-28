import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CallToAction() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Trading Experience?</h2>
          <p className="text-gray-400 mb-8">
            Join now and experience the power of AI-driven token management
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-gray-900/50 border-gray-800 text-white"
            />
            <Button 
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Get Started
            </Button>
          </form>
          
          
        </div>
      </div>
    </section>
  )
}

