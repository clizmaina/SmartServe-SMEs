// Lightweight AI Assistant UI (local-only, no external APIs)
(function () {
  const tpl = `
  .ai-toast-wrap{position:fixed;right:18px;bottom:18px;display:flex;flex-direction:column;gap:10px;z-index:99999}
  .ai-toast{min-width:260px;max-width:360px;background:linear-gradient(135deg,#1f2937,#111827);color:#fff;border-radius:10px;padding:12px 14px;box-shadow:0 8px 30px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.04);font-family:Arial,Helvetica,sans-serif}
  .ai-toast h4{margin:0 0 6px;font-size:14px;color:#f3d27a}
  .ai-toast p{margin:0;font-size:13px;color:#e6e6e6}
  .ai-toast .ai-close{position:absolute;right:8px;top:6px;cursor:pointer;color:rgba(255,255,255,0.6)}
  `;

  function injectStyles() {
    if (document.getElementById('ai-toast-styles')) return;
    const s = document.createElement('style');
    s.id = 'ai-toast-styles';
    s.innerHTML = tpl;
    document.head.appendChild(s);
  }

  function createContainer() {
    let c = document.getElementById('ai-toast-wrap');
    if (!c) {
      c = document.createElement('div');
      c.id = 'ai-toast-wrap';
      c.className = 'ai-toast-wrap';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(title, message, opts = {}) {
    injectStyles();
    const wrap = createContainer();
    const el = document.createElement('div');
    el.className = 'ai-toast';
    el.innerHTML = `<div style="position:relative"><span class=\"ai-close\">✖</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(message)}</p></div>`;
    wrap.appendChild(el);
    el.querySelector('.ai-close').addEventListener('click', () => el.remove());
    const duration = opts.duration || 6000;
    if (duration > 0) setTimeout(() => el.remove(), duration);
  }

  function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showHypeMessage(name, action) {
    const who = name || 'friend';
    const msg = action && action.toLowerCase().includes('pay')
      ? `Thanks ${who}! Your payment went through — we\'re getting to work.`
      : `Great choice, ${who}! Keep up the spirit — we\'re on it.`;
    showToast('SmartServe AI', msg, { duration: 7000 });
  }

  // ---------- Inventory analysis & insight panel ----------
  function analyzeInventory(data) {
    if (!data || !data.stats) return 'No inventory data available to analyze.';
    const s = data.stats;
    const parts = [];
    parts.push(`Customers: ${s.totalCustomers ?? 0}`);
    parts.push(`Designs: ${s.totalDesigns ?? 0}`);
    parts.push(`Measurements: ${s.totalMeasurements ?? 0}`);
    parts.push(`Previews: ${s.totalPreviews ?? 0}`);
    parts.push(`Pick-ups: ${s.pickupCount ?? 0}`);
    parts.push(`Deliveries: ${s.deliveryCount ?? 0}`);

    // Quick suggestions
    const suggestions = [];
    if ((s.deliveryCount ?? 0) > (s.pickupCount ?? 0)) suggestions.push('More customers prefer Delivery — consider scheduling more drop-offs.');
    if ((s.totalDesigns ?? 0) > (s.totalMeasurements ?? 0)) suggestions.push('You have many designs but fewer measurements — follow up with customers for measurements.');
    if ((s.totalPreviews ?? 0) < 3 && (s.totalDesigns ?? 0) > 0) suggestions.push('Few previews available — share more previews to boost confidence.');

    return parts.join(' · ') + (suggestions.length ? '\n\nSuggestions:\n- ' + suggestions.join('\n- ') : '');
  }

  function showInsight(title, message) {
    injectStyles();
    // create a persistent panel at top-right
    let panel = document.getElementById('ai-insight-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'ai-insight-panel';
      panel.style.position = 'fixed';
      panel.style.right = '18px';
      panel.style.top = '18px';
      panel.style.zIndex = 99998;
      panel.style.maxWidth = '420px';
      document.body.appendChild(panel);
    }
    panel.innerHTML = `<div class="ai-toast" style="background:linear-gradient(135deg,#0b1220,#09101a);border-left:4px solid #d4a843;">
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <div style="flex:1"><h4>${escapeHtml(title)}</h4><p style="white-space:pre-wrap;font-size:13px;color:#dfe7f0;margin-top:6px;">${escapeHtml(message)}</p></div>
          <div style="margin-left:6px;cursor:pointer;color:rgba(255,255,255,0.6);font-size:14px;" id="ai-insight-close">✖</div>
        </div>
      </div>`;
    const close = document.getElementById('ai-insight-close');
    if (close) close.addEventListener('click', () => panel.remove());
  }

  // Expose global API
  window.aiAssistant = {
    showToast,
    showHypeMessage,
    analyzeInventory,
    showInsight
  };

  // Auto-init container on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createContainer);
  else createContainer();
})();
