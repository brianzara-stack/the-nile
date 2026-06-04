// THE NILE — CLEAN APP

const SUPABASE_URL = 'https://xrejvtgnbalplueskgij.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWp2dGduYmFscGx1ZXNrZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU4MjIsImV4cCI6MjA5NjAwMTgyMn0.3NI9k5h_-kMRJh8FSlC4irSXReciHJEXtUjZdtYy7OM';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── GRADIENTS ──
const GRADIENTS = {
  'marcus aurelius':['#1a0a2e','#16213e','#0f3460'],
  'dale carnegie':['#0f2027','#203a43','#2c5364'],
  'sun tzu':['#16222a','#3a6073','#1a1a2e'],
  'seneca':['#2c1810','#6b3a2a','#1a0a05'],
  'epictetus':['#0d1b2a','#1b2a4a','#2d4a6b'],
  'aristotle':['#0d0d1a','#1a1a3e','#2a2a5e'],
  'plato':['#1a0d2e','#2e1a5e','#0d0a1a'],
  'napoleon hill':['#1a1a2e','#16213e','#0f3460'],
  'james allen':['#0a1a0a','#1a3a1a','#0d2a0d'],
  'benjamin franklin':['#0a1628','#1c3a5c','#2a4a7a'],
  'thoreau':['#0a1a0a','#1a3a1a','#0a2a10'],
  'douglass':['#1a0a0a','#3a1a1a','#1a0505'],
  'machiavelli':['#1a1205','#3a2a0d','#1a0d02'],
  'oscar wilde':['#1a0a1a','#3a1a3a','#5e2a5e'],
  'dickens':['#0a0a1a','#1a1a3a','#2a2050'],
  'mark twain':['#0d1a0d','#1a3328','#0a2018'],
  'shakespeare':['#1a0505','#3a0d0d','#1a0202'],
  'confucius':['#1a0d05','#3a2010','#1a1005'],
  'tolstoy':['#0a0d1a','#1a2030','#0a1520'],
  'gibran':['#1a0d1a','#3a1a3a','#1a0a20'],
  'hugo':['#0d0a1a','#1a1530','#2a2050'],
  'voltaire':['#0d1a10','#1a3a20','#0a2015'],
  'emerson':['#1a1205','#2a2010','#3a3020'],
  'News':['#050d18','#0a1e30','#051020'],
  'Issues':['#050d08','#0a1e10','#051008'],
  'Lifestyle':['#0d0518','#1e0a30','#100520'],
  'Entertainment':['#180505','#300a0a','#200305'],
  'Philosophy':['#050518','#0a0a30','#030318'],
  'History':['#100c02','#2a200a','#180e02'],
  'Education':['#051528','#0a2a4a','#051020'],
};

function getGradient(clip) {
  const k = (clip.creator || '').toLowerCase();
  for (const [key, c] of Object.entries(GRADIENTS)) {
    if (k.includes(key)) return c;
  }
  return GRADIENTS[clip.cat] || GRADIENTS['News'];
}

function gradCSS(colors) {
  return `radial-gradient(ellipse at top left, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
}

function initials(name) {
  return (name || 'N').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── STATE ──
let clips = [], currentIdx = 0, isPlaying = false;
let progInterval = null, clipProg = {}, liked = {}, saved = {}, following = {};
let speed = 1, currentUser = null, commentClip = null, allComments = {};
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const audio = new Audio();
audio.preload = 'none';

audio.addEventListener('timeupdate', () => {
  const c = clips[currentIdx];
  if (!c || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  clipProg[c.id] = pct;
  updateProg(c.id, pct, audio.currentTime);
});
audio.addEventListener('ended', () => { isPlaying = false; updateIcons(); setTimeout(nextClip, 800); });
audio.addEventListener('error', () => fakeProg());

const fmtT = s => { s = Math.floor(s || 0); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };

function updateProg(id, pct, elapsed) {
  const f = document.getElementById('pf-' + id);
  if (f) f.style.width = pct + '%';
  const t = document.getElementById('et-' + id);
  if (t && elapsed !== undefined) t.textContent = fmtT(elapsed);
  const pbf = document.getElementById('pb-fill');
  if (pbf) pbf.style.width = pct + '%';
  animateWave(id, pct);
}

function animateWave(id, pct) {
  document.querySelectorAll(`#wv-${id} .wv-bar`).forEach((b, i) => {
    const bp = (i / 44) * 100;
    b.style.background = bp < pct ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.2)';
    if (isPlaying && bp >= pct && bp < pct + 6) b.style.height = (5 + Math.random() * 28) + 'px';
  });
}

function buildWave(id, pct = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 44; i++) {
    const b = document.createElement('div');
    b.className = 'wv-bar';
    b.style.cssText = `height:${5 + Math.random() * 26}px;background:${(i/44*100) < pct ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.2)'}`;
    el.appendChild(b);
  }
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ── LISTEN NOTES ──
const LN_KEY = 'aaca221d7d284540bdc63cdeb09037da';
const LN_BASE = 'https://listen-api.listennotes.com/api/v2';
const LN_SEARCHES = [
  {q:'breaking news today', cat:'News'},
  {q:'philosophy wisdom life', cat:'Issues'},
  {q:'entrepreneurship health money', cat:'Lifestyle'},
  {q:'comedy funny storytelling', cat:'Entertainment'},
];

async function searchLN(query, cat) {
  try {
    const res = await fetch(`${LN_BASE}/search?q=${encodeURIComponent(query)}&type=episode&len_min=1&len_max=10&safe_mode=0&language=English`, {
      headers: {'X-ListenAPI-Key': LN_KEY}
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 3).map((ep, i) => ({
      id: 'ln_' + Date.now() + '_' + i,
      title: (ep.title_original || '').slice(0, 80),
      creator: ep.podcast?.title_original || 'Podcast',
      desc: (ep.description_original || '').replace(/<[^>]+>/g, '').slice(0, 120),
      tags: '#' + cat.toLowerCase() + ' #podcast',
      cat, duration: 75,
      plays: Math.floor(Math.random() * 500 + 10) + 'K',
      likes: Math.floor(Math.random() * 50 + 1) + 'K',
      audioUrl: (ep.audio || '') + '#t=' + Math.floor((ep.audio_length_sec || 300) * 0.25),
      podcastImage: ep.image || ep.podcast?.image || '',
    }));
  } catch(e) { return []; }
}

// ── LOAD CLIPS ──
async function loadClips() {
  const el = document.getElementById('feed-loading');
  if (el) el.style.display = 'flex';
  let dbClips = [], lnClips = [];
  try {
    const {data, error} = await db.from('clips').select('*').eq('status', 'published').order('created_at', {ascending: false});
    if (!error && data?.length) {
      dbClips = data.map(c => ({
        id: c.id, title: c.title,
        creator: c.rss_source || 'The Nile',
        desc: c.description || '',
        tags: (c.hashtags || []).map(t => '#' + t).join(' '),
        cat: c.category || 'Issues',
        duration: c.duration_seconds || 75,
        plays: c.play_count || 0, likes: c.like_count || 0,
        audioUrl: c.audio_url || '', podcastImage: '',
      }));
    }
  } catch(e) {}
  try {
    const results = await Promise.allSettled(LN_SEARCHES.slice(0, 3).map(s => searchLN(s.q, s.cat)));
    results.forEach(r => { if (r.status === 'fulfilled') lnClips.push(...r.value); });
  } catch(e) {}

  // Interleave DB and podcast clips
  const merged = [];
  let di = 0, li = 0;
  while (di < dbClips.length || li < lnClips.length) {
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (li < lnClips.length) merged.push(lnClips[li++]);
  }
  clips = merged.length ? merged : [{id:'f1',title:'Welcome to The Nile',creator:'The Nile',desc:'Your feed is loading.',tags:'#nile',cat:'News',duration:75,plays:0,likes:0,audioUrl:'',podcastImage:''}];
  if (el) el.style.display = 'none';
  buildFeed();
  toast(clips.length + ' clips ready');
}

// ── BUILD FEED ──
function buildFeed() {
  const container = document.getElementById('feed-scroll');
  if (!container) return;
  container.innerHTML = '';
  clips.forEach((clip, i) => {
    const pct = clipProg[clip.id] || 0;
    const elapsed = Math.floor((clip.duration || 0) * pct / 100);
    const colors = getGradient(clip);
    const bg = gradCSS(colors);
    const hasPodcastImg = !!clip.podcastImage;
    const cardBg = hasPodcastImg ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center` : `background:${bg}`;

    const card = document.createElement('div');
    card.className = 'clip-card';
    card.id = 'card-' + clip.id;
    card.innerHTML = `
      <div class="clip-card-bg" style="${cardBg}"></div>
      <div class="clip-inner" style="${hasPodcastImg ? '' : `background:${bg}`}">
        ${hasPodcastImg ? `<div class="clip-inner-bg" style="background-image:url(${clip.podcastImage});background-size:cover;background-position:center"></div>` : `<div class="clip-inner-bg" style="background:${bg}"></div>`}
        <div class="clip-inner-overlay"></div>
        <div class="clip-top">
          <span class="clip-cat-pill">${clip.cat}</span>
          <span class="clip-num">${String(i+1).padStart(2,'0')} / ${String(clips.length).padStart(2,'0')}</span>
        </div>
        <div class="clip-bottom">
          <div class="clip-creator-row">
            <div class="clip-av" style="${hasPodcastImg ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center` : `background:${bg}`}">${!hasPodcastImg ? initials(clip.creator) : ''}</div>
            <span class="clip-creator-name">${clip.creator}</span>
            <button class="clip-follow ${following[clip.id]?'following':''}" id="fp-${clip.id}" onclick="toggleFollow('${clip.id}')">${following[clip.id]?'Following':'Follow'}</button>
          </div>
          <div class="clip-title">${clip.title}</div>
          ${clip.desc ? `<div class="clip-desc">${clip.desc.slice(0,100)}</div>` : ''}
          <div class="clip-tags">${clip.tags}</div>
          <div class="clip-player">
            <div class="waveform" id="wv-${clip.id}" onclick="seekWave(event,'${clip.id}')"></div>
            <div class="prog-row">
              <span class="clip-time" id="et-${clip.id}">${fmtT(elapsed)}</span>
              <div class="prog-track" onclick="seekTrack(event,'${clip.id}')"><div class="prog-fill" id="pf-${clip.id}" style="width:${pct}%"></div></div>
              <span class="clip-time">${fmtT(clip.duration)}</span>
            </div>
            <div class="ctrl-row">
              <button class="ctrl-btn" onclick="rew('${clip.id}')"><i class="ti ti-rewind-10"></i></button>
              <button class="ctrl-btn" onclick="prevClip()"><i class="ti ti-skip-back"></i></button>
              <button class="play-btn" onclick="togglePlay('${clip.id}')"><i class="ti ${i===currentIdx&&isPlaying?'ti-player-pause':'ti-player-play'}" id="pi-${clip.id}"></i></button>
              <button class="ctrl-btn" onclick="nextClip()"><i class="ti ti-skip-forward"></i></button>
              <button class="speed-btn" onclick="cycleSpeed()">${speed}x</button>
            </div>
          </div>
        </div>
      </div>
      <div class="clip-actions">
        <div class="act-av-wrap">
          <div class="act-av" style="${hasPodcastImg ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center` : `background:${bg}`}">${!hasPodcastImg ? initials(clip.creator) : ''}</div>
          <div class="act-plus">+</div>
        </div>
        <div class="act-btn ${liked[clip.id]?'liked':''}" onclick="toggleLike('${clip.id}',this)">
          <div class="act-icon"><i class="ti ti-heart"></i></div>
          <span class="act-count" id="lc-${clip.id}">${typeof clip.likes==='number'&&clip.likes>999?(clip.likes/1000).toFixed(1)+'K':clip.likes}</span>
        </div>
        <div class="act-btn" onclick="openComments('${clip.id}')">
          <div class="act-icon"><i class="ti ti-message-circle-2"></i></div>
          <span class="act-count">${(allComments[clip.id]||[]).length||0}</span>
        </div>
        <div class="act-btn ${saved[clip.id]?'saved':''}" onclick="toggleSave('${clip.id}',this)">
          <div class="act-icon"><i class="ti ti-bookmark"></i></div>
        </div>
        <div class="act-btn" onclick="shareClip('${clip.id}')">
          <div class="act-icon"><i class="ti ti-share-2"></i></div>
          <span class="act-count">${typeof clip.plays==='number'&&clip.plays>999?(clip.plays/1000).toFixed(1)+'K':clip.plays}</span>
        </div>
      </div>`;
    container.appendChild(card);
    buildWave('wv-' + clip.id, pct);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.intersectionRatio > 0.75) {
        const id = e.target.id.replace('card-', '');
        const idx = clips.findIndex(c => String(c.id) === id);
        if (idx !== -1 && idx !== currentIdx) {
          stopAudio(); currentIdx = idx; isPlaying = true; updateIcons(); startAudio(); updateBar();
        }
      }
    });
  }, {threshold: 0.75});
  container.querySelectorAll('.clip-card').forEach(el => obs.observe(el));
  updateBar();
}

function updateIcons() {
  clips.forEach(c => {
    const el = document.getElementById('pi-' + c.id);
    if (el) el.className = 'ti ' + (String(c.id) === String(clips[currentIdx]?.id) && isPlaying ? 'ti-player-pause' : 'ti-player-play');
  });
  const pb = document.getElementById('pb-icon');
  if (pb) pb.className = 'ti ' + (isPlaying ? 'ti-player-pause' : 'ti-player-play');
}

function updateBar() {
  const c = clips[currentIdx]; if (!c) return;
  const bar = document.getElementById('player-bar');
  if (bar) bar.style.display = 'flex';
  const t = document.getElementById('pb-title'), s = document.getElementById('pb-source');
  if (t) t.textContent = c.title;
  if (s) s.textContent = c.creator + ' · ' + c.cat;
}

function togglePlay(id) {
  if (String(id) !== String(clips[currentIdx]?.id)) { stopAudio(); currentIdx = clips.findIndex(c => String(c.id) === String(id)); }
  isPlaying = !isPlaying; updateIcons();
  if (isPlaying) startAudio(); else stopAudio(); updateBar();
}

function startAudio() {
  const c = clips[currentIdx]; if (!c) return;
  if (c.audioUrl) {
    if (audio.src !== c.audioUrl) { audio.src = c.audioUrl; clipProg[c.id] = 0; }
    audio.playbackRate = speed;
    audio.play().catch(() => fakeProg());
  } else fakeProg();
}

function stopAudio() { audio.pause(); if (progInterval) { clearInterval(progInterval); progInterval = null; } }

function fakeProg() {
  if (progInterval) clearInterval(progInterval);
  const c = clips[currentIdx]; if (!c) return;
  progInterval = setInterval(() => {
    const cur = clipProg[c.id] || 0, step = (100 / c.duration) * 0.1 * speed;
    const np = Math.min(100, cur + step); clipProg[c.id] = np;
    updateProg(c.id, np, c.duration * np / 100);
    if (np >= 100) { clearInterval(progInterval); progInterval = null; isPlaying = false; updateIcons(); setTimeout(nextClip, 800); }
  }, 100);
}

function nextClip() {
  stopAudio(); currentIdx = (currentIdx + 1) % clips.length;
  document.getElementById('card-' + clips[currentIdx].id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  isPlaying = true; updateIcons(); startAudio(); updateBar();
}

function prevClip() {
  stopAudio(); currentIdx = (currentIdx - 1 + clips.length) % clips.length;
  document.getElementById('card-' + clips[currentIdx].id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  isPlaying = true; updateIcons(); startAudio(); updateBar();
}

function seekTrack(e, id) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  clipProg[id] = pct;
  const c = clips.find(c => String(c.id) === String(id));
  if (c?.audioUrl && audio.duration) audio.currentTime = (pct / 100) * audio.duration;
  buildWave('wv-' + id, pct);
}
function seekWave(e, id) { seekTrack(e, id); }
function rew(id) {
  const c = clips.find(c => String(c.id) === String(id)); if (!c) return;
  clipProg[id] = Math.max(0, (clipProg[id] || 0) - (10 / c.duration) * 100);
  if (c.audioUrl && audio.duration) audio.currentTime = Math.max(0, audio.currentTime - 10);
  buildWave('wv-' + id, clipProg[id]);
}
function cycleSpeed() {
  speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
  document.querySelectorAll('.speed-btn').forEach(b => b.textContent = speed + 'x');
  audio.playbackRate = speed; toast('Speed: ' + speed + 'x');
}
function toggleLike(id, el) {
  liked[id] = !liked[id]; el.classList.toggle('liked', liked[id]);
  const icon = el.querySelector('i');
  if (icon) icon.className = liked[id] ? 'ti ti-heart-filled' : 'ti ti-heart';
}
function toggleSave(id, el) { saved[id] = !saved[id]; el.classList.toggle('saved', saved[id]); toast(saved[id] ? 'Saved!' : 'Removed'); }
function toggleFollow(id) {
  following[id] = !following[id];
  const btn = document.getElementById('fp-' + id);
  if (btn) { btn.classList.toggle('following', following[id]); btn.textContent = following[id] ? 'Following' : 'Follow'; }
  toast(following[id] ? 'Following!' : 'Unfollowed');
}
function shareClip(id) { if (navigator.clipboard) { navigator.clipboard.writeText(location.href + '#' + id); toast('Link copied!'); } }

function openComments(id) {
  commentClip = id;
  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  const cc = allComments[id] || [];
  if (!cc.length) list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted2);font-size:14px">No comments yet. Be the first.</div>';
  else cc.forEach(c => {
    const d = document.createElement('div'); d.className = 'comment-item';
    d.innerHTML = `<div class="comment-av">${c.user.slice(1,3).toUpperCase()}</div><div><div class="comment-user">${c.user}</div><div class="comment-text">${c.text}</div><div class="comment-time">${c.time}</div></div>`;
    list.appendChild(d);
  });
  document.getElementById('comments-modal').style.display = 'flex';
}

// ── NAV ──
function switchView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn, .mob-item').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('view-' + v);
  if (target) target.classList.add('active');
  document.querySelectorAll(`[data-view="${v}"]`).forEach(el => el.classList.add('active'));
  if (v === 'profile') buildProfile();
  if (v === 'discover') buildDiscover();
}

// ── DISCOVER ──
const CATS = ['All','News','Issues','Lifestyle','Entertainment','Philosophy','History'];
const ICONS_MAP = {All:'ti-apps',News:'ti-news',Issues:'ti-world',Lifestyle:'ti-heart',Entertainment:'ti-masks-theater',Philosophy:'ti-yin-yang',History:'ti-hourglass'};
const TRENDING = [{rank:1,tag:'#Stoicism',clips:'48K'},{rank:2,tag:'#DailyNews',clips:'41K'},{rank:3,tag:'#MarcusAurelius',clips:'32K'},{rank:4,tag:'#Lifestyle',clips:'27K'},{rank:5,tag:'#Literature',clips:'19K'},{rank:6,tag:'#BigIdeas',clips:'16K'}];
const CREATORS_DATA = [
  {name:'Marcus Aurelius',handle:'@marcusaurelius',followers:'2.1M',colors:['#1a0a2e','#2d1b69','#0f3460']},
  {name:'Dale Carnegie',handle:'@dalecarnegie',followers:'890K',colors:['#0f2027','#203a43','#2c5364']},
  {name:'Sun Tzu',handle:'@suntzu',followers:'1.4M',colors:['#16222a','#3a6073','#1a1a2e']},
  {name:'Seneca',handle:'@seneca',followers:'780K',colors:['#2c1810','#6b3a2a','#1a0a05']},
  {name:'Shakespeare',handle:'@shakespeare',followers:'3.2M',colors:['#1a0505','#3a0d0d','#1a0202']},
  {name:'Confucius',handle:'@confucius',followers:'1.1M',colors:['#1a0d05','#3a2010','#1a1005']},
];

let discoverBuilt = false;
function buildDiscover() {
  if (discoverBuilt) return;
  discoverBuilt = true;

  const cp = document.getElementById('cat-pills');
  CATS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill' + (c === 'All' ? ' active' : '');
    btn.innerHTML = `<i class="ti ${ICONS_MAP[c]}"></i>${c}`;
    btn.onclick = () => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (c !== 'All') {
        const filtered = clips.filter(clip => clip.cat === c);
        if (filtered.length) { clips = filtered; currentIdx = 0; buildFeed(); switchView('feed'); toast('Showing ' + c); }
      } else { loadClips(); switchView('feed'); }
    };
    cp.appendChild(btn);
  });

  const tl = document.getElementById('trending-list');
  TRENDING.forEach(t => {
    const d = document.createElement('div'); d.className = 'trend-item';
    d.innerHTML = `<span class="trend-rank">${t.rank}</span><div><div class="trend-name">${t.tag}</div><div class="trend-count">${t.clips} clips</div></div><i class="ti ti-chevron-right" style="margin-left:auto;color:var(--muted2)"></i>`;
    d.onclick = () => { toast('Filtering by ' + t.tag); switchView('feed'); };
    tl.appendChild(d);
  });

  const cg = document.getElementById('creators-grid');
  CREATORS_DATA.forEach(c => {
    const bg = gradCSS(c.colors);
    const d = document.createElement('div'); d.className = 'creator-card';
    d.innerHTML = `<div class="cr-av" style="background:${bg}">${initials(c.name)}</div><div class="cr-name">${c.name}</div><div class="cr-handle">${c.handle}</div><div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-bottom:8px">${c.followers}</div><button class="cr-follow">Subscribe</button>`;
    d.querySelector('.cr-follow').onclick = function(e) {
      e.stopPropagation();
      this.classList.toggle('following');
      this.textContent = this.classList.contains('following') ? 'Subscribed' : 'Subscribe';
      toast(this.classList.contains('following') ? 'Subscribed to ' + c.name : 'Unsubscribed');
    };
    cg.appendChild(d);
  });
}

// ── PROFILE ──
function buildProfile() {
  if (!currentUser) return;
  const meta = currentUser.user_metadata || {};
  const name = meta.full_name || currentUser.email?.split('@')[0] || 'User';
  const username = meta.username || name.toLowerCase().replace(/\s+/g, '');
  document.getElementById('profile-cover-text').textContent = name.split(' ')[0];
  document.getElementById('profile-avatar').textContent = initials(name);
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-handle').textContent = '@' + username;
  document.querySelectorAll('.ptab').forEach(t => {
    t.onclick = function() {
      document.querySelectorAll('.ptab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.ptab-content').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      const tc = document.getElementById('ptab-' + this.dataset.ptab);
      if (tc) tc.classList.add('active');
    };
  });
  // About tab
  const about = document.getElementById('about-section');
  if (about) about.innerHTML = `
    <div style="padding:20px 0">
      <div style="font-family:var(--mono);font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Platform</div>
      <div style="font-size:14px;color:var(--text);margin-bottom:20px">The Nile — News. Issues. Lifestyle. Entertainment.</div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Member Since</div>
      <div style="font-size:14px;color:var(--text)">${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
    </div>`;
}

// ── AUTH ──
async function initAuth() {
  const {data:{session}} = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    document.getElementById('auth-screen').style.display = 'none';
    updateSidebarUser();
    await loadClips();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('feed-loading').style.display = 'none';
  }

  db.auth.onAuthStateChange((_, sess) => {
    if (sess) { currentUser = sess.user; document.getElementById('auth-screen').style.display = 'none'; updateSidebarUser(); loadClips(); }
    else { currentUser = null; document.getElementById('auth-screen').style.display = 'flex'; }
  });

  document.getElementById('tab-login').onclick = () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-signup').style.display = 'none';
  };
  document.getElementById('tab-signup').onclick = () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-signup').classList.add('active');
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-signup').style.display = 'block';
  };
  document.getElementById('to-signup').onclick = () => document.getElementById('tab-signup').click();
  document.getElementById('to-login').onclick = () => document.getElementById('tab-login').click();

  document.getElementById('form-login').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.auth-submit'); btn.textContent = 'Signing in...'; btn.disabled = true;
    const {error} = await db.auth.signInWithPassword({email: document.getElementById('login-email').value, password: document.getElementById('login-pw').value});
    if (error) { const el = document.getElementById('auth-err'); el.textContent = error.message; el.style.display = 'block'; }
    btn.textContent = 'Sign In →'; btn.disabled = false;
  };

  document.getElementById('form-signup').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.auth-submit'); btn.textContent = 'Creating...'; btn.disabled = true;
    const {error} = await db.auth.signUp({
      email: document.getElementById('signup-email').value,
      password: document.getElementById('signup-pw').value,
      options: {data: {full_name: document.getElementById('signup-name').value, username: document.getElementById('signup-user').value}}
    });
    if (error) { const el = document.getElementById('auth-err'); el.textContent = error.message; el.style.display = 'block'; }
    else { const el = document.getElementById('auth-ok'); el.textContent = 'Account created! Check your email.'; el.style.display = 'block'; }
    btn.textContent = 'Subscribe Free →'; btn.disabled = false;
  };
}

function updateSidebarUser() {
  if (!currentUser) return;
  const meta = currentUser.user_metadata || {};
  const name = meta.full_name || currentUser.email?.split('@')[0] || 'User';
  const username = meta.username || name.toLowerCase().replace(/\s+/g, '');
  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('sidebar-handle').textContent = '@' + username;
  document.getElementById('sidebar-av').textContent = initials(name);
}

// ── WIRE EVENTS ──
function wireEvents() {
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      const filtered = clips.filter(c => c.cat === cat);
      if (filtered.length) { const orig = [...clips]; clips = filtered; currentIdx = 0; buildFeed(); switchView('feed'); toast('Showing ' + cat); setTimeout(() => { clips = orig; }, 60000); }
      else { switchView('feed'); toast('Loading ' + cat + '...'); }
    });
  });

  document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.feed === 'following') toast('Showing voices you follow');
    });
  });

  document.getElementById('btn-prev')?.addEventListener('click', prevClip);
  document.getElementById('btn-next')?.addEventListener('click', nextClip);
  document.getElementById('pb-play')?.addEventListener('click', () => togglePlay(clips[currentIdx]?.id));
  document.getElementById('pb-next-btn')?.addEventListener('click', nextClip);
  document.getElementById('pb-rew')?.addEventListener('click', () => rew(clips[currentIdx]?.id));

  document.getElementById('comments-modal')?.addEventListener('click', e => { if (e.target === document.getElementById('comments-modal')) document.getElementById('comments-modal').style.display = 'none'; });
  document.getElementById('send-comment')?.addEventListener('click', () => {
    const input = document.getElementById('comment-input');
    const text = input.value.trim(); if (!text || !commentClip) return;
    if (!allComments[commentClip]) allComments[commentClip] = [];
    allComments[commentClip].push({user: '@' + (currentUser?.user_metadata?.username || 'you'), text, time: 'just now'});
    openComments(commentClip); input.value = '';
  });

  document.getElementById('btn-signout')?.addEventListener('click', () => {
    if (confirm('Sign out of The Nile?')) db.auth.signOut();
  });

  document.getElementById('sidebar-user')?.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (confirm('Sign out?')) db.auth.signOut();
  });

  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowDown') nextClip();
    else if (e.key === 'ArrowUp') prevClip();
    else if (e.key === ' ') { e.preventDefault(); togglePlay(clips[currentIdx]?.id); }
  });
}

// ── INIT ──
wireEvents();
initAuth();
