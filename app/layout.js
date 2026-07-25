import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CricGoal — Live Football & Cricket Scores',
  description: 'Get real-time live cricket and football scores, match updates, team lineups, player statistics, and trending sports news instantly on CricGoal.',
  metadataBase: new URL('https://cricgoal.info'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CricGoal — Live Football & Cricket Scores',
    description: 'Track your favorite cricket and football teams with live match centers, dynamic team rosters, and real-time updates.',
    url: 'https://cricgoal.info',
    siteName: 'CricGoal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CricGoal — Live Football & Cricket Scores',
    description: 'Track your favorite sports match updates instantly.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Analytics - Place directly inside <body> or root level */}
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