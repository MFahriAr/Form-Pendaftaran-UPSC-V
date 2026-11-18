# Panduan Integrasi Google Spreadsheet & Google Drive

Dokumen ini menjelaskan langkah-langkah menghubungkan aplikasi web pendaftaran pencak silat dengan Google Spreadsheet dan Google Drive menggunakan Google Apps Script (GAS) sesuai rancangan Bab 5 dan 6.

---

## 1. Menyiapkan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) dan buat Spreadsheet baru.
2. Beri nama file, misalnya: `DATABASE_PENDAFTARAN_PENCAK_SILAT_2026`.
3. Anda tidak perlu membuat sheet dan kolom secara manual, karena skrip `Code.gs` akan **otomatis membuat 3 sheet** (`DATA_KONTINGEN`, `DATA_ATLET`, dan `DOKUMEN_KONTINGEN`) beserta header berlatar hijau rimba saat data pertama kali dikirim!

---

## 2. Memasang Kode Google Apps Script

1. Pada Google Spreadsheet yang telah dibuka, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus semua kode bawaan yang ada di editor `Code.gs`.
3. Buka file `google-apps-script/Code.gs` dari folder proyek ini, salin seluruh kodenya, lalu tempelkan ke editor Apps Script.
4. Klik tombol **Save** (ikon disket) atau tekan `Ctrl + S`.

---

## 3. Melakukan Deployment Sebagai Web App

1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** > **New deployment**.
2. Pada ikon gerigi di sebelah kiri *Select type*, pilih **Web app**.
3. Isi konfigurasi sebagai berikut:
   - **Description:** `Webhook Pendaftaran Pencak Silat v1.0`
   - **Execute as:** `Me (email Anda)`
   - **Who has access:** `Anyone` (Siapa saja, agar peserta dapat mengirim form tanpa perlu login Google)
4. Klik tombol **Deploy**.
5. Jika muncul jendela permintaan otorisasi (*Authorization Required*):
   - Klik **Authorize access**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced (Lanjutan)** di bagian bawah, lalu klik **Go to Untitled project (unsafe)**.
   - Klik **Allow (Izinkan)** untuk mengizinkan Apps Script menulis ke Spreadsheet dan Drive Anda.
6. Salin **Web app URL** yang muncul (berakhiran `/exec`). Contoh format URL:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 4. Menghubungkan Web App URL ke Website

Anda memiliki 2 cara mudah untuk menghubungkan URL ini:

### Cara A: Melalui Menu Pengaturan di Website (Tanpa Ubah Koding)
1. Buka website pendaftaran (`daftar.html`).
2. Di pojok kanan atas formulir, klik tombol **"⚙️ Mode Koneksi"**.
3. Pilih **"Mode Live (Google Apps Script)"**.
4. Tempelkan Web app URL yang tadi disalin ke dalam kotak input yang disediakan, lalu klik **Simpan Pengaturan**.

### Cara B: Mengubah Nilai Default di File `js/kirim.js`
Buka file `js/kirim.js` dan ubah nilai variabel:
```javascript
const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
```

---

## 5. Struktur Folder di Google Drive

Secara otomatis, skrip akan membuat folder di Google Drive Anda bernama:
`BERKAS_PENDAFTARAN_PENCAK_SILAT/`

Di dalam folder tersebut, setiap kontingen yang mendaftar akan dibuatkan subfolder khusus:
`KTG-2026-0001_NAMA_KONTINGEN/`

Berisi berkas persyaratan yang diunggah:
- `KTG-2026-0001_PasFoto_...`
- `KTG-2026-0001_KK_Akta_...`
- `KTG-2026-0001_SuratIzin_...`
- `KTG-2026-0001_SuratSehat_...`
- `KTG-2026-0001_Formulir_...`

Tautan langsung menuju berkas tersebut akan otomatis dicatat di sheet `DOKUMEN_KONTINGEN`.
