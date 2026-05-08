// src/app/(app)/laporan/laba-rugi/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatRupiah } from '@/lib/utils'
import * as XLSX from 'xlsx'

export default function LabaRugiPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(monthStart)
  const [dateTo, setDateTo] = useState(today)

  const { data, isLoading } = useQuery({
    queryKey: ['laporan-lr', dateFrom, dateTo],
    queryFn: () => fetch(`/api/laporan?dateFrom=${dateFrom}&dateTo=${dateTo}`).then(r => r.json()),
  })

  const margin = data?.totalRevenue > 0
    ? ((data.totalProfit / data.totalRevenue) * 100).toFixed(1)
    : '0'

  function exportExcel() {
    if (!data) return
    const rows = [
      { Keterangan: 'Total Pendapatan (Revenue)', 'Jumlah (Rp)': data.totalRevenue },
      { Keterangan: 'Harga Pokok Penjualan (HPP)', 'Jumlah (Rp)': data.totalHpp },
      { Keterangan: 'Laba Kotor', 'Jumlah (Rp)': data.totalProfit },
      { Keterangan: 'Margin Laba (%)', 'Jumlah (Rp)': `${margin}%` },
    ]
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laba Rugi')
    XLSX.writeFile(wb, `laba-rugi-${dateFrom}-${dateTo}.xlsx`)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Laporan Laba Rugi</h1>
          <p className="text-sm text-zinc-500">Analisis pendapatan, HPP, dan laba kotor</p>
        </div>
        <button
          onClick={exportExcel}
          className="px-4 py-2 border border-zinc-200 rounded-lg text-sm hover:bg-zinc-50 transition"
        >
          Export Excel
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 mb-6 flex items-center gap-4 flex-wrap">
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

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Income Statement Card */}
          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-4 bg-zinc-900 text-white">
              <h2 className="font-bold text-sm">LAPORAN LABA RUGI</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Periode: {dateFrom} s/d {dateTo}</p>
            </div>
            <div className="divide-y divide-zinc-50">
              <div className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Pendapatan Penjualan</p>
                  <p className="text-xs text-zinc-400">{data?.totalTransactions ?? 0} transaksi</p>
                </div>
                <p className="text-base font-bold text-zinc-900">{formatRupiah(data?.totalRevenue ?? 0)}</p>
              </div>
              <div className="px-5 py-3 flex justify-between items-center bg-red-50/30">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Harga Pokok Penjualan (HPP)</p>
                  <p className="text-xs text-zinc-400">Total harga beli produk terjual</p>
                </div>
                <p className="text-base font-bold text-red-600">({formatRupiah(data?.totalHpp ?? 0)})</p>
              </div>
              <div className="px-5 py-4 flex justify-between items-center bg-emerald-50/50">
                <div>
                  <p className="text-base font-bold text-zinc-900">LABA KOTOR</p>
                  <p className="text-xs text-zinc-400">Margin: {margin}%</p>
                </div>
                <p className={`text-xl font-bold ${(data?.totalProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatRupiah(data?.totalProfit ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          {data?.topProducts?.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-zinc-800 mb-4">Kontribusi Produk Teratas</h2>
              <div className="space-y-3">
                {data.topProducts.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-700 font-medium">{p.name}</span>
                        <span className="text-zinc-500">{p.qty} terjual</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                          style={{ width: `${(p.revenue / data.topProducts[0].revenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-800 w-28 text-right">
                      {formatRupiah(p.revenue)}
                    </span>
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
