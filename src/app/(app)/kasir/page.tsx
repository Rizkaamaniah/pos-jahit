// src/app/(app)/kasir/page.tsx
'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, CheckCircle } from 'lucide-react'
import { formatRupiah, generateInvoiceNo } from '@/lib/utils'
import type { CartItem } from '@/types'
import { ReceiptPrint } from '@/components/ReceiptPrint'

export default function KasirPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState('')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH')
  const [lastTx, setLastTx] = useState<any>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({ content: () => receiptRef.current })

  const { data: products = [] } = useQuery({
    queryKey: ['products-kasir', search],
    queryFn: () => fetch(`/api/produk?search=${search}`).then(r => r.json()),
    enabled: search.length >= 1 || search === '',
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetch('/api/pelanggan').then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(e.error) })
        return r.json()
      }),
    onSuccess: (tx) => {
      setLastTx(tx)
      setShowReceipt(true)
      setCart([])
      setDiscount(0)
      setPaidAmount('')
      setCustomerId(null)
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal - discount
  const change = Number(paidAmount) - total

  function addToCart(product: any) {
    if (product.stockQty <= 0) return alert('Stok habis!')
    setCart(prev => {
      const exist = prev.find(i => i.productId === product.id)
      if (exist) {
        if (exist.qty >= product.stockQty) return alert('Stok tidak cukup!') as any ?? prev
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.priceSell - i.discountItem }
            : i,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          priceSell: Number(product.priceSell),
          qty: 1,
          discountItem: 0,
          subtotal: Number(product.priceSell),
          stockQty: product.stockQty,
          unit: product.unit,
        },
      ]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev =>
      prev
        .map(i => {
          if (i.productId !== productId) return i
          const newQty = i.qty + delta
          if (newQty <= 0) return null as any
          if (newQty > i.stockQty) return i
          return { ...i, qty: newQty, subtotal: newQty * i.priceSell - i.discountItem }
        })
        .filter(Boolean),
    )
  }

  function handleCheckout() {
    if (cart.length === 0) return alert('Keranjang kosong!')
    if (!paidAmount || Number(paidAmount) < total) return alert('Uang bayar kurang!')

    mutation.mutate({
      customerId,
      paymentMethod,
      discount,
      tax: 0,
      paidAmount: Number(paidAmount),
      items: cart.map(i => ({
        productId: i.productId,
        qty: i.qty,
        priceSell: i.priceSell,
        discountItem: i.discountItem,
      })),
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Product Search */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-200">
        <div className="p-4 bg-white border-b border-zinc-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk atau SKU..."
              className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(products as any[]).map((product: any) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stockQty <= 0}
                className="bg-white border border-zinc-100 rounded-xl p-3 text-left hover:border-brand-300 hover:shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-xs text-zinc-400 mb-0.5">{product.sku}</p>
                <p className="text-sm font-medium text-zinc-800 leading-tight mb-1 line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold text-brand-600">{formatRupiah(Number(product.priceSell))}</p>
                <p className={`text-xs mt-1 ${product.stockQty <= product.stockMin ? 'text-red-500' : 'text-zinc-400'}`}>
                  Stok: {product.stockQty} {product.unit}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 flex flex-col bg-white">
        <div className="p-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm text-zinc-800">Keranjang ({cart.length} item)</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {cart.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-8">Belum ada produk</p>
          )}
          {cart.map(item => (
            <div key={item.productId} className="bg-zinc-50 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-zinc-800 leading-tight flex-1">{item.name}</p>
                <button onClick={() => setCart(c => c.filter(i => i.productId !== item.productId))}>
                  <Trash2 size={12} className="text-zinc-400 hover:text-red-500 transition" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{formatRupiah(item.priceSell)} / {item.unit}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    className="w-6 h-6 rounded-md bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    className="w-6 h-6 rounded-md bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-bold text-zinc-800">{formatRupiah(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div className="p-4 border-t border-zinc-100 space-y-3">
          {/* Customer */}
          <select
            value={customerId || ''}
            onChange={e => setCustomerId(e.target.value || null)}
            className="w-full px-2 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">-- Tanpa Pelanggan --</option>
            {(customers as any[]).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Payment Method */}
          <div className="flex gap-2">
            {(['CASH', 'TRANSFER'] as const).map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-1.5 text-xs rounded-lg font-medium border transition ${paymentMethod === m ? 'bg-brand-600 text-white border-brand-600' : 'border-zinc-200 text-zinc-600 hover:border-brand-300'}`}
              >
                {m === 'CASH' ? 'Tunai' : 'Transfer'}
              </button>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Diskon</span>
              <input
                type="number"
                value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-28 px-2 py-0.5 border border-zinc-200 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-brand-300"
              />
            </div>
            <div className="flex justify-between text-base font-bold border-t border-zinc-100 pt-2">
              <span>Total</span>
              <span className="text-brand-600">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Uang Diterima</label>
            <input
              type="number"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 text-right font-bold"
            />
          </div>

          {paidAmount && Number(paidAmount) >= total && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex justify-between text-sm">
              <span className="text-emerald-700">Kembalian</span>
              <span className="font-bold text-emerald-700">{formatRupiah(change)}</span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={mutation.isPending || cart.length === 0}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {mutation.isPending ? 'Memproses...' : 'Bayar'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-5 text-center border-b border-zinc-100">
              <CheckCircle className="text-emerald-500 mx-auto mb-2" size={40} />
              <h2 className="text-lg font-bold">Transaksi Berhasil!</h2>
              <p className="text-sm text-zinc-500">{lastTx.invoiceNo}</p>
            </div>
            <div ref={receiptRef}>
              <ReceiptPrint tx={lastTx} />
            </div>
            <div className="p-4 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-zinc-200 rounded-lg text-sm hover:bg-zinc-50 transition"
              >
                <Printer size={15} />
                Cetak Struk
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
