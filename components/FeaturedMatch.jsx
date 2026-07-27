'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './FeaturedMatch.module.css'

// Countdown timer hook
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    if (!targetDate) return
    function update() {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ h, m, s })
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

function pad(n) { return String(n).padStart(2, '0') }

export default function FeaturedMatch({ games = [], sport = '' }) {
  const isCricket = sport.startsWith('cricket')

  // Pick best match to feature:
  // Priority: LIVE > most recent FINAL > first UPCOMING
  const featured = games.find(g => {
    const status = g?.competitions?.[0]?.status?.type?.name
    return status === 'STATUS_IN_PROGRESS'
  }) || games.find(g => {
    const status = g?.competitions?.[0]?.status?.type?.name
    return status === 'STATUS_FINAL'
  }) || games[0]

  if (!featured) return null

  const comp        = featured?.competitions?.[0] || {}
  const competitors = comp?.competitors || []
  const home        = competitors.find(c => c.homeAway === 'home') || competitors[0] || {}
  const away        = competitors.find(c => c.homeAway === 'away') || competitors[1] || {}
  const statusName  = comp?.status?.type?.name || ''
  const statusDetail = comp?.status?.type?.detail || ''
  const isLive      = statusName === 'STATUS_IN_PROGRESS'
  const isFinal     = statusName === 'STATUS_FINAL'
  const isUpcoming  = !isLive && !isFinal

  const homeColor = home?.team?.color ? `#${home.team.color}` : '#1a6b3c'
  const awayColor = away?.team?.color ? `#${away.team.color}` : '#1e40af'

  const timeLeft = useCountdown(isUpcoming ? featured?.date : null)

  return (
    <div className={styles.hero} style={{
      background: `linear-gradient(135deg, ${awayColor}dd 0%, #0a0a0a 50%, ${homeColor}dd 100%)`
    }}>
      {/* Status badge */}
      <div className={styles.statusRow}>
        {isLive && <span className={styles.liveBadge}>● LIVE</span>}
        {isFinal && <span className={styles.finalBadge}>FULL TIME</span>}
        {isUpcoming && <span className={styles.upcomingBadge}>UPCOMING</span>}
        <span className={styles.leagueLabel}>
          {isCricket ? '🏏' : '⚽'} {comp?.venue?.fullName || ''}
        </span>
      </div>

      {/* Teams + Score */}
      <div className={styles.matchRow}>
        {/* Away team */}
        <div className={styles.teamBlock}>
          {away?.team?.logo
            ? <img src={away.team.logo} alt={away.team.displayName} className={styles.logo} />
            : <div className={styles.logoFallback} style={{ background: awayColor }}>
                {away?.team?.abbreviation?.[0] || '?'}
              </div>
          }
          <div className={styles.teamName}>{away?.team?.displayName || 'TBD'}</div>
          <div className={styles.teamAbbr}>{away?.team?.abbreviation || ''}</div>
        </div>

        {/* Score / vs */}
        <div className={styles.scoreBlock}>
          {(isLive || isFinal) ? (
            <>
              <div className={styles.scores}>
                <span className={`${styles.score} ${away?.winner ? styles.winner : ''}`}>
                  {away?.score || '0'}
                </span>
                <span className={styles.scoreDash}>-</span>
                <span className={`${styles.score} ${home?.winner ? styles.winner : ''}`}>
                  {home?.score || '0'}
                </span>
              </div>
              {statusDetail && <div className={styles.matchStatus}>{statusDetail}</div>}
            </>
          ) : (
            <>
              <div className={styles.vs}>VS</div>
              {/* Countdown */}
              <div className={styles.countdown}>
                <div className={styles.countUnit}>
                  <span className={styles.countNum}>{pad(timeLeft.h)}</span>
                  <span className={styles.countLabel}>HRS</span>
                </div>
                <span className={styles.countColon}>:</span>
                <div className={styles.countUnit}>
                  <span className={styles.countNum}>{pad(timeLeft.m)}</span>
                  <span className={styles.countLabel}>MIN</span>
                </div>
                <span className={styles.countColon}>:</span>
                <div className={styles.countUnit}>
                  <span className={styles.countNum}>{pad(timeLeft.s)}</span>
                  <span className={styles.countLabel}>SEC</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Home team */}
        <div className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          {home?.team?.logo
            ? <img src={home.team.logo} alt={home.team.displayName} className={styles.logo} />
            : <div className={styles.logoFallback} style={{ background: homeColor }}>
                {home?.team?.abbreviation?.[0] || '?'}
              </div>
          }
          <div className={styles.teamName}>{home?.team?.displayName || 'TBD'}</div>
          <div className={styles.teamAbbr}>{home?.team?.abbreviation || ''}</div>
        </div>
      </div>

      {/* CTA button */}
      <div className={styles.ctaRow}>
        <Link href={`/match/${featured?.id}?sport=${sport}`} className={styles.ctaBtn}>
          {isLive ? '▶ Watch Live' : isFinal ? 'Match Report →' : 'Match Info →'}
        </Link>
      </div>
    </div>
  )
}