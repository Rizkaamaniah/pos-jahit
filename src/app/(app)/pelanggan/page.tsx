// src/app/(app)/pelanggan/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, X } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'

function CustomerModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })

  const mutation = useMutation({
    mutationFn: () =>
      fetch('/api/pelanggan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers-list'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">Tambah Pelanggan</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Nama', key: 'name', type: 'text', placeholder: 'Nama pelanggan' },
            { label: 'No. Telepon', key: 'phone', type: 'tel', placeholder: '08xx' },
            { label: 'Alamat', key: 'address', type: 'text', placeholder: 'Alamat (opsional)' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-zinc-600 block mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50">Batal</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.name || mutation.isPending}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PelangganPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-list', search],
    queryFn: () => fetch(`/api/pelanggan?search=${search}`).then(r => r.json()),
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Manajemen Pelanggan</h1>
          <p className="text-sm text-zinc-500">Data pelanggan setia toko</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} />
          Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pelanggan..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Nama', 'No. Telepon', 'Alamat', 'Total Belanja', 'Bergabung'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && <tr><td colSpan={5} className="text-center py-8 text-sm text-zinc-400">Memuat...</td></tr>}
              {(customers as any[]).map((c: any) => (
                <tr key={c.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate">{c.address || '-'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-brand-700">{formatRupiah(Number(c.totalSpend))}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CustomerModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
