import './globals.css'

export const metadata = {
  title: 'CricGoal - Live Cricket & Football Scores, News & Updates',
  description: 'Your home for live cricket and football scores, breaking news, standings, and match highlights.',
  keywords: 'cricket, football, live scores, IPL, Premier League, FIFA, ICC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
