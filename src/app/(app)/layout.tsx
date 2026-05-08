// src/app/(app)/layout.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Menu, Scissors } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - hanya muncul di HP */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-zinc-800 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Scissors size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold">POS Jahit</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  )
}