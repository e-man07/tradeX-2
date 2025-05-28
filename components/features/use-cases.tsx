import { Card, CardContent } from '@/components/ui/card'
import { Code2Icon, LineChartIcon, ShapesIcon } from 'lucide-react'

const useCases = [
  {
    title: 'Developers',
    description: 'Integrate AI-powered Solana transactions into your apps seamlessly.',
    icon: Code2Icon,
  },
  {
    title: 'Traders',
    description: 'Automate swaps, staking, and asset management effortlessly.',
    icon: LineChartIcon,
  },
  {
    title: 'Creators',
    description: 'Launch tokens, mint NFTs, and manage payments with ease.',
    icon: ShapesIcon,
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 relative bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Who Can Benefit?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Empowering developers, traders, and creators with AI-driven automation on Solana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 shadow-lg transition-transform duration-300 hover:scale-105">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-4 inline-block p-3 bg-blue-500/20 rounded-xl">
                    <useCase.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{useCase.title}</h3>
                  <p className="text-gray-400">{useCase.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
