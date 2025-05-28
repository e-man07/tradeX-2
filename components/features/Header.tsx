import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">tradeX</Link>
        <div className="space-x-4">
          <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</Link>
          <Link href="#features" className="text-gray-600 hover:text-blue-600">Features</Link>
          <Link href="#use-cases" className="text-gray-600 hover:text-blue-600">Use Cases</Link>
        </div>
      </nav>
    </header>
  )
}

