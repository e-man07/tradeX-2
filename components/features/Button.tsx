import Link from 'next/link'

interface ButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'white'
}

export default function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const baseClasses = 'inline-block px-6 py-3 rounded-md text-lg font-semibold transition-colors duration-200'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    white: 'bg-white text-blue-600 hover:bg-gray-100',
  }

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </Link>
  )
}

