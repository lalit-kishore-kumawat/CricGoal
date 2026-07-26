// Server component — can safely export generateMetadata
import { Suspense } from 'react'
import MatchPageClient from './PageClient'

export async function generateMetadata({ params }) {
  return {
    title: `Match | CricGoal`,
    description: `Live scores, scorecard and stats for this match on CricGoal.`,
  }
}

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text-muted)',
      fontSize: 14,
    }}>
      Loading match...
    </div>
  )
}

export default function MatchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MatchPageClient />
    </Suspense>
  )
}