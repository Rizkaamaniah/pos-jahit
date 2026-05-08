// src/app/(app)/produk/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

function ProductModal({
  product, categories, suppliers, onClose,
}: {
  product?: any; categories: any[]; suppliers: any[]; onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = !!product

  const [form, setForm] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    supplierId: product?.supplierId || '',
    priceBuy: product ? Number(product.priceBuy) : 0,
    priceSell: product ? Number(product.priceSell) : 0,
    stockQty: product?.stockQty || 0,
    stockMin: product?.stockMin || 5,
    unit: product?.unit || 'pcs',
    isActive: product?.isActive ?? true,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const url = isEdit ? `/api/produk/${product.id}` : '/api/produk'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Gagal menyimpan produk')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {[
            { label: 'SKU', key: 'sku', type: 'text', col: 1 },
            { label: 'Nama Produk', key: 'name', type: 'text', col: 2 },
            { label: 'Harga Beli', key: 'priceBuy', type: 'number', col: 1 },
            { label: 'Harga Jual', key: 'priceSell', type: 'number', col: 1 },
            { label: 'Stok', key: 'stockQty', type: 'number', col: 1 },
            { label: 'Stok Minimum', key: 'stockMin', type: 'number', col: 1 },
            { label: 'Satuan', key: 'unit', type: 'text', col: 1 },
          ].map(f => (
            <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
              <label className="text-xs font-medium text-zinc-600 block mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Kategori</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Supplier</label>
            <select
              value={form.supplierId}
              onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="">Tanpa Supplier</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-600 block mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
            Batal
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-60"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProdukPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalProduct, setModalProduct] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => fetch(`/api/produk?search=${search}`).then(r => r.json()),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/kategori').then(r => r.json()),
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetch('/api/supplier').then(r => r.json()),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/produk/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Manajemen Produk</h1>
          <p className="text-sm text-zinc-500">Kelola produk alat jahit</p>
        </div>
        <button
          onClick={() => { setModalProduct(null); setShowModal(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="p-4 border-b border-zinc-100">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-zinc-100">
                {['SKU', 'Nama', 'Kategori', 'Harga Jual', 'Stok', 'Satuan', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-zinc-400">Memuat...</td>
                </tr>
              )}
              {!isLoading && (products as any[]).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-zinc-400">Tidak ada produk</td>
                </tr>
              )}
              {(products as any[]).map((p: any) => (
                <tr key={p.id} className="hover:bg-zinc-50/50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500">{p.sku}</td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800">{p.name}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      {p.category?.name ?? '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800">{formatRupiah(Number(p.priceSell))}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${p.stockQty <= p.stockMin ? 'text-red-600' : 'text-zinc-800'}`}>
                    {p.stockQty}
                    {p.stockQty <= p.stockMin && <span className="text-xs text-red-400 ml-1">(kritis)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{p.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setModalProduct(p); setShowModal(true) }}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 size={13} className="text-zinc-500" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Hapus produk ini?')) deleteMutation.mutate(p.id) }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={modalProduct}
          categories={categories as any[]}
          suppliers={suppliers as any[]}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
