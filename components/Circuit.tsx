'use client'

import React from 'react'

const CircuitPattern = () => {
  return (
    <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none">
      {/* Top Left Circuit */}
      <div className="absolute top-0 left-0">
        <div className="relative w-32 h-32">
          <div className="absolute top-9 left-10 w-48 h-px bg-zinc-800" />
          <div className="absolute top-9 left-10 w-px h-48 bg-zinc-800" />
        </div>
      </div>

      {/* Top Right Circuit */}
      <div className="absolute top-0 right-0">
        <div className="relative w-32 h-32">
          <div className="absolute top-9 right-10 w-48 h-px bg-zinc-800 transform rotate-180" />
          <div className="absolute top-9 right-10 w-px h-48 bg-zinc-800" />
        </div>
      </div>

      {/* Bottom Left Circuit */}
      <div className="absolute bottom-0 left-0">
        <div className="relative w-32 h-32">
          <div className="absolute bottom-9 left-10 w-48 h-px bg-zinc-800" />
          <div className="absolute bottom-9 left-10 w-px h-48 bg-zinc-800 transform rotate-180" />
        </div>
      </div>

      {/* Bottom Right Circuit */}
      <div className="absolute bottom-0 right-0">
        <div className="relative w-32 h-32">
          <div className="absolute bottom-9 right-10 w-48 h-px bg-zinc-800 transform rotate-180" />
          <div className="absolute bottom-9 right-10 w-px h-48 bg-zinc-800 transform rotate-180" />
        </div>
      </div>
    </div>
  )
}

export default CircuitPattern