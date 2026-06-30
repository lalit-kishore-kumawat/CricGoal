'use client'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

function fmt(date) {
  try {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
  } catch { return '' }
}

function MatchHeader({ data }) {
  const comp   = data.header?.competitions?.[0]
  const home   = comp?.competitors?.find(c => c.homeAway === 'home')
  const away   = comp?.competitors?.find(c => c.homeAway === 'away')
  const status = comp?.status
  const isLive  = status?.type?.name === 'STATUS_IN_PROGRESS'
  const isFinal = status?.type?.name === 'STATUS_FINAL'

  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.teamBlock}>
          {away?.team?.logo
            ? <img src={away.team.logo} alt={away.team.displayName} className={styles.teamLogo} />
            : <div className={styles.logoBox} style={{ background: `#${away?.team?.color || '555'}` }}>{away?.team?.abbreviation?.[0]}</div>
          }
          <div className={styles.teamName}>{away?.team?.displayName}</div>
          <div className={`${styles.teamScore} ${away?.winner ? styles.winner : ''}`}>{away?.score ?? '-'}</div>
        </div>

        <div className={styles.centre}>
          {isLive  && <span className={styles.liveBadge}>● LIVE</span>}
          {isFinal && <span className={styles.finalBadge}>FINAL</span>}
          {!isLive && !isFinal && <span className={styles.scheduledBadge}>UPCOMING</span>}
          <div className={styles.statusDetail}>{status?.type?.detail || ''}</div>
          {comp?.venue?.fullName && <div className={styles.venue}>📍 {comp.venue.fullName}</div>}
        </div>

        <div className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          {home?.team?.logo
            ? <img src={home.team.logo} alt={home.team.displayName} className={styles.teamLogo} />
            : <div className={styles.logoBox} style={{ background: `#${home?.team?.color || '555'}` }}>{home?.team?.abbreviation?.[0]}</div>
          }
          <div className={styles.teamName}>{home?.team?.displayName}</div>
          <div className={`${styles.teamScore} ${home?.winner ? styles.winner : ''}`}>{home?.score ?? '-'}</div>
        </div>
      </div>
    </div>
  )
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className={styles.tabBar}>
      {tabs.map(t => (
        <button key={t} className={`${styles.tab} ${active === t ? styles.tabActive : ''}`} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  )
}

function FootballStats({ data }) {
  const teams = data?.header?.competitions?.[0]?.competitors || [];
const stats = Array.isArray(data?.boxscore?.teams) ? data.boxscore.teams : [];

  if (!stats.length) return <Empty msg="Stats not available for this match." />
  return (
    <div className={styles.statsWrap}>
      <div className={styles.statsTeamRow}>
        <span />
        {teams.map(t => <span key={t.id} className={styles.statsTeamName}>{t.team?.abbreviation}</span>)}
      </div>
      {stats[0]?.statistics?.map((stat, i) => (
        <div key={i} className={styles.statRow}>
          <span className={styles.statLabel}>{stat.label}</span>
          {stats.map((team, j) => (
            <span key={j} className={styles.statValue}>{team.statistics?.[i]?.displayValue ?? '-'}</span>
          ))}
        </div>
      ))}
    </div>
  )
}
function FootballLineup({ data }) {
  // Safe extraction fallback check mapping for football data streams
  const rosters = data?.rosters || data?.roster || [];
  
  if (!rosters || !rosters.length) return <Empty msg="Lineups not available yet." />
  
  return (
    <div className={styles.lineupWrap}>
      {rosters.map((team, i) => (
        <div key={i} className={styles.lineupTeam}>
          <div className={styles.lineupTeamName}>{team?.team?.displayName}</div>
          <div className={styles.lineupHeader}><span>Player</span><span>#</span><span>Pos</span></div>
          {team?.roster?.filter(p => p.starter).map((p, j) => (
            <div key={j} className={styles.playerRow}>
              <span className={styles.playerName}>{p?.athlete?.displayName}</span>
              <span className={styles.playerNum}>{p?.jersey ?? '-'}</span>
              <span className={styles.playerPos}>{p?.position?.abbreviation ?? ''}</span>
            </div>
          ))}
          {(team?.roster?.filter(p => !p.starter) || []).length > 0 && (
            <>
              <div className={styles.subLabel}>Substitutes</div>
              {team.roster.filter(p => !p.starter).map((p, j) => (
                <div key={j} className={`${styles.playerRow} ${styles.sub}`}>
                  <span className={styles.playerName}>{p?.athlete?.displayName}</span>
                  <span className={styles.playerNum}>{p?.jersey ?? '-'}</span>
                  <span className={styles.playerPos}>{p?.position?.abbreviation ?? ''}</span>
                </div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  )
}


function CricketScorecard({ data }) {
  const innings = data.innings || []
  if (!innings.length) return <Empty msg="Scorecard not available yet." />
  return (
    <div>
      {innings.map((inn, i) => (
        <div key={i} className={styles.innings}>
          <div className={styles.inningsTitle}>
            {inn.team?.displayName} — {inn.runs}/{inn.wickets} ({inn.overs} ov)
          </div>
          <table className={styles.scoreTable}>
            <thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
            <tbody>
              {inn.batsmen?.map((b, j) => (
                <tr key={j}>
                  <td><div className={styles.batsmanName}>{b.athlete?.displayName}</div><div className={styles.dismissal}>{b.dismissal}</div></td>
                  <td className={styles.boldStat}>{b.runs}</td>
                  <td>{b.balls}</td><td>{b.fours}</td><td>{b.sixes}</td><td>{b.strikerate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className={styles.scoreTable} style={{ marginTop: 12 }}>
            <thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Econ</th></tr></thead>
            <tbody>
              {inn.bowlers?.map((b, j) => (
                <tr key={j}>
                  <td className={styles.batsmanName}>{b.athlete?.displayName}</td>
                  <td>{b.overs}</td><td>{b.maidens}</td><td>{b.runs}</td>
                  <td className={styles.boldStat}>{b.wickets}</td><td>{b.economy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function PlayByPlay({ data }) {
  const plays = data.plays || []
  if (!plays.length) return <Empty msg="No play-by-play data available." />
  return (
    <div className={styles.pbp}>
      {plays.slice(0, 30).map((play, i) => (
        <div key={i} className={styles.pbpRow}>
          <span className={styles.pbpTime}>{play.clock?.displayValue || play.period?.displayValue}</span>
          {play.scoringPlay && <span className={styles.goalBadge}>⚽ GOAL</span>}
          <span className={styles.pbpText}>{play.text}</span>
        </div>
      ))}
    </div>
  )
}

function Empty({ msg }) {
  return <div className={styles.empty}>{msg}</div>
}

export default function MatchPage() {
  const { id }       = useParams()
  const searchParams = useSearchParams()
  const sport        = searchParams.get('sport') || 'soccer/eng.1'
  const isCricket    = sport.startsWith('cricket')

  const [data, setData]     = useState(null)
  const [tab, setTab]       = useState(isCricket ? 'Scorecard' : 'Stats')
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const tabs = isCricket
    ? ['Scorecard', 'Play-by-Play', 'Info']
    : ['Stats', 'Lineups', 'Play-by-Play', 'Info']

  useEffect(() => {
    fetch(`/api/match?id=${id}&sport=${sport}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Could not load match data.'); setLoading(false) })
  }, [id, sport])

  return (
    <div className={styles.page}>
      <div className={styles.backBar}>
        <Link href="/" className={styles.backBtn}>← Back to CricGoal</Link>
        <span className={styles.breadcrumb}>{isCricket ? '🏏 Cricket' : '⚽ Football'} · Match Detail</span>
      </div>

      {loading && (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading match data...</p>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {data && !loading && (
        <>
          <MatchHeader data={data} />
          <div className={styles.body}>
            <div className={styles.main}>
              <TabBar tabs={tabs} active={tab} onChange={setTab} />
              <div className={styles.tabContent}>
                {tab === 'Scorecard'    && <CricketScorecard data={data} />}
                {tab === 'Stats'        && <FootballStats data={data} />}
                {tab === 'Lineups'      && <FootballLineup data={data} />}
                {tab === 'Play-by-Play' && <PlayByPlay data={data} />}
                {tab === 'Info'         && (
                  <div className={styles.infoGrid}>
                    {[
                      ['Venue',      data.header?.competitions?.[0]?.venue?.fullName],
                      ['Date',       fmt(data.header?.competitions?.[0]?.date)],
                      ['Attendance', data.header?.competitions?.[0]?.attendance?.toLocaleString()],
                      ['Broadcast',  data.header?.competitions?.[0]?.broadcasts?.[0]?.names?.[0]],
                      ['Referee',    data.header?.competitions?.[0]?.officials?.[0]?.fullName],
                    ].map(([label, val]) => val ? (
                      <div key={label} className={styles.infoRow}>
                        <span className={styles.infoLabel}>{label}</span>
                        <span className={styles.infoVal}>{val}</span>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>

            <aside className={styles.aside}>
              {data.news?.map((article, i) => (
                <a key={i} href={article.links?.web?.href || '#'} target="_blank" rel="noopener noreferrer" className={styles.newsCard}>
                  <span className={styles.newsTag}>{article.categories?.[0]?.description || 'News'}</span>
                  <p className={styles.newsTitle}>{article.headline}</p>
                </a>
              ))}
              {!data.news?.length && (
                <div className={styles.newsCard}>
                  <span className={styles.newsTag}>CricGoal</span>
                  <p className={styles.newsTitle}>Live match coverage powered by ESPN data</p>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  )
}