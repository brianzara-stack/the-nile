// ═══════════════════════════════════════
// SONAIR — CONFIG
// ═══════════════════════════════════════

const SUPABASE_URL = 'https://xrejvtgnbalplueskgij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZWp2dGduYmFscGx1ZXNrZ2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU4MjIsImV4cCI6MjA5NjAwMTgyMn0.3NI9k5h_-kMRJh8FSlC4irSXReciHJEXtUjZdtYy7OM';

// Initialize Supabase
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state
let currentUser = null;

// Toast notification
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// Switch app views
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + viewName);
  if (view) view.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === viewName);
  });

  // Update mobile nav
  document.querySelectorAll('.mob-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === viewName);
  });
}

// Update user info in sidebar and profile
function updateUserUI(user) {
  const meta = user.user_metadata || {};
  const name = meta.full_name || user.email.split('@')[0];
  const username = meta.username || name.toLowerCase().replace(/\s+/g, '');
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  document.getElementById('sidebar-avatar').textContent = initials;
  document.getElementById('sidebar-name').textContent = name;
  document.getElementById('sidebar-handle').textContent = '@' + username;
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-handle').textContent = '@' + username;
}
