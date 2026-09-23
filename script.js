const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const themeToggle = $("#themeToggle");
const savedTheme = localStorage.getItem("group31-theme");
if (savedTheme === "dark") document.body.classList.add("dark");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("group31-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold:.12});
$$(".reveal").forEach(el => observer.observe(el));

const counters = $$(".counter");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const duration = 1000;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = target === 2026 ? value : value;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, {threshold:.7});
counters.forEach(el => counterObserver.observe(el));

const modal = $("#profileModal");
const modalName = $("#modalName");
const modalRole = $("#modalRole");
const modalBio = $("#modalBio");
const modalSkills = $("#modalSkills");
const modalAvatar = $("#modalAvatar");

function openProfile(card) {
  const name = card.dataset.name;
  modalName.textContent = name;
  modalRole.textContent = card.dataset.role.toUpperCase();
  modalBio.textContent = card.dataset.bio;
  modalSkills.innerHTML = "";
  card.dataset.skills.split(",").forEach(skill => {
    const span = document.createElement("span");
    span.textContent = skill.trim();
    modalSkills.appendChild(span);
  });
  modalAvatar.textContent = name.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeProfile() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
$$(".member-card").forEach(card => card.addEventListener("click", () => openProfile(card)));
$("#closeModal").addEventListener("click", closeProfile);
$(".modal-backdrop").addEventListener("click", closeProfile);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeProfile(); });
