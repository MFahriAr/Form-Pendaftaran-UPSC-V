/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - SISTEM PENDAFTARAN LOMBA PENCAK SILAT
 * Penghubung Antara Website Pendaftaran, Google Sheets, dan Google Drive
 * Sesuai Dokumen Perencanaan Bab 5 & Bab 6
 * ==============================================================================
 */

// KONFIGURASI NAMA SHEET
const SHEET_KONTINGEN = "DATA_KONTINGEN";
const SHEET_ATLET     = "DATA_ATLET";
const SHEET_DOKUMEN   = "DOKUMEN_KONTINGEN";
const NAMA_FOLDER_DRIVE = "BERKAS_PENDAFTARAN_PENCAK_SILAT";

/**
 * Handle HTTP GET Request (Pemeriksaan status service)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Service Webhook Pendaftaran Pencak Silat aktif dan siap menerima data.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Request (Menerima pengiriman data pendaftaran dan dokumen)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Kunci proses selama maksimal 30 detik untuk mencegah tabrakan data (race condition)
    lock.waitLock(30000);

    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error("Payload data tidak ditemukan.");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    inialisasiSheetJikaBelumAda(ss);

    // 1. GENERATE ID KONTINGEN (Format: KTG-YYYY-XXXX)
    const sheetKontingen = ss.getSheetByName(SHEET_KONTINGEN);
    const rowCount = Math.max(sheetKontingen.getLastRow(), 1);
    const tahunSekarang = new Date().getFullYear();
    const idKontingen = data.id_kontingen || `KTG-${tahunSekarang}-${padNumber(rowCount, 4)}`;
    const tanggalPendaftaran = data.tanggal_daftar || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // 2. SIMPAN DATA KONTINGEN
    sheetKontingen.appendRow([
      idKontingen,
      tanggalPendaftaran,
      data.kontingen.nama_kontingen || "-",
      data.kontingen.asal || "-",
      data.kontingen.penanggung_jawab || "-",
      "'" + (data.kontingen.whatsapp || "-"), // Beri tanda petik agar format nomor WA tidak terpotong
      data.kontingen.email || "-",
      "TERDAFTAR (Menunggu Verifikasi)"
    ]);

    // 3. SIMPAN DATA ATLET (Bisa banyak atlet untuk satu kontingen)
    const sheetAtlet = ss.getSheetByName(SHEET_ATLET);
    let atletCount = sheetAtlet.getLastRow();
    if (Array.isArray(data.atlet)) {
      data.atlet.forEach((atl, index) => {
        atletCount++;
        const idAtlet = `ATL-${tahunSekarang}-${padNumber(atletCount, 4)}`;
        sheetAtlet.appendRow([
          idAtlet,
          idKontingen,
          atl.nama || "-",
          atl.tempat_lahir || "-",
          atl.tanggal_lahir || "-",
          atl.usia || "-",
          "'" + (atl.whatsapp || "-"),
          atl.email || "-",
          atl.kategori || "-",
          atl.kelas || "-"
        ]);
      });
    }

    // 4. SIMPAN DOKUMEN KE GOOGLE DRIVE & TAUTAN KE SHEET DOKUMEN
    const sheetDokumen = ss.getSheetByName(SHEET_DOKUMEN);
    const folderUtama = dapatkanAtauBuatFolder(NAMA_FOLDER_DRIVE);
    // Buat subfolder khusus per kontingen agar rapi
    const folderKontingen = folderUtama.createFolder(`${idKontingen}_${sanitizeFolderName(data.kontingen.nama_kontingen)}`);

    const linkDokumen = {
      pas_foto: "-",
      kk_akta: "-",
      izin_ortu: "-",
      ket_sehat: "-",
      formulir: "-"
    };

    if (data.dokumen) {
      if (data.dokumen.pas_foto && data.dokumen.pas_foto.base64) {
        linkDokumen.pas_foto = simpanFileKeDrive(folderKontingen, data.dokumen.pas_foto, `${idKontingen}_PasFoto`);
      }
      if (data.dokumen.kk_akta && data.dokumen.kk_akta.base64) {
        linkDokumen.kk_akta = simpanFileKeDrive(folderKontingen, data.dokumen.kk_akta, `${idKontingen}_KK_Akta`);
      }
      if (data.dokumen.izin_ortu && data.dokumen.izin_ortu.base64) {
        linkDokumen.izin_ortu = simpanFileKeDrive(folderKontingen, data.dokumen.izin_ortu, `${idKontingen}_SuratIzin`);
      }
      if (data.dokumen.ket_sehat && data.dokumen.ket_sehat.base64) {
        linkDokumen.ket_sehat = simpanFileKeDrive(folderKontingen, data.dokumen.ket_sehat, `${idKontingen}_SuratSehat`);
      }
      if (data.dokumen.formulir && data.dokumen.formulir.base64) {
        linkDokumen.formulir = simpanFileKeDrive(folderKontingen, data.dokumen.formulir, `${idKontingen}_Formulir`);
      }
    }

    const docCount = Math.max(sheetDokumen.getLastRow(), 1);
    const idDokumen = `DOC-${tahunSekarang}-${padNumber(docCount, 4)}`;
    sheetDokumen.appendRow([
      idDokumen,
      idKontingen,
      linkDokumen.pas_foto,
      linkDokumen.kk_akta,
      linkDokumen.izin_ortu,
      linkDokumen.ket_sehat,
      linkDokumen.formulir
    ]);

    // Berhasil disimpan
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Pendaftaran kontingen dan atlet berhasil disimpan.",
      id_kontingen: idKontingen,
      total_atlet: data.atlet ? data.atlet.length : 0,
      drive_folder_url: folderKontingen.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan file dari string Base64 ke Google Drive
 */
function simpanFileKeDrive(folder, fileObj, namaPrefix) {
  try {
    const rawData = fileObj.base64.split(",")[1] || fileObj.base64;
    const bytes = Utilities.base64Decode(rawData);
    const namaFile = `${namaPrefix}_${fileObj.nama_file || "berkas.pdf"}`;
    const blob = Utilities.newBlob(bytes, fileObj.mime_type || "application/octet-stream", namaFile);
    const file = folder.createFile(blob);
    // Berikan izin agar panitia bisa melihat
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return `Gagal mengunggah: ${e.message}`;
  }
}

/**
 * Mencari atau membuat folder Google Drive berdasarkan nama
 */
function dapatkanAtauBuatFolder(namaFolder) {
  const folders = DriveApp.getFoldersByName(namaFolder);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(namaFolder);
}

/**
 * Membersihkan nama folder dari karakter terlarang
 */
function sanitizeFolderName(name) {
  if (!name) return "Kontingen";
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim();
}

/**
 * Padding angka (contoh: 1 -> "0001")
 */
function padNumber(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

/**
 * Auto-inisialisasi struktur Sheet jika belum dibuat
 */
function inialisasiSheetJikaBelumAda(ss) {
  // 1. DATA_KONTINGEN
  let s1 = ss.getSheetByName(SHEET_KONTINGEN);
  if (!s1) {
    s1 = ss.insertSheet(SHEET_KONTINGEN);
    s1.appendRow([
      "ID Kontingen",
      "Tanggal Pendaftaran",
      "Nama Kontingen",
      "Asal Perguruan/Sekolah/Instansi",
      "Nama Penanggung Jawab",
      "Nomor WhatsApp",
      "Email",
      "Status Pendaftaran"
    ]);
    formatHeaderSheet(s1);
  }

  // 2. DATA_ATLET
  let s2 = ss.getSheetByName(SHEET_ATLET);
  if (!s2) {
    s2 = ss.insertSheet(SHEET_ATLET);
    s2.appendRow([
      "ID Atlet",
      "ID Kontingen",
      "Nama Atlet",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Usia",
      "Nomor WhatsApp",
      "Email",
      "Kategori",
      "Kelas"
    ]);
    formatHeaderSheet(s2);
  }

  // 3. DOKUMEN_KONTINGEN
  let s3 = ss.getSheetByName(SHEET_DOKUMEN);
  if (!s3) {
    s3 = ss.insertSheet(SHEET_DOKUMEN);
    s3.appendRow([
      "ID Dokumen",
      "ID Kontingen",
      "Pas Foto",
      "KK/Akta",
      "Surat Izin Orang Tua",
      "Surat Keterangan Sehat",
      "Formulir Pendaftaran"
    ]);
    formatHeaderSheet(s3);
  }
}

/**
 * Mempercantik tampilan header di Google Sheet (Hijau Rimba #15803D & teks putih)
 */
function formatHeaderSheet(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground("#15803D");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}
