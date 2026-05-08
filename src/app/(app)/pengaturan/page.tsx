// src/app/(app)/pengaturan/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Users, Shield } from 'lucide-react'

function AddUserModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'KASIR' })

  const mutation = useMutation({
    mutationFn: () =>
      fetch('/api/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">Tambah Pengguna</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Nama Lengkap', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-zinc-600 block mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-zinc-600 block mb-1">Peran</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="KASIR">Kasir</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50">Batal</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.name || !form.email || !form.password || mutation.isPending}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PengaturanPage() {
  const [showModal, setShowModal] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/pengguna').then(r => r.json()),
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Pengaturan</h1>
        <p className="text-sm text-zinc-500">Kelola pengguna dan konfigurasi toko</p>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-sm text-zinc-800 mb-4 flex items-center gap-2">
          <Shield size={15} className="text-brand-600" />
          Informasi Toko
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nama Toko', value: 'Toko Alat Jahit' },
            { label: 'Alamat', value: 'Jl. Mesin Jahit No. 1' },
            { label: 'Telepon', value: '021-XXXXXXX' },
            { label: 'Versi Sistem', value: 'v1.0 — Mei 2026' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-zinc-400 mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-zinc-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-zinc-800 flex items-center gap-2">
            <Users size={15} className="text-brand-600" />
            Manajemen Pengguna
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition"
          >
            <Plus size={13} />
            Tambah
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Nama', 'Email', 'Peran', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading && <tr><td colSpan={4} className="text-center py-6 text-sm text-zinc-400">Memuat...</td></tr>}
              {(users as any[]).map((u: any) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-zinc-800">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
