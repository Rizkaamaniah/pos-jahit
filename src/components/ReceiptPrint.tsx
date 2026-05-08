// src/components/ReceiptPrint.tsx
import { formatRupiah, formatDate } from '@/lib/utils'

export function ReceiptPrint({ tx }: { tx: any }) {
  return (
    <div className="p-4 font-mono text-xs" style={{ width: '100%', maxWidth: 300 }}>
      <div className="text-center mb-3">
        <p className="font-bold text-base">TOKO ALAT JAHIT</p>
        <p className="text-zinc-500">Jl. Mesin Jahit No. 1</p>
        <p className="text-zinc-500">Telp: 021-XXXXXXX</p>
      </div>
      <div className="border-t border-dashed border-zinc-300 my-2" />
      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between">
          <span>No. Invoice</span>
          <span className="font-bold">{tx.invoiceNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal</span>
          <span>{formatDate(tx.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>{tx.user?.name ?? '-'}</span>
        </div>
        {tx.customer && (
          <div className="flex justify-between">
            <span>Pelanggan</span>
            <span>{tx.customer.name}</span>
          </div>
        )}
      </div>
      <div className="border-t border-dashed border-zinc-300 my-2" />
      {tx.items?.map((item: any, i: number) => (
        <div key={i} className="mb-1">
          <p className="font-medium">{item.product?.name ?? 'Produk'}</p>
          <div className="flex justify-between text-zinc-500">
            <span>{item.qty} x {formatRupiah(Number(item.priceSell))}</span>
            <span>{formatRupiah(Number(item.subtotal))}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-dashed border-zinc-300 my-2" />
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(Number(tx.subtotal))}</span>
        </div>
        {Number(tx.discount) > 0 && (
          <div className="flex justify-between text-zinc-500">
            <span>Diskon</span>
            <span>-{formatRupiah(Number(tx.discount))}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-zinc-300 pt-1">
          <span>TOTAL</span>
          <span>{formatRupiah(Number(tx.total))}</span>
        </div>
        <div className="flex justify-between">
          <span>Bayar ({tx.paymentMethod === 'CASH' ? 'Tunai' : 'Transfer'})</span>
          <span>{formatRupiah(Number(tx.paidAmount))}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Kembalian</span>
          <span>{formatRupiah(Number(tx.changeAmount))}</span>
        </div>
      </div>
      <div className="border-t border-dashed border-zinc-300 my-3" />
      <p className="text-center text-zinc-500">Terima kasih telah berbelanja!</p>
      <p className="text-center text-zinc-400 mt-1">*** STRUK INI SEBAGAI BUKTI PEMBAYARAN ***</p>
    </div>
  )
}
