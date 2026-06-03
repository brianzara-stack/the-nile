// ═══════════════════════════════════════
// SONAIR — AUTH
// ═══════════════════════════════════════

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideAuthMessages() {
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
}

function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  el.textContent = msg;
  el.style.display = 'block';
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function switchAuthTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  hideAuthMessages();
}

function enterApp(user) {
  currentUser = user;
  document.getElementById('page-landing').style.display = 'none';
  document.getElementById('page-app').style.display = 'flex';
  closeModal('modal-auth');
  updateUserUI(user);
  initApp();
}

// ── LOGIN ──
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAuthMessages();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login-submit');

  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    enterApp(data.user);
    showToast('Welcome back! 👋');
  } catch (err) {
    showAuthError(err.message || 'Login failed. Check your email and password.');
  } finally {
    btn.textContent = 'Sign In →';
    btn.disabled = false;
  }
});

// ── SIGNUP ──
document.getElementById('form-signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAuthMessages();

  const name = document.getElementById('signup-name').value.trim();
  const username = document.getElementById('signup-username').value.trim().replace('@', '');
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const btn = document.getElementById('btn-signup-submit');

  if (!name || !username || !email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }

  btn.textContent = 'Creating account...';
  btn.disabled = true;

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username }
      }
    });

    if (error) throw error;

    if (data.user) {
      enterApp(data.user);
      showToast('Welcome to Sonair! 🎙️');
    } else {
      // Email confirmation required
      showAuthSuccess('Account created! Check your email to confirm, then sign in.');
      switchAuthTab('login');
    }
  } catch (err) {
    showAuthError(err.message || 'Signup failed. Please try again.');
  } finally {
    btn.textContent = 'Create Account →';
    btn.disabled = false;
  }
});

// ── GOOGLE AUTH ──
async function handleGoogleAuth() {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
  if (error) showAuthError(error.message);
}

// ── SIGN OUT ──
async function handleSignOut() {
  await db.auth.signOut();
  currentUser = null;
  document.getElementById('page-app').style.display = 'none';
  document.getElementById('page-landing').style.display = 'block';
  showToast('Signed out');
}

// ── SESSION CHECK ──
async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    enterApp(session.user);
  }

  // Listen for auth changes
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session && !currentUser) {
      enterApp(session.user);
    }
  });
}

// ── WIRE UP BUTTONS ──
document.addEventListener('DOMContentLoaded', () => {
  // Landing page buttons
  document.getElementById('btn-signin').onclick = () => { openModal('modal-auth'); switchAuthTab('login'); };
  document.getElementById('btn-signup').onclick = () => { openModal('modal-auth'); switchAuthTab('signup'); };
  document.getElementById('btn-cta').onclick = () => { openModal('modal-auth'); switchAuthTab('signup'); };
  document.getElementById('btn-close-auth').onclick = () => closeModal('modal-auth');

  // Auth tab switching
  document.getElementById('tab-login').onclick = () => switchAuthTab('login');
  document.getElementById('tab-signup').onclick = () => switchAuthTab('signup');
  document.getElementById('link-to-signup').onclick = (e) => { e.preventDefault(); switchAuthTab('signup'); };
  document.getElementById('link-to-login').onclick = (e) => { e.preventDefault(); switchAuthTab('login'); };

  // Google auth
  document.getElementById('btn-google-login').onclick = handleGoogleAuth;
  document.getElementById('btn-google-signup').onclick = handleGoogleAuth;

  // Sign out
  document.getElementById('btn-signout').onclick = handleSignOut;

  // Waitlist
  document.getElementById('btn-waitlist').onclick = () => {
    const email = document.getElementById('waitlist-email').value.trim();
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    const span = document.getElementById('waitlist-num');
    span.textContent = (parseInt(span.textContent.replace(',', '')) + 1).toLocaleString();
    document.getElementById('waitlist-email').value = '';
    showToast("You're on the list! 🎙️");
  };

  // Close modal when clicking outside
  document.getElementById('modal-auth').onclick = (e) => {
    if (e.target === document.getElementById('modal-auth')) closeModal('modal-auth');
  };

  // Check for existing session on load
  checkSession();
});
