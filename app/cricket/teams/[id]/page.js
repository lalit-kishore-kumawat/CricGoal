'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { IPL_TEAMS } from '@/lib/iplTeams'
import styles from './page.module.css'

// IPL player data (key players per team)
const IPL_PLAYERS = {
  mi:   ['Rohit Sharma', 'Jasprit Bumrah', 'Hardik Pandya', 'Suryakumar Yadav', 'Tilak Varma'],
  csk:  ['MS Dhoni', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Devon Conway', 'Matheesha Pathirana'],
  rcb:  ['Virat Kohli', 'Faf du Plessis', 'Glenn Maxwell', 'Mohammed Siraj', 'Dinesh Karthik'],
  kkr:  ['Shreyas Iyer', 'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Phil Salt'],
  dc:   ['David Warner', 'Rishabh Pant', 'Axar Patel', 'Kuldeep Yadav', 'Prithvi Shaw'],
  pbks: ['Shikhar Dhawan', 'Sam Curran', 'Arshdeep Singh', 'Jonny Bairstow', 'Liam Livingstone'],
  rr:   ['Sanju Samson', 'Jos Buttler', 'Yuzvendra Chahal', 'Trent Boult', 'Shimron Hetmyer'],
  srh:  ['Pat Cummins', 'Heinrich Klaasen', 'Abhishek Sharma', 'Travis Head', 'Bhuvneshwar Kumar'],
  lsg:  ['KL Rahul', 'Nicholas Pooran', 'Marcus Stoinis', 'Ravi Bishnoi', 'Krunal Pandya'],
  gt:   ['Hardik Pandya', 'Shubman Gill', 'Mohammed Shami', 'Rashid Khan', 'David Miller'],
}

const IPL_STATS = {
  mi:   { matches: 229, wins: 133, losses: 93, nrr: '+0.128' },
  csk:  { matches: 220, wins: 124, losses: 89, nrr: '+0.071' },
  rcb:  { matches: 231, wins: 111, losses: 116, nrr: '-0.212' },
  kkr:  { matches: 224, wins: 111, losses: 109, nrr: '-0.032' },
  dc:   { matches: 220, wins: 104, losses: 113, nrr: '-0.158' },
  pbks: { matches: 217, wins: 101, losses: 114, nrr: '-0.050' },
  rr:   { matches: 207, wins: 104, losses: 100, nrr: '+0.025' },
  srh:  { matches: 177, wins: 84,  losses: 91,  nrr: '-0.120' },
  lsg:  { matches: 48,  wins: 27,  losses: 20,  nrr: '+0.251' },
  gt:   { matches: 48,  wins: 29,  losses: 19,  nrr: '+0.244' },
}

export default function IPLTeamDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const team = IPL_TEAMS.find(t => t.id === id)
  if (!team) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Team not found</div>
      </div>
    )
  }

  const players = IPL_PLAYERS[id] || []
  const stats   = IPL_STATS[id] || {}

  return (
    <div className={styles.page}>
      <div className={styles.backBar}>
        <button className={styles.backBtn} onClick={() => router.back()}>← Back</button>
        <span className={styles.breadcrumb}>🏏 IPL · {team.shortName}</span>
      </div>

      {/* Header */}
      <div className={styles.header} style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color2 || team.color})` }}>
        <div className={styles.headerInner}>
          <img src={team.logo} alt={team.name} className={styles.teamLogo}
            onError={e => e.target.style.display='none'} />
          <div>
            <div className={styles.teamName}>{team.name}</div>
            <div className={styles.teamMeta}>{team.city} · {team.shortName}</div>
            <div className={styles.teamMeta}>🏟️ {team.ground}</div>
            {team.titles > 0 && (
              <div className={styles.titlesBadge}>
                🏆 {team.titles} IPL {team.titles === 1 ? 'Title' : 'Titles'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* Overall stats */}
        <div className={styles.sectionTitle}>Overall IPL Record</div>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{stats.matches || '-'}</span>
            <span className={styles.statLabel}>Matches</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum} style={{ color: 'var(--brand-green)' }}>{stats.wins || '-'}</span>
            <span className={styles.statLabel}>Wins</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum} style={{ color: '#e53e3e' }}>{stats.losses || '-'}</span>
            <span className={styles.statLabel}>Losses</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{stats.nrr || '-'}</span>
            <span className={styles.statLabel}>NRR</span>
          </div>
        </div>

        {/* Key players */}
        <div className={styles.sectionTitle}>Key Players</div>
        <div className={styles.playerList}>
          {players.map((name, i) => (
            <div key={i} className={styles.playerRow}>
              <div className={styles.playerAvatar} style={{ background: team.color }}>
                {name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <span className={styles.playerName}>{name}</span>
            </div>
          ))}
        </div>

        {/* Team colors */}
        <div className={styles.sectionTitle}>Team Colors</div>
        <div className={styles.colorsRow}>
          <div className={styles.colorBox}>
            <div className={styles.colorSwatch} style={{ background: team.color }} />
            <span className={styles.colorHex}>{team.color}</span>
          </div>
          {team.color2 && (
            <div className={styles.colorBox}>
              <div className={styles.colorSwatch} style={{ background: team.color2 }} />
              <span className={styles.colorHex}>{team.color2}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
