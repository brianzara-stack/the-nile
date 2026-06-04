// ═══════════════════════════════════════
// THE NILE — FEED (CLEAN REBUILD)
// No images — rich gradients per clip
// ═══════════════════════════════════════

// Each author/category gets a unique rich gradient
const GRADIENTS = {
  // Authors
  'marcus aurelius':   ['#1a0a2e','#2d1b69','#11998e'],
  'dale carnegie':     ['#0f2027','#203a43','#2c5364'],
  'sun tzu':           ['#16222a','#3a6073','#1a1a2e'],
  'james allen':       ['#134e5e','#71b280','#0a2e1a'],
  'napoleon hill':     ['#1a1a2e','#16213e','#0f3460'],
  'seneca':            ['#2c1810','#6b3a2a','#1a0a05'],
  'epictetus':         ['#0d1b2a','#1b2a4a','#2d4a6b'],
  'aristotle':         ['#0d0d1a','#1a1a3e','#2a2a5e'],
  'plato':             ['#1a0d2e','#2e1a5e','#0d0a1a'],
  'benjamin franklin': ['#0a1628','#1c3a5c','#2a4a7a'],
  'thoreau':           ['#0a1a0a','#1a3a1a','#0d2a0d'],
  'frederick douglass':['#1a0a0a','#3a1a1a','#1a0505'],
  'machiavelli':       ['#1a1205','#3a2a0d','#1a0d02'],
  'oscar wilde':       ['#1a0a1a','#3a1a3a','#5e2a5e'],
  'dickens':           ['#0a0a1a','#1a1a3a','#2a2050'],
  'mark twain':        ['#0d1a0d','#1a3328','#0a2018'],
  'emerson':           ['#1a1205','#2a2010','#3a3020'],
  'william james':     ['#0d1520','#1a2a3a','#0a1828'],
  'gibran':            ['#1a0d1a','#3a1a3a','#1a0a20'],
  'tolstoy':           ['#0a0d1a','#1a2030','#0a1520'],
  'victor hugo':       ['#0d0a1a','#1a1530','#2a2050'],
  'shakespeare':       ['#1a0505','#3a0d0d','#1a0202'],
  'voltaire':          ['#0d1a10','#1a3a20','#0a2015'],
  'confucius':         ['#1a0d05','#3a2010','#1a1005'],
  // Categories
  'News':          ['#0d1520','#1a2d4a','#0a1830'],
  'Issues':        ['#0d1a0d','#1a3a1a','#102810'],
  'Lifestyle':     ['#1a0d1a','#2a1a3a','#1a0d28'],
  'Entertainment': ['#1a0808','#3a1010','#200505'],
  'Philosophy':    ['#0d0d28','#1a1a4a','#080818'],
  'History':       ['#1a1205','#2a2010','#100c02'],
  'Education':     ['#051528','#0a2a4a','#051020'],
  'Stories':       ['#1a0a15','#3a1a2a','#1a0810'],
};

function getGradient(clip) {
  // Check if Listen Notes clip has an image — use that if so
  if (clip.podcastImage) return null;

  const key = (clip.creator || '').toLowerCase();
  const cat = clip.cat || 'News';

  for (const [author, colors] of Object.entries(GRADIENTS)) {
    if (key.includes(author)) return colors;
  }
  return GRADIENTS[cat] || GRADIENTS['News'];
}

function buildGradientBg(colors) {
  const [c1, c2, c3] = colors;
  return `radial-gradient(ellipse at top left, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
}

function buildInitials(name) {
  return (name || 'N').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
}

// ── FALLBACK CLIPS ──
const FALLBACK_CLIPS = [
  { id:'f1', title:'Loading your feed...', creator:'The Nile', handle:'@thenile', verified:true, desc:'Your clips are loading.', tags:'#nile', cat:'News', duration:60, plays:'0', likes:'0', audioUrl:'' }
];

let clips = [];
let currentIdx = 0;
let isPlaying = false;
let progressInterval = null;
let clipProgress = {};
let likedClips = {};
let savedClips = {};
let followedCreators = {};
let currentCommentClip = null;
let allComments = {};
let currentSpeed = 1;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const audioEl = new Audio();
audioEl.preload = 'none';

audioEl.addEventListener('timeupdate', () => {
  const clip = clips[currentIdx];
  if (!clip || !audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  clipProgress[clip.id] = pct;
  updateProgressUI(clip.id, pct, audioEl.currentTime);
});

audioEl.addEventListener('ended', () => {
  isPlaying = false;
  updatePlayIcons();
  setTimeout(() => nextClip(), 800);
});

audioEl.addEventListener('error', () => startFakeProgress());

function fmtTime(secs) {
  const s = Math.floor(secs || 0);
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

function updateProgressUI(id, pct, elapsed) {
  const fill = document.getElementById('pf-'+id);
  if (fill) fill.style.width = pct + '%';
  const et = document.getElementById('et-'+id);
  if (et && elapsed !== undefined) et.textContent = fmtTime(elapsed);
  const pbFill = document.getElementById('player-fill');
  if (pbFill) pbFill.style.width = pct + '%';
  animateWaveform(id, pct);
}

function animateWaveform(id, pct) {
  const bars = document.querySelectorAll(`#wv-${id} .wv-bar`);
  bars.forEach((b,i) => {
    const bp = (i/bars.length)*100;
    b.style.background = bp < pct ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)';
    if (isPlaying && bp >= pct && bp < pct+5) b.style.height = (6+Math.random()*32)+'px';
  });
}

function buildWaveform(containerId, pct=0) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i=0; i<44; i++) {
    const b = document.createElement('div');
    b.className = 'wv-bar';
    const h = 4 + Math.random()*34;
    b.style.cssText = `height:${h}px;background:${(i/44*100)<pct?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.2)'}`;
    el.appendChild(b);
  }
}

// ── LISTEN NOTES ──
const LISTEN_NOTES_KEY = 'aaca221d7d284540bdc63cdeb09037da';
const LN_BASE = 'https://listen-api.listennotes.com/api/v2';

const NILE_SEARCHES = [
  {q:'breaking news today',          cat:'News'},
  {q:'technology innovation ai',     cat:'News'},
  {q:'philosophy stoicism wisdom',   cat:'Issues'},
  {q:'history society culture',      cat:'Issues'},
  {q:'entrepreneurship health money',cat:'Lifestyle'},
  {q:'comedy funny storytelling',    cat:'Entertainment'},
];

function guessCat(text) {
  const t = text.toLowerCase();
  if (t.match(/news|politic|world|breaking|tech|science|ai/)) return 'News';
  if (t.match(/philosoph|stoic|wisdom|psych|histor|society/)) return 'Issues';
  if (t.match(/lifestyle|health|wellness|business|money|career/)) return 'Lifestyle';
  if (t.match(/comedy|music|film|sport|entertain|celebrity/)) return 'Entertainment';
  return 'Issues';
}

async function searchListenNotes(query, cat) {
  try {
    const res = await fetch(`${LN_BASE}/search?q=${encodeURIComponent(query)}&type=episode&len_min=1&len_max=10&safe_mode=0&language=English`, {
      headers: {'X-ListenAPI-Key': LISTEN_NOTES_KEY}
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results||[]).slice(0,3).map((ep,i) => ({
      id: 'ln_'+Date.now()+'_'+i,
      title: (ep.title_original||'').slice(0,80),
      creator: ep.podcast?.title_original || 'Podcast',
      handle: '@'+(ep.podcast?.title_original||'podcast').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,15),
      verified: true,
      desc: (ep.description_original||'').replace(/<[^>]+>/g,'').slice(0,120),
      tags: '#'+cat.toLowerCase()+' #podcast',
      cat,
      duration: ep.audio_length_sec||300,
      plays: Math.floor(Math.random()*500+10)+'K',
      likes: Math.floor(Math.random()*50+1)+'K',
      audioUrl: ep.audio||'',
      podcastImage: ep.image||ep.podcast?.image||'',
      podcastUrl: ep.listennotes_url||'',
      podcastDesc: (ep.podcast?.description||'').replace(/<[^>]+>/g,'').slice(0,200),
      podcastTitle: ep.podcast?.title_original||'',
      episodeUrl: ep.listennotes_url||'',
      isListenNotes: true,
    }));
  } catch(e) { return []; }
}

// ── LOAD CLIPS ──
async function loadClipsFromDB() {
  const loadEl = document.getElementById('feed-loading');
  if (loadEl) loadEl.style.display = 'flex';

  let dbClips = [], lnClips = [];

  try {
    const {data, error} = await db.from('clips').select('*').eq('status','published').order('created_at',{ascending:false});
    if (!error && data?.length) {
      dbClips = data.map(c => ({
        id: c.id,
        title: c.title,
        creator: c.rss_source||'The Nile',
        handle: '@'+(c.rss_source||'thenile').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,15),
        verified: true,
        desc: c.description||'',
        tags: (c.hashtags||[]).map(t=>'#'+t).join(' '),
        cat: c.category||'Issues',
        duration: c.duration_seconds||90,
        plays: c.play_count?c.play_count.toLocaleString():'0',
        likes: c.like_count?c.like_count.toLocaleString():'0',
        audioUrl: c.audio_url||'',
        podcastImage: '',
      }));
    }
  } catch(e) { console.warn('DB error:', e); }

  try {
    const results = await Promise.allSettled(
      NILE_SEARCHES.slice(0,4).map(s => searchListenNotes(s.q, s.cat))
    );
    results.forEach(r => { if (r.status==='fulfilled') lnClips.push(...r.value); });
  } catch(e) { console.warn('LN error:', e); }

  // Interleave: 2 db clips, 1 podcast, repeat
  const merged = [];
  let di=0, li=0;
  while (di < dbClips.length || li < lnClips.length) {
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (di < dbClips.length) merged.push(dbClips[di++]);
    if (li < lnClips.length) merged.push(lnClips[li++]);
  }

  clips = merged.length ? merged : FALLBACK_CLIPS;
  if (loadEl) loadEl.style.display = 'none';
  currentIdx = 0;
  buildFeed();
  showToast(`${clips.length} clips ready`);
}

// ── BUILD FEED ──
function buildFeed() {
  const container = document.getElementById('feed-scroll');
  if (!container) return;
  container.innerHTML = '';

  clips.forEach((clip, i) => {
    const pct = clipProgress[clip.id] || 0;
    const elapsed = Math.floor((clip.duration||0) * pct / 100);
    const colors = getGradient(clip);
    const bg = colors ? buildGradientBg(colors) : '';
    const hasPodcastImg = !!clip.podcastImage;

    const card = document.createElement('div');
    card.className = 'clip-card';
    card.id = 'card-' + clip.id;

    card.innerHTML = `
      <!-- Background -->
      <div class="clip-bg" style="${hasPodcastImg
        ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center;`
        : `background:${bg};`
      }"></div>
      ${hasPodcastImg ? '<div class="clip-bg-blur"></div>' : ''}
      <div class="clip-bg-overlay"></div>

      <!-- Portrait card -->
      <div class="clip-card-inner">

        <!-- Top bar -->
        <div class="clip-top-bar">
          <span class="clip-cat-pill">${clip.cat}</span>
          <span class="clip-counter">${String(i+1).padStart(2,'0')} / ${String(clips.length).padStart(2,'0')}</span>
        </div>

        <!-- Bottom content -->
        <div class="clip-bottom">
          <!-- Creator row -->
          <div class="clip-creator-row">
            <div class="clip-avatar" style="${hasPodcastImg?`background-image:url(${clip.podcastImage});background-size:cover;background-position:center`:`background:${bg}`}" onclick="openPodcastProfile('${clip.id}')">
              ${!hasPodcastImg ? `<span>${buildInitials(clip.creator)}</span>` : ''}
            </div>
            <span class="clip-creator-name" onclick="openPodcastProfile('${clip.id}')">${clip.creator}</span>
            <button class="clip-follow-btn ${followedCreators[clip.id]?'following':''}" id="fp-${clip.id}" onclick="toggleFollow('${clip.id}')">${followedCreators[clip.id]?'Following':'Follow'}</button>
          </div>

          <!-- Headline — NYT Serif -->
          <div class="clip-headline">${clip.title}</div>

          <!-- Standfirst -->
          ${clip.desc ? `<div class="clip-desc">${clip.desc.slice(0,100)}</div>` : ''}

          <!-- Tags -->
          <div class="clip-tags">${clip.tags}</div>

          <!-- Player -->
          <div class="clip-player">
            <div class="waveform" id="wv-${clip.id}" onclick="seekWaveform(event,'${clip.id}')"></div>
            <div class="clip-progress-row">
              <span class="clip-time" id="et-${clip.id}">${fmtTime(elapsed)}</span>
              <div class="clip-progress-track" onclick="seekTrack(event,'${clip.id}')">
                <div class="clip-progress-fill" id="pf-${clip.id}" style="width:${pct}%"></div>
              </div>
              <span class="clip-time">${fmtTime(clip.duration)}</span>
            </div>
            <div class="clip-controls">
              <button class="clip-ctrl" onclick="rewind10('${clip.id}')"><i class="ti ti-rewind-10"></i></button>
              <button class="clip-ctrl" onclick="prevClip()"><i class="ti ti-skip-back"></i></button>
              <button class="clip-play-btn" onclick="togglePlay('${clip.id}')">
                <i class="ti ${i===currentIdx&&isPlaying?'ti-player-pause':'ti-player-play'}" id="pi-${clip.id}"></i>
              </button>
              <button class="clip-ctrl" onclick="nextClip()"><i class="ti ti-skip-forward"></i></button>
              <button class="clip-speed" onclick="cycleSpeed()">${currentSpeed}x</button>
            </div>
          </div>
        </div>

      </div>

      <!-- Right actions — TikTok style -->
      <div class="clip-actions">
        <div class="clip-action-avatar-wrap" onclick="openPodcastProfile('${clip.id}')">
          <div class="clip-action-av" style="${hasPodcastImg?`background-image:url(${clip.podcastImage});background-size:cover;background-position:center`:`background:${bg}`}">
            ${!hasPodcastImg?`<span style="font-size:13px;font-weight:700;color:#fff;font-family:var(--font-mono)">${buildInitials(clip.creator)}</span>`:''}
          </div>
          <div class="clip-action-plus">+</div>
        </div>
        <div class="clip-action-btn ${likedClips[clip.id]?'active':''}" onclick="toggleLike('${clip.id}',this)">
          <div class="clip-action-icon"><i class="ti ti-heart"></i></div>
          <span class="clip-action-count" id="lc-${clip.id}">${clip.likes}</span>
        </div>
        <div class="clip-action-btn" onclick="openComments('${clip.id}')">
          <div class="clip-action-icon"><i class="ti ti-message-circle-2"></i></div>
          <span class="clip-action-count">${(allComments[clip.id]||[]).length||0}</span>
        </div>
        <div class="clip-action-btn ${savedClips[clip.id]?'active':''}" onclick="toggleSave('${clip.id}',this)">
          <div class="clip-action-icon"><i class="ti ti-bookmark"></i></div>
        </div>
        <div class="clip-action-btn" onclick="shareClip('${clip.id}')">
          <div class="clip-action-icon"><i class="ti ti-share-2"></i></div>
          <span class="clip-action-count">${clip.plays}</span>
        </div>
      </div>`;

    container.appendChild(card);
    buildWaveform('wv-'+clip.id, pct);
  });

  // Intersection observer for auto-play on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.intersectionRatio > 0.8) {
        const rawId = e.target.id.replace('card-','');
        const idx = clips.findIndex(c => String(c.id) === rawId);
        if (idx !== -1 && idx !== currentIdx) {
          stopAudio();
          currentIdx = idx;
          isPlaying = true;
          updatePlayIcons();
          updatePlayerBar();
          startAudio();
        }
      }
    });
  }, {threshold: 0.8});

  document.querySelectorAll('.clip-card').forEach(el => obs.observe(el));
  updatePlayerBar();
}

function updatePlayIcons() {
  clips.forEach(c => {
    const el = document.getElementById('pi-'+c.id);
    if (el) el.className = 'ti '+(String(c.id)===String(clips[currentIdx]?.id)&&isPlaying?'ti-player-pause':'ti-player-play');
  });
  const pbIcon = document.getElementById('pb-play-icon');
  if (pbIcon) pbIcon.className = 'ti '+(isPlaying?'ti-player-pause':'ti-player-play');
}

function updatePlayerBar() {
  const clip = clips[currentIdx];
  if (!clip) return;
  const bar = document.getElementById('player-bar');
  if (bar) bar.style.display = 'flex';
  const title = document.getElementById('player-title');
  const source = document.getElementById('player-source');
  if (title) title.textContent = clip.title;
  if (source) source.textContent = clip.creator + ' · ' + clip.cat;
}

function togglePlay(clipId) {
  if (!clipId) return;
  if (String(clipId) !== String(clips[currentIdx]?.id)) {
    stopAudio();
    currentIdx = clips.findIndex(c => String(c.id) === String(clipId));
  }
  isPlaying = !isPlaying;
  updatePlayIcons();
  if (isPlaying) startAudio(); else stopAudio();
  updatePlayerBar();
}

function startAudio() {
  const clip = clips[currentIdx];
  if (!clip) return;
  if (clip.audioUrl) {
    if (audioEl.src !== clip.audioUrl) {
      audioEl.src = clip.audioUrl;
      clipProgress[clip.id] = 0;
    }
    audioEl.playbackRate = currentSpeed;
    audioEl.play().catch(() => startFakeProgress());
  } else {
    startFakeProgress();
  }
}

function stopAudio() {
  audioEl.pause();
  stopFakeProgress();
}

function startFakeProgress() {
  stopFakeProgress();
  const clip = clips[currentIdx];
  if (!clip) return;
  progressInterval = setInterval(() => {
    const cur = clipProgress[clip.id]||0;
    const step = (100/clip.duration)*0.1*currentSpeed;
    const np = Math.min(100, cur+step);
    clipProgress[clip.id] = np;
    updateProgressUI(clip.id, np, clip.duration*np/100);
    if (np>=100) { stopFakeProgress(); isPlaying=false; updatePlayIcons(); setTimeout(()=>nextClip(),800); }
  }, 100);
}

function stopFakeProgress() {
  if (progressInterval) { clearInterval(progressInterval); progressInterval=null; }
}

function nextClip() {
  stopAudio();
  currentIdx = (currentIdx+1)%clips.length;
  const card = document.getElementById('card-'+clips[currentIdx].id);
  if (card) card.scrollIntoView({behavior:'smooth',block:'start'});
  isPlaying = true;
  updatePlayIcons();
  startAudio();
  updatePlayerBar();
}

function prevClip() {
  stopAudio();
  currentIdx = (currentIdx-1+clips.length)%clips.length;
  const card = document.getElementById('card-'+clips[currentIdx].id);
  if (card) card.scrollIntoView({behavior:'smooth',block:'start'});
  isPlaying = true;
  updatePlayIcons();
  startAudio();
  updatePlayerBar();
}

function seekTrack(e, id) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width)*100));
  clipProgress[id] = pct;
  const clip = clips.find(c=>String(c.id)===String(id));
  if (clip?.audioUrl && audioEl.duration) audioEl.currentTime = (pct/100)*audioEl.duration;
  const fill = document.getElementById('pf-'+id);
  if (fill) fill.style.width = pct+'%';
  buildWaveform('wv-'+id, pct);
}
function seekWaveform(e, id) { seekTrack(e, id); }

function rewind10(id) {
  const clip = clips.find(c=>String(c.id)===String(id));
  if (!clip) return;
  const cur = clipProgress[id]||0;
  clipProgress[id] = Math.max(0, cur-(10/clip.duration)*100);
  if (clip.audioUrl && audioEl.duration) audioEl.currentTime = Math.max(0, audioEl.currentTime-10);
  const fill = document.getElementById('pf-'+id);
  if (fill) fill.style.width = clipProgress[id]+'%';
  buildWaveform('wv-'+id, clipProgress[id]);
}

function cycleSpeed() {
  currentSpeed = SPEEDS[(SPEEDS.indexOf(currentSpeed)+1)%SPEEDS.length];
  document.querySelectorAll('.clip-speed').forEach(b => b.textContent = currentSpeed+'x');
  if (audioEl) audioEl.playbackRate = currentSpeed;
  showToast('Speed: '+currentSpeed+'x');
}

function toggleLike(id, el) {
  likedClips[id] = !likedClips[id];
  el.classList.toggle('active', likedClips[id]);
  const icon = el.querySelector('i');
  if (icon) icon.className = likedClips[id] ? 'ti ti-heart-filled' : 'ti ti-heart';
}

function toggleSave(id, el) {
  savedClips[id] = !savedClips[id];
  el.classList.toggle('active', savedClips[id]);
  showToast(savedClips[id] ? 'Saved!' : 'Removed');
}

function toggleFollow(id) {
  followedCreators[id] = !followedCreators[id];
  const btn = document.getElementById('fp-'+id);
  if (btn) { btn.classList.toggle('following', followedCreators[id]); btn.textContent = followedCreators[id]?'Following':'Follow'; }
  showToast(followedCreators[id]?'Following!':'Unfollowed');
}

function shareClip(id) {
  if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href+'#clip-'+id); showToast('Link copied!'); }
}

function openComments(id) {
  currentCommentClip = id;
  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  const cc = allComments[id]||[];
  if (!cc.length) {
    list.innerHTML = '<div style="text-align:center;padding:32px;color:rgba(22,24,35,0.4);font-size:14px">No comments yet</div>';
  } else {
    cc.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `<div class="avatar" style="width:32px;height:32px;font-size:11px">${c.user.slice(1,3).toUpperCase()}</div><div><div class="comment-user">${c.user}</div><div class="comment-text">${c.text}</div><div class="comment-time">${c.time}</div></div>`;
      list.appendChild(div);
    });
  }
  document.getElementById('modal-comments').style.display = 'flex';
}

// Podcast profile modal
function openPodcastProfile(clipId) {
  const clip = clips.find(c => String(c.id) === String(clipId));
  if (!clip) return;
  const existing = document.getElementById('podcast-profile-modal');
  if (existing) existing.remove();
  const colors = getGradient(clip);
  const bgStyle = clip.podcastImage ? `background-image:url(${clip.podcastImage});background-size:cover;background-position:center` : `background:${buildGradientBg(colors||['#1a1a2e','#16213e','#0f3460'])}`;
  const podcastUrl = clip.podcastUrl || '';
  const episodeUrl = clip.episodeUrl || '';

  const modal = document.createElement('div');
  modal.id = 'podcast-profile-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);z-index:500;display:flex;align-items:flex-end;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;width:100%;max-width:480px;border-radius:16px 16px 0 0;max-height:85vh;overflow-y:auto">
      <div style="${bgStyle};height:120px;border-radius:16px 16px 0 0;position:relative">
        <button onclick="document.getElementById('podcast-profile-modal').remove()" style="position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.3);border:none;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;color:#fff"><i class="ti ti-x"></i></button>
      </div>
      <div style="padding:0 20px 24px">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:-22px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:8px;${bgStyle};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.12)"></div>
          <div style="display:flex;gap:8px">
            ${podcastUrl?`<a href="${podcastUrl}" target="_blank" style="padding:8px 14px;background:#161823;border-radius:4px;font-family:var(--font-mono);font-size:10px;color:#fff;letter-spacing:0.5px;text-decoration:none">Website</a>`:''}
            ${episodeUrl?`<a href="${episodeUrl}" target="_blank" style="padding:8px 14px;border:1px solid rgba(22,24,35,0.15);border-radius:4px;font-family:var(--font-mono);font-size:10px;color:#161823;letter-spacing:0.5px;text-decoration:none">Listen Notes</a>`:''}
          </div>
        </div>
        <div style="font-family:var(--font-serif);font-size:20px;font-weight:800;font-style:italic;color:#161823;margin-bottom:4px;letter-spacing:-0.3px">${clip.creator}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:#B8922A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">${clip.cat}</div>
        ${clip.podcastDesc?`<div style="font-size:13px;color:rgba(22,24,35,0.6);line-height:1.6;margin-bottom:18px;font-style:italic">${clip.podcastDesc}</div>`:''}
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(22,24,35,0.3);border-bottom:1px solid rgba(22,24,35,0.08);padding-bottom:8px;margin-bottom:14px">Now Playing</div>
        <div style="display:flex;gap:12px;align-items:center;padding:12px;background:#F8F8F8;border-radius:8px;cursor:pointer" onclick="document.getElementById('podcast-profile-modal').remove();togglePlay('${clip.id}')">
          <div style="width:44px;height:44px;border-radius:6px;${bgStyle};flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-serif);font-size:14px;font-weight:700;font-style:italic;color:#161823;line-height:1.3;margin-bottom:3px">${clip.title}</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:rgba(22,24,35,0.4)">${clip.cat} · ${fmtTime(clip.duration)}</div>
          </div>
          <div style="width:34px;height:34px;border-radius:50%;background:#161823;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff"><i class="ti ti-player-play"></i></div>
        </div>
      </div>
    </div>`;

  modal.onclick = e => { if (e.target===modal) modal.remove(); };
  document.body.appendChild(modal);
}

async function loadRSSFeeds() {
  await loadClipsFromDB();
}
