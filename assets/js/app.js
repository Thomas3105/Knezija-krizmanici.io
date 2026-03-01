function qs(id){ return document.getElementById(id); }

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

/* KATEHEZE: [{date,title,text}] */
async function renderKateheze(path, targetId){
  const data = await fetchJson(path);
  data.sort((a,b)=> String(b.date ?? "").localeCompare(String(a.date ?? "")));

  const html = data.map(x => `
    <details>
      <summary>
        ${escapeHtml(x.title || "Bez naslova")}
        <span class="metaInline">${escapeHtml(x.date || "")}</span>
      </summary>
      <div class="spacer"></div>
      <div class="muted">${nl2br(x.text || "")}</div>
    </details>
  `).join("");

  qs(targetId).innerHTML = html || `<p class="muted">Nema sadržaja.</p>`;
}

/* FAQ: [{q,a}] */
async function renderFaq(path, targetId){
  const data = await fetchJson(path);
  const html = data.map(x => `
    <details>
      <summary>${escapeHtml(x.q || "Pitanje")}</summary>
      <div class="spacer"></div>
      <div class="muted">${nl2br(x.a || "")}</div>
    </details>
  `).join("");

  qs(targetId).innerHTML = html || `<p class="muted">Nema pitanja.</p>`;
}

/* RJEČNIK: [{term,meaning,example}] with search */
async function renderRjecnik(path, targetId, searchInputId){
  const data = await fetchJson(path);
  data.sort((a,b)=> String(a.term ?? "").localeCompare(String(b.term ?? "")));

  function draw(filter){
    const f = (filter || "").trim().toLowerCase();
    const rows = data.filter(x=>{
      const term = String(x.term ?? "").toLowerCase();
      const meaning = String(x.meaning ?? "").toLowerCase();
      return !f || term.includes(f) || meaning.includes(f);
    });

    qs(targetId).innerHTML = rows.map(x => `
      <div class="item">
        <h3>${escapeHtml(x.term || "")}</h3>
        <div class="meta">
          <span>${escapeHtml(x.meaning || "")}</span>
        </div>
        ${x.example ? `<p class="muted">${nl2br(x.example)}</p>` : ""}
      </div>
    `).join("") || `<p class="muted">Nema rezultata.</p>`;
  }

  const input = qs(searchInputId);
  input.addEventListener("input", () => draw(input.value));
  draw("");
}

/* ORATORIJI: [{date,title,tag,text}] */
async function renderPosts(path, targetId){
  const data = await fetchJson(path);
  data.sort((a,b)=> String(b.date ?? "").localeCompare(String(a.date ?? "")));

  qs(targetId).innerHTML = data.map(x => `
    <div class="item">
      <h3>${escapeHtml(x.title || "Objava")}</h3>
      <div class="meta">
        ${x.date ? `<span>${escapeHtml(x.date)}</span>` : ""}
        ${x.tag ? `<span>• ${escapeHtml(x.tag)}</span>` : ""}
      </div>
      ${x.text ? `<p class="muted">${nl2br(x.text)}</p>` : ""}
    </div>
  `).join("") || `<p class="muted">Nema objava.</p>`;
}
/* DRUSTVENE MREZE: [{name,url,description}] */
async function renderSocial(path, targetId){
  const data = await fetchJson(path);

  const icons = {
    "TikTok":"🎵",
    "YouTube":"▶️",
    "Instagram":"📷",
    "Facebook":"📘"
  };

  qs(targetId).innerHTML = data.map(x => `
    <a href="${x.url}" target="_blank" class="item" style="display:block;text-decoration:none;color:inherit">
      <h3>${icons[x.name] || "🔗"} ${escapeHtml(x.name)}</h3>
      <p class="muted">${escapeHtml(x.description || "")}</p>
      <div class="meta">
        <span>${escapeHtml(x.url)}</span>
      </div>
    </a>
  `).join("") || `<p class="muted">Nema linkova.</p>`;
}
