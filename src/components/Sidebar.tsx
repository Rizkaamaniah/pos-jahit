// src/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, ShoppingCart, Package, Layers, BarChart2,
  Users, Truck, Wallet, Settings, LogOut, Scissors, AlertTriangle, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'KASIR'] },
  { href: '/kasir', icon: ShoppingCart, label: 'Kasir', roles: ['ADMIN', 'KASIR'] },
  { href: '/produk', icon: Package, label: 'Produk', roles: ['ADMIN'] },
  { href: '/produk/kategori', icon: Layers, label: 'Kategori', roles: ['ADMIN'] },
  { href: '/stok', icon: AlertTriangle, label: 'Stok', roles: ['ADMIN', 'KASIR'] },
  { href: '/supplier', icon: Truck, label: 'Supplier', roles: ['ADMIN'] },
  { href: '/pelanggan', icon: Users, label: 'Pelanggan', roles: ['ADMIN', 'KASIR'] },
  { href: '/kas', icon: Wallet, label: 'Kas', roles: ['ADMIN', 'KASIR'] },
  { href: '/laporan/penjualan', icon: BarChart2, label: 'Laporan', roles: ['ADMIN'] },
  { href: '/pengaturan', icon: Settings, label: 'Pengaturan', roles: ['ADMIN'] },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user.role || 'KASIR'

  const visibleItems = navItems.filter(item => item.roles.includes(role))

  return (
    <>
      {/* Overlay untuk mobile ketika sidebar terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-56 bg-zinc-900 text-white flex flex-col z-30 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:translate-x-0 lg:z-auto',
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2.5 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Scissors size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold leading-tight">POS Jahit</p>
            <p className="text-[10px] text-zinc-400 leading-tight">v1.0</p>
          </div>
          {/* Tombol tutup sidebar - hanya tampil di mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {visibleItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800',
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {session?.user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{session?.user.name}</p>
              <p className="text-[10px] text-zinc-400">{role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}