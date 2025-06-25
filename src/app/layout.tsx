import '../app/globals.css';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'SundayL',
  description: 'SundayL - Intelligent Email Assistant & MAGK Framework, a new way to build AI-powered applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="pt-16">
        <NavBar />
        {children}
      </body>
    </html>
  )
}
