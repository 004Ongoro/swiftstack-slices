const root = document;
const grid = document.getElementById('slicesGrid');
const empty = document.getElementById('empty');
const searchInput = document.getElementById('search');
const filterType = document.getElementById('filterType');

let manifest = {bases:[],addons:[]};

async function loadManifest(){
  try{
    const res = await fetch('manifest.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Manifest not found');
    manifest = await res.json();
    renderAll();
  }catch(err){
    empty.textContent = 'Failed to load manifest.json — using fallback sample.';
    manifest = getFallback();
    renderAll();
  }
}

function getFallback(){
  return {
    bases:[{id:'next-base',title:'Next.js Base',description:'Opinionated Next.js base project',url:'#',version:'1.0.0',hash:'9f2c7d4b6a5e2b...'}],
    addons:[{id:'tailwind-ui',title:'Tailwind UI Setup',description:'Tailwind + config + sample components',url:'#',version:'0.4.2',hash:'3a4b5c...'}]
  }
}

function makeCard(slice,type){
  const el = document.createElement('div');
  el.className = 'card';
  const h = document.createElement('h3');
  h.textContent = slice.title || slice.id;
  const p = document.createElement('p');
  p.textContent = slice.description || '';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const left = document.createElement('div');
  left.innerHTML = `<span class="badge">${type.toUpperCase()}</span> <span style="margin-left:8px">${slice.id}</span>`;

  const right = document.createElement('div');
  right.innerHTML = `<small>${slice.version || ''}</small>`;
  meta.appendChild(left);
  meta.appendChild(right);

  const actions = document.createElement('div');
  actions.style.marginTop = '0.7rem';
  const dl = document.createElement('a');
  dl.href = slice.url || '#';
  dl.className = 'btn';
  dl.textContent = 'Download';
  dl.target = '_blank';

  const info = document.createElement('button');
  info.textContent = 'Details';
  info.className = 'btn ghost';
  info.style.marginLeft = '0.5rem';
  info.addEventListener('click', ()=> showDetails(slice,type));

  actions.appendChild(dl);
  actions.appendChild(info);

  el.appendChild(h);
  el.appendChild(p);
  el.appendChild(meta);
  el.appendChild(actions);
  return el;
}

function showDetails(slice,type){
  const d = document.createElement('div');
  d.style.position='fixed';d.style.left=0;d.style.top=0;d.style.width='100%';d.style.height='100%';d.style.display='flex';d.style.alignItems='center';d.style.justifyContent='center';d.style.background='rgba(2,6,12,0.6)';
  const box = document.createElement('div');box.style.background='#071022';box.style.padding='1rem';box.style.borderRadius='10px';box.style.maxWidth='720px';box.style.width='90%';
  box.innerHTML = `<h3>${slice.title||slice.id} <small style="color:var(--muted);font-size:0.8rem">${slice.version||''}</small></h3>
  <p style="color:var(--muted)">${slice.description||''}</p>
  <pre style="background:#06121a;padding:0.7rem;border-radius:6px;color:#9ad3ff;overflow:auto">id: ${slice.id}\nversion: ${slice.version||''}\nurl: ${slice.url||''}\nhash: ${slice.hash||''}</pre>
  <div style="margin-top:0.6rem;display:flex;gap:0.6rem;justify-content:flex-end">
    <button id="copyBtn" class="btn">Copy curl</button>
    <a href="${slice.url||'#'}" target="_blank" class="btn">Open URL</a>
    <button id="closeBtn" class="btn ghost">Close</button>
  </div>`;

  d.appendChild(box);
  document.body.appendChild(d);
  document.getElementById('closeBtn').onclick = ()=> d.remove();
  document.getElementById('copyBtn').onclick = ()=>{
    const cmd = `curl -L ${slice.url||'#'} -o ${slice.id}@${slice.version||'latest'}.tar.zst`;
    navigator.clipboard.writeText(cmd).then(()=>{
      document.getElementById('copyBtn').textContent='Copied!';
      setTimeout(()=>document.getElementById('copyBtn').textContent='Copy curl',1200);
    });
  }
}

function renderAll(){
  grid.innerHTML='';
  empty.style.display='none';
  const q = searchInput.value.trim().toLowerCase();
  const type = filterType.value;
  let items = [];
  if(type==='all' || type==='bases') items = items.concat(manifest.bases.map(s=>({...s,type:'bases'})));
  if(type==='all' || type==='addons') items = items.concat(manifest.addons.map(s=>({...s,type:'addons'})));
  items = items.filter(it=>{
    if(!q) return true;
    return (it.id||'').toLowerCase().includes(q) || (it.title||'').toLowerCase().includes(q) || (it.description||'').toLowerCase().includes(q);
  });
  if(items.length===0){
    empty.style.display='block';
    empty.textContent='No slices found.';
    return;
  }
  for(const it of items){
    const c = makeCard(it,it.type==='bases'?'bases':'addons');
    grid.appendChild(c);
  }
}

searchInput.addEventListener('input', renderAll);
filterType.addEventListener('change', renderAll);

loadManifest();
