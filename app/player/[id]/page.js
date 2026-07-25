// Server component — can safely export generateMetadata
import PlayerPageClient from './PageClient'

export async function generateMetadata({ params }) {
  return {
    title: `Player Profile | CricGoal`,
    description: `Player career stats and bio on CricGoal.`,
  }
}

export default function PlayerPage() {
  return <PlayerPageClient />
}