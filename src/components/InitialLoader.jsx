'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './InitialLoader.module.css'

const InitialLoader = () => {
  const [loading, setLoading] = useState(true)
  const [typedText, setTypedText] = useState('')
  const fullText = 'Cargando...'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let index = 0
    const typing = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(prev => prev + fullText[index])
        index++
      } else {
        clearInterval(typing)
      }
    }, 60)
    return () => clearInterval(typing)
  }, [])

  const isTypingComplete = typedText === fullText

  if (!loading) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <Image
          src="/log.webp"
          alt="Logo"
          width={84}
          height={84}
          className={styles.logo}
          priority
        />
        <div className={styles.ring}></div>
        <p className={`${styles.typing} ${isTypingComplete ? styles.done : ''}`}>
          {typedText}
        </p>
      </div>
    </div>
  )
}

export default InitialLoader
