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

  if(!themeToggle) return;


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

// =====================================================
// MOBILE MENU
// =====================================================


const menuBtn = $("#menuBtn");

const navMenu = $(".navbar nav");



if(menuBtn && navMenu){


menuBtn.addEventListener(
"click",
(e)=>{

e.stopPropagation();

navMenu.classList.toggle("open");


});



// Klik area menu jangan menutup

navMenu.addEventListener(
"click",
(e)=>{

e.stopPropagation();

});




// Klik luar menu → close

document.addEventListener(
"click",
()=>{


navMenu.classList.remove("open");


});


}


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


// =====================================================
// PESAN & KESAN
// =====================================================

const commentForm =
  $("#commentForm");

// PERBAIKAN: Ubah commentsContainer agar sesuai dengan ID di index.html
const commentsContainer =
  $("#commentList");

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

  // Update jumlah komentar (Jika elemen ada)
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
      ${time
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

      // PERBAIKAN: Ubah selector untuk nama dan pesan agar sesuai dengan ID di index.html
      const nameInput =
        $("#nama");

      const textInput =
        $("#pesan");

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
        waktu: new Date().toISOString(),
        likes:0
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
// GROUP PHOTO SLIDER
// AUTO + MANUAL DESKTOP + SWIPE MOBILE
// =====================================================


const photos=[

"img/mentoring/day1.jpeg",
"img/mentoring/day2.jpeg",
"img/mentoring/day3.jpeg",
"img/mentoring/day4.jpeg"

];


const groupPhoto = $("#groupPhoto");


let currentPhoto = 0;



function changePhoto(){


if(!groupPhoto) return;


groupPhoto.style.opacity="0";


setTimeout(()=>{


groupPhoto.src =
photos[currentPhoto];


groupPhoto.style.opacity="1";


},200);


}



// =========================
// NEXT BUTTON
// =========================

const nextPhoto=$("#nextPhoto");


if(nextPhoto){

nextPhoto.addEventListener(
"click",
()=>{


currentPhoto++;


if(currentPhoto >= photos.length){

currentPhoto=0;

}


changePhoto();

resetAutoSlide();


});

}




// =========================
// PREVIOUS BUTTON
// =========================

const prevPhoto=$("#prevPhoto");


if(prevPhoto){

prevPhoto.addEventListener(
"click",
()=>{


currentPhoto--;


if(currentPhoto < 0){

currentPhoto =
photos.length-1;

}


changePhoto();

resetAutoSlide();


});

}




// =========================
// AUTO SLIDE
// =========================


let autoSlide;


function startAutoSlide(){


autoSlide=setInterval(()=>{


currentPhoto++;


if(currentPhoto >= photos.length){

currentPhoto=0;

}


changePhoto();


},4000);


}



function resetAutoSlide(){

clearInterval(autoSlide);

startAutoSlide();

}



startAutoSlide();




// =========================
// MOBILE SWIPE
// =========================


let startX=0;


groupPhoto.addEventListener(
"touchstart",
(e)=>{

startX=e.touches[0].clientX;

}

);



groupPhoto.addEventListener(
"touchend",
(e)=>{


let endX=e.changedTouches[0].clientX;


let distance=startX-endX;



if(distance > 50){


currentPhoto++;


if(currentPhoto >= photos.length){

currentPhoto=0;

}


changePhoto();

resetAutoSlide();


}



if(distance < -50){


currentPhoto--;


if(currentPhoto < 0){

currentPhoto=photos.length-1;

}


changePhoto();

resetAutoSlide();


}



}

);

// =====================================================
// INITIAL LOAD
// =====================================================

// =====================================================
// NAVBAR ACTIVE
// =====================================================

const sections =
document.querySelectorAll("section[id]");

const navLinks =
document.querySelectorAll(".navbar nav a");


let isClickScrolling = false;



function updateActiveNav(){

if(isClickScrolling) return;


let current="";


sections.forEach(section=>{


const sectionTop =
section.offsetTop - 180;


if(scrollY >= sectionTop){

current = section.id;

}


});



navLinks.forEach(link=>{


link.classList.remove("active");


if(
link.getAttribute("href")
===
"#"+current
){

link.classList.add("active");

}


});


}



navLinks.forEach(link=>{


link.addEventListener(
"click",
()=>{


isClickScrolling=true;



navLinks.forEach(item=>{
item.classList.remove("active");
});



link.classList.add("active");



setTimeout(()=>{

isClickScrolling=false;

},1500);



});


});



window.addEventListener(
"scroll",
updateActiveNav
);

navLinks.forEach(link=>{

link.addEventListener(
"click",
()=>{

navMenu?.classList.remove("open");

});

});


updateActiveNav();


loadComments();
