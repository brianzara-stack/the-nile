// ═══════════════════════════════════════════════
// THE NILE — app.js
// Clean build. No patches.
// ═══════════════════════════════════════════════

const SUPA_URL = 'https://xrejvtgnbalplueskgij.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWp2dGduYmFscGx1ZXNrZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU4MjIsImV4cCI6MjA5NjAwMTgyMn0.3NI9k5h_-kMRJh8FSlC4irSXReciHJEXtUjZdtYy7OM';
const LN_KEY  = 'aaca221d7d284540bdc63cdeb09037da';
const LN_BASE = 'https://listen-api.listennotes.com/api/v2';

const db = supabase.createClient(SUPA_URL, SUPA_KEY);

// ═══════════════════════════════════════════════
// GRADIENTS — per author / category
// ═══════════════════════════════════════════════
const GRAD = {
  'marcus aurelius':    ['#1a0a2e','#16213e','#0f3460'],
  'dale carnegie':      ['#0f2027','#203a43','#2c5364'],
  'sun tzu':            ['#16222a','#3a6073','#1a1a2e'],
  'seneca':             ['#2c1810','#6b3a2a','#1a0a05'],
  'epictetus':          ['#0d1b2a','#1b2a4a','#2d4a6b'],
  'aristotle':          ['#0d0d1a','#1a1a3e','#2a2a5e'],
  'plato':              ['#1a0d2e','#2e1a5e','#0d0a1a'],
  'napoleon hill':      ['#1a1a2e','#16213e','#0f3460'],
  'james allen':        ['#0a1a0a','#1a3a1a','#0d2a0d'],
  'benjamin franklin':  ['#0a1628','#1c3a5c','#2a4a7a'],
  'thoreau':            ['#0a1a0a','#1a3a1a','#0a2a10'],
  'douglass':           ['#1a0a0a','#3a1a1a','#1a0505'],
  'machiavelli':        ['#1a1205','#3a2a0d','#1a0d02'],
  'oscar wilde':        ['#1a0a1a','#3a1a3a','#5e2a5e'],
  'dickens':            ['#0a0a1a','#1a1a3a','#2a2050'],
  'mark twain':         ['#0d1a0d','#1a3328','#0a2018'],
  'shakespeare':        ['#1a0505','#3a0d0d','#1a0202'],
  'confucius':          ['#1a0d05','#3a2010','#1a1005'],
  'tolstoy':            ['#0a0d1a','#1a2030','#0a1520'],
  'gibran':             ['#1a0d1a','#3a1a3a','#1a0a20'],
  'hugo':               ['#0d0a1a','#1a1530','#2a2050'],
  'voltaire':           ['#0d1a10','#1a3a20','#0a2015'],
  'emerson':            ['#1a1205','#2a2010','#3a3020'],
  'News':           ['#050d18','#0a1e30','#051020'],
  'Issues':         ['#050d08','#0a1e10','#051008'],
  'Lifestyle':      ['#0d0518','#1e0a30','#100520'],
  'Entertainment':  ['#180505','#300a0a','#200305'],
  'Philosophy':     ['#050518','#0a0a30','#030318'],
  'History':        ['#100c02','#2a200a','#180e02'],
};

function getGrad(clip) {
  const k = (clip.creator || '').toLowerCase();
  for (const [key, val] of Object.entries(GRAD)) {
    if (k.includes(key)) return val;
  }
  return GRAD[clip.cat] || GRAD['News'];
}

function gradCSS([c1, c2, c3]) {
  return `radial-gradient(ellipse at top left, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || 'N';
}

function fmt(s) {
  s = Math.floor(s || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtCount(n) {
  if (typeof n !== 'number') return n || '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let clips = [], idx = 0, playing = false;
let progInt = null, progMap = {}, liked = {}, saved = {}, following = {};
let speed = 1, user = null, commentClip = null, comments = {};
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const audio = new Audio();
audio.preload = 'none';

// ═══════════════════════════════════════════════
// AUDIO EVENTS
// ═══════════════════════════════════════════════
audio.addEventListener('timeupdate', () => {
  const c = clips[idx];
  if (!c || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progMap[c.id] = pct;
  updateProg(c.id, pct, audio.currentTime);
  msPosition();
});

audio.addEventListener('ended', () => {
  playing = false;
  syncIcons();
  setTimeout(nextClip, 800);
});

audio.addEventListener('error', () => fakePlay());

// ═══════════════════════════════════════════════
// PROGRESS UI
// ═══════════════════════════════════════════════
function updateProg(id, pct, elapsed) {
  const fill = document.getElementById('pf-' + id);
  if (fill) fill.style.width = pct + '%';
  const time = document.getElementById('et-' + id);
  if (time && elapsed !== undefined) time.textContent = fmt(elapsed);
  const pbFill = document.getElementById('pb-fill');
  if (pbFill) pbFill.style.width = pct + '%';
  waveAnim(id, pct);
}

function waveAnim(id, pct) {
  const bars = document.querySelectorAll(`#wv-${id} .wv-bar`);
  bars.forEach((b, i) => {
    const bp = (i / bars.length) * 100;
    b.style.background = bp < pct ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.12)';
    if (playing && bp >= pct && bp < pct + 7)
      b.style.height = (5 + Math.random() * 26) + 'px';
  });
}

function buildWave(id, pct = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 44; i++) {
    const b = document.createElement('div');
    b.className = 'wv-bar';
    b.style.cssText = `height:${5 + Math.random() * 24}px;background:${(i / 44 * 100) < pct ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.12)'}`;
    el.appendChild(b);
  }
}

// ═══════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

// ═══════════════════════════════════════════════
// LISTEN NOTES
// ═══════════════════════════════════════════════
const LN_SEARCHES = [
  { q: 'breaking news today',           cat: 'News' },
  { q: 'philosophy wisdom stoicism',    cat: 'Issues' },
  { q: 'entrepreneurship health money', cat: 'Lifestyle' },
  { q: 'comedy funny storytelling',     cat: 'Entertainment' },
];

async function fetchLN(q, cat) {
  try {
    const r = await fetch(
      `${LN_BASE}/search?q=${encodeURIComponent(q)}&type=episode&len_min=1&len_max=10&safe_mode=0&language=English`,
      { headers: { 'X-ListenAPI-Key': LN_KEY } }
    );
    if (!r.ok) return [];
    const data = await r.json();
    return (data.results || []).slice(0, 3).map((ep, i) => ({
      id: 'ln_' + Date.now() + '_' + i + '_' + Math.random().toString(36).slice(2),
      title:   (ep.title_original || '').slice(0, 80),
      creator: ep.podcast?.title_original || 'Podcast',
      desc:    (ep.description_original || '').replace(/<[^>]+>/g, '').slice(0, 120),
      tags:    '#' + cat.toLowerCase() + ' #podcast',
      cat,
      duration:     75,
      plays:        Math.floor(Math.random() * 500 + 20),
      likes:        Math.floor(Math.random() * 80 + 5),
      audioUrl:     (ep.audio || '') + '#t=' + Math.floor((ep.audio_length_sec || 300) * 0.22),
      podcastImage: ep.image || ep.podcast?.image || '',
      isLN: true,
    }));
  } catch { return []; }
}

// ═══════════════════════════════════════════════
// LOAD CLIPS
// ═══════════════════════════════════════════════
async function loadClips() {
  const loading = document.getElementById('feed-loading');
  if (loading) loading.style.display = 'flex';

  let dbClips = [], lnClips = [];

  // Supabase
  try {
    const { data, error } = await db
      .from('clips')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data?.length) {
      dbClips = data.map(c => ({
        id:       c.id,
        title:    c.title || 'Untitled',
        creator:  c.rss_source || 'The Nile',
        desc:     c.description || '',
        tags:     (c.hashtags || []).map(t => '#' + t).join(' '),
        cat:      c.category || 'Issues',
        duration: c.duration_seconds || 75,
        plays:    c.play_count  || 0,
        likes:    c.like_count  || 0,
        audioUrl: c.audio_url   || '',
        podcastImage: '',
      }));
    }
  } catch (e) { console.warn('DB:', e); }

  // Listen Notes
  try {
    const results = await Promise.allSettled(
      LN_SEARCHES.slice(0, 3).map(s => fetchLN(s.q, s.cat))
    );
    results.forEach(r => { if (r.status === 'fulfilled') lnClips.push(...r.value); });
  } catch (e) { console.warn('LN:', e); }

  // Interleave: 2 db, 1 podcast
  const merged = [];
  let di = 0, li = 0;
  while (di < dbClips.length || li < lnClips.length) {
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (li < lnClips.length) merged.push(lnClips[li++]);
  }

  clips = merged.length ? merged : [{
    id: 'fallback', title: 'Welcome to The Nile',
    creator: 'The Nile', desc: 'Your feed is loading.',
    tags: '#nile', cat: 'News', duration: 75,
    plays: 0, likes: 0, audioUrl: '', podcastImage: '',
  }];

  if (loading) loading.style.display = 'none';
  buildFeed();
  toast(clips.length + ' clips ready');

  // Auto-start
  idx = 0;
  playing = true;
  syncIcons();
  startAudio();
  updateBar();
}

// ═══════════════════════════════════════════════
// BUILD FEED
// ═══════════════════════════════════════════════
function buildFeed() {
  const container = document.getElementById('feed-scroll');
  if (!container) return;
  container.innerHTML = '';

  clips.forEach((clip, i) => {
    const pct     = progMap[clip.id] || 0;
    const elapsed = Math.floor((clip.duration || 0) * pct / 100);
    const colors  = getGrad(clip);
    const bg      = gradCSS(colors);
    const hasImg  = !!clip.podcastImage;

    const card = document.createElement('div');
    card.className = 'clip-card';
    card.id = 'card-' + clip.id;

    card.innerHTML = `
      <div class="clip-inner">

        <!-- TOP HALF — image/gradient -->
        <div class="clip-image-half">
          <div class="clip-bg" style="${hasImg
            ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center`
            : `background:${bg}`
          }"></div>
          <div class="clip-overlay"></div>

          <!-- Category + counter -->
          <div class="clip-top">
            <span class="clip-cat">${clip.cat}</span>
            <span class="clip-counter">${String(i+1).padStart(2,'0')} / ${String(clips.length).padStart(2,'0')}</span>
          </div>

          <!-- Actions overlaid on image -->
          <div class="clip-actions">
            <div class="clip-act-av-wrap" onclick="openProfile('${clip.id}')">
              <div class="clip-act-av" style="${hasImg
                ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center`
                : `background:${bg}`
              }">${!hasImg ? initials(clip.creator) : ''}</div>
              <div class="clip-act-plus">+</div>
            </div>
            <div class="act-btn ${liked[clip.id] ? 'liked' : ''}" onclick="toggleLike('${clip.id}',this)">
              <div class="act-icon"><i class="ti ti-heart"></i></div>
              <span class="act-count" id="lc-${clip.id}">${fmtCount(clip.likes)}</span>
            </div>
            <div class="act-btn" onclick="openComments('${clip.id}')">
              <div class="act-icon"><i class="ti ti-message-circle-2"></i></div>
              <span class="act-count">${(comments[clip.id]||[]).length||0}</span>
            </div>
            <div class="act-btn ${saved[clip.id] ? 'saved' : ''}" onclick="toggleSave('${clip.id}',this)">
              <div class="act-icon"><i class="ti ti-bookmark"></i></div>
            </div>
            <div class="act-btn" onclick="shareClip('${clip.id}')">
              <div class="act-icon"><i class="ti ti-share-2"></i></div>
              <span class="act-count">${fmtCount(clip.plays)}</span>
            </div>
          </div>
        </div>

        <!-- BOTTOM HALF — white card -->
        <div class="clip-bottom">
          <div class="clip-creator">
            <div class="clip-creator-av" style="${hasImg
              ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center`
              : `background:${bg}`
            }" onclick="openProfile('${clip.id}')">${!hasImg ? initials(clip.creator) : ''}</div>
            <span class="clip-creator-name" onclick="openProfile('${clip.id}')">${clip.creator}</span>
            <button class="clip-follow-btn ${following[clip.id]?'following':''}"
              id="fb-${clip.id}" onclick="toggleFollow('${clip.id}')">
              ${following[clip.id]?'Following':'Follow'}
            </button>
          </div>

          <div class="clip-title">${clip.title}</div>
          ${clip.desc ? `<div class="clip-desc">${clip.desc.slice(0,120)}</div>` : ''}
          <div class="clip-tags">${clip.tags}</div>

          <div class="clip-player">
            <div class="waveform" id="wv-${clip.id}" onclick="seekWave(event,'${clip.id}')"></div>
            <div class="clip-prog-row">
              <span class="clip-time" id="et-${clip.id}">${fmt(elapsed)}</span>
              <div class="clip-prog-track" onclick="seekTrack(event,'${clip.id}')">
                <div class="clip-prog-fill" id="pf-${clip.id}" style="width:${pct}%"></div>
              </div>
              <span class="clip-time">${fmt(clip.duration)}</span>
            </div>
            <div class="clip-ctrl-row">
              <button class="clip-ctrl" onclick="rewind('${clip.id}')"><i class="ti ti-rewind-10"></i></button>
              <button class="clip-ctrl" onclick="prevClip()"><i class="ti ti-skip-back"></i></button>
              <button class="clip-play" onclick="togglePlay('${clip.id}')">
                <i class="ti ${i===idx&&playing?'ti-player-pause':'ti-player-play'}" id="pi-${clip.id}"></i>
              </button>
              <button class="clip-ctrl" onclick="nextClip()"><i class="ti ti-skip-forward"></i></button>
              <button class="clip-speed" onclick="cycleSpeed()">${speed}x</button>
            </div>
          </div>
        </div>

      </div>`;

    container.appendChild(card);
    buildWave('wv-' + clip.id, pct);
  });

  // Intersection observer — auto-advance on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.intersectionRatio > 0.78) {
        const cid = e.target.id.replace('card-', '');
        const ni  = clips.findIndex(c => String(c.id) === cid);
        if (ni !== -1 && ni !== idx) {
          stopAudio();
          idx = ni;
          playing = true;
          syncIcons();
          startAudio();
          updateBar();
        }
      }
    });
  }, { threshold: 0.78 });

  container.querySelectorAll('.clip-card').forEach(el => obs.observe(el));
  updateBar();
}

// ═══════════════════════════════════════════════
// PLAYBACK
// ═══════════════════════════════════════════════
function syncIcons() {
  clips.forEach(c => {
    const el = document.getElementById('pi-' + c.id);
    if (el) el.className = 'ti ' + (String(c.id) === String(clips[idx]?.id) && playing
      ? 'ti-player-pause' : 'ti-player-play');
  });
  const pb = document.getElementById('pb-icon');
  if (pb) pb.className = 'ti ' + (playing ? 'ti-player-pause' : 'ti-player-play');
  if ('mediaSession' in navigator)
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
}

function updateBar() {
  const c = clips[idx];
  if (!c) return;
  const bar = document.getElementById('player-bar');
  // Only show player bar when NOT on feed view
  const onFeed = document.getElementById('view-feed')?.classList.contains('active');
  if (bar) bar.style.display = onFeed ? 'none' : 'flex';
  const t  = document.getElementById('pb-title');
  const s  = document.getElementById('pb-source');
  const av = document.getElementById('pb-av');
  if (t)  t.textContent = c.title;
  if (s)  s.textContent = c.creator + ' · ' + c.cat;
  if (av) {
    const colors = getGrad(c);
    av.style.background = c.podcastImage
      ? `url(${c.podcastImage}) center/cover`
      : gradCSS(colors);
    av.textContent = c.podcastImage ? '' : initials(c.creator);
  }
}

function togglePlay(id) {
  if (String(id) !== String(clips[idx]?.id)) {
    stopAudio();
    idx = clips.findIndex(c => String(c.id) === String(id));
  }
  playing = !playing;
  syncIcons();
  if (playing) startAudio(); else stopAudio();
  updateBar();
}

function startAudio() {
  const c = clips[idx];
  if (!c) return;
  updateMS(c);
  if (c.audioUrl) {
    if (audio.src !== c.audioUrl) { audio.src = c.audioUrl; progMap[c.id] = 0; }
    audio.playbackRate = speed;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        fakePlay();
        const resume = () => { audio.play().catch(() => {}); };
        document.addEventListener('click',      resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
      });
    }
  } else {
    fakePlay();
  }
}

function stopAudio() {
  audio.pause();
  if (progInt) { clearInterval(progInt); progInt = null; }
}

function fakePlay() {
  if (progInt) clearInterval(progInt);
  const c = clips[idx];
  if (!c) return;
  progInt = setInterval(() => {
    const cur  = progMap[c.id] || 0;
    const step = (100 / c.duration) * 0.1 * speed;
    const np   = Math.min(100, cur + step);
    progMap[c.id] = np;
    updateProg(c.id, np, c.duration * np / 100);
    if (np >= 100) {
      clearInterval(progInt); progInt = null;
      playing = false; syncIcons();
      setTimeout(nextClip, 800);
    }
  }, 100);
}

function nextClip() {
  stopAudio();
  idx = (idx + 1) % clips.length;
  document.getElementById('card-' + clips[idx].id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playing = true; syncIcons(); startAudio(); updateBar();
}

function prevClip() {
  stopAudio();
  idx = (idx - 1 + clips.length) % clips.length;
  document.getElementById('card-' + clips[idx].id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playing = true; syncIcons(); startAudio(); updateBar();
}

function seekTrack(e, id) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  progMap[id] = pct;
  const c = clips.find(c => String(c.id) === String(id));
  if (c?.audioUrl && audio.duration) audio.currentTime = (pct / 100) * audio.duration;
  buildWave('wv-' + id, pct);
}
function seekWave(e, id) { seekTrack(e, id); }

function rewind(id) {
  const c = clips.find(c => String(c.id) === String(id));
  if (!c) return;
  progMap[id] = Math.max(0, (progMap[id] || 0) - (10 / c.duration) * 100);
  if (c.audioUrl && audio.duration) audio.currentTime = Math.max(0, audio.currentTime - 10);
  buildWave('wv-' + id, progMap[id]);
}

function cycleSpeed() {
  speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
  document.querySelectorAll('.clip-speed').forEach(b => b.textContent = speed + 'x');
  audio.playbackRate = speed;
  toast('Speed: ' + speed + 'x');
}

// ═══════════════════════════════════════════════
// MEDIA SESSION API — Apple lock screen / CarPlay
// ═══════════════════════════════════════════════
function updateMS(clip) {
  if (!('mediaSession' in navigator)) return;
  const colors = getGrad(clip);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs><radialGradient id="g" cx="30%" cy="30%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="50%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </radialGradient></defs>
    <rect width="512" height="512" fill="url(%23g)"/>
    <text x="256" y="340" text-anchor="middle" font-family="Georgia,serif"
      font-size="280" font-style="italic" font-weight="700"
      fill="rgba(255,255,255,0.85)">N</text>
  </svg>`;
  const artwork = clip.podcastImage
    ? [{ src: clip.podcastImage, sizes: '512x512', type: 'image/jpeg' }]
    : [{ src: 'data:image/svg+xml,' + encodeURIComponent(svg), sizes: '512x512', type: 'image/svg+xml' }];

  navigator.mediaSession.metadata = new MediaMetadata({
    title:  clip.title,
    artist: clip.creator,
    album:  'The Nile · ' + clip.cat,
    artwork,
  });

  navigator.mediaSession.setActionHandler('play',          () => { if (!playing) togglePlay(clips[idx]?.id); });
  navigator.mediaSession.setActionHandler('pause',         () => { if (playing)  togglePlay(clips[idx]?.id); });
  navigator.mediaSession.setActionHandler('nexttrack',     nextClip);
  navigator.mediaSession.setActionHandler('previoustrack', prevClip);
  navigator.mediaSession.setActionHandler('seekbackward',  () => rewind(clips[idx]?.id));
  navigator.mediaSession.setActionHandler('seekforward',   d  => {
    if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + (d?.seekOffset || 10));
  });
}

function msPosition() {
  if (!('mediaSession' in navigator) || !audio.duration) return;
  try {
    navigator.mediaSession.setPositionState({
      duration:     audio.duration,
      playbackRate: audio.playbackRate || 1,
      position:     Math.min(audio.currentTime, audio.duration),
    });
  } catch {}
}

// ═══════════════════════════════════════════════
// INTERACTIONS
// ═══════════════════════════════════════════════
function toggleLike(id, el) {
  liked[id] = !liked[id];
  el.classList.toggle('liked', liked[id]);
  const icon = el.querySelector('i');
  if (icon) icon.className = liked[id] ? 'ti ti-heart-filled' : 'ti ti-heart';
  const count = document.getElementById('lc-' + id);
  if (count) {
    const c = clips.find(c => String(c.id) === String(id));
    if (c) count.textContent = fmtCount((c.likes || 0) + (liked[id] ? 1 : 0));
  }
}

function toggleSave(id, el) {
  saved[id] = !saved[id];
  el.classList.toggle('saved', saved[id]);
  toast(saved[id] ? 'Saved to library' : 'Removed from library');
}

function toggleFollow(id) {
  following[id] = !following[id];
  const btn = document.getElementById('fb-' + id);
  if (btn) {
    btn.classList.toggle('following', following[id]);
    btn.textContent = following[id] ? 'Following' : 'Follow';
  }
  toast(following[id] ? 'Following' : 'Unfollowed');
}

function shareClip(id) {
  const url = window.location.origin + window.location.pathname + '#clip-' + id;
  if (navigator.share) {
    navigator.share({ title: 'The Nile', url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    toast('Link copied');
  }
}

function openProfile(clipId) {
  const clip = clips.find(c => String(c.id) === String(clipId));
  if (!clip) return;
  const existing = document.getElementById('profile-modal');
  if (existing) existing.remove();
  const colors = getGrad(clip);
  const bg     = gradCSS(colors);
  const modal  = document.createElement('div');
  modal.id     = 'profile-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `
    <div style="background:#fff;width:100%;max-width:480px;border-radius:16px 16px 0 0;max-height:80vh;overflow-y:auto">
      <div style="height:110px;background:${clip.podcastImage ? `url(${clip.podcastImage}) center/cover` : bg};border-radius:16px 16px 0 0;position:relative">
        <button onclick="document.getElementById('profile-modal').remove()"
          style="position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.3);border:none;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div style="padding:0 20px 28px">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:-22px;margin-bottom:14px">
          <div style="width:50px;height:50px;border-radius:10px;border:3px solid #fff;background:${clip.podcastImage ? `url(${clip.podcastImage}) center/cover` : bg};box-shadow:0 2px 8px rgba(0,0,0,0.15)"></div>
          <button class="btn-outline" onclick="toggleFollow('${clip.id}');this.textContent=following['${clip.id}']?'Following':'Follow'">Follow</button>
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;font-style:italic;color:#0a0a0a;margin-bottom:3px">${clip.creator}</div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">${clip.cat}</div>
        ${clip.desc ? `<div style="font-family:'IM Fell English',serif;font-size:14px;font-style:italic;color:#666;line-height:1.6;margin-bottom:16px">${clip.desc}</div>` : ''}
        <div style="font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#ccc;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:12px">Now Playing</div>
        <div style="display:flex;gap:12px;align-items:center;padding:12px;background:#f7f6f4;border-radius:10px;cursor:pointer"
          onclick="document.getElementById('profile-modal').remove();togglePlay('${clip.id}')">
          <div style="width:42px;height:42px;border-radius:8px;background:${clip.podcastImage ? `url(${clip.podcastImage}) center/cover` : bg};flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic;font-weight:300;color:#0a0a0a;line-height:1.3;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${clip.title}</div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;color:#aaa">${fmt(clip.duration)}</div>
          </div>
          <div style="width:32px;height:32px;border-radius:50%;background:#0a0a0a;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;flex-shrink:0">
            <i class="ti ti-player-play"></i>
          </div>
        </div>
      </div>
    </div>`;
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function openComments(clipId) {
  commentClip = clipId;
  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  const cc = comments[clipId] || [];
  if (!cc.length) {
    list.innerHTML = '<div style="text-align:center;padding:28px;font-family:\'IM Fell English\',serif;font-style:italic;color:#b8b4af">No comments yet. Be the first.</div>';
  } else {
    cc.forEach(c => {
      const d = document.createElement('div');
      d.className = 'comment-item';
      d.innerHTML = `
        <div class="comment-av">${c.user.slice(1, 3).toUpperCase()}</div>
        <div>
          <div class="comment-user">${c.user}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-time">${c.time}</div>
        </div>`;
      list.appendChild(d);
    });
  }
  document.getElementById('comments-modal').style.display = 'flex';
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function switchView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sb-item, .mob-btn').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('view-' + v);
  if (target) target.classList.add('active');
  document.querySelectorAll(`[data-view="${v}"]`).forEach(el => el.classList.add('active'));
  if (v === 'profile')  buildProfile();
  if (v === 'discover') buildDiscover();
  // Show player bar on all views except feed
  const bar = document.getElementById('player-bar');
  if (bar && clips.length) bar.style.display = v === 'feed' ? 'none' : 'flex';
}

// ═══════════════════════════════════════════════
// DISCOVER
// ═══════════════════════════════════════════════
const CATS = ['All', 'News', 'Issues', 'Lifestyle', 'Entertainment', 'Philosophy', 'History'];
const CAT_ICONS = { All:'ti-apps', News:'ti-news', Issues:'ti-world', Lifestyle:'ti-heart', Entertainment:'ti-masks-theater', Philosophy:'ti-yin-yang', History:'ti-hourglass' };
const TRENDING = [
  { rank:1, tag:'#Stoicism',       clips:'48K' },
  { rank:2, tag:'#DailyNews',      clips:'41K' },
  { rank:3, tag:'#MarcusAurelius', clips:'32K' },
  { rank:4, tag:'#Lifestyle',      clips:'27K' },
  { rank:5, tag:'#Literature',     clips:'19K' },
  { rank:6, tag:'#BigIdeas',       clips:'16K' },
];
const VOICES = [
  { name:'Marcus Aurelius', handle:'@marcusaurelius', followers:'2.1M', grad:['#1a0a2e','#2d1b69','#0f3460'] },
  { name:'Dale Carnegie',   handle:'@dalecarnegie',   followers:'890K',  grad:['#0f2027','#203a43','#2c5364'] },
  { name:'Sun Tzu',         handle:'@suntzu',         followers:'1.4M',  grad:['#16222a','#3a6073','#1a1a2e'] },
  { name:'Seneca',          handle:'@seneca',         followers:'780K',  grad:['#2c1810','#6b3a2a','#1a0a05'] },
  { name:'Shakespeare',     handle:'@shakespeare',    followers:'3.2M',  grad:['#1a0505','#3a0d0d','#1a0202'] },
  { name:'Confucius',       handle:'@confucius',      followers:'1.1M',  grad:['#1a0d05','#3a2010','#1a1005'] },
];

let discoverReady = false;
function buildDiscover() {
  if (discoverReady) return;
  discoverReady = true;

  // Category pills
  const pillsEl = document.getElementById('cat-pills');
  CATS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill' + (cat === 'All' ? ' active' : '');
    btn.innerHTML = `<i class="ti ${CAT_ICONS[cat]}"></i>${cat}`;
    btn.onclick = () => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (cat !== 'All') {
        const f = clips.filter(c => c.cat === cat);
        if (f.length) { const orig = [...clips]; clips = f; idx = 0; buildFeed(); switchView('feed'); toast('Showing ' + cat); setTimeout(() => clips = orig, 60000); }
      } else { switchView('feed'); }
    };
    pillsEl.appendChild(btn);
  });

  // Trending
  const trendEl = document.getElementById('trending-list');
  TRENDING.forEach(t => {
    const d = document.createElement('div');
    d.className = 'trend-item';
    d.innerHTML = `<span class="trend-rank">${t.rank}</span><div><div class="trend-name">${t.tag}</div><div class="trend-count">${t.clips} clips</div></div><i class="ti ti-chevron-right" style="margin-left:auto;color:var(--muted2)"></i>`;
    d.onclick = () => { switchView('feed'); toast(t.tag); };
    trendEl.appendChild(d);
  });

  // Creators
  const grid = document.getElementById('creators-grid');
  VOICES.forEach(v => {
    const bg = gradCSS(v.grad);
    const d  = document.createElement('div');
    d.className = 'creator-card';
    d.innerHTML = `
      <div class="cr-av" style="background:${bg}">${initials(v.name)}</div>
      <div class="cr-name">${v.name}</div>
      <div class="cr-handle">${v.handle}</div>
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-bottom:8px">${v.followers}</div>
      <button class="cr-follow">Subscribe</button>`;
    d.querySelector('.cr-follow').onclick = function(e) {
      e.stopPropagation();
      this.classList.toggle('following');
      this.textContent = this.classList.contains('following') ? 'Subscribed' : 'Subscribe';
      toast(this.classList.contains('following') ? 'Subscribed to ' + v.name : 'Unsubscribed');
    };
    grid.appendChild(d);
  });
}

// ═══════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════
function buildProfile() {
  if (!user) return;
  const meta     = user.user_metadata || {};
  const name     = meta.full_name || user.email?.split('@')[0] || 'Reader';
  const username = meta.username  || name.toLowerCase().replace(/\s+/g, '');
  document.getElementById('profile-cover-n').textContent = name[0] || 'N';
  document.getElementById('profile-av').textContent       = initials(name);
  document.getElementById('profile-name').textContent     = name;
  document.getElementById('profile-handle').textContent   = '@' + username;
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.onclick = function() {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.ptab-pane').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const pane = document.getElementById('ptab-' + this.dataset.ptab);
      if (pane) pane.classList.add('active');
    };
  });
  const about = document.getElementById('about-content');
  if (about) about.innerHTML = `
    <div style="padding:10px 0">
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Email</div>
      <div style="font-family:var(--fell);font-style:italic;font-size:15px;color:var(--black);margin-bottom:20px">${user.email}</div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted2);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Member since</div>
      <div style="font-family:var(--fell);font-style:italic;font-size:15px;color:var(--black)">${new Date(user.created_at || Date.now()).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
    </div>`;
}

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
function showMsg(msg, type = 'err') {
  const el = document.getElementById('auth-msg');
  el.textContent = msg;
  el.className   = type;
  el.style.display = 'block';
}

function updateSidebar() {
  if (!user) return;
  const meta     = user.user_metadata || {};
  const name     = meta.full_name || user.email?.split('@')[0] || 'Reader';
  const username = meta.username  || name.toLowerCase().replace(/\s+/g, '');
  document.getElementById('sb-av').textContent     = initials(name);
  document.getElementById('sb-name').textContent   = name;
  document.getElementById('sb-handle').textContent = '@' + username;
}

async function initAuth() {
  const { data: { session } } = await db.auth.getSession();

  if (session) {
    user = session.user;
    document.getElementById('auth-screen').style.display = 'none';
    updateSidebar();
    loadClips();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('feed-loading').style.display = 'none';
  }

  db.auth.onAuthStateChange((_, sess) => {
    if (sess) {
      user = sess.user;
      document.getElementById('auth-screen').style.display = 'none';
      updateSidebar();
      if (!clips.length) loadClips();
    } else {
      user = null;
      document.getElementById('auth-screen').style.display = 'flex';
    }
  });

  // Tab switching
  document.getElementById('tab-in').onclick = () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-in').classList.add('active');
    document.getElementById('form-in').style.display = 'block';
    document.getElementById('form-up').style.display = 'none';
    document.getElementById('auth-msg').style.display = 'none';
  };
  document.getElementById('tab-up').onclick = () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-up').classList.add('active');
    document.getElementById('form-in').style.display = 'none';
    document.getElementById('form-up').style.display = 'block';
    document.getElementById('auth-msg').style.display = 'none';
  };
  document.getElementById('to-up').onclick = () => document.getElementById('tab-up').click();
  document.getElementById('to-in').onclick = () => document.getElementById('tab-in').click();

  // Sign in
  document.getElementById('form-in').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-primary');
    btn.textContent = 'Signing in...'; btn.disabled = true;
    const { error } = await db.auth.signInWithPassword({
      email:    document.getElementById('in-email').value,
      password: document.getElementById('in-pw').value,
    });
    if (error) showMsg(error.message);
    btn.textContent = 'Sign In'; btn.disabled = false;
  };

  // Sign up
  document.getElementById('form-up').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-primary');
    btn.textContent = 'Creating account...'; btn.disabled = true;
    const { error } = await db.auth.signUp({
      email:    document.getElementById('up-email').value,
      password: document.getElementById('up-pw').value,
      options:  { data: {
        full_name: document.getElementById('up-name').value,
        username:  document.getElementById('up-user').value,
      }},
    });
    if (error) showMsg(error.message);
    else showMsg('Account created! Check your email to confirm.', 'ok');
    btn.textContent = 'Subscribe Free'; btn.disabled = false;
  };
}

// ═══════════════════════════════════════════════
// WIRE EVENTS
// ═══════════════════════════════════════════════
function wire() {
  // Nav
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Edition filters
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat      = btn.dataset.cat;
      const filtered = clips.filter(c => c.cat === cat);
      if (filtered.length) {
        const orig = [...clips];
        clips = filtered; idx = 0;
        buildFeed(); switchView('feed');
        toast('Showing ' + cat);
        setTimeout(() => { clips = orig; }, 60000);
      } else {
        switchView('feed');
        toast('Loading ' + cat + '...');
      }
    });
  });

  // Feed tabs
  document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.feed === 'following') toast('Showing voices you follow');
    });
  });

  // Feed arrows
  document.getElementById('btn-prev')?.addEventListener('click', prevClip);
  document.getElementById('btn-next')?.addEventListener('click', nextClip);

  // Player bar
  document.getElementById('pb-play')?.addEventListener('click',  () => togglePlay(clips[idx]?.id));
  document.getElementById('pb-skip')?.addEventListener('click',  nextClip);
  document.getElementById('pb-rew')?.addEventListener('click',   () => rewind(clips[idx]?.id));
  document.getElementById('pb-progress')?.addEventListener('click', e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = ((e.clientX - rect.left) / rect.width) * 100;
    const c    = clips[idx];
    if (c && audio.duration) audio.currentTime = (pct / 100) * audio.duration;
  });

  // Comments
  document.getElementById('comments-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('comments-modal'))
      document.getElementById('comments-modal').style.display = 'none';
  });
  document.getElementById('btn-comment')?.addEventListener('click', () => {
    const input = document.getElementById('comment-input');
    const text  = input.value.trim();
    if (!text || !commentClip) return;
    if (!comments[commentClip]) comments[commentClip] = [];
    const handle = '@' + (user?.user_metadata?.username || 'reader');
    comments[commentClip].push({ user: handle, text, time: 'just now' });
    openComments(commentClip);
    input.value = '';
  });
  document.getElementById('comment-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-comment').click();
  });

  // Sign out
  document.getElementById('btn-signout')?.addEventListener('click', async () => {
    if (confirm('Sign out of The Nile?')) {
      await db.auth.signOut();
      clips = []; idx = 0; playing = false;
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (document.getElementById('auth-screen').style.display !== 'none') return;
    if (e.key === 'ArrowDown' || e.key === 'j') nextClip();
    if (e.key === 'ArrowUp'   || e.key === 'k') prevClip();
    if (e.key === ' ') { e.preventDefault(); togglePlay(clips[idx]?.id); }
    if (e.key === 'ArrowLeft')  rewind(clips[idx]?.id);
  });
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
wire();
initAuth();
