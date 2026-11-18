# Aplikasi Web Pendaftaran Kejuaraan Pencak Silat

Aplikasi web modern, responsif, dan profesional untuk sistem pendaftaran peserta kejuaraan pencak silat berbasis **kontingen**. Aplikasi ini dikembangkan secara utuh berdasarkan spesifikasi dokumen perencanaan dan standar visual **Anti-Slop (No AI Slop UI)**.

---

## 🥋 Fitur Utama & Kesesuaian Spesifikasi

1. **Model Pendaftaran Berbasis Kontingen (Bab 1, 2, 3)**:
   - Satu kontingen dapat mendaftarkan banyak atlet sekaligus dalam satu kali proses pendaftaran.
   - Form dinamis untuk penambahan, penghapusan, dan peringkasan (*collapsible accordion*) data atlet.
   - Pengisian usia atlet diisi secara manual sesuai kesepakatan Bab 2.
   - Pilihan kategori pertandingan: **Tanding** dan **Seni** (Tunggal, Ganda, Regu, Solo Kreatif).
   - Pengumpulan berkas persyaratan dilakukan satu kali di tingkat kontingen.

2. **Alur Pendaftaran Bertahap / Multi-step Wizard (Bab 4 & Bab 11.6)**:
   - **Langkah 1:** Identitas Kontingen & Penanggung Jawab (Nama, Asal Lembaga, Nama PJ, WhatsApp, Email).
   - **Langkah 2:** Data Atlet (Biodata, Tempat Tanggal Lahir, Usia manual, Kategori, Kelas).
   - **Langkah 3:** Dokumen Kontingen (5 area dropzone: Pas Foto, KK/Akta, Surat Izin Ortu, Surat Keterangan Sehat, Formulir).
   - **Langkah 4:** Periksa & Kirim (Ringkasan lengkap dengan tombol ubah instan, checkbox pernyataan keabsahan).
   - **Layar Berhasil:** ID Registrasi Kontingen unik (contoh: `KTG-2026-XXXX`), tombol cetak struk/kuitansi tanda terima resmi, dan tautan kembali.

3. **Penyimpanan Terintegrasi (Bab 5 & 6)**:
   - **Google Spreadsheet:** Struktur 3 Sheet terpisah:
     - `DATA_KONTINGEN` (Kolom A-H)
     - `DATA_ATLET` (Kolom A-J)
     - `DOKUMEN_KONTINGEN` (Kolom A-G)
   - **Google Drive:** Otomatis membuat folder dan subfolder terorganisir per kontingen untuk menyimpan berkas yang diunggah.
   - **Google Apps Script (`google-apps-script/Code.gs`):** Skrip backend siap pakai dengan `doPost` dan penanganan `Base64` file upload ke Drive.

4. **Desain Profesional & Anti-Slop UI (Bab 11)**:
   - Palet warna resmi bela diri Nusantara: **Hijau Rimba (`#15803D`)**, **Hijau Tua (`#14532D`)**, **Hijau Segar (`#22C55E`)**, **Latar Hijau Embun (`#F0FDF4`)**, dan **Aksen Emas (`#F5B301`)**.
   - Hero dinamis dengan gradasi hijau resmi dan tekstur motif geometris tradisional Nusantara halus.
   - Tanpa gradien ungu-biru generik AI, tanpa glassmorphism berlebih, tanpa pill-shape di seluruh tombol, tanpa data/testimoni palsu.
   - Rasio kontras teks memenuhi standar aksesibilitas WCAG AA (kontras > 4.5:1).
   - Responsif optimal pada layar ponsel (*mobile first*), tablet, dan desktop.

5. **Dukungan Dual Mode (Siap Evaluasi & Siap Live)**:
   - **Mode Simulasi (Default):** Dapat langsung diuji secara instan di browser tanpa memerlukan koneksi backend terlebih dahulu (data tersimpan di memori browser dan struk pendaftaran resmi langsung terbit).
   - **Mode Live Google Apps Script:** Cukup atur URL Web App Apps Script Anda pada file `js/kirim.js` untuk mengirim data langsung ke Google Spreadsheet dan Drive.

---

## 📁 Struktur Berkas Proyek

```text
/UPSC
 ├─ index.html                  (Halaman beranda/landing page resmi event)
 ├─ daftar.html                 (Halaman formulir pendaftaran wizard bertahap)
 ├─ README.md                   (Panduan utama proyek)
 ├─ assets/                     (Aset visual & gambar)
 │   └─ img/
 │       ├─ logo nu.png         (Logo resmi Nahdlatul Ulama)
 │       ├─ logo ipsi.png       (Logo resmi Ikatan Pencak Silat Indonesia)
 │       ├─ Logo_Pagar_Nusa.png (Logo resmi Pencak Silat NU Pagar Nusa)
 │       ├─ Unu giri.png        (Logo resmi Universitas Nahdlatul Ulama Sunan Giri)
 │       ├─ Logo UKM HD.png     (Logo resmi UKM Pencak Silat NU Pagar Nusa UNUGIRI)
 │       ├─ Maskot naga polos.png (Maskot naga resmi kejuaraan pencak silat)
 │       └─ pola-batik.svg      (Motif batik kawung tradisional Nusantara)
 ├─ css/
 │   └─ style.css               (Kustom styling, tema warna silat, dropzone, dan print media)
 ├─ js/
 │   ├─ app.js                  (Logika interaksi landing page, countdown waktu, drawer mobile, modal juknis)
 │   ├─ form.js                 (Logika stepper, manajemen atlet dinamis, validasi, dropzone)
 │   └─ kirim.js                (Handler pengiriman data ke Google Apps Script / LocalStorage)
 └─ google-apps-script/
     ├─ Code.gs                 (Kode Google Apps Script untuk dipasang di Spreadsheet)
     └─ README-SETUP.md         (Panduan langkah demi langkah integrasi Google Drive & Sheets)
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dibuat menggunakan standar web modern (HTML5, Tailwind CSS via CDN, Vanilla JavaScript modular) sehingga **dapat langsung dijalankan di browser apa pun tanpa memerlukan instalasi Node.js atau server tambahan**.

1. Cukup buka file `index.html` dengan cara klik ganda (*double click*) atau klik kanan > *Open with* (Chrome, Edge, Firefox, Safari).
2. Anda juga dapat menggunakan live server lokal (misalnya ekstensi VS Code *Live Server* atau `npx serve`).

---

## 📄 Pengujian Alur Pendaftaran

1. Buka `index.html` dan klik tombol **"Daftar Sekarang"**.
2. Anda akan diarahkan ke `daftar.html`.
3. Isi data kontingen pada **Langkah 1** &rarr; klik **Lanjut**.
4. Pada **Langkah 2**, isi data atlet pertama, lalu coba klik **"+ Tambah Atlet Lagi ke Kontingen Ini"** untuk menambah atlet kedua &rarr; klik **Lanjut**.
5. Pada **Langkah 3**, coba unggah salah satu berkas (gambar atau PDF) dengan cara klik atau seret ke area dropzone &rarr; klik **Lanjut**.
6. Pada **Langkah 4**, tinjau ringkasan seluruh data, centang pernyataan integritas, lalu klik **Kirim Pendaftaran**.
7. Layar sukses akan muncul menampilkan nomor ID Registrasi resmi. Klik **"Cetak Bukti Pendaftaran"** untuk mencetak struk atau menyimpannya sebagai format PDF.
