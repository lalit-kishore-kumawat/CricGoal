import Link from 'next/link'
import styles from './Breadcrumb.module.css'

/**
 * Usage:
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Cricket', href: '/?sport=cricket' },
 *   { label: 'India vs Australia' },   // no href = current page
 * ]} />
 */
export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className={styles.item}>
            {!isLast && item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            )}
            {!isLast && <span className={styles.sep}>›</span>}
          </span>
        )
      })}
    </nav>
  )
}