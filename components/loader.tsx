import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

export default function Loader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const loaderContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full animate-spin">
          {/* Inner ring */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-ping opacity-25"></div>
          {/* Loading text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 font-medium text-sm whitespace-nowrap">
            Loading...
          </div>
        </div>
        {/* Pulsing dots */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  )

  return mounted ? createPortal(loaderContent, document.body) : null
}
