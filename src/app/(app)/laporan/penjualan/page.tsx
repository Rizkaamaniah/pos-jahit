// src/app/(app)/laporan/penjualan/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts'
import { formatRupiah, formatDateShort } from '@/lib/utils'
import * as XLSX from 'xlsx'

export default function LaporanPenjualanPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

  const [dateFrom, setDateFrom] = useState(monthStart)
  const [dateTo, setDateTo] = useState(today)

  const { data, isLoading } = useQuery({
    queryKey: ['laporan', dateFrom, dateTo],
    queryFn: () => fetch(`/api/laporan?dateFrom=${dateFrom}&dateTo=${dateTo}`).then(r => r.json()),
  })

  function exportExcel() {
    if (!data) return
    const ws = XLSX.utils.json_to_sheet(
      (data.dailyData || []).map((d: any) => ({
        Tanggal: d.date,
        'Total Transaksi': d.transactions,
        'Pendapatan (Rp)': d.revenue,
        'HPP (Rp)': d.hpp,
        'Laba Kotor (Rp)': d.profit,
      })),
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan')
    XLSX.writeFile(wb, `laporan-penjualan-${dateFrom}-${dateTo}.xlsx`)
  }

  const chartData = (data?.dailyData || []).map((d: any) => ({
    ...d,
    dateLabel: formatDateShort(d.date),
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Laporan Penjualan</h1>
          <p className="text-sm text-zinc-500">Analisis penjualan dan laba</p>
        </div>
        <button
          onClick={exportExcel}
          className="px-4 py-2 border border-zinc-200 rounded-lg text-sm hover:bg-zinc-50 transition"
        >
          Export Excel
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 mb-5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 whitespace-nowrap">Dari:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 whitespace-nowrap">Sampai:</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pendapatan', value: formatRupiah(data.totalRevenue), color: 'text-emerald-600' },
            { label: 'Total HPP', value: formatRupiah(data.totalHpp), color: 'text-red-500' },
            { label: 'Laba Kotor', value: formatRupiah(data.totalProfit), color: 'text-brand-600' },
            { label: 'Total Transaksi', value: String(data.totalTransactions), color: 'text-zinc-800' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-zinc-100 p-4 shadow-sm">
              <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && chartData.length > 0 && (
        <>
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Tren Pendapatan</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a42fd4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#a42fd4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatRupiah(v)} />
                <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#a42fd4" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Profit Chart */}
          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Pendapatan vs HPP vs Laba</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatRupiah(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Pendapatan" fill="#a42fd4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="hpp" name="HPP" fill="#f97316" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit" name="Laba" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          {data?.topProducts?.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-zinc-700 mb-4">Produk Terlaris</h2>
              <div className="space-y-2">
                {data.topProducts.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-zinc-700">{p.name}</span>
                        <span className="text-sm font-medium text-zinc-800">{formatRupiah(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${(p.revenue / data.topProducts[0].revenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 w-16 text-right">{p.qty} terjual</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
