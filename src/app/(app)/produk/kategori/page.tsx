// src/app/(app)/produk/kategori/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Layers } from 'lucide-react'

export default function KategoriPage() {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/kategori').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: () =>
      fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setDescription('')
      setShowForm(false)
    },
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Kategori Produk</h1>
          <p className="text-sm text-zinc-500">Kelola kategori alat jahit</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} />
          Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-zinc-800">Kategori Baru</h2>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-zinc-400" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">Nama Kategori</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Benang, Jarum, Kain..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">Deskripsi (opsional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Deskripsi singkat kategori"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={!name || mutation.isPending}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60"
              >
                {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {isLoading && [...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-zinc-200 rounded-xl animate-pulse" />
        ))}
        {(categories as any[]).map((cat: any) => (
          <div key={cat.id} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Layers size={15} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">{cat.name}</p>
              {cat.description && <p className="text-xs text-zinc-400 mt-0.5 leading-tight">{cat.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
