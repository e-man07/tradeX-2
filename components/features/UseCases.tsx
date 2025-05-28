import Image from 'next/image'

const useCases = [
  {
    title: 'Developers',
    description: 'Integrate AI-powered Solana transactions into your apps effortlessly.',
    icon: '/icons/developer.svg',
  },
  {
    title: 'Traders',
    description: 'Execute swaps, stake SOL, and manage assets with AI-driven automation.',
    icon: '/icons/trader.svg',
  },
  {
    title: 'Creators',
    description: 'Launch and distribute tokens, mint NFTs, and manage payments easily.',
    icon: '/icons/creator.svg',
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Who Can Benefit?</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="text-center w-full sm:w-1/3 md:w-1/4">
              <Image
                src={useCase.icon || "/placeholder.svg"}
                alt={useCase.title}
                width={80}
                height={80}
                className="mx-auto mb-4 rounded-full border-2 border-gray-700 p-2 bg-gray-800"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-gray-400">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
