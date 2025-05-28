import { Button } from '@/components/ui/button'
import Hero from '@/components/features/hero'
import HowItWorks from '@/components/features/how-it-works'
import Features from '@/components/features/features'
import UseCases from '@/components/features/use-cases'
import CallToAction from '@/components/features/call-to-action'
import Footer from '@/components/features/footer'
import ShowcaseCards from '@/components/features/showcase-cards'


export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("/grid-pattern.svg")',
          backgroundSize: '50px 50px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="text-xl font-bold">tradeX</div>
          {/* <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            Connect Wallet
          </Button> */}
        </header>

        <Hero />
        {/* <ShowcaseCards /> */}
        <div className="mt-20"> {/* Add spacing between ShowcaseCards and HowItWorks */}
           <HowItWorks /> 
        </div>
         <Features /> 
       <UseCases /> 
        <CallToAction />
        <Footer /> 
      </div>
    </main>
  )
}

