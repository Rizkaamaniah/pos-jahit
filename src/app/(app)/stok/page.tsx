// src/app/(app)/stok/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertTriangle, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const MOVEMENT_LABELS: Record<string, { label: string; color: string }> = {
  SALE: { label: 'Penjualan', color: 'text-red-600 bg-red-50' },
  PURCHASE: { label: 'Pembelian', color: 'text-emerald-600 bg-emerald-50' },
  ADJUSTMENT: { label: 'Penyesuaian', color: 'text-yellow-600 bg-yellow-50' },
  RETURN: { label: 'Retur', color: 'text-blue-600 bg-blue-50' },
}

function AddStockModal({ products, onClose }: { products: any[]; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ productId: '', type: 'PURCHASE', qtyChange: 0, note: '' })

  const mutation = useMutation({
    mutationFn: () =>
      fetch('/api/stok', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(e.error) })
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-movements'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (e: any) => alert(e.message),
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">Pergerakan Stok</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Produk</label>
            <select
              value={form.productId}
              onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">Pilih Produk</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (Stok: {p.stockQty})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Jenis Pergerakan</label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="PURCHASE">Pembelian (Stok Masuk)</option>
              <option value="ADJUSTMENT">Penyesuaian</option>
              <option value="RETURN">Retur dari Pelanggan</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">
              Jumlah Perubahan {form.type === 'ADJUSTMENT' ? '(positif/negatif)' : '(positif)'}
            </label>
            <input
              type="number"
              value={form.qtyChange || ''}
              onChange={e => setForm(p => ({ ...p, qtyChange: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Catatan (opsional)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              placeholder="Misal: Restock dari supplier"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50">Batal</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.productId || !form.qtyChange}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StokPage() {
  const [showModal, setShowModal] = useState(false)

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: () => fetch('/api/stok').then(r => r.json()),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/produk').then(r => r.json()),
  })

  const lowStock = (products as any[]).filter((p: any) => p.stockQty <= p.stockMin)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Manajemen Stok</h1>
          <p className="text-sm text-zinc-500">Riwayat pergerakan stok</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} />
          Pergerakan Stok
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">{lowStock.length} Produk Stok Kritis</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p: any) => (
              <span key={p.id} className="text-xs bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full">
                {p.name} ({p.stockQty} {p.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800 text-sm">Riwayat Pergerakan Stok</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Produk', 'Jenis', 'Sebelum', 'Perubahan', 'Sesudah', 'Oleh', 'Catatan', 'Waktu'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && (
                <tr><td colSpan={8} className="text-center py-8 text-sm text-zinc-400">Memuat...</td></tr>
              )}
              {(movements as any[]).map((m: any) => {
                const meta = MOVEMENT_LABELS[m.type] || { label: m.type, color: 'text-zinc-600 bg-zinc-100' }
                return (
                  <tr key={m.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-800">{m.product?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{m.qtyBefore}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${m.qtyChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.qtyChange > 0 ? `+${m.qtyChange}` : m.qtyChange}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-800">{m.qtyAfter}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{m.user?.name}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{m.note || '-'}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddStockModal products={products as any[]} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
