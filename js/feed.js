// ═══════════════════════════════════════
// SONAIR — FEED & AUDIO
// ═══════════════════════════════════════

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
    b.style.background = barPct < pct ? 'var(--accent)' : 'rgba(0,0,0,0.12)';
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
    b.style.background = (i / 50 * 100) < pct ? 'var(--accent)' : 'rgba(0,0,0,0.12)';
    el.appendChild(b);
  }
}

function fmtTime(secs) {
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
}

// ── LOAD CLIPS FROM SUPABASE ──
async function loadClipsFromDB() {
  document.getElementById('feed-loading').style.display = 'flex';
  try {
    const { data, error } = await db
      .from('clips')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      clips = data.map(clip => ({
        id: clip.id,
        title: clip.title,
        creator: clip.rss_source || 'Sonair Library',
        handle: '@' + (clip.rss_source || 'sonair').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15),
        verified: true,
        desc: clip.description || '',
        tags: (clip.hashtags || []).map(t => '#' + t).join(' '),
        cat: clip.category || 'Education',
        duration: clip.duration_seconds || 90,
        bg: CAT_GRADIENTS[clip.category] || CAT_GRADIENTS['Education'],
        initials: (clip.rss_source || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: 'linear-gradient(135deg,#C8A96E,#8B5E3C)',
        plays: clip.play_count ? clip.play_count.toLocaleString() : '0',
        likes: clip.like_count ? clip.like_count.toLocaleString() : '0',
        audioUrl: clip.audio_url || '',
      }));

      document.getElementById('feed-loading').style.display = 'none';
      currentIdx = 0;
      buildFeed();
      showToast(`${clips.length} clips loaded`);
    } else {
      throw new Error('No clips found');
    }
  } catch (e) {
    console.warn('DB load failed, using fallback:', e);
    clips = FALLBACK_CLIPS;
    document.getElementById('feed-loading').style.display = 'none';
    buildFeed();
  }
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

    card.innerHTML = `
      <div class="clip-card-bg" style="background:${clip.bg}"></div>
      <div class="clip-card-content">
        <!-- LEFT: ARTICLE -->
        <div class="clip-article">
          <div class="clip-section-tag">${clip.cat}</div>
          <div class="clip-headline">${clip.title}</div>
          <div class="clip-byline">
            <span>${clip.creator}</span>
            <span class="byline-dot"></span>
            <span>${fmtTime(clip.duration)}</span>
          </div>
          <div class="clip-standfirst">${clip.desc || 'From the great works of human thought and literature.'}</div>
          <div class="clip-article-tags">${clip.tags}</div>
        </div>
        <!-- RIGHT: PLAYER -->
        <div class="clip-player-panel">
          <div class="player-panel-label">Audio Player</div>
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
          <div style="border-top:1px solid var(--border);padding-top:14px;margin-top:4px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <div class="avatar" style="width:26px;height:26px;font-size:10px;background:${clip.color}">${clip.initials}</div>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--muted2)">${clip.creator}</span>
              <button class="follow-pill ${followedCreators[clip.id] ? 'following' : ''}" id="fp-${clip.id}" onclick="toggleFollow('${clip.id}')" style="margin-left:auto">${followedCreators[clip.id] ? 'Subscribed' : 'Subscribe'}</button>
            </div>
          </div>
        </div>
      </div>
      <!-- ACTIONS -->
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
      </div>`;

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
