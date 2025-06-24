'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Testimonial {
  quote: string
  name: string
  role: string
  avatarUrl: string
  flagUrl: string
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0)

  const prev = () => setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  const next = () => setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))

  if (!testimonials?.length) return null

  const t = testimonials[index]

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Testimonios</h2>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md animate-fadeInUp">
          <p className="text-gray-700 italic text-base md:text-lg mb-4">"{t.quote}"</p>
          <div className="flex items-center justify-center mt-4 gap-3">
            <Image src={t.avatarUrl} alt={t.name} width={40} height={40} className="rounded-full" />
            <div className="text-left">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-600">{t.role}</p>
            </div>
            <Image src={t.flagUrl} alt="flag" width={20} height={12} className="ml-2" />
          </div>
        </div>

        {/* Flechas */}
        <div className="flex justify-center gap-6 mt-8">
          <button onClick={prev} className="text-gray-500 hover:text-gray-700 transition text-xl">←</button>
          <button onClick={next} className="text-gray-500 hover:text-gray-700 transition text-xl">→</button>
        </div>
      </div>
    </section>
  )
}
