import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata = {
  title: '404 — Page Not Found | CricGoal',
}

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Animated emoji */}
        <div className={styles.emoji}>🏏</div>

        {/* Error code */}
        <h1 className={styles.code}>404</h1>

        {/* Message */}
        <h2 className={styles.title}>Bowled Out!</h2>
        <p className={styles.desc}>
          The page you're looking for has been caught behind or gone for a duck.
          It may have been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            ← Back to Home
          </Link>
          <Link href="/?sport=cricket" className={styles.btnSecondary}>
            🏏 Live Cricket
          </Link>
          <Link href="/?sport=football" className={styles.btnSecondary}>
            ⚽ Live Football
          </Link>
        </div>

        {/* Quick links */}
        <div className={styles.quickLinks}>
          <p className={styles.quickTitle}>Looking for something?</p>
          <div className={styles.linkGrid}>
            <Link href="/" className={styles.quickLink}>🏠 Home</Link>
            <Link href="/?league=T20I" className={styles.quickLink}>🏏 T20I</Link>
            <Link href="/?league=IPL" className={styles.quickLink}>🏆 IPL</Link>
            <Link href="/?league=Premier League" className={styles.quickLink}>⚽ Premier League</Link>
          </div>
        </div>

      </div>
    </div>
  )
}