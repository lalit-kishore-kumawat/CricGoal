'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './FeaturedMatch.module.css'

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    if (!targetDate) return
    function update() {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetDate])
  return timeLeft
}

function pad(n) { return String(n).padStart(2, '0') }

// Safe color extractor — always returns valid hex
function safeColor(colorStr, fallback) {
  if (!colorStr || colorStr === 'undefined' || colorStr === 'null') return fallback
  return colorStr.startsWith('#') ? colorStr : `#${colorStr}`
}

export default function FeaturedMatch({ games = [], sport = '' }) {
  const isCricket = sport.startsWith('cricket')

  if (!games || games.length === 0) return null

  // Pick best match: LIVE > FINAL > UPCOMING
  let featured = null
  for (const g of games) {
    const s = g?.competitions?.[0]?.status?.type?.name
    if (s === 'STATUS_IN_PROGRESS') { featured = g; break }
  }
  if (!featured) {
    for (const g of games) {
      const s = g?.competitions?.[0]?.status?.type?.name
      if (s === 'STATUS_FINAL') { featured = g; break }
    }
  }
  if (!featured) featured = games[0]
  if (!featured) return null

  const comp        = featured?.competitions?.[0] || {}
  const competitors = Array.isArray(comp?.competitors) ? comp.competitors : []
  const home        = competitors.find(c => c?.homeAway === 'home') || competitors[0] || {}
  const away        = competitors.find(c => c?.homeAway === 'away') || competitors[1] || {}
  const statusName  = comp?.status?.type?.name || 'STATUS_SCHEDULED'
  const statusDetail = comp?.status?.type?.detail || ''
  const isLive      = statusName === 'STATUS_IN_PROGRESS'
  const isFinal     = statusName === 'STATUS_FINAL'
  const isUpcoming  = !isLive && !isFinal

  const homeColor = safeColor(home?.team?.color, '#1a6b3c')
  const awayColor = safeColor(away?.team?.color, '#1e3a8a')

  const timeLeft = useCountdown(isUpcoming ? (featured?.date || null) : null)

  const homeAbbr = home?.team?.abbreviation || home?.team?.displayName?.substring(0,3) || '?'
  const awayAbbr = away?.team?.abbreviation || away?.team?.displayName?.substring(0,3) || '?'

  return (
    <div
      className={styles.hero}
      style={{ background: `linear-gradient(135deg, ${awayColor}cc 0%, #111 45%, ${homeColor}cc 100%)` }}
    >
      <div className={styles.overlay} />

      {/* Status */}
      <div className={styles.statusRow}>
        {isLive     && <span className={styles.liveBadge}>● LIVE</span>}
        {isFinal    && <span className={styles.finalBadge}>FULL TIME</span>}
        {isUpcoming && <span className={styles.upcomingBadge}>UPCOMING</span>}
        {comp?.venue?.fullName && (
          <span className={styles.venue}>📍 {comp.venue.fullName}</span>
        )}
      </div>

      {/* Match */}
      <div className={styles.matchRow}>
        {/* Away */}
        <div className={styles.teamBlock}>
          {away?.team?.logo
            ? <img src={away.team.logo} alt={awayAbbr} className={styles.logo} />
            : <div className={styles.logoFallback} style={{ background: awayColor }}>{awayAbbr[0]}</div>
          }
          <span className={styles.teamName}>{away?.team?.displayName || awayAbbr}</span>
        </div>

        {/* Centre */}
        <div className={styles.centreBlock}>
          {(isLive || isFinal) ? (
            <>
              <div className={styles.scores}>
                <span className={`${styles.score} ${away?.winner ? styles.winner : ''}`}>
                  {away?.score || '0'}
                </span>
                <span className={styles.dash}>-</span>
                <span className={`${styles.score} ${home?.winner ? styles.winner : ''}`}>
                  {home?.score || '0'}
                </span>
              </div>
              {statusDetail && <p className={styles.detail}>{statusDetail}</p>}
            </>
          ) : (
            <>
              <span className={styles.vs}>VS</span>
              <div className={styles.countdown}>
                {[['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]].map(([label, val], i) => (
                  <span key={label}>
                    {i > 0 && <span className={styles.colon}>:</span>}
                    <span className={styles.countUnit}>
                      <b>{pad(val)}</b>
                      <small>{label.toUpperCase()}</small>
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Home */}
        <div className={`${styles.teamBlock} ${styles.right}`}>
          {home?.team?.logo
            ? <img src={home.team.logo} alt={homeAbbr} className={styles.logo} />
            : <div className={styles.logoFallback} style={{ background: homeColor }}>{homeAbbr[0]}</div>
          }
          <span className={styles.teamName}>{home?.team?.displayName || homeAbbr}</span>
        </div>
      </div>

      {/* CTA */}
      <div className={styles.cta}>
        <Link href={`/match/${featured?.id}?sport=${encodeURIComponent(sport)}`} className={styles.ctaBtn}>
          {isLive ? '▶ Watch Live' : isFinal ? 'Match Report →' : 'Match Preview →'}
        </Link>
      </div>
    </div>
  )
}