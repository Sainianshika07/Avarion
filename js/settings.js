// Avarion Settings Helper
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Settings Icon into Navbar
  const nav = document.querySelector('.navbar .container-wide') || document.querySelector('.navbar .container');
  if (nav) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost btn-sm';
    btn.style.padding = '8px 12px';
    btn.style.marginLeft = '12px';
    btn.innerHTML = '⚙️ Settings';
    btn.title = 'Ava AI Configuration';
    btn.addEventListener('click', openSettingsModal);
    
    // Insert into nav actions area
    const linksDiv = nav.querySelector('div[style*="margin-left:auto"]') || nav.querySelector('.nav-links') || nav;
    linksDiv.insertBefore(btn, linksDiv.firstChild);
  }

  // 2. Inject Modal Overlay HTML into Body
  const overlay = document.createElement('div');
  overlay.id = 'settingsModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="settings-modal anim-fade-in-up" style="max-width:440px; padding:28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%; border-bottom:1px solid var(--clr-border); padding-bottom:12px; margin-bottom:12px;">
        <h3 class="heading-3" style="margin:0; font-family:var(--font-display);">⚙️ Ava AI Config</h3>
        <button class="btn btn-ghost btn-sm" id="closeSettingsBtn" style="margin-left:auto; padding:4px 8px; font-size:1.1rem; border:none; background:none; cursor:pointer; color:var(--clr-text-3);">✕</button>
      </div>
      <p class="body-sm text-muted" style="margin-bottom:16px; line-height:1.5; text-align:left;">
        Avarion runs on **Google Gemini 1.5 Flash**. Provide your own Google Gemini API Key to experience custom real-time style advice, computer vision face processing, and dynamic trends without backend locks.
      </p>
      <div style="display:flex; flex-direction:column; gap:8px; text-align:left;">
        <label class="body-sm" style="font-weight:600;">Gemini API Key</label>
        <input type="password" id="geminiApiKeyInput" placeholder="AIzaSy..." style="background:var(--clr-surface); border:1px solid var(--clr-border); border-radius:var(--radius-md); padding:12px; color:var(--clr-text); font-family:monospace; outline:none; font-size:0.875rem;" />
      </div>
      <div class="body-sm" style="display:flex; gap:6px; align-items:center; color:var(--clr-teal); margin-top:8px;">
        <span>🔒</span> Stored securely in your browser's LocalStorage.
      </div>
      <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-ghost btn-sm" id="clearSettingsBtn">Clear Key</button>
        <button class="btn btn-primary btn-sm" id="saveSettingsBtn">Save Key</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Set initial value
  const savedKey = localStorage.getItem('avarionApiKey') || '';
  document.getElementById('geminiApiKeyInput').value = savedKey;

  // Bind close events
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettingsModal();
  });

  // Save
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    if (key) {
      localStorage.setItem('avarionApiKey', key);
      showSettingsToast('🔑 API key saved successfully!', 'success');
    } else {
      localStorage.removeItem('avarionApiKey');
      showSettingsToast('🔑 API key cleared!', 'success');
    }
    closeSettingsModal();
    // Reload recommendations or page to apply changes
    if (window.loadAIRecommendations) loadAIRecommendations();
    else setTimeout(() => window.location.reload(), 1000);
  });

  // Clear
  document.getElementById('clearSettingsBtn').addEventListener('click', () => {
    localStorage.removeItem('avarionApiKey');
    document.getElementById('geminiApiKeyInput').value = '';
    showSettingsToast('🔑 API key cleared!', 'success');
    closeSettingsModal();
    setTimeout(() => window.location.reload(), 1000);
  });

  function openSettingsModal() {
    overlay.classList.add('show');
  }

  function closeSettingsModal() {
    overlay.classList.remove('show');
  }

  function showSettingsToast(msg, type) {
    if (window.showToast) {
      window.showToast(msg, type);
    } else {
      // Inline simple toast fallback
      const t = document.createElement('div');
      t.className = 'toast show ' + type;
      t.innerHTML = `<span>✅</span><span>${msg}</span>`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
  }
});

// Global header generator
window.getApiKeyHeader = function() {
  const key = localStorage.getItem('avarionApiKey');
  return key ? { 'x-gemini-key': key } : {};
};
