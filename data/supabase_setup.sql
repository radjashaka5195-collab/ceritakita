-- ====================================================================
-- INSTRUKSI PENYETELAN SUPABASE (DATABASE & STORAGE)
-- ====================================================================
--
-- CARA MENGGUNAKAN SQL INI:
-- 1. Buka Dashboard Supabase Anda (https://supabase.com).
-- 2. Pilih proyek Anda, lalu navigasikan ke menu "SQL Editor" di kolom kiri.
-- 3. Klik "+ New Query", salin seluruh kode SQL di bawah ini, dan tempelkan.
-- 4. Klik tombol "Run" di kanan bawah editor SQL.
--
-- ====================================================================

-- 1. Membuat Tabel `photos` untuk Menyimpan Metadata Polaroid
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  alt TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TEXT,
  is_hero BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- JIKA ANDA SUDAH TERLANJUR MENJALANKAN SQL SEBELUMNYA:
-- Jalankan baris perintah di bawah ini di SQL Editor untuk menambahkan kolom baru:
-- ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_hero BOOLEAN DEFAULT false;
-- ALTER TABLE photos DROP COLUMN IF EXISTS category;


-- ====================================================================
-- 2. PANDUAN PENYETELAN STORAGE BUCKET (Untuk Unggah Gambar)
-- ====================================================================
--
-- Supaya gambar yang diunggah dapat diakses oleh publik, Anda harus membuat 
-- bucket penyimpanan baru di Dashboard Supabase. Ikuti langkah berikut:
--
-- 1. Navigasikan ke menu "Storage" di kolom kiri Dashboard Supabase.
-- 2. Klik tombol "New Bucket" (Buat Bucket Baru).
-- 3. Beri nama bucket tersebut: photos
-- 4. Aktifkan sakelar "Public bucket" (Sangat Penting! Ini agar URL gambar 
--    bisa dibaca langsung oleh browser).
-- 5. Klik "Create bucket".
-- 
-- Selesai! Sekarang proyek Anda sudah siap dihubungkan dengan website.
-- ====================================================================
