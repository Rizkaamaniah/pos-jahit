# POS Alat Jahit 🧵

Sistem Point of Sale (POS) berbasis web untuk Toko Peralatan Alat Jahit.

**Tech Stack:** Next.js 14 · Supabase (PostgreSQL) · Prisma ORM · NextAuth.js · TanStack Query · Recharts · Tailwind CSS · Vercel

---

## ✨ Fitur

| Modul | Fitur |
|---|---|
| **Autentikasi** | Login email/password, RBAC (Admin/Kasir), sesi JWT 8 jam |
| **Kasir (POS)** | Cari produk, keranjang belanja, diskon, hitung kembalian, cetak struk |
| **Produk** | CRUD produk, SKU, harga beli/jual, kategori, supplier |
| **Stok** | Manajemen stok, riwayat pergerakan, notifikasi stok kritis |
| **Pelanggan** | CRUD pelanggan, akumulasi total belanja |
| **Supplier** | Data pemasok barang |
| **Kas** | Buka/tutup sesi kasir per shift, rekap modal |
| **Laporan** | Penjualan harian/bulanan, laba rugi, top produk, export Excel |
| **Pengaturan** | Manajemen pengguna sistem |

---

## 🚀 Cara Setup

### 1. Clone & Install

```bash
git clone https://github.com/username/pos-jahit.git
cd pos-jahit
npm install
```

### 2. Buat Database Supabase

1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Salin **Connection String** dari Settings > Database

### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Isi file `.env`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-characters

NEXT_PUBLIC_APP_NAME=POS Alat Jahit
```

### 4. Migrasi Database & Seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 👤 Akun Default

| Role | Email | Password |
|---|---|---|
| Admin | admin@posjahit.com | admin123 |
| Kasir | kasir@posjahit.com | kasir123 |

---

## 📁 Struktur Project

```
pos-jahit/
├── prisma/
│   ├── schema.prisma          # Schema database (9 tabel)
│   └── seed.ts                # Data awal (produk, kategori, dll)
├── src/
│   ├── app/
│   │   ├── (app)/             # Halaman utama (require auth)
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── kasir/         # POS Interface
│   │   │   ├── produk/        # Manajemen Produk & Kategori
│   │   │   ├── stok/          # Manajemen Stok
│   │   │   ├── supplier/      # Manajemen Supplier
│   │   │   ├── pelanggan/     # Manajemen Pelanggan
│   │   │   ├── kas/           # Manajemen Kas
│   │   │   ├── laporan/       # Laporan Penjualan & Laba Rugi
│   │   │   └── pengaturan/    # Pengaturan & Users
│   │   ├── api/               # REST API Endpoints
│   │   │   ├── auth/          # NextAuth.js
│   │   │   ├── dashboard/     # Dashboard stats
│   │   │   ├── produk/        # CRUD Produk
│   │   │   ├── kategori/      # CRUD Kategori
│   │   │   ├── supplier/      # CRUD Supplier
│   │   │   ├── pelanggan/     # CRUD Pelanggan
│   │   │   ├── transaksi/     # Proses Transaksi
│   │   │   ├── stok/          # Pergerakan Stok
│   │   │   ├── kas/           # Sesi Kasir
│   │   │   ├── laporan/       # Data Laporan
│   │   │   └── pengguna/      # CRUD Users
│   │   ├── login/             # Halaman Login
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigasi sidebar
│   │   └── ReceiptPrint.tsx   # Komponen cetak struk
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   └── utils.ts           # Helper functions
│   ├── types/
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── middleware.ts          # Route protection RBAC
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🌐 Deploy ke Vercel

1. Push project ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import repository
3. Set semua Environment Variables (sama seperti `.env`)
4. Update `NEXTAUTH_URL` ke domain Vercel
5. Klik **Deploy**

---

## 📊 Schema Database

9 tabel: `users`, `categories`, `suppliers`, `products`, `customers`, `transactions`, `transaction_items`, `stock_movements`, `cash_drawers`

---

## 💰 Estimasi Biaya

| Layanan | Plan | Biaya |
|---|---|---|
| Vercel Hosting | Hobby (Free) | Gratis |
| Supabase Database | Free Tier | Gratis |
| Domain (opsional) | .id / .com | ~Rp 150rb/tahun |
| **Total** | | **Rp 0 - 13rb/bulan** |

---

*Versi 1.0 · Mei 2026 · Sistem POS Toko Alat Jahit*
