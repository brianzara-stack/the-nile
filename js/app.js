// ═══════════════════════════════════════
// SONAIR — APP (Discover, Create, Live, Activity, Profile)
// ═══════════════════════════════════════

const TRENDING = [
  { rank: 1, tag: '#Stoicism', clips: '48K' },
  { rank: 2, tag: '#DailyNews', clips: '41K' },
  { rank: 3, tag: '#MarcusAurelius', clips: '32K' },
  { rank: 4, tag: '#Lifestyle', clips: '27K' },
  { rank: 5, tag: '#ClassicLiterature', clips: '19K' },
  { rank: 6, tag: '#BigIdeas', clips: '16K' },
];

const CREATORS = [
  { name: 'Marcus Aurelius', handle: '@marcusaurelius', followers: '2.1M', color: 'linear-gradient(135deg,#C8A96E,#8B5E3C)', initials: 'MA' },
  { name: 'Dale Carnegie', handle: '@dalecarnegie', followers: '890K', color: 'linear-gradient(135deg,#A07840,#C8A96E)', initials: 'DC' },
  { name: 'Sun Tzu', handle: '@suntzu', followers: '1.4M', color: 'linear-gradient(135deg,#8B7355,#C8A96E)', initials: 'ST' },
  { name: 'Seneca', handle: '@seneca', followers: '780K', color: 'linear-gradient(135deg,#C8A96E,#6E5A3C)', initials: 'SE' },
];

const ACTIVITY_NEW = [
  { av: 'NP', color: 'linear-gradient(135deg,#E8384F,#FF8C5E)', text: '<strong>@nprnews</strong> published a new clip', time: '2m ago', thumb: true },
  { av: 'TD', color: 'linear-gradient(135deg,#333,#666)', text: '<strong>@thedailynyt</strong> posted today\'s episode', time: '8m ago', thumb: true },
  { av: 'PM', color: 'linear-gradient(135deg,#6B4FE8,#FF4E9A)', text: '<strong>@planetmoney</strong> liked your comment', time: '14m ago', thumb: true },
  { av: 'HI', color: 'linear-gradient(135deg,#00C4A4,#00A8FF)', text: '<strong>@howibuiltthis</strong> started following you', time: '1h ago', thumb: false },
];

const ACTIVITY_OLD = [
  { av: 'AM', color: 'linear-gradient(135deg,#FF4E9A,#FF8C5E)', text: '<strong>@alexmyers</strong> tipped you $5', time: '3h ago', thumb: true, icon: 'ti-coin' },
  { av: 'LW', color: 'linear-gradient(135deg,#5E9CFF,#7B5EFF)', text: '<strong>@lisawong</strong> saved your clip', time: '5h ago', thumb: true },
  { av: 'DK', color: 'linear-gradient(135deg,#7BFF5E,#00D4B4)', text: 'Your clip hit <strong>10K plays</strong> 🎉', time: 'Yesterday', thumb: false },
];

const LIVE_SESSIONS = [
  { title: 'Live Market Coverage — Fed Decision', host: 'CNBC Fast Money', listeners: '8,204', gifts: '142', color: 'linear-gradient(135deg,#00C4A4,#00A8FF)' },
  { title: 'VC Panel: What Investors Really Want', host: 'Sarah Michaels', listeners: '847', gifts: '32', color: 'linear-gradient(135deg,#6B4FE8,#FF4E9A)' },
  { title: 'Open Mic Comedy Night', host: 'Mike Davis', listeners: '512', gifts: '156', color: 'linear-gradient(135deg,#FFB347,#FF6B6B)' },
];

// Called once user logs in
function initApp() {
  buildDiscover();
  buildCreatePage();
  buildActivity();
  buildLive();
  buildFeed();
  loadRSSFeeds();
  wireAppEvents();
}

function wireAppEvents() {
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.onclick = () => switchView(item.dataset.view);
  });

  // Mobile nav
  document.querySelectorAll('.mob-item').forEach(item => {
    item.onclick = () => switchView(item.dataset.view);
  });

  // Feed tabs
  document.querySelectorAll('.feed-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.feed === 'following') showToast('Showing clips from people you follow');
    };
  });

  // Feed arrows
  document.getElementById('btn-prev').onclick = prevClip;
  document.getElementById('btn-next').onclick = nextClip;

  // Player bar
  document.getElementById('pb-play').onclick = () => togglePlay(clips[currentIdx]?.id);
  document.getElementById('pb-next').onclick = nextClip;
  document.getElementById('pb-rewind').onclick = () => rewind10(clips[currentIdx]?.id);
  document.getElementById('player-progress').onclick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clip = clips[currentIdx];
    if (clip) {
      clipProgress[clip.id] = pct;
      if (audioEl.duration) audioEl.currentTime = (pct / 100) * audioEl.duration;
      document.getElementById('player-fill').style.width = pct + '%';
    }
  };

  // Comments
  document.getElementById('modal-comments').onclick = (e) => {
    if (e.target === document.getElementById('modal-comments')) {
      document.getElementById('modal-comments').style.display = 'none';
    }
  };
  document.getElementById('btn-send-comment').onclick = sendComment;
  document.getElementById('comment-input').onkeydown = (e) => {
    if (e.key === 'Enter') sendComment();
  };

  // Create page
  document.getElementById('upload-btn').onclick = () => document.getElementById('file-upload').click();
  document.getElementById('file-upload').onchange = (e) => {
    const f = e.target.files[0];
    if (f) showToast('File loaded: ' + f.name);
  };
  document.getElementById('btn-publish').onclick = publishClip;
  document.getElementById('rec-btn').onclick = toggleRecord;
  document.getElementById('btn-create-first').onclick = () => switchView('create');

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (document.getElementById('page-app').style.display === 'none') return;
    if (e.key === 'ArrowDown') nextClip();
    if (e.key === 'ArrowUp') prevClip();
    if (e.key === ' ') { e.preventDefault(); togglePlay(clips[currentIdx]?.id); }
  });
}

// ── DISCOVER ──
function buildDiscover() {
  const CATS = ['All', 'News', 'Issues', 'Lifestyle', 'Entertainment', 'Philosophy', 'History'];
  const ICONS = { All: 'ti-apps', News: 'ti-news', Issues: 'ti-world', Lifestyle: 'ti-heart', Entertainment: 'ti-masks-theater', Philosophy: 'ti-yin-yang', History: 'ti-hourglass' };

  const catsEl = document.getElementById('discover-cats');
  CATS.forEach(cat => {
    const el = document.createElement('div');
    el.className = 'disc-cat' + (cat === 'All' ? ' active' : '');
    el.innerHTML = `<i class="ti ${ICONS[cat]}"></i>${cat}`;
    el.onclick = function () {
      document.querySelectorAll('.disc-cat').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      if (cat !== 'All') {
        const filtered = clips.filter(c => c.cat === cat);
        if (filtered.length) { clips = filtered; currentIdx = 0; buildFeed(); switchView('feed'); }
        else showToast('No ' + cat + ' clips yet');
      } else {
        loadRSSFeeds();
        switchView('feed');
      }
    };
    catsEl.appendChild(el);
  });

  const trendingEl = document.getElementById('trending-list');
  TRENDING.forEach(t => {
    const item = document.createElement('div');
    item.className = 'trend-item';
    item.innerHTML = `
      <span class="trend-rank">${t.rank}</span>
      <div>
        <div class="trend-name">${t.tag}</div>
        <div class="trend-count">${t.clips} clips</div>
      </div>
      <i class="ti ti-arrow-right" style="margin-left:auto;color:var(--muted);font-size:16px"></i>`;
    item.onclick = () => {
      switchView('feed');
      showToast('Showing ' + t.tag);
    };
    trendingEl.appendChild(item);
  });

  const creatorsEl = document.getElementById('creators-grid');
  CREATORS.forEach(c => {
    creatorsEl.innerHTML += `
      <div class="creator-card">
        <div class="big-av" style="background:${c.color}">${c.initials}</div>
        <div class="cr-name">${c.name}</div>
        <div class="cr-handle">${c.handle}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">${c.followers}</div>
        <button class="cr-follow" onclick="this.classList.toggle('following');this.textContent=this.classList.contains('following')?'Following':'Follow'">Follow</button>
      </div>`;
  });

  const searchInput = document.getElementById('discover-search');
  if (searchInput) {
    let searchTimeout;
    searchInput.oninput = (e) => {
      clearTimeout(searchTimeout);
      const q = e.target.value.trim();
      if (q.length > 2) {
        searchTimeout = setTimeout(async () => {
          showToast('Searching for "' + q + '"...');
          const results = await searchListenNotes(q, 'News');
          if (results.length > 0) {
            clips = results;
            currentIdx = 0;
            buildFeed();
            switchView('feed');
            showToast(results.length + ' results for "' + q + '"');
          } else {
            showToast('No results found');
          }
        }, 600);
      }
    };
  }
}

// ── CREATE ──
function buildCreatePage() {
  const vizEl = document.getElementById('rec-viz');
  for (let i = 0; i < 24; i++) {
    const b = document.createElement('div');
    b.className = 'rv-bar';
    b.style.height = '20px';
    vizEl.appendChild(b);
  }

  const durRow = document.getElementById('duration-row');
  ['30s', '60s', '3 min', '10 min'].forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'dur-btn' + (i === 0 ? ' active' : '');
    btn.textContent = d;
    btn.onclick = function () {
      document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    };
    durRow.appendChild(btn);
  });

  // Tool items
  document.querySelectorAll('.tool-item').forEach(item => {
    const label = item.querySelector('span')?.textContent;
    if (label && label !== 'Upload File') {
      item.onclick = () => showToast(label + ' coming soon');
    }
  });
}

function toggleRecord() {
  isRecording = !isRecording;
  const btn = document.getElementById('rec-btn');
  const icon = document.getElementById('rec-icon');
  const status = document.getElementById('rec-status');

  btn.classList.toggle('recording', isRecording);
  icon.className = 'ti ' + (isRecording ? 'ti-player-stop' : 'ti-microphone');
  status.textContent = isRecording ? 'Recording... tap to stop' : 'Tap to record';

  if (isRecording) {
    recSeconds = 0;
    recTimerInterval = setInterval(() => {
      recSeconds++;
      const m = Math.floor(recSeconds / 60);
      document.getElementById('rec-timer').textContent = `${m}:${String(recSeconds % 60).padStart(2, '0')}`;
    }, 1000);
    recAnimInterval = setInterval(() => {
      document.querySelectorAll('.rv-bar').forEach(b => { b.style.height = (6 + Math.random() * 68) + 'px'; });
    }, 120);
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
      }).catch(() => showToast('Microphone permission needed'));
    }
  } else {
    clearInterval(recTimerInterval);
    clearInterval(recAnimInterval);
    document.querySelectorAll('.rv-bar').forEach(b => { b.style.height = '20px'; });
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      showToast('Recording saved! Fill in details below.');
    }
  }
}

async function publishClip() {
  const title = document.getElementById('pub-title').value.trim();
  if (!title) { showToast('Please add a title'); return; }
  const btn = document.getElementById('btn-publish');
  btn.textContent = 'Publishing...';
  btn.disabled = true;
  try {
    if (currentUser && currentUser.id && !currentUser.id.startsWith('local-')) {
      await db.from('clips').insert({
        user_id: currentUser.id,
        title,
        description: document.getElementById('pub-desc').value.trim(),
        hashtags: document.getElementById('pub-tags').value.trim().split(' '),
        category: document.getElementById('pub-cat').value,
        status: 'published',
      });
    }
    showToast('Published to The Nile!');
    ['pub-title', 'pub-desc', 'pub-tags'].forEach(id => { document.getElementById(id).value = ''; });
    setTimeout(() => switchView('feed'), 1000);
  } catch (e) {
    showToast('Saved locally');
  } finally {
    btn.textContent = 'Publish to Sonair →';
    btn.disabled = false;
  }
}

// ── ACTIVITY ──
function buildActivity() {
  const newEl = document.getElementById('activity-new');
  const oldEl = document.getElementById('activity-old');

  ACTIVITY_NEW.forEach(a => {
    newEl.innerHTML += `
      <div class="activity-item">
        <div class="act-av" style="background:${a.color}">${a.av}</div>
        <div class="act-body">
          <div class="act-text">${a.text}</div>
          <div class="act-time">${a.time}</div>
        </div>
        ${a.thumb ? '<div class="act-thumb"><i class="ti ti-headphones"></i></div>' : ''}
      </div>`;
  });

  ACTIVITY_OLD.forEach(a => {
    oldEl.innerHTML += `
      <div class="activity-item">
        <div class="act-av" style="background:${a.color}">${a.av}</div>
        <div class="act-body">
          <div class="act-text">${a.text}</div>
          <div class="act-time">${a.time}</div>
        </div>
        ${a.thumb ? `<div class="act-thumb"><i class="ti ${a.icon || 'ti-headphones'}"></i></div>` : ''}
      </div>`;
  });
}

// ── LIVE ──
function buildLive() {
  const listEl = document.getElementById('live-list');
  LIVE_SESSIONS.forEach(s => {
    listEl.innerHTML += `
      <div class="live-card" onclick="showToast('Joining: ${s.title}')">
        <div class="live-pill"><div class="live-dot"></div>LIVE</div>
        <div class="live-card-title">${s.title}</div>
        <div class="live-card-host">${s.host}</div>
        <div class="live-card-stats">
          <span><i class="ti ti-users" style="font-size:14px"></i> ${s.listeners} listening</span>
          <span><i class="ti ti-gift" style="font-size:14px"></i> ${s.gifts} gifts</span>
        </div>
      </div>`;
  });

  document.getElementById('btn-go-live').onclick = () => showToast('Live broadcasting coming soon!');
}

// ── COMMENTS ──
function sendComment() {
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;
  if (!allComments[currentCommentClip]) allComments[currentCommentClip] = [];
  const meta = currentUser?.user_metadata || {};
  const handle = '@' + (meta.username || 'you');
  allComments[currentCommentClip].unshift({ user: handle, text, time: 'just now' });
  openComments(currentCommentClip);
  input.value = '';
}

// ── HEADER SEARCH ──
document.getElementById('btn-search-header').onclick = () => switchView('discover');

// ═══════════════════════════════════════
// CREATOR PROFILE
// ═══════════════════════════════════════

async function buildProfile() {
  if (!currentUser) return;

  const meta = currentUser.user_metadata || {};
  const name = meta.full_name || currentUser.email.split('@')[0];
  const username = meta.username || name.toLowerCase().replace(/\s+/g, '');
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Set cover watermark
  const coverText = document.getElementById('profile-cover-text');
  if (coverText) coverText.textContent = name.split(' ')[0];

  // Set avatar
  const av = document.getElementById('profile-avatar');
  if (av) av.textContent = initials;

  // Set name and handle
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-handle').textContent = '@' + username;

  // Set bio from Supabase if available
  let bio = 'Creator at The Nile · N.I.L.E.';
  let totalPlays = 0;
  let followerCount = 0;
  let followingCount = 0;
  let clipCount = 0;
  let userClips = [];

  if (currentUser.id) {
    try {
      // Fetch profile
      const { data: profile } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
      if (profile) {
        bio = profile.bio || bio;
        followerCount = profile.follower_count || 0;
        followingCount = profile.following_count || 0;
        totalPlays = profile.total_plays || 0;
      }

      // Fetch user's clips
      const { data: clipsData } = await db.from('clips').select('*').eq('user_id', currentUser.id).eq('status', 'published').order('created_at', { ascending: false });
      if (clipsData) {
        userClips = clipsData;
        clipCount = clipsData.length;
        totalPlays = clipsData.reduce((sum, c) => sum + (c.play_count || 0), 0);
      }
    } catch(e) {
      console.warn('Profile fetch error:', e);
    }
  }

  // Update bio
  document.getElementById('profile-bio').textContent = bio;

  // Update stats
  document.getElementById('stat-clips').textContent = clipCount;
  document.getElementById('stat-followers').textContent = followerCount >= 1000 ? (followerCount/1000).toFixed(1) + 'K' : followerCount;
  document.getElementById('stat-following').textContent = followingCount;
  document.getElementById('stat-plays').textContent = totalPlays >= 1000 ? (totalPlays/1000).toFixed(1) + 'K' : totalPlays;

  // Build tags
  const tagsEl = document.getElementById('profile-tags');
  if (tagsEl) {
    const tags = ['Creator', 'The Nile', 'N.I.L.E.'];
    tagsEl.innerHTML = tags.map(t => `<span class="profile-tag">${t}</span>`).join('');
  }

  // Build clips grid
  buildProfileClipsGrid(userClips, name, initials);

  // Build about section
  buildAboutSection(name, username, currentUser.email);

  // Wire up profile tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.onclick = function() {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.ptab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const target = document.getElementById('ptab-' + this.dataset.ptab);
      if (target) target.classList.add('active');
    };
  });

  // Edit profile button
  document.getElementById('btn-edit-profile').onclick = () => showToast('Edit profile coming soon');

  // Share button
  document.getElementById('btn-share-profile').onclick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href + '?profile=' + username);
      showToast('Profile link copied!');
    }
  };
}

function buildProfileClipsGrid(clips, name, initials) {
  const grid = document.getElementById('profile-clips-grid');
  if (!grid) return;

  if (!clips || clips.length === 0) {
    grid.innerHTML = `
      <div class="profile-empty">
        <i class="ti ti-microphone"></i>
        <p>No clips yet. Contribute your first.</p>
        <button class="btn-primary" onclick="switchView('create')">Contribute a Clip</button>
      </div>`;
    return;
  }

  grid.innerHTML = clips.map(clip => {
    const catImgs = {
      'Philosophy': 'photo-1571019613454-1cb2f99b2d8b',
      'Business': 'photo-1454165804606-c3d57bc86b40',
      'Literature': 'photo-1481627834876-b7833e8f5570',
      'History': 'photo-1461360228754-6e81c478b882',
      'Education': 'photo-1503676260728-1c00da094a0b',
      'Stories': 'photo-1513836279014-a89f7a76ae86',
    };
    const imgId = catImgs[clip.category] || 'photo-1503676260728-1c00da094a0b';
    const imgUrl = 'https://images.unsplash.com/' + imgId + '?w=400&q=80&fit=crop';
    return `
    <div class="profile-clip-card" onclick="playClipFromProfile('${clip.id}')">
      <img class="profile-clip-img" src="${imgUrl}" alt="${clip.title}" loading="lazy" onerror="this.style.display='none'">
      <div class="pcc-cat">${clip.category || 'General'}</div>
      <div class="pcc-title">${clip.title}</div>
      <div class="pcc-desc">${clip.description || ''}</div>
      <div class="pcc-meta">
        <div class="pcc-stats">
          <span><i class="ti ti-player-play" style="font-size:12px"></i>${clip.play_count || 0}</span>
          <span><i class="ti ti-heart" style="font-size:12px"></i>${clip.like_count || 0}</span>
        </div>
        <div class="pcc-duration">${formatDuration(clip.duration_seconds || 0)}</div>
        <div class="pcc-play"><i class="ti ti-player-play"></i></div>
      </div>
    </div>`;
  }).join('');
}

function buildAboutSection(name, username, email) {
  const el = document.getElementById('about-section');
  if (!el) return;
  el.innerHTML = `
    <div class="about-field">
      <div class="about-label">Creator</div>
      <div class="about-value" style="font-family:var(--font-serif);font-size:20px;font-weight:800;font-style:italic">${name}</div>
    </div>
    <div class="about-field">
      <div class="about-label">Handle</div>
      <div class="about-value">@${username}</div>
    </div>
    <div class="about-field">
      <div class="about-label">Platform</div>
      <div class="about-value">The Nile — News. Issues. Lifestyle. Entertainment.</div>
    </div>
    <div class="about-field">
      <div class="about-label">Member Since</div>
      <div class="about-value">${new Date().toLocaleDateString('en-US', {month:'long', year:'numeric'})}</div>
    </div>
    <div class="about-field">
      <div class="about-label">Contribute</div>
      <div class="about-value">
        <button class="btn-primary" onclick="switchView('create')" style="margin-top:4px">Record a New Clip</button>
      </div>
    </div>`;
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return s + ' sec';
  if (s === 0) return m + ' min';
  return m + ' min ' + s + ' sec';
}

function playClipFromProfile(clipId) {
  switchView('feed');
  setTimeout(() => {
    const card = document.getElementById('card-' + clipId);
    if (card) card.scrollIntoView({ behavior: 'smooth' });
    togglePlay(clipId);
  }, 300);
}

// Override switchView to build profile when navigating to it
const _origSwitchView = switchView;
switchView = function(viewName) {
  _origSwitchView(viewName);
  if (viewName === 'profile') buildProfile();
};
