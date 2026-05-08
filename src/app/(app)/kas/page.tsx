// src/app/(app)/kas/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet, PlayCircle, StopCircle } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function KasPage() {
  const qc = useQueryClient()
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingBalance, setClosingBalance] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['kas'],
    queryFn: () => fetch('/api/kas').then(r => r.json()),
    refetchInterval: 30000,
  })

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      fetch('/api/kas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kas'] })
      setOpeningBalance('')
      setClosingBalance('')
    },
  })

  const activeDrawer = data?.activeDrawer
  const history = data?.history ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Manajemen Kas</h1>
        <p className="text-sm text-zinc-500">Buka dan tutup sesi kasir per shift</p>
      </div>

      {/* Active Session */}
      <div className={`rounded-xl border p-5 mb-6 ${activeDrawer ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className={activeDrawer ? 'text-emerald-600' : 'text-zinc-400'} />
          <h2 className="font-semibold text-sm">
            {activeDrawer ? 'Sesi Kasir Aktif' : 'Tidak Ada Sesi Aktif'}
          </h2>
        </div>

        {activeDrawer ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-zinc-500">Modal Awal</p>
                <p className="text-lg font-bold text-zinc-800">{formatRupiah(Number(activeDrawer.openingBalance))}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-zinc-500">Dibuka Pada</p>
                <p className="text-sm font-medium text-zinc-800">{formatDate(activeDrawer.openedAt)}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">Saldo Akhir (saat tutup)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={closingBalance}
                  onChange={e => setClosingBalance(e.target.value)}
                  placeholder="Masukkan saldo akhir"
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button
                  onClick={() => mutation.mutate({ action: 'close', closingBalance: Number(closingBalance) })}
                  disabled={!closingBalance || mutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
                >
                  <StopCircle size={15} />
                  Tutup Sesi
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              value={openingBalance}
              onChange={e => setOpeningBalance(e.target.value)}
              placeholder="Modal awal kas"
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <button
              onClick={() => mutation.mutate({ action: 'open', openingBalance: Number(openingBalance) })}
              disabled={!openingBalance || mutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              <PlayCircle size={15} />
              Buka Sesi
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-sm text-zinc-800">Riwayat Sesi Kasir</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Kasir', 'Modal Awal', 'Saldo Akhir', 'Dibuka', 'Ditutup', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {history.map((d: any) => (
                <tr key={d.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 text-sm text-zinc-800">{d.user?.name}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatRupiah(Number(d.openingBalance))}</td>
                  <td className="px-4 py-3 text-sm font-medium">{d.closingBalance ? formatRupiah(Number(d.closingBalance)) : '-'}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(d.openedAt)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{d.closedAt ? formatDate(d.closedAt) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {d.status === 'OPEN' ? 'Aktif' : 'Selesai'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
