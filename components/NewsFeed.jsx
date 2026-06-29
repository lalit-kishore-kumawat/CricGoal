import styles from './NewsFeed.module.css'

function HeroCard({ article }) {
  return (
    <a href={article.links?.web?.href || '#'} target="_blank" rel="noopener noreferrer" className={styles.heroCard}>
      {article.images?.[0]?.url ? (
        <img src={article.images[0].url} alt={article.headline} className={styles.heroImg} />
      ) : (
        <div className={styles.heroImgPlaceholder}>
          <span>🏆</span>
        </div>
      )}
      <div className={styles.heroBody}>
        <span className={styles.tag}>{article.categories?.[0]?.description || 'Sports'}</span>
        <h2 className={styles.heroTitle}>{article.headline}</h2>
        {article.description && (
          <p className={styles.heroDesc}>{article.description}</p>
        )}
        <span className={styles.time}>
          {article.published
            ? new Date(article.published).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </a>
  )
}

function NewsItem({ article }) {
  const sport = article.categories?.[0]?.description || 'Sports'
  return (
    <a href={article.links?.web?.href || '#'} target="_blank" rel="noopener noreferrer" className={styles.newsItem}>
      {article.images?.[0]?.url ? (
        <img src={article.images[0].url} alt="" className={styles.thumb} />
      ) : (
        <div className={styles.thumbPlaceholder}>📰</div>
      )}
      <div className={styles.itemBody}>
        <span className={styles.itemTag}>{sport}</span>
        <p className={styles.itemTitle}>{article.headline}</p>
        <span className={styles.itemTime}>
          {article.published
            ? new Date(article.published).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </a>
  )
}

export default function NewsFeed({ articles = [] }) {
  if (!articles.length) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>No stories available right now.</p>
  }

  const [hero1, hero2, ...rest] = articles

  return (
    <div>
      <p className={styles.sectionLabel}>Top stories</p>
      <div className={styles.heroGrid}>
        {hero1 && <HeroCard article={hero1} />}
        {hero2 && <HeroCard article={hero2} />}
      </div>
      <div className={styles.list}>
        {rest.map((article, i) => (
          <NewsItem key={i} article={article} />
        ))}
      </div>
    </div>
  )
}
