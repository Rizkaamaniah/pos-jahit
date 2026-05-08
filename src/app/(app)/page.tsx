// src/app/(app)/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingCart, AlertTriangle, Package } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
          <p className="text-xl font-bold text-zinc-900">{value}</p>
          {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-6" />
        {/* Skeleton responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Ringkasan aktivitas toko hari ini</p>
      </div>

      {/* Stats - 2 kolom di HP, 4 kolom di desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard
          icon={TrendingUp}
          label="Omzet Hari Ini"
          value={formatRupiah(data?.todayRevenue ?? 0)}
          color="bg-emerald-500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Transaksi Hari Ini"
          value={String(data?.todayTransactions ?? 0)}
          sub="transaksi selesai"
          color="bg-blue-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Stok Kritis"
          value={String(data?.lowStockCount ?? 0)}
          sub="produk perlu restock"
          color={data?.lowStockCount > 0 ? 'bg-red-500' : 'bg-zinc-400'}
        />
        <StatCard
          icon={Package}
          label="Total Produk"
          value={String(data?.totalProducts ?? 0)}
          sub="produk aktif"
          color="bg-brand-600"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="px-4 md:px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800 text-sm">Transaksi Terbaru</h2>
        </div>
        <div className="divide-y divide-zinc-50">
          {data?.recentTransactions?.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-8">Belum ada transaksi</p>
          )}
          {data?.recentTransactions?.map((tx: any) => (
            <div key={tx.id} className="px-4 md:px-5 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">{tx.invoiceNo}</p>
                <p className="text-xs text-zinc-400 truncate">
                  {tx.user?.name} • {formatDate(tx.createdAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-emerald-600">{formatRupiah(Number(tx.total))}</p>
                <p className="text-xs text-zinc-400">{tx.items?.length} item</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}