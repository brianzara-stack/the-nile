/* ═══════════════════════════════════
   THE NILE — APP.JS
   ═══════════════════════════════════ */

const LISTEN_KEY = 'aaca221d7d284540bdc63cdeb09037da';
const LISTEN_BASE = 'https://listen-api.listennotes.com/api/v2';

// ── State ──────────────────────────────────────────────
let currentEp = null;
let savedEpisodes = JSON.parse(localStorage.getItem('nile_saved') || '[]');
let history = JSON.parse(localStorage.getItem('nile_history') || '[]');
let isPlaying = false;

// ── DOM refs ────────────────────────────────────────────
const audio = document.getElementById('audioEl');
const player = document.getElementById('player');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const playerTitle = document.getElementById('playerTitle');
const playerPodcast = document.getElementById('playerPodcast');
const playerSource = document.getElementById('playerSource');
const attributionLink = document.getElementById('attributionLink');
const saveBtn = document.getElementById('saveBtn');
const shareBtn = document.getElementById('shareBtn');

// ── Splash ──────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('app').classList.remove('hidden');
      initFeed();
      initBooks();
      initProfile();
    }, 600);
  }, 1400);
});

// ── Tab navigation ──────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    tab.classList.add('active');
    const view = tab.dataset.tab;
    document.getElementById(view + 'View').classList.remove('hidden');
    if (view === 'discover') initDiscover();
    if (view === 'profile') renderProfile();
  });
});

// ── Listen Notes Fetch ──────────────────────────────────
async function fetchEpisodes(query, offset = 0) {
  try {
    const res = await fetch(`${LISTEN_BASE}/search?q=${encodeURIComponent(query)}&type=episode&offset=${offset}&len_min=5&language=English`, {
      headers: { 'X-ListenAPI-Key': LISTEN_KEY }
    });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('Listen Notes error:', e);
    return [];
  }
}

async function fetchBestEpisodes(query) {
  try {
    const res = await fetch(`${LISTEN_BASE}/search?q=${encodeURIComponent(query)}&type=episode&len_min=10&sort_by_date=0&language=English`, {
      headers: { 'X-ListenAPI-Key': LISTEN_KEY }
    });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

// ── Feed ────────────────────────────────────────────────
const FEED_QUERIES = ['inspiring stories 2025', 'business insights', 'science discoveries', 'world news today', 'health mindset'];

async function initFeed() {
  const container = document.getElementById('feedCards');
  container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading episodes…</p></div>';

  const query = FEED_QUERIES[Math.floor(Math.random() * FEED_QUERIES.length)];
  const episodes = await fetchEpisodes(query);

  if (!episodes.length) {
    container.innerHTML = '<div class="loading-state"><p>Could not load episodes. Check your API key.</p></div>';
    return;
  }

  container.innerHTML = '';
  episodes.slice(0, 10).forEach(ep => {
    container.appendChild(buildEpCard(ep));
  });
}

function buildEpCard(ep) {
  const card = document.createElement('div');
  card.className = 'ep-card';

  const img = ep.thumbnail || ep.image || '';
  const podcast = ep.podcast?.title_original || ep.podcast_title_original || 'Podcast';
  const sourceUrl = ep.listennotes_url || `https://listennotes.com${ep.listennotes_url || ''}`;
  const duration = ep.audio_length_sec ? formatDuration(ep.audio_length_sec) : '';
  const desc = stripHtml(ep.description_highlighted || ep.description || '');

  card.innerHTML = `
    ${img
      ? `<img class="ep-card-image" src="${img}" alt="${escHtml(ep.title_original || '')}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="ep-card-image placeholder">N</div>`
    }
    <div class="ep-card-body">
      <div class="ep-card-attribution">
        <span class="ep-podcast-name">${escHtml(podcast)}</span>
        <a class="ep-source-link" href="${sourceUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Source
        </a>
      </div>
      <div class="ep-card-title">${escHtml(ep.title_original || 'Episode')}</div>
      ${desc ? `<div class="ep-card-desc">${escHtml(desc)}</div>` : ''}
      <div class="ep-card-footer">
        <span class="ep-duration">${duration}</span>
        <button class="ep-play-btn" title="Play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>
    </div>
  `;

  const playBtn = card.querySelector('.ep-play-btn');
  playBtn.addEventListener('click', (e) => { e.stopPropagation(); playEpisode(ep); });
  card.addEventListener('click', () => playEpisode(ep));
  return card;
}

// ── Discover ────────────────────────────────────────────
let discoverInitialized = false;

function initDiscover() {
  if (discoverInitialized) return;
  discoverInitialized = true;
  loadDiscover('news today');

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      loadDiscover(pill.dataset.query);
    });
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value.trim();
    if (q) loadDiscover(q);
  });
  document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) loadDiscover(q);
    }
  });
}

async function loadDiscover(query) {
  const grid = document.getElementById('discoverResults');
  grid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Searching…</p></div>';
  const episodes = await fetchBestEpisodes(query);
  grid.innerHTML = '';
  if (!episodes.length) {
    grid.innerHTML = '<div class="loading-state"><p>No results found.</p></div>';
    return;
  }
  episodes.slice(0, 12).forEach(ep => grid.appendChild(buildEpCard(ep)));
}

// ── Books (Public Domain) ───────────────────────────────
const BOOKS = [
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    era: "170 AD",
    excerpt: "You have power over your mind — not outside events. Realize this, and you will find strength. The impediment to action advances action. What stands in the way becomes the way.",
    text: "You have power over your mind, not outside events. Realize this, and you will find strength. The impediment to action advances action. What stands in the way becomes the way. Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present. Waste no more time arguing about what a good man should be. Be one. If it is not right, do not do it; if it is not true, do not say it. The first rule is to keep an untroubled spirit. The second is to look things in the face and know them for what they are.",
    duration: "2 min",
    color: "#1a1508"
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    era: "500 BC",
    excerpt: "Supreme excellence consists in breaking the enemy's resistance without fighting. The supreme art of war is to subdue the enemy without fighting. Opportunities multiply as they are seized.",
    text: "Supreme excellence consists in breaking the enemy's resistance without fighting. The supreme art of war is to subdue the enemy without fighting. Opportunities multiply as they are seized. In the midst of chaos, there is also opportunity. Appear weak when you are strong, and strong when you are weak. The greatest victory is that which requires no battle. Know yourself and know your enemy and you shall not fear the result of a hundred battles.",
    duration: "2 min",
    color: "#080f12"
  },
  {
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    era: "1883",
    excerpt: "You must be ready to burn yourself in your own flame; how could you rise anew if you have not first become ashes? Man must surpass himself.",
    text: "You must be ready to burn yourself in your own flame; how could you rise anew if you have not first become ashes? I tell you: one must still have chaos in oneself, to give birth to a dancing star. Man is a rope stretched between animal and Superman — a rope over an abyss. What is great in man is that he is a bridge and not a goal. The secret for harvesting from existence the greatest fruitfulness and the greatest enjoyment is to live dangerously.",
    duration: "2 min",
    color: "#0f0808"
  },
  {
    title: "Walden",
    author: "Henry David Thoreau",
    era: "1854",
    excerpt: "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.",
    text: "I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I wanted to live deep and suck out all the marrow of life. Our life is frittered away by detail. Simplify, simplify. If you have built castles in the air, your work need not be lost; that is where they should be. Now put the foundations under them.",
    duration: "2 min",
    color: "#080f08"
  },
  {
    title: "The Republic",
    author: "Plato",
    era: "380 BC",
    excerpt: "The measure of a man is what he does with power. We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.",
    text: "The measure of a man is what he does with power. We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light. Until philosophers rule as kings or those who are now called kings and leading men genuinely and adequately philosophize, there can be no end to troubles for states. Ignorance is the root and stem of all evil. The price of apathy towards public affairs is to be ruled by evil men.",
    duration: "2 min",
    color: "#0a080f"
  }
];

function initBooks() {
  const grid = document.getElementById('booksGrid');
  BOOKS.forEach((book, i) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.background = `linear-gradient(135deg, ${book.color}, #0f0f0f)`;
    card.innerHTML = `
      <div class="book-era">${book.era}</div>
      <div class="book-title">${escHtml(book.title)}</div>
      <div class="book-author">${escHtml(book.author)}</div>
      <div class="book-excerpt">${escHtml(book.excerpt)}</div>
      <div class="book-footer">
        <span class="book-duration">${book.duration} read</span>
        <button class="ep-play-btn" title="Listen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>
    `;
    const playBtn = card.querySelector('.ep-play-btn');
    const syntheticEp = {
      id: 'book_' + i,
      title_original: `${book.title} — ${book.author}`,
      podcast: { title_original: 'Classic Wisdom' },
      podcast_title_original: 'Classic Wisdom · Public Domain',
      description: book.text,
      thumbnail: null,
      image: null,
      audio: null,
      listennotes_url: 'https://www.gutenberg.org',
      isBook: true,
      bookText: book.text
    };
    playBtn.addEventListener('click', e => { e.stopPropagation(); playBookPassage(syntheticEp, book); });
    card.addEventListener('click', () => playBookPassage(syntheticEp, book));
    grid.appendChild(card);
  });
}

function playBookPassage(ep, book) {
  // Use browser TTS for books
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(book.text);
    utter.rate = 0.88;
    utter.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('samantha'))
      || voices.find(v => v.lang === 'en-GB')
      || voices[0];
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  }

  currentEp = ep;
  playerPodcast.textContent = 'Classic Wisdom · Public Domain';
  playerTitle.textContent = ep.title_original;
  playerSource.href = 'https://www.gutenberg.org';
  playerSource.textContent = 'Project Gutenberg';
  attributionLink.textContent = 'Project Gutenberg (Public Domain)';
  attributionLink.href = 'https://www.gutenberg.org';
  player.classList.remove('hidden');
  setPlaying(true);
  addToHistory(ep);
}

// ── Play Episode ─────────────────────────────────────────
function playEpisode(ep) {
  currentEp = ep;
  const podcast = ep.podcast?.title_original || ep.podcast_title_original || 'Podcast';
  const sourceUrl = ep.listennotes_url || '#';

  playerPodcast.textContent = podcast;
  playerTitle.textContent = ep.title_original || 'Episode';
  playerSource.href = sourceUrl;

  // Attribution
  attributionLink.textContent = podcast;
  attributionLink.href = sourceUrl;

  // Audio
  if (ep.audio) {
    audio.src = ep.audio;
    audio.play().catch(() => {});
    setPlaying(true);
  } else {
    // No direct audio URL from search — show player UI anyway
    setPlaying(true);
  }

  player.classList.remove('hidden');
  addToHistory(ep);
  updateSaveBtn();

  // Media Session API (lock screen controls)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: ep.title_original || 'Episode',
      artist: podcast,
      artwork: ep.thumbnail ? [{ src: ep.thumbnail, sizes: '512x512', type: 'image/jpeg' }] : []
    });
    navigator.mediaSession.setActionHandler('play', () => { audio.play(); setPlaying(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); setPlaying(false); });
  }
}

// ── Player Controls ──────────────────────────────────────
playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    window.speechSynthesis?.pause();
    setPlaying(false);
  } else {
    audio.play().catch(() => {});
    window.speechSynthesis?.resume();
    setPlaying(true);
  }
});

document.getElementById('skipBackBtn').addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 15);
});
document.getElementById('skipFwdBtn').addEventListener('click', () => {
  audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.value = pct;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => setPlaying(false));

progressBar.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

function setPlaying(state) {
  isPlaying = state;
  playIcon.classList.toggle('hidden', state);
  pauseIcon.classList.toggle('hidden', !state);
}

// ── Save / Bookmark ──────────────────────────────────────
saveBtn.addEventListener('click', () => {
  if (!currentEp) return;
  const id = currentEp.id;
  const idx = savedEpisodes.findIndex(e => e.id === id);
  if (idx === -1) {
    savedEpisodes.unshift(currentEp);
    saveBtn.style.color = '#b8962e';
  } else {
    savedEpisodes.splice(idx, 1);
    saveBtn.style.color = '';
  }
  localStorage.setItem('nile_saved', JSON.stringify(savedEpisodes.slice(0, 50)));
  renderProfile();
});

function updateSaveBtn() {
  if (!currentEp) return;
  const saved = savedEpisodes.some(e => e.id === currentEp.id);
  saveBtn.style.color = saved ? '#b8962e' : '';
}

// ── Share ─────────────────────────────────────────────────
shareBtn.addEventListener('click', () => {
  if (!currentEp) return;
  openShareSheet(currentEp);
});

function openShareSheet(ep) {
  const sheet = document.getElementById('shareSheet');
  document.getElementById('shareTitle').textContent = ep.title_original || 'Episode';
  document.getElementById('sharePodcast').textContent = ep.podcast?.title_original || ep.podcast_title_original || '';
  const art = document.getElementById('shareArt');
  art.src = ep.thumbnail || ep.image || '';
  art.style.display = ep.thumbnail || ep.image ? '' : 'none';
  sheet.classList.remove('hidden');
}

document.getElementById('closeShareBtn').addEventListener('click', () => {
  document.getElementById('shareSheet').classList.add('hidden');
});

document.getElementById('copyLinkBtn').addEventListener('click', () => {
  const url = currentEp?.listennotes_url || window.location.href;
  navigator.clipboard.writeText(`Check out this episode on The Nile: ${url}`).then(() => {
    document.getElementById('copyLinkBtn').textContent = 'Copied!';
    setTimeout(() => { document.getElementById('copyLinkBtn').textContent = 'Copy Link'; }, 2000);
  });
});

document.getElementById('nativeShareBtn').addEventListener('click', () => {
  const ep = currentEp;
  if (!ep) return;
  const url = ep.listennotes_url || window.location.href;
  if (navigator.share) {
    navigator.share({
      title: ep.title_original || 'Episode',
      text: `Listening to "${ep.title_original}" on The Nile`,
      url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
  }
  document.getElementById('shareSheet').classList.add('hidden');
});

// ── Premium Modal ─────────────────────────────────────────
document.getElementById('premiumBtn').addEventListener('click', () => {
  document.getElementById('premiumModal').classList.remove('hidden');
});
document.getElementById('closePremiumBtn').addEventListener('click', () => {
  document.getElementById('premiumModal').classList.add('hidden');
});
document.getElementById('premiumModal').addEventListener('click', e => {
  if (e.target === document.getElementById('premiumModal')) {
    document.getElementById('premiumModal').classList.add('hidden');
  }
});

// ── Profile ───────────────────────────────────────────────
function addToHistory(ep) {
  history = history.filter(e => e.id !== ep.id);
  history.unshift(ep);
  history = history.slice(0, 20);
  localStorage.setItem('nile_history', JSON.stringify(history));
}

function renderProfile() {
  renderEpList('savedList', savedEpisodes);
  renderEpList('historyList', history);
}

function renderEpList(containerId, list) {
  const el = document.getElementById(containerId);
  if (!list.length) {
    el.innerHTML = '<p class="empty-state">Nothing here yet</p>';
    return;
  }
  el.innerHTML = '';
  list.slice(0, 10).forEach(ep => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    const podcast = ep.podcast?.title_original || ep.podcast_title_original || '';
    item.innerHTML = `
      ${ep.thumbnail ? `<img class="saved-thumb" src="${ep.thumbnail}" alt="" loading="lazy">` : '<div class="saved-thumb" style="background:#1a1a1a;border-radius:8px;"></div>'}
      <div class="saved-info">
        <div class="saved-title">${escHtml(ep.title_original || 'Episode')}</div>
        <div class="saved-podcast">${escHtml(podcast)}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      if (ep.isBook) {
        const book = BOOKS.find(b => ep.title_original?.includes(b.title));
        if (book) playBookPassage(ep, book);
      } else {
        playEpisode(ep);
      }
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      document.querySelector('[data-tab="feed"]').classList.add('active');
      document.getElementById('feedView').classList.remove('hidden');
    });
    el.appendChild(item);
  });
}

function initProfile() {
  renderProfile();
}

// ── Helpers ───────────────────────────────────────────────
function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
function formatDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();
}
