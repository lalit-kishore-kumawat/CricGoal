'use client'
import { useState, useEffect } from 'react'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('cricgoal-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('cricgoal-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      className={styles.btn}
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}