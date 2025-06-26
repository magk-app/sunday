import '../app/globals.css';
import NavBar from '../components/NavBar';
import ErrorBoundary from '../components/ErrorBoundary';
import DarkModeProvider from '../../src/components/DarkModeProvider';

export const metadata = {
  title: 'Sunday',
  description: 'Sunday - Intelligent Email Assistant & MAGK Framework, a new way to build AI-powered applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body className="pt-16 dark:bg-gray-900 dark:text-white transition-colors" suppressHydrationWarning>
        <DarkModeProvider>
          <ErrorBoundary>
            <NavBar />
            {children}
          </ErrorBoundary>
        </DarkModeProvider>
      </body>
    </html>
  )
}
