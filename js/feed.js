// ═══════════════════════════════════════
// THE NILE — FEED & AUDIO
// ═══════════════════════════════════════

// ═══════════════════════════════════════
// IMAGE MAPS — Unsplash photos for authors & categories
// ═══════════════════════════════════════
const UNSPLASH = 'https://images.unsplash.com/';

const AUTHOR_IMAGES = {
  'marcus aurelius':  UNSPLASH + 'photo-1578301978693-85fa9c0320b9?w=800&q=80&fit=crop',
  'dale carnegie':    UNSPLASH + 'photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
  'sun tzu':          UNSPLASH + 'photo-1544716278-ca5e3f4abd8c?w=800&q=80&fit=crop',
  'james allen':      UNSPLASH + 'photo-1518495973542-4542c06a5843?w=800&q=80&fit=crop',
  'napoleon hill':    UNSPLASH + 'photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop',
  'seneca':           UNSPLASH + 'photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop',
  'epictetus':        UNSPLASH + 'photo-1580130775562-0ef92da028de?w=800&q=80&fit=crop',
  'aristotle':        UNSPLASH + 'photo-1541963463532-d68292c34b19?w=800&q=80&fit=crop',
  'plato':            UNSPLASH + 'photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
  'benjamin franklin':UNSPLASH + 'photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop',
  'thoreau':          UNSPLASH + 'photo-1448375240586-882707db888b?w=800&q=80&fit=crop',
  'frederick douglass':UNSPLASH + 'photo-1531545514256-b1400bc00f31?w=800&q=80&fit=crop',
  'booker':           UNSPLASH + 'photo-1559827260-dc66d52bef19?w=800&q=80&fit=crop',
  'machiavelli':      UNSPLASH + 'photo-1564507592333-c60657eea523?w=800&q=80&fit=crop',
  'oscar wilde':      UNSPLASH + 'photo-1513836279014-a89f7a76ae86?w=800&q=80&fit=crop',
  'dickens':          UNSPLASH + 'photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop',
  'mark twain':       UNSPLASH + 'photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
  'emerson':          UNSPLASH + 'photo-1448375240586-882707db888b?w=800&q=80&fit=crop',
  'william james':    UNSPLASH + 'photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
  'gibran':           UNSPLASH + 'photo-1504701954957-2010ec3bcec1?w=800&q=80&fit=crop',
  'tolstoy':          UNSPLASH + 'photo-1547981609-4b6bfe67ca0b?w=800&q=80&fit=crop',
  'victor hugo':      UNSPLASH + 'photo-1502602898657-3e91760cbb34?w=800&q=80&fit=crop',
  'shakespeare':      UNSPLASH + 'photo-1513836279014-a89f7a76ae86?w=800&q=80&fit=crop',
  'voltaire':         UNSPLASH + 'photo-1502602898657-3e91760cbb34?w=800&q=80&fit=crop',
  'confucius':        UNSPLASH + 'photo-1544716278-ca5e3f4abd8c?w=800&q=80&fit=crop',
};

const CAT_IMAGES = {
  'Philosophy':     UNSPLASH + 'photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop',
  'Business':       UNSPLASH + 'photo-1454165804606-c3d57bc86b40?w=800&q=80&fit=crop',
  'Literature':     UNSPLASH + 'photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop',
  'History':        UNSPLASH + 'photo-1461360228754-6e81c478b882?w=800&q=80&fit=crop',
  'Education':      UNSPLASH + 'photo-1503676260728-1c00da094a0b?w=800&q=80&fit=crop',
  'News':           UNSPLASH + 'photo-1504711434969-e33886168f5c?w=800&q=80&fit=crop',
  'Issues':         UNSPLASH + 'photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop',
  'Lifestyle':      UNSPLASH + 'photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop',
  'Entertainment':  UNSPLASH + 'photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop',
  'Stories':        UNSPLASH + 'photo-1513836279014-a89f7a76ae86?w=800&q=80&fit=crop',
  'Self-Mastery':   UNSPLASH + 'photo-1518495973542-4542c06a5843?w=800&q=80&fit=crop',
  'Sports':         UNSPLASH + 'photo-1461896836934-ffe607ba8211?w=800&q=80&fit=crop',
  'Music':          UNSPLASH + 'photo-1511379938547-c1f69419868d?w=800&q=80&fit=crop',
  'Science':        UNSPLASH + 'photo-1507413245164-6160d8298b31?w=800&q=80&fit=crop',
  'Technology':     UNSPLASH + 'photo-1518770660439-4636190af475?w=800&q=80&fit=crop',
  'Poetry & Spirit':UNSPLASH + 'photo-1504701954957-2010ec3bcec1?w=800&q=80&fit=crop',
};

function getClipImage(clip) {
  // Use Listen Notes/Supabase image if available
  if (clip.imageUrl) return clip.imageUrl;
  // Otherwise match by author name
  const creator = (clip.creator || '').toLowerCase();
  const source = (clip.rss_source || '').toLowerCase();
  const combined = creator + ' ' + source;
  for (const [key, url] of Object.entries(AUTHOR_IMAGES)) {
    if (combined.includes(key)) return url;
  }
  return CAT_IMAGES[clip.cat] || CAT_IMAGES['Philosophy'];
}


// Dark moody gradients for clip cards
const CAT_GRADIENTS = {
  'Education':  'linear-gradient(160deg,#0d0a05 0%,#1a1206 50%,#080804 100%)',
  'Business':   'linear-gradient(160deg,#080810 0%,#0d0d1a 50%,#050508 100%)',
  'Technology': 'linear-gradient(160deg,#050d0d 0%,#0a1a1a 50%,#040a0a 100%)',
  'Stories':    'linear-gradient(160deg,#0d0805 0%,#1a1008 50%,#0a0804 100%)',
  'News':       'linear-gradient(160deg,#0a0808 0%,#1a1010 50%,#080606 100%)',
  'Sports':     'linear-gradient(160deg,#060d06 0%,#0d1a0d 50%,#040a04 100%)',
  'Comedy':     'linear-gradient(160deg,#0d0d06 0%,#1a1a08 50%,#0a0a04 100%)',
  'Wellness':   'linear-gradient(160deg,#050d0a 0%,#0a1a14 50%,#040a08 100%)',
  'Music':      'linear-gradient(160deg,#0d050d 0%,#1a0a1a 50%,#0a040a 100%)',
};

const FALLBACK_CLIPS = [
  { id: 'fallback_1', title: 'Loading your content...', creator: 'Sonair', handle: '@sonair', verified: true, desc: 'Your clips are loading from the library', tags: '#sonair', cat: 'Education', duration: 60, bg: CAT_GRADIENTS['Education'], initials: 'S', color: 'linear-gradient(135deg,#C8A96E,#8B5E3C)', plays: '0', likes: '0', audioUrl: '' },
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
let isRecording = false;
let recSeconds = 0;
let recTimerInterval = null;
let recAnimInterval = null;
let mediaRecorder = null;
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
  nextClip();
});

audioEl.addEventListener('error', () => {
  startFakeProgress();
});

function updateProgressUI(id, pct, elapsed) {
  const fill = document.getElementById('pf-' + id);
  if (fill) fill.style.width = pct + '%';
  const et = document.getElementById('et-' + id);
  if (et && elapsed !== undefined) {
    const s = Math.floor(elapsed);
    et.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  const pbFill = document.getElementById('player-fill');
  if (pbFill) pbFill.style.width = pct + '%';
  animateWaveform(id, pct);
}

function animateWaveform(id, pct) {
  const bars = document.querySelectorAll(`#wv-${id} .wv-bar`);
  bars.forEach((b, i) => {
    const barPct = (i / bars.length) * 100;
    b.style.background = barPct < pct ? '#B8922A' : 'rgba(255,255,255,0.2)';
    if (isPlaying && barPct >= pct && barPct < pct + 5) {
      b.style.height = (5 + Math.random() * 38) + 'px';
    }
  });
}

function buildWaveform(containerId, pct = 0) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 50; i++) {
    const b = document.createElement('div');
    b.className = 'wv-bar';
    b.style.height = (5 + Math.random() * 38) + 'px';
    b.style.background = (i / 50 * 100) < pct ? '#B8922A' : 'rgba(255,255,255,0.2)';
    el.appendChild(b);
  }
}

function fmtTime(secs) {
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
}


// ═══════════════════════════════════════
// LISTEN NOTES API INTEGRATION
// ═══════════════════════════════════════

const LISTEN_NOTES_KEY = 'aaca221d7d284540bdc63cdeb09037da';
const LISTEN_NOTES_BASE = 'https://listen-api.listennotes.com/api/v2';

// Search queries for each N.I.L.E. category
const NILE_SEARCHES = [
  { q: 'breaking news today',           cat: 'News'          },
  { q: 'technology innovation ai',      cat: 'News'          },
  { q: 'world politics current events', cat: 'News'          },
  { q: 'philosophy stoicism wisdom',    cat: 'Issues'        },
  { q: 'history society culture',       cat: 'Issues'        },
  { q: 'psychology mind behavior',      cat: 'Issues'        },
  { q: 'entrepreneurship money career', cat: 'Lifestyle'     },
  { q: 'health wellness fitness',       cat: 'Lifestyle'     },
  { q: 'comedy funny humor',            cat: 'Entertainment' },
  { q: 'music film pop culture sport',  cat: 'Entertainment' },
];

async function fetchListenNotesClips() {
  const allClips = [];
  let idCounter = Date.now();

  // Use best_episodes endpoint for curated content
  try {
    const res = await fetch(`${LISTEN_NOTES_BASE}/best_podcasts?page=1&region=us&safe_mode=0`, {
      headers: { 'X-ListenAPI-Key': LISTEN_NOTES_KEY }
    });

    if (res.status === 429) {
      console.warn('Listen Notes rate limit hit');
      return [];
    }

    if (!res.ok) {
      console.warn('Listen Notes error:', res.status);
      return [];
    }

    const data = await res.json();
    const podcasts = data.podcasts || [];

    // For each podcast get latest episode
    for (const podcast of podcasts.slice(0, 12)) {
      try {
        const epRes = await fetch(`${LISTEN_NOTES_BASE}/podcasts/${podcast.id}?sort=recent_first&next_episode_pub_date=0`, {
          headers: { 'X-ListenAPI-Key': LISTEN_NOTES_KEY }
        });
        if (!epRes.ok) continue;
        const epData = await epRes.json();
        const episode = (epData.episodes || [])[0];
        if (!episode || !episode.audio) continue;

        const cat = guessCat(podcast.title + ' ' + (podcast.description || ''));
        const imgUrl = podcast.image || episode.image || CAT_IMAGES[cat] || '';

        allClips.push({
          id: 'ln_' + (idCounter++),
          title: episode.title?.slice(0, 80) || podcast.title,
          creator: podcast.title,
          handle: '@' + podcast.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15),
          verified: true,
          desc: (episode.description || podcast.description || '').replace(/<[^>]+>/g, '').slice(0, 120),
          tags: '#' + cat.toLowerCase().replace(/\s/g, '') + ' #podcast',
          cat,
          duration: episode.audio_length_sec || 300,
          bg: CAT_IMAGES[cat] || CAT_IMAGES['News'],
          initials: podcast.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          color: 'linear-gradient(135deg,#B8922A,#8B5E3C)',
          plays: Math.floor(Math.random() * 500 + 10) + 'K',
          likes: Math.floor(Math.random() * 50 + 1) + 'K',
          audioUrl: episode.audio,
          imageUrl: imgUrl,
          podcastId: podcast.id,
          episodeId: episode.id,
          isListenNotes: true,
        });
      } catch(e) { continue; }
    }
  } catch(e) {
    console.warn('Listen Notes fetch error:', e);
  }

  return allClips;
}

async function searchListenNotes(query, cat) {
  try {
    const url = `${LISTEN_NOTES_BASE}/search?q=${encodeURIComponent(query)}&type=episode&len_min=1&len_max=10&safe_mode=0&language=English`;
    const res = await fetch(url, {
      headers: { 'X-ListenAPI-Key': LISTEN_NOTES_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];

    return results.slice(0, 3).map((ep, i) => ({
      id: 'lns_' + Date.now() + '_' + i,
      title: ep.title_original?.slice(0, 80) || ep.title_highlighted?.replace(/<[^>]+>/g,'').slice(0,80) || 'Untitled',
      creator: ep.podcast?.title_original || 'Podcast',
      handle: '@' + (ep.podcast?.title_original || 'podcast').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15),
      verified: true,
      desc: (ep.description_original || '').replace(/<[^>]+>/g, '').slice(0, 120),
      tags: '#' + cat.toLowerCase().replace(/\s/g, '') + ' #podcast',
      cat,
      duration: ep.audio_length_sec || 300,
      bg: CAT_IMAGES[cat] || CAT_IMAGES['News'],
      initials: (ep.podcast?.title_original || 'P').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: 'linear-gradient(135deg,#B8922A,#8B5E3C)',
      plays: Math.floor(Math.random() * 500 + 10) + 'K',
      likes: Math.floor(Math.random() * 50 + 1) + 'K',
      audioUrl: ep.audio,
      imageUrl: ep.image || ep.podcast?.image || '',
      isListenNotes: true,
    }));
  } catch(e) {
    return [];
  }
}

function guessCat(text) {
  const t = text.toLowerCase();
  // N — News
  if (t.match(/news|politic|world|breaking|daily|report|tech|science|ai|software|digital|climate|economy/)) return 'News';
  // I — Issues
  if (t.match(/philosoph|stoic|wisdom|psychology|mind|think|histor|true crime|mystery|society|culture|debate|social/)) return 'Issues';
  // L — Lifestyle
  if (t.match(/lifestyle|health|wellness|fitness|food|travel|fashion|business|entrepreneur|startup|invest|finance|money|market|career|productivity|self/)) return 'Lifestyle';
  // E — Entertainment
  if (t.match(/comedy|humor|funny|laugh|joke|music|art|film|tv|sport|game|entertain|story|fiction|celebrity|pop/)) return 'Entertainment';
  return 'Issues';
}


// ── LOAD CLIPS FROM SUPABASE ──
async function loadClipsFromDB() {
  document.getElementById('feed-loading').style.display = 'flex';

  let dbClips = [];
  let lnClips = [];

  // Load from Supabase
  try {
    const { data, error } = await db
      .from('clips')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      dbClips = data.map(clip => ({
        id: clip.id,
        title: clip.title,
        creator: clip.rss_source || 'The Nile Library',
        handle: '@' + (clip.rss_source || 'thenile').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15),
        verified: true,
        desc: clip.description || '',
        tags: (clip.hashtags || []).map(t => '#' + t).join(' '),
        cat: clip.category || 'Education',
        duration: clip.duration_seconds || 90,
        bg: CAT_GRADIENTS[clip.category] || CAT_GRADIENTS['Education'],
        initials: (clip.rss_source || 'N').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: 'linear-gradient(135deg,#B8922A,#8B5E3C)',
        plays: clip.play_count ? clip.play_count.toLocaleString() : '0',
        likes: clip.like_count ? clip.like_count.toLocaleString() : '0',
        audioUrl: clip.audio_url || '',
        imageUrl: '',
      }));
    }
  } catch(e) {
    console.warn('DB load error:', e);
  }

  // Load from Listen Notes in parallel
  try {
    const searchPromises = NILE_SEARCHES.slice(0, 4).map(s => searchListenNotes(s.q, s.cat));
    const results = await Promise.allSettled(searchPromises);
    results.forEach(r => {
      if (r.status === 'fulfilled') lnClips.push(...r.value);
    });
  } catch(e) {
    console.warn('Listen Notes error:', e);
  }

  // Combine: DB clips first, then Listen Notes, shuffle Listen Notes
  const shuffledLN = lnClips.sort(() => Math.random() - 0.5);
  clips = dbClips.length > 0
    ? [...dbClips, ...shuffledLN]
    : shuffledLN.length > 0
      ? shuffledLN
      : FALLBACK_CLIPS;

  document.getElementById('feed-loading').style.display = 'none';
  currentIdx = 0;
  buildFeed();

  const total = clips.length;
  const sources = [];
  if (dbClips.length > 0) sources.push(dbClips.length + ' library clips');
  if (lnClips.length > 0) sources.push(lnClips.length + ' live podcasts');
  if (sources.length > 0) showToast('Loaded ' + sources.join(' + '));
}

function buildFeed() {
  const container = document.getElementById('feed-scroll');
  container.innerHTML = '';

  clips.forEach((clip, i) => {
    const pct = clipProgress[clip.id] || 0;
    const elapsed = Math.floor(clip.duration * pct / 100);
    const card = document.createElement('div');
    card.className = 'clip-card';
    card.id = 'card-' + clip.id;

    const clipImg = getClipImage(clip);
    card.innerHTML = `
      <div class="clip-card-bg" style="background-image:url(${clipImg});background-color:#1a1208;background-size:cover;background-position:center"></div>
      <div class="clip-card-content">
        <div class="clip-section-tag">${clip.cat}</div>
        <div class="clip-headline">${clip.title}</div>
        <div class="clip-byline">
          <div class="clip-byline-avatar" style="background-image:url(${clip.podcastImage || clipImg})"></div>
          <span>${clip.creator}</span>
          <span class="byline-dot"></span>
          <span>${fmtTime(clip.duration)}</span>
        </div>
        <div class="clip-standfirst">${clip.desc || 'From the great works of human thought and literature.'}</div>
        <div class="clip-article-tags">${clip.tags}</div>
        <div class="clip-inline-player">
          <div class="waveform" id="wv-${clip.id}" onclick="seekWaveform(event,'${clip.id}')"></div>
          <div class="progress-row">
            <span class="time-label" id="et-${clip.id}">${fmtTime(elapsed)}</span>
            <div class="progress-track" onclick="seekTrack(event,'${clip.id}')">
              <div class="progress-fill" id="pf-${clip.id}" style="width:${pct}%"></div>
            </div>
            <span class="time-label">${fmtTime(clip.duration)}</span>
          </div>
          <div class="player-controls">
            <button class="ctrl-btn" onclick="rewind10('${clip.id}')"><i class="ti ti-rewind-10"></i></button>
            <button class="ctrl-btn" onclick="prevClip()"><i class="ti ti-skip-back"></i></button>
            <button class="play-btn" onclick="togglePlay('${clip.id}')">
              <i class="ti ${i === currentIdx && isPlaying ? 'ti-player-pause' : 'ti-player-play'}" id="pi-${clip.id}"></i>
            </button>
            <button class="ctrl-btn" onclick="nextClip()"><i class="ti ti-skip-forward"></i></button>
            <button class="speed-tag" onclick="cycleSpeed()">${currentSpeed}x</button>
          </div>
          <div class="clip-creator-strip">
            <div class="clip-creator-photo" style="background-image:url(${clip.podcastImage || clipImg})" onclick="openPodcastProfile('${clip.id}')"></div>
            <span class="clip-creator-name" onclick="openPodcastProfile('${clip.id}')">${clip.creator}</span>
            <button class="follow-pill ${followedCreators[clip.id] ? 'following' : ''}" id="fp-${clip.id}" onclick="toggleFollow('${clip.id}')">${followedCreators[clip.id] ? 'Subscribed' : 'Subscribe'}</button>
          </div>
        </div>
      </div>
      <div class="clip-actions">
        <div class="action-btn ${likedClips[clip.id] ? 'liked' : ''}" onclick="toggleLike('${clip.id}',this)">
          <div class="action-circle"><i class="ti ti-heart"></i></div>
          <span class="action-count" id="lc-${clip.id}">${clip.likes}</span>
        </div>
        <div class="action-btn" onclick="openComments('${clip.id}')">
          <div class="action-circle"><i class="ti ti-message-circle"></i></div>
          <span class="action-count">${(allComments[clip.id] || []).length || 0}</span>
        </div>
        <div class="action-btn" onclick="shareClip('${clip.id}')">
          <div class="action-circle"><i class="ti ti-share-2"></i></div>
        </div>
        <div class="action-btn ${savedClips[clip.id] ? 'saved' : ''}" onclick="toggleSave('${clip.id}',this)">
          <div class="action-circle"><i class="ti ti-bookmark"></i></div>
        </div>
      </div>`

    container.appendChild(card);
    buildWaveform('wv-' + clip.id, pct);
  });

  // Intersection observer for auto-play on scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.intersectionRatio > 0.7) {
        const rawId = e.target.id.replace('card-', '');
        const idx = clips.findIndex(c => String(c.id) === rawId);
        if (idx !== -1 && idx !== currentIdx) {
          stopAudio();
          currentIdx = idx;
          isPlaying = true;
          updatePlayIcons();
          startAudio();
        }
      }
    });
  }, { threshold: 0.7 });

  document.querySelectorAll('.clip-card').forEach(el => obs.observe(el));
  updatePlayerBar();
}

function updatePlayIcons() {
  clips.forEach(c => {
    const el = document.getElementById('pi-' + c.id);
    if (el) el.className = 'ti ' + (String(c.id) === String(clips[currentIdx]?.id) && isPlaying ? 'ti-player-pause' : 'ti-player-play');
  });
  const pbIcon = document.getElementById('pb-play-icon');
  if (pbIcon) pbIcon.className = 'ti ' + (isPlaying ? 'ti-player-pause' : 'ti-player-play');
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
  if (isPlaying) startAudio();
  else stopAudio();
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
    const cur = clipProgress[clip.id] || 0;
    const step = (100 / clip.duration) * 0.1 * currentSpeed;
    const newPct = Math.min(100, cur + step);
    clipProgress[clip.id] = newPct;
    updateProgressUI(clip.id, newPct, clip.duration * newPct / 100);
    if (newPct >= 100) { stopFakeProgress(); isPlaying = false; updatePlayIcons(); nextClip(); }
  }, 100);
}

function stopFakeProgress() {
  if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}

function nextClip() {
  stopAudio();
  currentIdx = (currentIdx + 1) % clips.length;
  document.getElementById('card-' + clips[currentIdx].id)?.scrollIntoView({ behavior: 'smooth' });
  isPlaying = true;
  updatePlayIcons();
  startAudio();
  updatePlayerBar();
}

function prevClip() {
  stopAudio();
  currentIdx = (currentIdx - 1 + clips.length) % clips.length;
  document.getElementById('card-' + clips[currentIdx].id)?.scrollIntoView({ behavior: 'smooth' });
  isPlaying = true;
  updatePlayIcons();
  startAudio();
  updatePlayerBar();
}

function seekTrack(e, id) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  clipProgress[id] = pct;
  const clip = clips.find(c => String(c.id) === String(id));
  if (clip && clip.audioUrl && audioEl.duration) {
    audioEl.currentTime = (pct / 100) * audioEl.duration;
  }
  const fill = document.getElementById('pf-' + id);
  if (fill) fill.style.width = pct + '%';
  buildWaveform('wv-' + id, pct);
}

function seekWaveform(e, id) { seekTrack(e, id); }

function rewind10(id) {
  const clip = clips.find(c => String(c.id) === String(id));
  if (!clip) return;
  const cur = clipProgress[id] || 0;
  clipProgress[id] = Math.max(0, cur - (10 / clip.duration) * 100);
  if (clip.audioUrl && audioEl.duration) audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
  const fill = document.getElementById('pf-' + id);
  if (fill) fill.style.width = clipProgress[id] + '%';
  buildWaveform('wv-' + id, clipProgress[id]);
}

function cycleSpeed() {
  currentSpeed = SPEEDS[(SPEEDS.indexOf(currentSpeed) + 1) % SPEEDS.length];
  document.querySelectorAll('.speed-tag').forEach(b => b.textContent = currentSpeed + 'x');
  if (audioEl) audioEl.playbackRate = currentSpeed;
  showToast('Speed: ' + currentSpeed + 'x');
}

function toggleLike(id, el) {
  likedClips[id] = !likedClips[id];
  el.classList.toggle('liked', likedClips[id]);
}

function toggleSave(id, el) {
  savedClips[id] = !savedClips[id];
  el.classList.toggle('saved', savedClips[id]);
  showToast(savedClips[id] ? 'Saved!' : 'Removed from saved');
}

function toggleFollow(id) {
  followedCreators[id] = !followedCreators[id];
  const btn = document.getElementById('fp-' + id);
  if (btn) {
    btn.classList.toggle('following', followedCreators[id]);
    btn.textContent = followedCreators[id] ? 'Following' : 'Follow';
  }
  if (followedCreators[id]) showToast('Following!');
}

function shareClip(id) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href + '#clip-' + id);
    showToast('Link copied!');
  }
}

function openComments(id) {
  currentCommentClip = id;
  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  const clipComments = allComments[id] || [];
  if (clipComments.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted2);font-size:13px">No comments yet. Be the first!</div>';
  } else {
    clipComments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `
        <div class="avatar" style="width:32px;height:32px;font-size:12px">${c.user.slice(1,3).toUpperCase()}</div>
        <div>
          <div class="comment-user">${c.user}</div>
          <div class="comment-text">${c.text}</div>
          <div class="comment-time">${c.time}</div>
        </div>`;
      list.appendChild(div);
    });
  }
  document.getElementById('modal-comments').style.display = 'flex';
}

// Called when app loads — replaces loadRSSFeeds
async function loadRSSFeeds() {
  await loadClipsFromDB();
}


// ═══════════════════════════════════════
// PODCAST PROFILE MODAL
// ═══════════════════════════════════════

function openPodcastProfile(clipId) {
  const clip = clips.find(c => String(c.id) === String(clipId));
  if (!clip) return;

  // Remove existing modal if any
  const existing = document.getElementById('podcast-profile-modal');
  if (existing) existing.remove();

  const img = clip.podcastImage || getClipImage(clip);
  const podcastUrl = clip.podcastUrl || clip.podcastListenUrl || '';
  const episodeUrl = clip.episodeUrl || '';

  const modal = document.createElement('div');
  modal.id = 'podcast-profile-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `
    <div style="background:#FAFAF7;width:100%;max-width:540px;border-radius:8px 8px 0 0;border-top:2px solid #0A0A08;max-height:85vh;overflow-y:auto">
      <!-- COVER -->
      <div style="height:140px;background-image:url(${img});background-size:cover;background-position:center;position:relative;border-radius:8px 8px 0 0;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(250,248,244,0.95) 100%)"></div>
        <button onclick="document.getElementById('podcast-profile-modal').remove()" style="position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:rgba(250,248,244,0.9);border:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;color:#0A0A08"><i class="ti ti-x"></i></button>
      </div>
      <!-- PROFILE INFO -->
      <div style="padding:0 24px 24px">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:-28px;margin-bottom:14px">
          <div style="width:64px;height:64px;border-radius:4px;background-image:url(${img});background-size:cover;background-position:center;border:3px solid #FAFAF7;box-shadow:0 2px 8px rgba(0,0,0,0.12)"></div>
          <div style="display:flex;gap:8px">
            ${podcastUrl ? `<a href="${podcastUrl}" target="_blank" style="padding:7px 14px;background:#B8922A;border-radius:2px;font-family:var(--font-mono);font-size:10px;font-weight:500;color:#FAFAF7;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none">Visit Website</a>` : ''}
            ${episodeUrl ? `<a href="${episodeUrl}" target="_blank" style="padding:7px 14px;border:1px solid rgba(0,0,0,0.15);border-radius:2px;font-family:var(--font-mono);font-size:10px;font-weight:500;color:#0A0A08;letter-spacing:0.8px;text-transform:uppercase;text-decoration:none">Listen Notes</a>` : ''}
          </div>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;font-style:italic;color:#0A0A08;letter-spacing:-0.5px;margin-bottom:4px">${clip.creator}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:#B8922A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">${clip.cat}</div>
        ${clip.podcastDesc ? `<div style="font-size:13px;color:rgba(10,10,8,0.6);line-height:1.65;font-style:italic;border-left:2px solid rgba(184,146,42,0.3);padding-left:12px;margin-bottom:20px">${clip.podcastDesc}</div>` : ''}

        <!-- CURRENT EPISODE -->
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(10,10,8,0.3);border-bottom:1px solid rgba(0,0,0,0.08);padding-bottom:8px;margin-bottom:14px">Current Episode</div>
        <div style="display:flex;gap:12px;align-items:flex-start;padding:14px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.08);border-radius:2px;cursor:pointer" onclick="document.getElementById('podcast-profile-modal').remove();togglePlay('${clip.id}')">
          <div style="width:48px;height:48px;border-radius:2px;background-image:url(${img});background-size:cover;background-position:center;flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:700;font-style:italic;color:#0A0A08;line-height:1.3;margin-bottom:5px">${clip.title}</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:rgba(10,10,8,0.3)">${clip.cat.toUpperCase()} · ${fmtTime(clip.duration)}</div>
          </div>
          <div style="width:36px;height:36px;border-radius:50%;background:#B8922A;display:flex;align-items:center;justify-content:center;font-size:14px;color:#FAFAF7;flex-shrink:0"><i class="ti ti-player-play"></i></div>
        </div>

        ${episodeUrl ? `
        <div style="margin-top:16px;text-align:center">
          <a href="${episodeUrl}" target="_blank" style="font-family:var(--font-mono);font-size:10px;color:rgba(10,10,8,0.3);letter-spacing:1px;text-decoration:none">
            Powered by Listen Notes <i class="ti ti-external-link" style="font-size:11px"></i>
          </a>
        </div>` : ''}
      </div>
    </div>`;

  // Close on backdrop click
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}
