// =====================================================
// FIREBASE INITIALIZATION
// (Harus diletakkan paling atas)
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDoGLleNKQ3k_lbTvoOt0hoNFixNuHD74U",
  authDomain: "kelompok14-5bb0b.firebaseapp.com",
  projectId: "kelompok14-5bb0b",
  storageBucket: "kelompok14-5bb0b.firebasestorage.app",
  messagingSenderId: "974119608507",
  appId: "1:974119608507:web:3ef3cf8d7d291eca21499e",
  measurementId: "G-MGBWWLKKEV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================================
// BASIC SELECTOR
// =====================================================
const $ = (selector, parent = document) => parent.querySelector(selector); const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// =====================================================
// THEME SYSTEM (DEFAULT = DARK MODE)
// =====================================================
const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("group31-theme");

// Kalau belum pernah memilih tema → otomatis DARK
if (!savedTheme || savedTheme === "dark") {
  document.body.classList.add("dark");
} else {
  document.body.classList.remove("dark");
}

// Update icon tombol tema
function updateThemeIcon() {
  if(!themeToggle) return;
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☾";
    themeToggle.setAttribute("aria-label", "Aktifkan light mode");
  } else {
    themeToggle.textContent = "☀";
    themeToggle.setAttribute("aria-label", "Aktifkan dark mode");
  }
}
updateThemeIcon();

// Toggle Dark / Light
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("group31-theme", isDark ? "dark" : "light");
    updateThemeIcon();
  });
}

// =====================================================
// MOBILE MENU
// =====================================================
const menuBtn = $("#menuBtn");
const navMenu = $(".navbar nav");

if(menuBtn && navMenu){
  menuBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    navMenu.classList.toggle("open");
  });

  // Klik area menu jangan menutup
  navMenu.addEventListener("click", (e)=>{
    e.stopPropagation();
  });

  // Klik luar menu → close
  document.addEventListener("click", ()=>{
    navMenu.classList.remove("open");
  });
}

// =====================================================
// REVEAL ANIMATION
// =====================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

$$(".reveal").forEach((element) => {   observer.observe(element); });  // ===================================================== // COUNTER ANIMATION // ===================================================== const counters = $$
(".counter");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.target);
    const duration = 1000;
    const start = performance.now();

    function animateCounter(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      element.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(animateCounter);
      } else {
        element.textContent = target;
      }
    }
    requestAnimationFrame(animateCounter);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.7 });

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

// =====================================================
// PESAN & KESAN (FIREBASE REAL-TIME)
// =====================================================
const commentForm = $("#commentForm");
const commentsContainer = $("#commentList");
const commentCount = $("#commentCount");

// Escape HTML
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Format waktu
function formatTime(dateString) {
  return new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function loadComments() {
  if (!commentsContainer) return;

  const q = query(collection(db, "comments"), orderBy("waktu", "desc"));

  // onSnapshot akan menarik data otomatis ketika ada komentar masuk
  onSnapshot(q, (snapshot) => {
    const comments = [];
    snapshot.forEach((doc) => {
      comments.push(doc.data());
    });

    if (commentCount) {
      commentCount.textContent = comments.length;
    }

    if (comments.length === 0) {
      commentsContainer.innerHTML = `
        <div class="empty-comments">
          <span>✦</span>
          <p>Belum ada pesan.</p>
          <small>Jadilah yang pertama meninggalkan pesan.</small>
        </div>
      `;
      return;
    }

    commentsContainer.innerHTML = "";

    comments.forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item";

      const name = escapeHTML(comment.nama);
      const message = escapeHTML(comment.pesan);
      const time = comment.waktu ? formatTime(comment.waktu) : "";

      commentItem.innerHTML = `
        <strong>${name}</strong>
        <p>${message}</p>
        ${time ? `<small>${time}</small>` : ""}
      `;
      commentsContainer.appendChild(commentItem);
    });
  });
}

if (commentForm) {
  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = $("#nama");
    const textInput = $("#pesan");
    const submitBtn = $(".comment-btn"); // Memilih tombol kirim

    if (!nameInput || !textInput) return;

    const nama = nameInput.value.trim();
    const pesan = textInput.value.trim();

    if (!nama || !pesan) return;

    // Ubah status tombol saat mengirim
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Mengirim... <span>⏳</span>";
    submitBtn.disabled = true;

    try {
      // Menyimpan data ke Firebase
      await addDoc(collection(db, "comments"), {
        nama: nama,
        pesan: pesan,
        waktu: new Date().toISOString()
      });
      // Kosongkan form setelah sukses
      commentForm.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Gagal mengirim pesan. Pastikan koneksi internet lancar.");
    } finally {
      // Kembalikan tombol seperti semula
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

// =====================================================
// GROUP PHOTO SLIDER
// =====================================================
const photos=[
  "img/mentoring/day1.jpeg",
  "img/mentoring/day2.jpeg",
  "img/mentoring/day3.jpeg",
  "img/mentoring/day4.jpeg"
];

const comingSoon = $("#comingSoon");
let currentPhoto = 0;
const groupPhoto = $("#groupPhoto");
const dayLabel = $("#dayLabel");
const photoCount = $("#photoCount");

function changePhoto(){
  if(!groupPhoto) return;
  
  groupPhoto.style.opacity="0";
  
  setTimeout(()=>{
    groupPhoto.src = photos[currentPhoto];
    
    // tampilkan coming soon hanya foto terakhir
    if(comingSoon){
      if(currentPhoto === photos.length - 1){
        comingSoon.style.display="block";
      } else {
        comingSoon.style.display="none";
      }
    }
    
    if(dayLabel) dayLabel.textContent = "DAY 0"+(currentPhoto+1);
    if(photoCount) photoCount.textContent = `${currentPhoto+1} / ${photos.length}`;
    
    groupPhoto.style.opacity="1";
  }, 200);
}

const nextPhoto = $("#nextPhoto");
const prevPhoto = $("#prevPhoto");

if(nextPhoto){
  nextPhoto.addEventListener("click", ()=>{
    currentPhoto++;
    if(currentPhoto >= photos.length){
      currentPhoto = 0;
    }
    changePhoto();
  });
}

if(prevPhoto){
  prevPhoto.addEventListener("click", ()=>{
    currentPhoto--;
    if(currentPhoto < 0){
      currentPhoto = photos.length - 1;
    }
    changePhoto();
  });
}

// =====================================================
// NAVBAR ACTIVE & INITIAL LOAD
// =====================================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".navbar nav a");
let isClickScrolling = false;

function updateActiveNav(){
  if(isClickScrolling) return;
  
  let current="";
  sections.forEach(section=>{
    const sectionTop = section.offsetTop - 180;
    if(scrollY >= sectionTop){
      current = section.id;
    }
  });
  
  navLinks.forEach(link=>{
    link.classList.remove("active");
    if(link.getAttribute("href") === "#"+current){
      link.classList.add("active");
    }
  });
}

navLinks.forEach(link=>{
  link.addEventListener("click", ()=>{
    isClickScrolling=true;
    navLinks.forEach(item=>{
      item.classList.remove("active");
    });
    link.classList.add("active");
    setTimeout(()=>{
      isClickScrolling=false;
    }, 1500);
  });
});

window.addEventListener("scroll", updateActiveNav);

navLinks.forEach(link=>{
  link.addEventListener("click", ()=>{
    navMenu?.classList.remove("open");
  });
});

// Jalankan Fungsi
updateActiveNav();
loadComments();
