// Server component — can safely export generateMetadata
import TeamPageClient from './PageClient'

export async function generateMetadata({ params }) {
  return {
    title: `Team Profile | CricGoal`,
    description: `Team roster, schedule and stats on CricGoal.`,
  }
}

export default function TeamPage() {
  return <TeamPageClient />
}