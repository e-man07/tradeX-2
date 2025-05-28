import Image from 'next/image'

const steps = [
  {
    title: 'Set up your giveaway',
    description: 'Define rules and prizes',
    icon: '/icons/setup.svg',
  },
  {
    title: 'Share the Blink link',
    description: 'Post on Twitter for participation',
    icon: '/icons/share.svg',
  },
  {
    title: 'AI selects winners',
    description: 'Fair selection and transparent announcement',
    icon: '/icons/ai-select.svg',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <Image
                src={step.icon || "/placeholder.svg"}
                alt={step.title}
                width={64}
                height={64}
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

