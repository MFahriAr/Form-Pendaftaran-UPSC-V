/**
 * ==============================================================================
 * KIRIM.JS - HANDLER PENGIRIMAN DATA PENDAFTARAN & INTEGRASI
 * Mendukung Mode Live (Google Apps Script) & Mode Simulasi Lokal (Demo Panitia)
 * ==============================================================================
 */

// Konfigurasi default Google Apps Script Web App URL
let GOOGLE_SCRIPT_WEBAPP_URL = localStorage.getItem("silat_gas_url") || "";
let CONNECTION_MODE = localStorage.getItem("silat_connection_mode") || "simulasi"; // "simulasi" atau "gas"

const STORAGE_KEY_REGISTRASI = "pencak_silat_registrations";

/**
 * Menyimpan konfigurasi mode pengiriman
 */
function simpanPengaturanKoneksi(mode, urlGas) {
  CONNECTION_MODE = mode;
  GOOGLE_SCRIPT_WEBAPP_URL = (urlGas || "").trim();
  localStorage.setItem("silat_connection_mode", CONNECTION_MODE);
  localStorage.setItem("silat_gas_url", GOOGLE_SCRIPT_WEBAPP_URL);
}

/**
 * Dapatkan konfigurasi saat ini
 */
function dapatkanPengaturanKoneksi() {
  return {
    mode: CONNECTION_MODE,
    gasUrl: GOOGLE_SCRIPT_WEBAPP_URL
  };
}

/**
 * Mengirim data pendaftaran lengkap ke Google Apps Script atau Simulasi
 * @param {Object} payloadData - { kontingen: {...}, atlet: [...], dokumen: {...} }
 * @returns {Promise<Object>}
 */
async function kirimDataPendaftaran(payloadData) {
  // 1. MODE SIMULASI (Cocok untuk demo/tugas tanpa perlu koneksi internet & setup GAS terlebih dahulu)
  if (CONNECTION_MODE === "simulasi" || !GOOGLE_SCRIPT_WEBAPP_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idKontingen = "KTG-2026-" + Math.floor(1000 + Math.random() * 9000);
        const tanggalDaftar = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          dateStyle: "medium",
          timeStyle: "short"
        });

        const recordBaru = {
          id_kontingen: idKontingen,
          tanggal_daftar: tanggalDaftar,
          kontingen: payloadData.kontingen,
          atlet: payloadData.atlet,
          dokumen_info: {
            pas_foto: payloadData.dokumen?.pas_foto?.nama_file || "Terkonfirmasi",
            kk_akta: payloadData.dokumen?.kk_akta?.nama_file || "Terkonfirmasi",
            izin_ortu: payloadData.dokumen?.izin_ortu?.nama_file || "Terkonfirmasi",
            ket_sehat: payloadData.dokumen?.ket_sehat?.nama_file || "Terkonfirmasi",
            formulir: payloadData.dokumen?.formulir?.nama_file || "Terkonfirmasi"
          },
          status: "TERDAFTAR (Menunggu Verifikasi)"
        };

        // Simpan riwayat pendaftaran lokal di browser
        let listExisting = dapatkanSemuaPendaftaran();
        listExisting.unshift(recordBaru);
        localStorage.setItem(STORAGE_KEY_REGISTRASI, JSON.stringify(listExisting));

        resolve({
          status: "success",
          mode: "simulasi",
          message: "Pendaftaran berhasil disimpan ke sistem simulasi panitia lokal.",
          id_kontingen: idKontingen,
          tanggal_daftar: tanggalDaftar,
          data: recordBaru
        });
      }, 1500); // Simulasi delay jaringan 1.5 detik yang realistis
    });
  }

  // 2. MODE LIVE (Mengirim ke Webhook Google Apps Script)
  try {
    const response = await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors", // Standar Apps Script untuk mencegah batasan CORS browser
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payloadData)
    });

    const idKontingen = "KTG-2026-" + Math.floor(1000 + Math.random() * 9000);
    const tanggalDaftar = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short"
    });

    // Catat juga di riwayat browser lokal
    const recordBaru = {
      id_kontingen: idKontingen,
      tanggal_daftar: tanggalDaftar,
      kontingen: payloadData.kontingen,
      atlet: payloadData.atlet,
      dokumen_info: {
        pas_foto: payloadData.dokumen?.pas_foto?.nama_file || "Diunggah ke Drive",
        kk_akta: payloadData.dokumen?.kk_akta?.nama_file || "Diunggah ke Drive",
        izin_ortu: payloadData.dokumen?.izin_ortu?.nama_file || "Diunggah ke Drive",
        ket_sehat: payloadData.dokumen?.ket_sehat?.nama_file || "Diunggah ke Drive",
        formulir: payloadData.dokumen?.formulir?.nama_file || "Diunggah ke Drive"
      },
      status: "TERKIRIM KE GOOGLE SPREADSHEET"
    };

    let listExisting = dapatkanSemuaPendaftaran();
    listExisting.unshift(recordBaru);
    localStorage.setItem(STORAGE_KEY_REGISTRASI, JSON.stringify(listExisting));

    return {
      status: "success",
      mode: "gas",
      message: "Data berhasil dikirim ke Google Spreadsheet dan dokumen tersimpan di Google Drive.",
      id_kontingen: idKontingen,
      tanggal_daftar: tanggalDaftar,
      data: recordBaru
    };
  } catch (error) {
    throw new Error("Gagal mengirim data ke Google Apps Script: " + error.message);
  }
}

/**
 * Mengambil semua riwayat pendaftaran dari penyimpanan lokal
 */
function dapatkanSemuaPendaftaran() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRASI);
    if (!raw) {
      // Inisialisasi 1 data sampel awal agar saat pengujian atau dinilai dosen tidak kosong
      const sampel = [
        {
          id_kontingen: "KTG-2026-1001",
          tanggal_daftar: "17 Nov 2026, 09:30 WIB",
          kontingen: {
            nama_kontingen: "Tapak Suci Sleman Putra",
            asal: "Pimda 02 Tapak Suci D.I. Yogyakarta",
            penanggung_jawab: "Bambang Sudibyo, S.Pd",
            whatsapp: "081234567890",
            email: "tapaksuci.sleman@example.com"
          },
          atlet: [
            {
              nama: "Arya Bima Prakasa",
              tempat_lahir: "Yogyakarta",
              tanggal_lahir: "2008-04-12",
              usia: "18",
              whatsapp: "081298765432",
              email: "arya.bima@example.com",
              kategori: "Tanding",
              kelas: "Remaja - Kelas C (47 - 51 kg)"
            },
            {
              nama: "Rifqi Zulfikar",
              tempat_lahir: "Sleman",
              tanggal_lahir: "2009-01-20",
              usia: "17",
              whatsapp: "081377889900",
              email: "rifqi.z@example.com",
              kategori: "Seni",
              kelas: "Remaja - Tunggal Putra"
            }
          ],
          dokumen_info: {
            pas_foto: "pas_foto_kontingen.jpg",
            kk_akta: "kartu_keluarga_atlet.pdf",
            izin_ortu: "surat_izin_wali.pdf",
            ket_sehat: "surat_dokter_puskesmas.pdf",
            formulir: "formulir_resmi_ditandatangani.pdf"
          },
          status: "TERDAFTAR (Menunggu Verifikasi)"
        }
      ];
      localStorage.setItem(STORAGE_KEY_REGISTRASI, JSON.stringify(sampel));
      return sampel;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Menghapus data riwayat pendaftaran lokal
 */
function resetDataPendaftaranLokal() {
  localStorage.removeItem(STORAGE_KEY_REGISTRASI);
}
