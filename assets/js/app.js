// ---------- helpers ----------
function qs(id){ return document.getElementById(id); }

const BASE = "/Knezija-krizmanici.io"; // your repo name (GitHub Pages project site)

async function fetchJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Cannot load ${path} (${res.status})`);
  return await res.json();
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function nl2br(str){
  return escapeHtml(str).replaceAll("\n","<br>");
}

// **bold** and *italic* support + new lines
function formatText(str){
  if(!str) return "";
  const safe = escapeHtml(str);
  return safe
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replaceAll("\n","<br>");
}

// ---------- Kateheze list page ----------
async function renderKatehezeList(path, targetId){
  const data = await fetchJson(path);
  if(!Array.isArray(data)) throw new Error("kateheze.json must be an array []");

  // newest first
  data.sort((a,b)=> String(b.date ?? "").localeCompare(String(a.date ?? "")));

  qs(targetId).innerHTML = `
    <div class="grid">
      ${data.map(x => `
        <a class="card" href="${BASE}/kateheze/${encodeURIComponent(x.slug)}/">
          <h2>${escapeHtml(x.title || "Bez naslova")}</h2>
          <p>${escapeHtml(x.date || "")}</p>
          <span class="chip">Otvori</span>
        </a>
      `).join("")}
    </div>
  `;
}

// ---------- Lesson page (folder-based) ----------
async function loadLessonFromFolder(){
  // URL like: /Knezija-krizmanici.io/kateheze/svetost-put-ka-sreci/
  const parts = location.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1]; // last segment should be slug

  const data = await fetchJson(`${BASE}/data/kateheze.json`);
  const lesson = Array.isArray(data) ? data.find(x => x.slug === slug) : null;

  if(!lesson){
    qs("title").textContent = "Lekcija nije pronađena";
    qs("date").textContent = "";
    qs("text").innerHTML = "Provjeri slug/folder i kateheze.json.";
    return;
  }

  document.title = lesson.title || "Kateheza";
  qs("title").textContent = lesson.title || "Kateheza";
  qs("date").textContent = lesson.date || "";
  qs("text").innerHTML = nl2br(lesson.text || "");

  const gallery = qs("gallery");
  const imgs = Array.isArray(lesson.images) ? lesson.images : [];

  if(imgs.length === 0){
    gallery.innerHTML = `<p class="muted">Nema slika za ovu lekciju.</p>`;
    return;
  }

  gallery.innerHTML = imgs.map(img => `
    <div class="photoCard">
      <a class="photo" href="${BASE}/${img.src}" target="_blank" rel="noopener">
        <img src="${BASE}/${img.src}" alt="Slika" loading="lazy" />
      </a>
      ${img.caption ? `<div class="caption">${escapeHtml(img.caption)}</div>` : ""}
      ${img.note ? `<div class="note">${formatText(img.note)}</div>` : ""}
    </div>
  `).join("");
}
