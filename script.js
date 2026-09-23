// =====================================================
// BASIC SELECTOR
// =====================================================

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


// =====================================================
// THEME SYSTEM
// DEFAULT = DARK MODE
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
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☾";
    themeToggle.setAttribute(
      "aria-label",
      "Aktifkan light mode"
    );
  } else {
    themeToggle.textContent = "☀";
    themeToggle.setAttribute(
      "aria-label",
      "Aktifkan dark mode"
    );
  }
}

updateThemeIcon();


// Toggle Dark / Light
if (themeToggle) {
  themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
      document.body.classList.contains("dark");

    localStorage.setItem(
      "group31-theme",
      isDark ? "dark" : "light"
    );

    updateThemeIcon();
  });
}


// =====================================================
// REVEAL ANIMATION
// =====================================================

const observer = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {

        entry.target.classList.add("visible");

        observer.unobserve(entry.target);
      }

    });

  },
  {
    threshold: 0.12
  }
);

$$(".reveal").forEach((element) => {
  observer.observe(element);
});


// =====================================================
// COUNTER ANIMATION
// =====================================================

const counters = $$(".counter");

const counterObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (!entry.isIntersecting) return;

      const element = entry.target;

      const target =
        Number(element.dataset.target);

      const duration = 1000;

      const start = performance.now();

      function animateCounter(now) {

        const progress = Math.min(
          (now - start) / duration,
          1
        );

        const value =
          Math.floor(progress * target);

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

  },
  {
    threshold: 0.7
  }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});


// =====================================================
// PROFILE MODAL
// =====================================================

const modal = $("#profileModal");
const modalName = $("#modalName");
const modalRole = $("#modalRole");
const modalBio = $("#modalBio");
const modalSkills = $("#modalSkills");
const modalAvatar = $("#modalAvatar");
const closeModalButton = $("#closeModal");
const modalBackdrop = $(".modal-backdrop");


function openProfile(card) {

  const name = card.dataset.name || "Unknown";
  const role = card.dataset.role || "Member";
  const bio = card.dataset.bio || "";
  const skills = card.dataset.skills || "";


  // Nama
  modalName.textContent = name;


  // Role
  modalRole.textContent =
    role.toUpperCase();


  // Bio
  modalBio.textContent = bio;


  // Bersihkan skill lama
  modalSkills.innerHTML = "";


  // Tambahkan skill
  skills
    .split(",")
    .filter(Boolean)
    .forEach((skill) => {

      const span =
        document.createElement("span");

      span.textContent =
        skill.trim();

      modalSkills.appendChild(span);
    });


  // Inisial nama
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  modalAvatar.textContent =
    initials || "??";


  // Buka modal
  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";
}


function closeProfile() {

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}


// Klik kartu anggota
$$(".member-card").forEach((card) => {

  card.addEventListener("click", (event) => {

    // Kalau yang diklik adalah tombol arrow,
    // tetap buka modal.
    openProfile(card);

  });

});


// Tombol close
if (closeModalButton) {
  closeModalButton.addEventListener(
    "click",
    closeProfile
  );
}


// Klik background modal
if (modalBackdrop) {
  modalBackdrop.addEventListener(
    "click",
    closeProfile
  );
}


// Tombol ESC
document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {
      closeProfile();
    }

  }
);


// =====================================================
// PESAN & KESAN
// =====================================================

const commentForm =
  $("#commentForm");

const commentsContainer =
  $("#commentsContainer");

const commentCount =
  $("#commentCount");


// Key LocalStorage
const COMMENT_STORAGE =
  "group31-comments";


// Escape HTML
function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// Format waktu
function formatTime(date) {

  return new Date(date).toLocaleString(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}


// =====================================================
// LOAD COMMENTS
// =====================================================

function loadComments() {

  if (!commentsContainer) return;


  let comments = [];

  try {

    comments =
      JSON.parse(
        localStorage.getItem(
          COMMENT_STORAGE
        )
      ) || [];

  } catch (error) {

    comments = [];

  }


  // Update jumlah komentar
  if (commentCount) {
    commentCount.textContent =
      comments.length;
  }


  // Belum ada komentar
  if (comments.length === 0) {

    commentsContainer.innerHTML = `
      <div class="empty-comments">
        <span>✦</span>
        <p>Belum ada pesan.</p>
        <small>
          Jadilah yang pertama meninggalkan pesan.
        </small>
      </div>
    `;

    return;
  }


  // Bersihkan container
  commentsContainer.innerHTML = "";


  // Tampilkan komentar
  comments.forEach((comment) => {

    const commentItem =
      document.createElement("div");

    commentItem.className =
      "comment-item";


    const name =
      escapeHTML(comment.nama);


    const message =
      escapeHTML(comment.pesan);


    const time =
      comment.waktu
        ? formatTime(comment.waktu)
        : "";


    commentItem.innerHTML = `
      <strong>${name}</strong>

      <p>${message}</p>

      ${
        time
          ? `<small>${time}</small>`
          : ""
      }
    `;


    commentsContainer.appendChild(
      commentItem
    );

  });

}


// =====================================================
// SUBMIT COMMENT
// =====================================================

if (commentForm) {

  commentForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const nameInput =
        $("#commentName");


      const textInput =
        $("#commentText");


      if (!nameInput || !textInput) {
        return;
      }


      const nama =
        nameInput.value.trim();


      const pesan =
        textInput.value.trim();


      // Validasi
      if (!nama || !pesan) {
        return;
      }


      let comments = [];

      try {

        comments =
          JSON.parse(
            localStorage.getItem(
              COMMENT_STORAGE
            )
          ) || [];

      } catch (error) {

        comments = [];

      }


      // Tambahkan komentar terbaru
      comments.unshift({

        nama: nama,

        pesan: pesan,

        waktu: new Date().toISOString()

      });


      // Simpan
      localStorage.setItem(
        COMMENT_STORAGE,
        JSON.stringify(comments)
      );


      // Reset form
      commentForm.reset();


      // Refresh komentar
      loadComments();

    }
  );

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadComments();
