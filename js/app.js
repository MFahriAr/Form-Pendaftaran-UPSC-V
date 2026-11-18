/**
 * ==============================================================================
 * APP.JS - INTERAKSI HALAMAN UTAMA (LANDING PAGE)
 * ==============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  inisialisasiMobileMenu();
  inisialisasiCountdown();
  inisialisasiModalPanduan();
});

/**
 * Menu Navigasi Mobile (Hamburger Toggle)
 */
function inisialisasiMobileMenu() {
  const btnToggle = document.getElementById("mobile-menu-btn");
  const menuEl = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".mobile-nav-link");

  if (btnToggle && menuEl) {
    btnToggle.addEventListener("click", () => {
      const isHidden = menuEl.classList.contains("hidden");
      if (isHidden) {
        menuEl.classList.remove("hidden");
        btnToggle.setAttribute("aria-expanded", "true");
      } else {
        menuEl.classList.add("hidden");
        btnToggle.setAttribute("aria-expanded", "false");
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuEl.classList.add("hidden");
        btnToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/**
 * Hitung Mundur Batas Akhir Pendaftaran
 */
function inisialisasiCountdown() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 24); // 24 hari dari sekarang
  targetDate.setHours(23, 59, 59, 0);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      document.getElementById("cd-hari") && (document.getElementById("cd-hari").textContent = "00");
      document.getElementById("cd-jam") && (document.getElementById("cd-jam").textContent = "00");
      document.getElementById("cd-menit") && (document.getElementById("cd-menit").textContent = "00");
      document.getElementById("cd-detik") && (document.getElementById("cd-detik").textContent = "00");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elHari = document.getElementById("cd-hari");
    const elJam = document.getElementById("cd-jam");
    const elMenit = document.getElementById("cd-menit");
    const elDetik = document.getElementById("cd-detik");

    if (elHari) elHari.textContent = padZero(days);
    if (elJam) elJam.textContent = padZero(hours);
    if (elMenit) elMenit.textContent = padZero(minutes);
    if (elDetik) elDetik.textContent = padZero(seconds);
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function padZero(n) {
  return n < 10 ? "0" + n : n;
}

/**
 * Modal Petunjuk Teknis (Juknis)
 */
function inisialisasiModalPanduan() {
  const btnBuka = document.getElementById("btn-lihat-juknis");
  const modal = document.getElementById("modal-juknis");
  const btnTutup = document.getElementById("btn-tutup-juknis");

  if (btnBuka && modal) {
    btnBuka.addEventListener("click", () => modal.classList.remove("hidden"));
  }
  if (btnTutup && modal) {
    btnTutup.addEventListener("click", () => modal.classList.add("hidden"));
  }
}
