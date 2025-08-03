import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthDialogProvider } from '@/contexts/AuthDialogContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Trade Wizard AI Studio',
  description: 'AI-powered trading strategy builder and backtester',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ChatProvider>
            <AuthDialogProvider>
              <AuthProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <div className="min-h-screen bg-background">
                    {children}
                  </div>
                </TooltipProvider>
              </AuthProvider>
            </AuthDialogProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}