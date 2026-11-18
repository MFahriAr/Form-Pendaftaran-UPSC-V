/**
 * ==============================================================================
 * FORM.JS - LOGIKA WIZARD, DATA ATLET DINAMIS, VALIDASI, & UPLOAD
 * Sesuai Dokumen Perencanaan Bab 3, 4, 11 (Multi-step Wizard)
 * ==============================================================================
 */

// State Global Wizard
let currentStep = 1;
const totalSteps = 4;

// State Data Atlet Dinamis
let daftarAtlet = [
  {
    id: 1,
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    usia: "",
    whatsapp: "",
    email: "",
    kategori: "Tanding",
    kelas: "",
    isCollapsed: false
  }
];

// State Dokumen Terunggah
const dataDokumen = {
  pas_foto: null,
  kk_akta: null,
  izin_ortu: null,
  ket_sehat: null,
  formulir: null
};

// Inisialisasi Saat Dokumen Dimuat
document.addEventListener("DOMContentLoaded", () => {
  muatDraftLokal();
  renderStepper();
  renderDaftarAtlet();
  inisialisasiDropzones();

  // Tombol navigasi
  document.getElementById("btn-lanjut")?.addEventListener("click", () => navigasiLangkah(1));
  document.getElementById("btn-kembali")?.addEventListener("click", () => navigasiLangkah(-1));
  document.getElementById("btn-tambah-atlet")?.addEventListener("click", tambahAtletBaru);
  document.getElementById("form-pendaftaran")?.addEventListener("submit", prosesKirimForm);

  // Checkbox persetujuan di Langkah 4
  const cbSetuju = document.getElementById("cb-pernyataan");
  if (cbSetuju) {
    cbSetuju.addEventListener("change", (e) => {
      const btnKirim = document.getElementById("btn-kirim-final");
      if (btnKirim) {
        btnKirim.disabled = !e.target.checked;
      }
    });
  }

  // Tampilkan step 1
  tampilkanLangkah(currentStep);
});

/**
 * Mengatur tampilan langkah form aktif
 */
function tampilkanLangkah(step) {
  currentStep = step;

  // Sembunyikan semua step container
  for (let i = 1; i <= totalSteps; i++) {
    const el = document.getElementById(`step-${i}`);
    if (el) el.classList.add("hidden");
  }

  // Tampilkan step yang aktif
  const elAktif = document.getElementById(`step-${step}`);
  if (elAktif) {
    elAktif.classList.remove("hidden");
    elAktif.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Update Stepper
  renderStepper();

  // Atur visibilitas tombol navigasi bawah
  const btnKembali = document.getElementById("btn-kembali");
  const btnLanjut = document.getElementById("btn-lanjut");
  const btnKirimFinal = document.getElementById("btn-kirim-container");

  if (btnKembali) {
    if (step === 1) {
      btnKembali.classList.add("invisible");
    } else {
      btnKembali.classList.remove("invisible");
    }
  }

  if (btnLanjut && btnKirimFinal) {
    if (step === totalSteps) {
      btnLanjut.classList.add("hidden");
      btnKirimFinal.classList.remove("hidden");
      renderRingkasanData();
    } else {
      btnLanjut.classList.remove("hidden");
      btnKirimFinal.classList.add("hidden");
    }
  }

  // Simpan draft
  simpanDraftLokal();
}

/**
 * Navigasi antar langkah dengan validasi
 */
function navigasiLangkah(arah) {
  if (arah === 1) {
    // Validasi sebelum maju
    if (!validasiLangkah(currentStep)) {
      return;
    }
    if (currentStep < totalSteps) {
      tampilkanLangkah(currentStep + 1);
    }
  } else if (arah === -1) {
    if (currentStep > 1) {
      tampilkanLangkah(currentStep - 1);
    }
  }
}

/**
 * Validasi per langkah
 */
function validasiLangkah(step) {
  let isValid = true;
  bersihkanPesanError();

  if (step === 1) {
    const namaKontingen = document.getElementById("kontingen-nama");
    const asal = document.getElementById("kontingen-asal");
    const pj = document.getElementById("kontingen-pj");
    const wa = document.getElementById("kontingen-wa");
    const email = document.getElementById("kontingen-email");

    if (!namaKontingen.value.trim()) {
      tampilkanError(namaKontingen, "Nama kontingen wajib diisi");
      isValid = false;
    }
    if (!asal.value.trim()) {
      tampilkanError(asal, "Asal perguruan/sekolah/instansi wajib diisi");
      isValid = false;
    }
    if (!pj.value.trim()) {
      tampilkanError(pj, "Nama penanggung jawab wajib diisi");
      isValid = false;
    }
    if (!wa.value.trim() || wa.value.trim().length < 9) {
      tampilkanError(wa, "Nomor WhatsApp aktif wajib diisi (minimal 9 digit)");
      isValid = false;
    }
    if (email.value.trim() && !email.value.includes("@")) {
      tampilkanError(email, "Format email tidak valid");
      isValid = false;
    }
  }

  if (step === 2) {
    // Validasi data atlet
    if (daftarAtlet.length === 0) {
      alert("Harap tambahkan minimal 1 atlet untuk kontingen ini.");
      return false;
    }

    for (let i = 0; i < daftarAtlet.length; i++) {
      const atl = daftarAtlet[i];
      if (!atl.nama.trim()) {
        alert(`Nama lengkap Atlet #${i + 1} belum diisi.`);
        expandAtlet(atl.id);
        return false;
      }
      if (!atl.tempat_lahir.trim() || !atl.tanggal_lahir) {
        alert(`Tempat dan tanggal lahir Atlet #${i + 1} (${atl.nama}) wajib diisi.`);
        expandAtlet(atl.id);
        return false;
      }
      if (!atl.usia || parseInt(atl.usia) < 5 || parseInt(atl.usia) > 60) {
        alert(`Usia Atlet #${i + 1} (${atl.nama}) wajib diisi dengan benar.`);
        expandAtlet(atl.id);
        return false;
      }
      if (!atl.kelas || !atl.kelas.trim()) {
        alert(`Kelas pertandingan Atlet #${i + 1} (${atl.nama || 'ini'}) wajib diisi.`);
        expandAtlet(atl.id);
        return false;
      }
    }
  }

  if (step === 3) {
    // Validasi dokumen (peringatan jika belum ada dokumen yang diunggah)
    const totalDiunggah = Object.values(dataDokumen).filter(Boolean).length;
    if (totalDiunggah === 0) {
      const konfirmasi = confirm(
        "Anda belum mengunggah dokumen persyaratan apa pun. Anda yakin ingin melanjutkan ke tahap tinjauan?"
      );
      if (!konfirmasi) return false;
    }
  }

  return isValid;
}

/**
 * Render visual Stepper indikator
 */
function renderStepper() {
  const steps = [
    { num: 1, label: "Kontingen" },
    { num: 2, label: "Atlet" },
    { num: 3, label: "Dokumen" },
    { num: 4, label: "Periksa & Kirim" }
  ];

  // Update banner khusus mobile (<640px)
  const bannerEl = document.getElementById("stepper-mobile-banner");
  if (bannerEl) {
    bannerEl.innerHTML = `<span class="text-silat-700 font-normal">Langkah ${currentStep} dari ${steps.length}:</span> <span class="font-bold text-silat-900">${steps[currentStep - 1].label}</span>`;
  }

  const container = document.getElementById("stepper-container");
  if (!container) return;

  container.innerHTML = steps
    .map((s, idx) => {
      let circleClass = "upcoming";
      let iconOrNum = s.num;

      if (s.num < currentStep) {
        circleClass = "completed";
        iconOrNum = "✓";
      } else if (s.num === currentStep) {
        circleClass = "active";
      }

      const isLast = idx === steps.length - 1;
      const lineClass = s.num < currentStep ? "completed" : "";

      return `
      <div class="flex items-center ${isLast ? '' : 'flex-1'}">
        <button type="button" onclick="lompatKeLangkah(${s.num})" 
          class="flex items-center gap-1.5 sm:gap-2 group focus:outline-none py-1"
          title="Ke langkah ${s.num}: ${s.label}">
          <div class="stepper-circle ${circleClass}">
            ${iconOrNum}
          </div>
          <span class="hidden sm:inline-block text-[11px] md:text-xs font-semibold ${
            s.num === currentStep ? 'text-green-900 font-bold' : 'text-gray-500'
          }">
            ${s.label}
          </span>
        </button>
        ${
          !isLast
            ? `<div class="stepper-line ${lineClass} mx-1.5 sm:mx-2 md:mx-4"></div>`
            : ''
        }
      </div>
    `;
    })
    .join("");
}

/**
 * Boleh lompat ke langkah tertentu jika sudah dilewati atau valid
 */
function lompatKeLangkah(targetStep) {
  if (targetStep < currentStep) {
    tampilkanLangkah(targetStep);
  } else if (targetStep > currentStep) {
    if (validasiLangkah(currentStep)) {
      tampilkanLangkah(targetStep);
    }
  }
}

/**
 * Menampilkan pesan error validasi input
 */
function tampilkanError(inputEl, pesan) {
  inputEl.classList.add("is-invalid");
  let errEl = inputEl.parentElement.querySelector(".text-error-msg");
  if (!errEl) {
    errEl = document.createElement("p");
    errEl.className = "text-error-msg text-xs text-red-600 mt-1 font-medium flex items-center gap-1";
    inputEl.parentElement.appendChild(errEl);
  }
  errEl.innerHTML = `
    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
    </svg>
    ${pesan}
  `;
}

function bersihkanPesanError() {
  document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  document.querySelectorAll(".text-error-msg").forEach((el) => el.remove());
}

/**
 * MANAJEMEN ATLET DINAMIS
 */
function renderDaftarAtlet() {
  const container = document.getElementById("daftar-atlet-container");
  const counterEl = document.getElementById("total-atlet-counter");
  if (!container) return;

  if (counterEl) {
    counterEl.textContent = `Total: ${daftarAtlet.length} atlet`;
  }

  container.innerHTML = daftarAtlet
    .map((atlet, index) => {
      const nomor = index + 1;

      // Jika atlet dalam posisi collapsed / ringkas
      if (atlet.isCollapsed) {
        return `
        <div class="border border-green-200 rounded-xl bg-white p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition hover:border-green-300">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-xs flex-shrink-0 flex items-center justify-center">
              #${nomor}
            </span>
            <div class="min-w-0">
              <h4 class="font-bold text-gray-800 text-sm truncate">
                ${escapeHtml(atlet.nama) || `Atlet #${nomor} (Belum diisi)`}
              </h4>
              <p class="text-xs text-gray-500 truncate">
                ${escapeHtml(atlet.kategori)} • ${escapeHtml(atlet.kelas) || 'Belum diisi'} • Usia: ${escapeHtml(atlet.usia) || '-'} thn
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button type="button" onclick="expandAtlet(${atlet.id})" 
              class="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3.5 py-2 min-h-[44px] rounded-lg transition border border-green-200 flex items-center justify-center">
              Ubah / Rincian
            </button>
            ${
              daftarAtlet.length > 1
                ? `<button type="button" onclick="hapusAtlet(${atlet.id})" 
                     class="text-xs text-red-600 hover:text-red-700 p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-50 transition flex items-center justify-center" title="Hapus atlet" aria-label="Hapus atlet #${nomor}">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                     </svg>
                   </button>`
                : ''
            }
          </div>
        </div>
      `;
      }

      // Tampilan Form Lengkap Atlet
      return `
      <div class="kartu-silat p-4 sm:p-5 border-l-4 border-l-green-600 relative transition">
        <!-- Header Kartu Atlet -->
        <div class="flex items-center justify-between pb-3 sm:pb-4 mb-4 border-b border-gray-100">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-7 h-7 rounded-full bg-green-700 text-white font-bold text-xs flex-shrink-0 flex items-center justify-center">
              #${nomor}
            </span>
            <h4 class="font-bold text-gray-900 text-sm sm:text-base truncate">
              ${atlet.nama ? `Atlet #${nomor}: ${escapeHtml(atlet.nama)}` : `Data Atlet #${nomor}`}
            </h4>
          </div>

          <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            ${
              daftarAtlet.length > 1
                ? `<button type="button" onclick="collapseAtlet(${atlet.id})" 
                     class="text-xs font-medium text-gray-600 hover:text-gray-900 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg hover:bg-gray-100 transition flex items-center gap-1">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                     </svg>
                     <span class="hidden xs:inline sm:inline">Ringkas</span>
                   </button>
                   <button type="button" onclick="hapusAtlet(${atlet.id})" 
                     class="text-xs font-medium text-red-600 hover:text-red-700 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-lg hover:bg-red-50 transition flex items-center gap-1" title="Hapus atlet #${nomor}">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                     </svg>
                     <span class="hidden xs:inline sm:inline">Hapus</span>
                   </button>`
                : ''
            }
          </div>
        </div>

        <!-- Isi Form Atlet -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nama Lengkap -->
          <div class="md:col-span-2">
            <label class="label-silat">Nama Lengkap Atlet *</label>
            <input type="text" class="input-silat" value="${escapeHtml(atlet.nama)}" 
              placeholder="Contoh: Arya Bima Prakasa"
              oninput="updateFieldAtlet(${atlet.id}, 'nama', this.value)">
          </div>

          <!-- Tempat Lahir -->
          <div>
            <label class="label-silat">Tempat Lahir *</label>
            <input type="text" class="input-silat" value="${escapeHtml(atlet.tempat_lahir)}" 
              placeholder="Contoh: Sleman"
              oninput="updateFieldAtlet(${atlet.id}, 'tempat_lahir', this.value)">
          </div>

          <!-- Tanggal Lahir -->
          <div>
            <label class="label-silat">Tanggal Lahir *</label>
            <input type="date" class="input-silat" value="${atlet.tanggal_lahir}" 
              oninput="updateFieldAtlet(${atlet.id}, 'tanggal_lahir', this.value)">
          </div>

          <!-- Usia (Manual sesuai Bab 2) -->
          <div>
            <label class="label-silat">Usia (Tahun) *</label>
            <input type="number" min="5" max="60" class="input-silat" value="${atlet.usia}" 
              placeholder="Contoh: 17"
              oninput="updateFieldAtlet(${atlet.id}, 'usia', this.value)">
            <p class="text-xs text-gray-500 mt-1">Sesuai peraturan, usia diisi manual.</p>
          </div>

          <!-- Kategori (Tanding / Seni) -->
          <div>
            <label class="label-silat">Kategori Pertandingan *</label>
            <div class="grid grid-cols-2 gap-2">
              <div class="category-card ${atlet.kategori === 'Tanding' ? 'selected' : ''}"
                onclick="pilihKategoriAtlet(${atlet.id}, 'Tanding')">
                <input type="radio" name="kat_${atlet.id}" ${atlet.kategori === 'Tanding' ? 'checked' : ''} class="hidden">
                <span class="w-3.5 h-3.5 rounded-full border border-green-600 flex items-center justify-center">
                  ${atlet.kategori === 'Tanding' ? '<span class="w-2 h-2 rounded-full bg-green-600"></span>' : ''}
                </span>
                <span class="text-sm font-bold text-gray-800">Tanding</span>
              </div>

              <div class="category-card ${atlet.kategori === 'Seni' ? 'selected' : ''}"
                onclick="pilihKategoriAtlet(${atlet.id}, 'Seni')">
                <input type="radio" name="kat_${atlet.id}" ${atlet.kategori === 'Seni' ? 'checked' : ''} class="hidden">
                <span class="w-3.5 h-3.5 rounded-full border border-green-600 flex items-center justify-center">
                  ${atlet.kategori === 'Seni' ? '<span class="w-2 h-2 rounded-full bg-green-600"></span>' : ''}
                </span>
                <span class="text-sm font-bold text-gray-800">Seni</span>
              </div>
            </div>
          </div>

          <!-- Kelas Pertandingan (Input Manual) -->
          <div class="md:col-span-2">
            <label class="label-silat">Kelas Pertandingan *</label>
            <input type="text" class="input-silat" value="${escapeHtml(atlet.kelas)}" 
              placeholder="Contoh: Remaja - Kelas C (47 - 51 kg) / Seni Tunggal Putra"
              oninput="updateFieldAtlet(${atlet.id}, 'kelas', this.value)">
            <p class="text-xs text-gray-500 mt-1">Isi manual kelas atau nomor pertandingan yang diikuti atlet.</p>
          </div>

          <!-- WhatsApp Atlet -->
          <div>
            <label class="label-silat">Nomor WhatsApp Atlet</label>
            <input type="tel" class="input-silat" value="${escapeHtml(atlet.whatsapp)}" 
              placeholder="08xxxxxxxxxx (opsional)"
              oninput="updateFieldAtlet(${atlet.id}, 'whatsapp', this.value)">
          </div>

          <!-- Email Atlet -->
          <div>
            <label class="label-silat">Email Atlet</label>
            <input type="email" class="input-silat" value="${escapeHtml(atlet.email)}" 
              placeholder="atlet@email.com (opsional)"
              oninput="updateFieldAtlet(${atlet.id}, 'email', this.value)">
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function updateFieldAtlet(id, field, value) {
  const target = daftarAtlet.find((a) => a.id === id);
  if (target) {
    target[field] = value;
    simpanDraftLokal();
  }
}

function pilihKategoriAtlet(id, kategoriBaru) {
  const target = daftarAtlet.find((a) => a.id === id);
  if (target) {
    target.kategori = kategoriBaru;
    renderDaftarAtlet();
    simpanDraftLokal();
  }
}

function tambahAtletBaru() {
  // Collapse atlet sebelumnya agar form tetap rapi
  daftarAtlet.forEach((a) => (a.isCollapsed = true));

  const newId = Date.now();
  daftarAtlet.push({
    id: newId,
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    usia: "",
    whatsapp: "",
    email: "",
    kategori: "Tanding",
    kelas: "",
    isCollapsed: false
  });

  renderDaftarAtlet();
  simpanDraftLokal();

  // Scroll ke atlet yang baru ditambahkan
  setTimeout(() => {
    const container = document.getElementById("daftar-atlet-container");
    if (container && container.lastElementChild) {
      container.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}

function hapusAtlet(id) {
  if (daftarAtlet.length <= 1) {
    alert("Minimal harus ada 1 atlet dalam satu kontingen.");
    return;
  }
  const konfirmasi = confirm("Apakah Anda yakin ingin menghapus data atlet ini?");
  if (konfirmasi) {
    daftarAtlet = daftarAtlet.filter((a) => a.id !== id);
    renderDaftarAtlet();
    simpanDraftLokal();
  }
}

function collapseAtlet(id) {
  const target = daftarAtlet.find((a) => a.id === id);
  if (target) {
    target.isCollapsed = true;
    renderDaftarAtlet();
  }
}

function expandAtlet(id) {
  const target = daftarAtlet.find((a) => a.id === id);
  if (target) {
    target.isCollapsed = false;
    renderDaftarAtlet();
  }
}

/**
 * INISIALISASI DROPZONE UNGGAH DOKUMEN
 */
function inisialisasiDropzones() {
  const dropzones = [
    { key: "pas_foto", label: "Pas Foto Atlet/Kontingen", accept: "image/*,application/pdf" },
    { key: "kk_akta", label: "Kartu Keluarga (KK) / Akta Lahir", accept: "application/pdf,image/*" },
    { key: "izin_ortu", label: "Surat Izin Orang Tua", accept: "application/pdf,image/*" },
    { key: "ket_sehat", label: "Surat Keterangan Sehat Dokter", accept: "application/pdf,image/*" },
    { key: "formulir", label: "Formulir Pendaftaran Resmi", accept: "application/pdf,image/*" }
  ];

  const container = document.getElementById("dropzone-container");
  if (!container) return;

  container.innerHTML = dropzones
    .map(
      (dz) => `
    <div class="dropzone-silat p-4" id="dz-${dz.key}" onclick="triggerFileInput('${dz.key}')">
      <input type="file" id="file-${dz.key}" class="hidden" accept="${dz.accept}" onchange="handleFileSelected('${dz.key}', this.files)">
      
      <div id="dz-empty-${dz.key}" class="flex flex-col items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>
        <h5 class="font-bold text-gray-800 text-sm mb-1">${dz.label}</h5>
        <p class="text-xs text-gray-500">Tarik file ke sini atau <span class="text-green-700 font-semibold underline">Pilih File</span></p>
        <span class="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG (Maks 5 MB)</span>
      </div>

      <div id="dz-filled-${dz.key}" class="hidden flex items-center justify-between text-left gap-2">
        <div class="flex items-center gap-3 overflow-hidden min-w-0">
          <div class="w-9 h-9 rounded-lg bg-green-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div class="overflow-hidden min-w-0">
            <h6 class="font-bold text-gray-900 text-xs truncate" id="dz-name-${dz.key}">nama-file.pdf</h6>
            <p class="text-[11px] text-green-700 font-medium" id="dz-size-${dz.key}">0 KB</p>
          </div>
        </div>
        <button type="button" onclick="event.stopPropagation(); hapusFileDokumen('${dz.key}')" 
          class="text-xs font-semibold text-red-600 hover:text-red-800 px-3 py-2 min-h-[44px] min-w-[44px] hover:bg-red-50 rounded-lg transition flex items-center justify-center flex-shrink-0" title="Ganti/Hapus File">
          Hapus
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Setup drag & drop listener
  dropzones.forEach((dz) => {
    const el = document.getElementById(`dz-${dz.key}`);
    if (!el) return;

    ["dragenter", "dragover"].forEach((eventName) => {
      el.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      el.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove("dragover");
      });
    });

    el.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelected(dz.key, files);
      }
    });
  });
}

function triggerFileInput(key) {
  document.getElementById(`file-${key}`)?.click();
}

function handleFileSelected(key, files) {
  if (!files || files.length === 0) return;
  const file = files[0];

  // Cek batas ukuran 5MB
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert(`Ukuran file "${file.name}" melebihi batas 5 MB. Harap perkecil file Anda.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    dataDokumen[key] = {
      nama_file: file.name,
      ukuran_kb: (file.size / 1024).toFixed(1),
      mime_type: file.type,
      base64: e.target.result
    };

    updateTampilanDropzone(key);
    simpanDraftLokal();
  };
  reader.readAsDataURL(file);
}

function updateTampilanDropzone(key) {
  const elEmpty = document.getElementById(`dz-empty-${key}`);
  const elFilled = document.getElementById(`dz-filled-${key}`);
  const elBox = document.getElementById(`dz-${key}`);
  const nameEl = document.getElementById(`dz-name-${key}`);
  const sizeEl = document.getElementById(`dz-size-${key}`);

  if (dataDokumen[key]) {
    if (elEmpty) elEmpty.classList.add("hidden");
    if (elFilled) elFilled.classList.remove("hidden");
    if (elBox) elBox.classList.add("has-file");
    if (nameEl) nameEl.textContent = dataDokumen[key].nama_file;
    if (sizeEl) sizeEl.textContent = `${dataDokumen[key].ukuran_kb} KB • Siap dikirim`;
  } else {
    if (elEmpty) elEmpty.classList.remove("hidden");
    if (elFilled) elFilled.classList.add("hidden");
    if (elBox) elBox.classList.remove("has-file");
  }
}

function hapusFileDokumen(key) {
  dataDokumen[key] = null;
  const fileInput = document.getElementById(`file-${key}`);
  if (fileInput) fileInput.value = "";
  updateTampilanDropzone(key);
  simpanDraftLokal();
}

/**
 * LANGKAH 4: RENDER RINGKASAN DATA
 */
function renderRingkasanData() {
  const namaKontingen = document.getElementById("kontingen-nama")?.value || "-";
  const asal = document.getElementById("kontingen-asal")?.value || "-";
  const pj = document.getElementById("kontingen-pj")?.value || "-";
  const wa = document.getElementById("kontingen-wa")?.value || "-";
  const email = document.getElementById("kontingen-email")?.value || "-";

  // Ringkasan Kontingen
  const elKontingen = document.getElementById("summary-kontingen");
  if (elKontingen) {
    elKontingen.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
        <div><span class="font-semibold text-gray-900">Nama Kontingen:</span> ${escapeHtml(namaKontingen)}</div>
        <div><span class="font-semibold text-gray-900">Asal Perguruan/Sekolah:</span> ${escapeHtml(asal)}</div>
        <div><span class="font-semibold text-gray-900">Penanggung Jawab:</span> ${escapeHtml(pj)}</div>
        <div><span class="font-semibold text-gray-900">WhatsApp:</span> ${escapeHtml(wa)}</div>
        <div><span class="font-semibold text-gray-900">Email:</span> ${escapeHtml(email)}</div>
      </div>
    `;
  }

  // Ringkasan Atlet
  const elAtlet = document.getElementById("summary-atlet");
  if (elAtlet) {
    elAtlet.innerHTML = `
      <div class="overflow-x-auto -mx-1 sm:mx-0">
        <table class="w-full min-w-[480px] text-left text-xs text-gray-700">
          <thead class="bg-green-50 text-green-900 font-bold border-b border-green-200">
            <tr>
              <th class="p-2.5">No</th>
              <th class="p-2.5">Nama Atlet</th>
              <th class="p-2.5">TTL / Usia</th>
              <th class="p-2.5">Kategori</th>
              <th class="p-2.5">Kelas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${daftarAtlet
              .map(
                (a, idx) => `
              <tr class="hover:bg-gray-50">
                <td class="p-2.5 font-bold">${idx + 1}</td>
                <td class="p-2.5 font-semibold text-gray-900">${escapeHtml(a.nama)}</td>
                <td class="p-2.5">${escapeHtml(a.tempat_lahir)}, ${a.tanggal_lahir} (${a.usia} thn)</td>
                <td class="p-2.5">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${
                    a.kategori === 'Tanding' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }">
                    ${a.kategori}
                  </span>
                </td>
                <td class="p-2.5">${escapeHtml(a.kelas)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // Ringkasan Dokumen
  const elDokumen = document.getElementById("summary-dokumen");
  if (elDokumen) {
    const listDoc = [
      { key: "pas_foto", label: "Pas Foto" },
      { key: "kk_akta", label: "KK / Akta" },
      { key: "izin_ortu", label: "Surat Izin Orang Tua" },
      { key: "ket_sehat", label: "Surat Ket. Sehat" },
      { key: "formulir", label: "Formulir Pendaftaran" }
    ];

    elDokumen.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
        ${listDoc
          .map((d) => {
            const uploaded = !!dataDokumen[d.key];
            return `
            <div class="p-2.5 rounded-lg border ${
              uploaded ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500'
            } flex items-center gap-2">
              <span class="font-bold">${uploaded ? '✓' : '✗'}</span>
              <span class="font-medium truncate">${d.label}</span>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }
}

/**
 * PROSES PENGIRIMAN FORM
 */
async function prosesKirimForm(e) {
  e.preventDefault();

  const cbSetuju = document.getElementById("cb-pernyataan");
  if (!cbSetuju || !cbSetuju.checked) {
    alert("Harap centang pernyataan keabsahan data sebelum mengirim pendaftaran.");
    return;
  }

  const btnKirim = document.getElementById("btn-kirim-final");
  const spinnerContainer = document.getElementById("spinner-mengirim");
  if (btnKirim) btnKirim.disabled = true;
  if (spinnerContainer) spinnerContainer.classList.remove("hidden");

  const payload = {
    kontingen: {
      nama_kontingen: document.getElementById("kontingen-nama")?.value.trim(),
      asal: document.getElementById("kontingen-asal")?.value.trim(),
      penanggung_jawab: document.getElementById("kontingen-pj")?.value.trim(),
      whatsapp: document.getElementById("kontingen-wa")?.value.trim(),
      email: document.getElementById("kontingen-email")?.value.trim()
    },
    atlet: daftarAtlet.map((a) => ({
      nama: a.nama.trim(),
      tempat_lahir: a.tempat_lahir.trim(),
      tanggal_lahir: a.tanggal_lahir,
      usia: a.usia,
      whatsapp: a.whatsapp.trim(),
      email: a.email.trim(),
      kategori: a.kategori,
      kelas: a.kelas
    })),
    dokumen: dataDokumen
  };

  try {
    const hasil = await kirimDataPendaftaran(payload);

    // Hapus draft lokal setelah sukses
    localStorage.removeItem("pencak_silat_draft");

    // Sembunyikan wizard dan tampilkan layar sukses
    document.getElementById("form-wizard-card")?.classList.add("hidden");
    const successScreen = document.getElementById("layar-sukses");
    if (successScreen) {
      successScreen.classList.remove("hidden");
      document.getElementById("sukses-id-kontingen").textContent = hasil.id_kontingen;
      document.getElementById("sukses-nama-kontingen").textContent = payload.kontingen.nama_kontingen;
      document.getElementById("sukses-total-atlet").textContent = `${payload.atlet.length} Atlet`;
      document.getElementById("sukses-mode-info").textContent =
        hasil.mode === "gas"
          ? "Data tersimpan di Google Spreadsheet & Google Drive Panitia."
          : "Data pendaftaran telah resmi tersimpan dalam sistem basis data panitia.";
      successScreen.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    alert("Terjadi kendala saat mengirim: " + error.message);
    if (btnKirim) btnKirim.disabled = false;
    if (spinnerContainer) spinnerContainer.classList.add("hidden");
  }
}

/**
 * AUTOSAVE & DRAFT
 */
function simpanDraftLokal() {
  const draft = {
    currentStep,
    kontingen: {
      nama_kontingen: document.getElementById("kontingen-nama")?.value || "",
      asal: document.getElementById("kontingen-asal")?.value || "",
      penanggung_jawab: document.getElementById("kontingen-pj")?.value || "",
      whatsapp: document.getElementById("kontingen-wa")?.value || "",
      email: document.getElementById("kontingen-email")?.value || ""
    },
    daftarAtlet
  };
  localStorage.setItem("pencak_silat_draft", JSON.stringify(draft));
}

function muatDraftLokal() {
  try {
    const raw = localStorage.getItem("pencak_silat_draft");
    if (!raw) return;
    const draft = JSON.parse(raw);

    if (draft.kontingen) {
      if (document.getElementById("kontingen-nama")) document.getElementById("kontingen-nama").value = draft.kontingen.nama_kontingen || "";
      if (document.getElementById("kontingen-asal")) document.getElementById("kontingen-asal").value = draft.kontingen.asal || "";
      if (document.getElementById("kontingen-pj")) document.getElementById("kontingen-pj").value = draft.kontingen.penanggung_jawab || "";
      if (document.getElementById("kontingen-wa")) document.getElementById("kontingen-wa").value = draft.kontingen.whatsapp || "";
      if (document.getElementById("kontingen-email")) document.getElementById("kontingen-email").value = draft.kontingen.email || "";
    }

    if (Array.isArray(draft.daftarAtlet) && draft.daftarAtlet.length > 0) {
      daftarAtlet = draft.daftarAtlet;
    }
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
  }
}

/**
 * BANTUAN ESCAPE HTML
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
