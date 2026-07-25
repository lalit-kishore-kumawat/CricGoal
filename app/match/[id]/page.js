// Server component — can safely export generateMetadata
import MatchPageClient from './PageClient'

export async function generateMetadata({ params }) {
  return {
    title: `Match | CricGoal`,
    description: `Live scores, scorecard and stats for this match on CricGoal.`,
  }
}

export default function MatchPage() {
  return <MatchPageClient />
}