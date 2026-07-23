import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'CricGoal - Live Cricket & Football Scores, News & Updates',
  description: 'Live cricket and football scores, match details, standings, player stats and news. Covering IPL, T20I, ODI, Test, Premier League, La Liga and more.',
  keywords: 'cricket scores, football scores, IPL, T20I, Premier League, live scores, cricket news',
  metadataBase: new URL('https://cricgoal.info'),
  openGraph: {
    title: 'CricGoal - Live Cricket & Football',
    description: 'Live scores, news and stats for cricket and football.',
    url: 'https://cricgoal.info',
    siteName: 'CricGoal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CricGoal - Live Cricket & Football',
    description: 'Live scores, news and stats for cricket and football.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6EJH4HQKCX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6EJH4HQKCX');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}
