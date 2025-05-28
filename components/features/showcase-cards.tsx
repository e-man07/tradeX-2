'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VerifiedIcon } from 'lucide-react'

const showcaseItems = [
  {
    id: 1,
    author: 'Mad Lads',
    username: '@MadLads',
    verified: true,
    avatar: '/placeholder.svg',
    content: 'The floor is looking great for Mad Lads 🫡',
    image: '/placeholder.svg',
    imageAspect: 'square',
    time: '1h',
  },
  {
    id: 2,
    author: 'Jupiter',
    username: '@jupiter',
    verified: true,
    avatar: '/placeholder.svg',
    content: 'Building the best exchange in crypto.',
    description: 'Join us as a space cadet and drive the decentralization meta together.',
    image: '/placeholder.svg',
    imageAspect: 'video',
    time: '2h',
  },
  {
    id: 3,
    author: 'Helium',
    username: '@helium',
    verified: true,
    avatar: '/placeholder.svg',
    content: 'People-Powered Networks.',
    description: 'The Helium Network represents a paradigm shift in decentralized wireless infrastructure.',
    image: '/placeholder.svg',
    imageAspect: 'square',
    time: '3h',
  },
]

export default function ShowcaseCards() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-[1200px] h-[600px] perspective-[1000px]">
            <div className="relative h-full flex items-center justify-center">
              {showcaseItems.map((item, index) => (
                <Card
                  key={item.id}
                  className={`
                    absolute w-[320px] bg-white/95 backdrop-blur shadow-xl rounded-3xl overflow-hidden
                    transition-all duration-500 ease-out
                    hover:scale-105 hover:shadow-2xl hover:z-30
                    ${index === 0 ? '-translate-x-[90%] -rotate-6' : ''}
                    ${index === 1 ? 'translate-y-[-2%] z-20' : ''}
                    ${index === 2 ? 'translate-x-[90%] rotate-6' : ''}
                  `}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={item.avatar} />
                        <AvatarFallback>{item.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-900 text-lg truncate">
                            {item.author}
                          </span>
                          {item.verified && (
                            <VerifiedIcon className="w-5 h-5 text-blue-500 ml-1 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <span className="truncate">{item.username}</span>
                          <span className="mx-1 flex-shrink-0">·</span>
                          <span className="flex-shrink-0">{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-900 text-base">{item.content}</p>
                      {item.description && (
                        <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
                      )}
                    </div>
                    <div className={`mt-4 rounded-xl overflow-hidden border border-gray-200
                      ${item.imageAspect === 'video' ? 'aspect-video' : 'aspect-square'}
                    `}>
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

