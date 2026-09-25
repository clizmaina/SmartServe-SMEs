/**
 * business-chat-ai.js
 * Shared Chat + AI Assistant module for all SmartServe SME dashboards
 * (Agrovet, Boutique, Cyber, Hardware, Restaurant, Salon)
 */

(function () {
  /* ─────────────── helpers ─────────────── */
  function getBase() {
    return (typeof window.SERVER_BASE !== 'undefined' && window.SERVER_BASE)
      ? window.SERVER_BASE
      : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:5501`
        : 'https://smartserve-smes.onrender.com');
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /* ─────────────── CSS injection ─────────────── */
  function injectStyles() {
    if (document.getElementById('bca-styles')) return;
    const s = document.createElement('style');
    s.id = 'bca-styles';
    s.textContent = `
      /* ── Chat ── */
      .bca-chat-wrap { display:flex; flex-direction:column; height:420px; }
      .bca-chat-msgs { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; background:rgba(0,0,0,0.25); border-radius:10px; margin-bottom:12px; }
      .bca-bubble { max-width:75%; padding:10px 14px; border-radius:18px; font-size:0.88rem; line-height:1.5; word-break:break-word; }
      .bca-bubble.me { align-self:flex-end; background:rgba(120,60,180,0.7); color:#fff; border-bottom-right-radius:4px; }
      .bca-bubble.them { align-self:flex-start; background:rgba(255,255,255,0.15); color:#f0f0f0; border-bottom-left-radius:4px; }
      .bca-bubble .bca-sender { font-size:0.72rem; opacity:0.65; margin-bottom:3px; }
      .bca-bubble .bca-time { font-size:0.68rem; opacity:0.5; margin-top:4px; text-align:right; }
      .bca-input-row { display:flex; gap:8px; }
      .bca-input-row textarea { flex:1; resize:none; height:44px; padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.1); color:#fff; font-family:'Poppins',sans-serif; font-size:0.88rem; }
      .bca-input-row textarea::placeholder { color:rgba(255,255,255,0.4); }
      .bca-send-btn { padding:0 20px; border-radius:10px; background:linear-gradient(135deg,#7b2d8b,#a855c8); color:#fff; border:none; font-weight:600; cursor:pointer; transition:all 0.25s; white-space:nowrap; }
      .bca-send-btn:hover { transform:scale(1.05); }
      .bca-empty { color:rgba(255,255,255,0.35); font-size:0.85rem; text-align:center; margin:auto; }

      /* ── AI Assistant panel ── */
      .bca-ai-wrap { display:flex; flex-direction:column; gap:18px; }
      .bca-ai-welcome { background:linear-gradient(135deg,rgba(212,168,67,0.12),rgba(212,168,67,0.04)); border:1px solid rgba(212,168,67,0.3); border-radius:14px; padding:20px 24px; }
      .bca-ai-welcome h3 { color:#f0d070; font-size:1.05rem; margin-bottom:8px; }
      .bca-ai-welcome p { color:rgba(255,255,255,0.7); font-size:0.88rem; line-height:1.6; margin:0; }
      .bca-chip-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:4px; }
      .bca-chip { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:6px 14px; font-size:0.8rem; color:#e0e0e0; cursor:pointer; transition:all 0.2s; }
      .bca-chip:hover { background:rgba(255,255,255,0.2); transform:translateY(-2px); }
      .bca-ai-box { display:flex; flex-direction:column; gap:10px; }
      .bca-ai-box textarea { width:100%; resize:none; height:80px; padding:12px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.1); color:#fff; font-family:'Poppins',sans-serif; font-size:0.88rem; }
      .bca-ai-box textarea::placeholder { color:rgba(255,255,255,0.4); }
      .bca-ai-btn { align-self:flex-start; padding:10px 28px; border-radius:10px; font-weight:600; cursor:pointer; border:none; transition:all 0.25s; }
      .bca-ai-btn:hover { transform:scale(1.04); }
      .bca-ai-answer { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:16px 20px; font-size:0.88rem; color:rgba(255,255,255,0.85); line-height:1.7; white-space:pre-wrap; display:none; }
      .bca-ai-answer.visible { display:block; }
      .bca-ai-loading { color:rgba(255,255,255,0.45); font-size:0.85rem; font-style:italic; }

      /* ── Analytics panel ── */
      .bca-analytics-wrap { display:flex; flex-direction:column; gap:16px; }
      .bca-stat-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; }
      .bca-stat-box { background:rgba(255,255,255,0.1); border-radius:10px; padding:18px; text-align:center; }
      .bca-stat-box .bca-num { font-size:1.6rem; font-weight:700; }
      .bca-stat-box .bca-lbl { font-size:0.75rem; opacity:0.7; margin-top:4px; }
      .bca-insight-box { background:rgba(212,168,67,0.07); border:1px solid rgba(212,168,67,0.25); border-radius:12px; padding:18px 22px; font-size:0.87rem; color:rgba(255,255,255,0.8); line-height:1.75; white-space:pre-wrap; }
      .bca-insight-box h4 { color:#f0d070; margin-bottom:10px; font-size:0.95rem; }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────── CHAT ─────────────── */

  /**
   * Render chat HTML into a container element.
   * @param {string} containerId  - id of the element to render into
   * @param {string} businessType - e.g. 'agrovet','salon','restaurant','hardware','cyber','boutique'
   * @param {string} senderRole   - 'customer' or 'provider'
   * @param {string} accentColor  - CSS color for the send button
   */
  function renderChat(containerId, businessType, senderRole, accentColor) {
    injectStyles();
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = `
      <div class="bca-chat-wrap">
        <div class="bca-chat-msgs" id="bca-msgs-${containerId}">
          <p class="bca-empty">No messages yet. Start the conversation!</p>
        </div>
        <div class="bca-input-row">
          <textarea id="bca-input-${containerId}" placeholder="Type a message…" rows="1"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window.bcaSend('${containerId}','${businessType}','${senderRole}');}"></textarea>
          <button class="bca-send-btn" style="background:linear-gradient(135deg,${accentColor},${accentColor}cc);"
            onclick="window.bcaSend('${containerId}','${businessType}','${senderRole}')">Send ➤</button>
        </div>
      </div>`;
  }

  function loadChat(containerId, businessType, customerId, providerId) {
    if (!customerId || !providerId) return;
    const box = document.getElementById(`bca-msgs-${containerId}`);
    if (!box) return;
    fetch(`${getBase()}/biz-chat/${businessType}/${customerId}/${providerId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        box.innerHTML = '';
        if (data.success && data.messages && data.messages.length) {
          const myRole = box.closest('.bca-chat-wrap')
            ? box.closest('[data-sender]')?.dataset.sender || 'customer'
            : 'customer';
          data.messages.forEach(m => appendBubble(box, m.sender, m.message, m.timestamp, myRole));
          box.scrollTop = box.scrollHeight;
        } else {
          box.innerHTML = '<p class="bca-empty">No messages yet. Start the conversation!</p>';
        }
      })
      .catch(() => {
        if (box) box.innerHTML = '<p class="bca-empty">Could not load messages.</p>';
      });
  }

  function appendBubble(box, sender, message, timestamp, myRole) {
    const isMe = sender === myRole;
    const div = document.createElement('div');
    div.className = `bca-bubble ${isMe ? 'me' : 'them'}`;
    div.innerHTML = `
      <div class="bca-sender">${escHtml(sender)}</div>
      <div>${escHtml(message)}</div>
      <div class="bca-time">${fmtTime(timestamp)}</div>`;
    box.appendChild(div);
  }

  window.bcaSend = function (containerId, businessType, senderRole) {
    const input = document.getElementById(`bca-input-${containerId}`);
    const message = (input?.value || '').trim();
    if (!message) return;

    const customerId = window._bcaCustomerId;
    const providerId = window._bcaProviderId;
    if (!customerId || !providerId) {
      alert('Please select a provider first.'); return;
    }

    const box = document.getElementById(`bca-msgs-${containerId}`);
    // Optimistic append
    if (box) {
      const empties = box.querySelectorAll('.bca-empty');
      empties.forEach(e => e.remove());
      appendBubble(box, senderRole, message, new Date().toISOString(), senderRole);
      box.scrollTop = box.scrollHeight;
    }
    input.value = '';

    fetch(`${getBase()}/biz-chat/${businessType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ customerId, providerId, sender: senderRole, message })
    })
    .then(r => r.json())
    .then(d => { if (!d.success) console.warn('Chat send failed:', d.message); })
    .catch(e => console.error('Chat error:', e));
  };

  /* ─────────────── AI ASSISTANT ─────────────── */

  const AI_CONFIGS = {
    agrovet: {
      accent: '#388e3c',
      welcome: 'Welcome to SmartServe Agrovet! 🌱 I\'m your AI farming assistant. I can help you choose the right seeds, fertilisers, animal feeds and drugs — and advise on crop seasons and livestock care.',
      chips: [
        { label: '🌱 Best crops this season', q: 'What are the best crops to plant this season in Kenya?' },
        { label: '🐄 Dairy cow feeding', q: 'What is the best feeding programme for a dairy cow?' },
        { label: '🐛 Pest control tips', q: 'How do I control pests on my maize crop organically?' },
        { label: '💊 Poultry vaccination', q: 'What vaccines does my poultry flock need?' },
        { label: '🌧️ Irrigation advice', q: 'When should I irrigate my vegetable garden?' },
        { label: '🧪 Fertiliser guide', q: 'What is the difference between DAP and CAN fertiliser?' },
      ],
      systemPrompt: `You are an expert agronomist and veterinarian with 20+ years of experience in Kenyan agriculture. You specialize in:
- Crop farming: maize, beans, tomatoes, potatoes, vegetables, fruit trees
- Seeds, fertilisers (DAP, CAN, NPK), pesticides, and herbicides — brands available in Kenya
- Livestock: dairy cows, beef cattle, goats, sheep, pigs, poultry (layers & broilers)
- Animal health: common diseases, vaccines, dewormers, acaricides
- Irrigation systems: drip, furrow, sprinkler
- Seasonal farming calendar for different Kenyan regions
- Agrovet products, dosages, and prices
Give practical, specific, actionable advice relevant to Kenyan farmers. Keep it simple and friendly.`
    },
    boutique: {
      accent: '#9c27b0',
      welcome: 'Welcome to SmartServe Boutique! 👗 I\'m your personal fashion AI. I can help you find the perfect outfit, suggest styles for any occasion, and guide you through our product catalogue.',
      chips: [
        { label: '👗 Outfit for a wedding', q: 'What outfit should I wear to a Kenyan wedding as a guest?' },
        { label: '👔 Office wear ideas', q: 'Suggest smart casual office outfits for a woman.' },
        { label: '🎨 Colour matching', q: 'How do I match colours when building an outfit?' },
        { label: '👠 Accessories guide', q: 'How do I choose the right shoes and bag for a formal event?' },
        { label: '📏 Sizing help', q: 'How do I take my measurements for online shopping?' },
        { label: '🌍 Ankara styles', q: 'What are trending Ankara print styles in Kenya right now?' },
      ],
      systemPrompt: `You are an expert fashion consultant and personal stylist with deep knowledge of Kenyan and African fashion. You specialize in:
- Outfit recommendations for different occasions: weddings, office, casual, church, parties, graduation
- African fashion: Ankara prints, kitenge, kente, leso, and other Kenyan fabrics and styles
- Body type dressing and what styles flatter different shapes
- Color coordination, pattern mixing, and accessorizing
- Boutique stock: dresses, blouses, trousers, skirts, suits, shoes, bags, accessories
- Sizing, fitting, and how to take measurements
- Fashion trends in Kenya and East Africa
Give warm, personalized, practical style advice. Be enthusiastic and encouraging.`
    },
    cyber: {
      accent: '#00aa00',
      welcome: 'Welcome to SmartServe Cyber Café! 💻 I\'m your digital assistant. I can help you with computer bookings, printing, scanning, and guide you through any digital services you need.',
      chips: [
        { label: '💻 How to book a PC', q: 'How do I book a computer session at a cyber café?' },
        { label: '🖨️ Print costs', q: 'What is the typical cost of printing and scanning at a cyber café in Kenya?' },
        { label: '📧 Email setup', q: 'How do I set up a Gmail account for the first time?' },
        { label: '📄 CV writing tips', q: 'How do I write a professional CV for a job application in Kenya?' },
        { label: '🔒 Internet safety', q: 'How do I stay safe when using a shared computer at a cyber café?' },
        { label: '📱 M-Pesa online', q: 'How do I pay for services using M-Pesa online?' },
      ],
      systemPrompt: `You are a helpful digital literacy assistant and cyber café guide. You specialize in:
- Computer basics: typing, internet browsing, email, printing, scanning
- Common software: Microsoft Word, Excel, PowerPoint, Google Docs
- Internet services popular in Kenya: M-Pesa online, eCitizen, NHIF, NSSF portals
- CV writing, job applications, and sending emails
- Cyber security: safe browsing, password tips, avoiding scams
- Photo editing basics, form filling, and document formatting
- Booking and session management at cyber cafés
Be patient, clear, and beginner-friendly. Use simple language.`
    },
    hardware: {
      accent: '#2e7d32',
      welcome: 'Welcome to SmartServe Hardware! 🔧 I\'m your building & construction AI assistant. I can help you estimate materials, understand product specifications, and guide your project planning.',
      chips: [
        { label: '🏗️ Building materials needed', q: 'What materials do I need to build a 3-bedroom house in Kenya?' },
        { label: '🧱 How much cement?', q: 'How many bags of cement do I need for a 100sqm floor slab?' },
        { label: '🪵 Timber vs metal roofing', q: 'What are the pros and cons of timber vs iron sheet roofing?' },
        { label: '⚡ Electrical basics', q: 'What electrical materials do I need to wire a 3-bedroom house?' },
        { label: '🚿 Plumbing guide', q: 'What plumbing materials do I need for a bathroom and kitchen?' },
        { label: '🎨 Paint calculator', q: 'How many litres of paint do I need for a 4-room house?' },
      ],
      systemPrompt: `You are an expert hardware and construction consultant with deep knowledge of the Kenyan building industry. You specialize in:
- Building materials: cement (Bamburi, Savannah, ARM), steel, timber, roofing sheets, blocks, bricks
- Material quantity estimations: concrete mixes, paint coverage, pipe lengths, tile coverage
- Electrical materials: cables, conduits, sockets, circuit breakers — Kenyan standards
- Plumbing: pipes (PVC, galvanized, CPVC), fittings, taps, water tanks
- Tools: hand tools vs power tools, what to use for each job
- Construction best practices and safety
- Kenyan market prices and where to source materials in major towns
Give practical advice with quantities and estimates. Be helpful to both professionals and first-time builders.`
    },
    restaurant: {
      accent: '#c0392b',
      welcome: 'Welcome to SmartServe Restaurant! 🍽️ I\'m your dining assistant. I can help you explore our menu, suggest meals based on your preferences, and answer any questions about our food and services.',
      chips: [
        { label: '🍗 Recommend a meal', q: 'Recommend a hearty Kenyan meal for lunch.' },
        { label: '🥗 Healthy options', q: 'What are good healthy meal options at a Kenyan restaurant?' },
        { label: '🎂 Birthday booking', q: 'How do I book a table for a birthday celebration?' },
        { label: '🌿 Vegetarian options', q: 'What vegetarian meals are popular in Kenya?' },
        { label: '🍹 Popular drinks', q: 'What are popular non-alcoholic drinks at Kenyan restaurants?' },
        { label: '📦 Takeaway & delivery', q: 'How does food delivery and takeaway typically work in Kenya?' },
      ],
      systemPrompt: `You are a friendly restaurant assistant and food expert specializing in Kenyan and East African cuisine. You know:
- Kenyan dishes: nyama choma, ugali, sukuma wiki, pilau, biryani, githeri, mutura, mandazi, chapati, samosa
- International dishes: burgers, pizza, pasta, grilled chicken, salads, soups
- Dietary needs: vegetarian, vegan, halal, gluten-free options
- Beverages: fresh juices, smoothies, chai, coffee, sodas
- Table reservations, special occasions, and event catering
- Food pricing ranges in Kenyan restaurants
- Healthy eating tips and meal pairing suggestions
Be warm, welcoming, and make customers feel hungry and excited about the food!`
    },
    salon: {
      accent: '#b43c78',
      welcome: 'Welcome to SmartServe Salon! 💇 I\'m your beauty and style AI assistant. I can help you choose the right haircut, colour, or treatment — and advise on skincare and beauty tips tailored for you.',
      chips: [
        { label: '💇 Best hairstyle for me', q: 'How do I choose the best hairstyle for my face shape?' },
        { label: '🎨 Hair colour advice', q: 'What hair colour would suit a dark-skinned woman with natural hair?' },
        { label: '🌀 Protective styles', q: 'What are popular protective hairstyles for natural African hair?' },
        { label: '🧴 Hair care routine', q: 'What is a good weekly hair care routine for damaged hair?' },
        { label: '💅 Nail art trends', q: 'What are the latest nail art trends in Kenya?' },
        { label: '🧖 Skin care tips', q: 'What is a good basic skincare routine for African skin?' },
      ],
      systemPrompt: `You are an expert hair stylist, beauty consultant, and skincare advisor specializing in African and Kenyan beauty. You know:
- Hairstyling: haircuts, braids, weaves, wigs, locs, natural hair care, perms, relaxers
- Hair treatments: deep conditioning, protein treatments, scalp care for different hair types
- Hair colour: highlights, balayage, full colour — what works for different skin tones
- Nail care: manicure, pedicure, gel nails, nail art, acrylic nails
- Skincare: routines for different skin types, dark spots, hyperpigmentation, moisturizing
- Beauty treatments: facials, eyebrow shaping, eyelash extensions, waxing
- Kenyan beauty trends, local products, and pricing
Be upbeat, encouraging, and make clients feel excited about their beauty journey!`
    }
  };

  /**
   * Render the AI assistant panel into a container.
   * @param {string} containerId
   * @param {string} businessType
   */
  function renderAI(containerId, businessType) {
    injectStyles();
    const c = document.getElementById(containerId);
    if (!c) return;
    const cfg = AI_CONFIGS[businessType] || AI_CONFIGS.agrovet;
    const chipsHtml = cfg.chips.map(ch =>
      `<span class="bca-chip" onclick="window.bcaSetQ('${containerId}','${escHtml(ch.q)}')">${escHtml(ch.label)}</span>`
    ).join('');

    c.innerHTML = `
      <div class="bca-ai-wrap">
        <div class="bca-ai-welcome">
          <h3>🤖 AI Assistant</h3>
          <p id="bca-welcome-text-${containerId}">${escHtml(cfg.welcome)}</p>
        </div>
        <div class="bca-chip-row">${chipsHtml}</div>
        <div class="bca-ai-box">
          <textarea id="bca-ai-q-${containerId}" placeholder="Ask me anything about our services…"></textarea>
          <button class="bca-ai-btn" style="background:linear-gradient(135deg,${cfg.accent},${cfg.accent}cc);color:#fff;"
            onclick="window.bcaAskAI('${containerId}','${businessType}')">🤖 Ask AI</button>
          <div class="bca-ai-answer" id="bca-ai-ans-${containerId}"></div>
        </div>
      </div>`;

    // Personalise welcome with user name after a short delay
    setTimeout(() => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) {
          const el = document.getElementById(`bca-welcome-text-${containerId}`);
          if (el) el.textContent = `Hi ${user.name}! ` + cfg.welcome;
        }
      } catch(e) {}
    }, 300);
  }

  window.bcaSetQ = function(containerId, q) {
    const el = document.getElementById(`bca-ai-q-${containerId}`);
    if (el) { el.value = q; el.focus(); }
  };

  window.bcaAskAI = async function(containerId, businessType) {
    const qEl = document.getElementById(`bca-ai-q-${containerId}`);
    const ansEl = document.getElementById(`bca-ai-ans-${containerId}`);
    const q = qEl?.value?.trim();
    if (!q) return;
    if (!ansEl) return;

    const cfg = AI_CONFIGS[businessType] || {};
    ansEl.className = 'bca-ai-answer visible';
    ansEl.innerHTML = '<span class="bca-ai-loading">🤖 Thinking…</span>';

    try {
      const res = await fetch(`${getBase()}/biz-ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: q, businessType, systemPrompt: cfg.systemPrompt })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        ansEl.textContent = data.reply;
      } else {
        // Fallback to ChatGPT redirect
        ansEl.innerHTML = `<span style="color:rgba(255,255,255,0.6);">AI service busy. <a href="https://chatgpt.com/?q=${encodeURIComponent(q)}" target="_blank" style="color:#f0d070;">Ask ChatGPT instead ↗</a></span>`;
      }
    } catch(e) {
      ansEl.innerHTML = `<span style="color:rgba(255,255,255,0.6);">Could not reach AI. <a href="https://chatgpt.com/?q=${encodeURIComponent(q)}" target="_blank" style="color:#f0d070;">Ask ChatGPT ↗</a></span>`;
    }
  };

  /* ─────────────── ANALYTICS ─────────────── */

  /**
   * Render analytics panel with live stats + AI insights.
   * @param {string} containerId
   * @param {string} businessType
   * @param {string} role  'customer' | 'provider'
   * @param {string} accentColor
   */
  function renderAnalytics(containerId, businessType, role, accentColor) {
    injectStyles();
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = `
      <div class="bca-analytics-wrap">
        <div class="bca-stat-row" id="bca-stats-${containerId}">
          <div class="bca-stat-box"><div class="bca-num" style="color:${accentColor}" id="bca-s1-${containerId}">—</div><div class="bca-lbl" id="bca-l1-${containerId}">Loading…</div></div>
          <div class="bca-stat-box"><div class="bca-num" style="color:${accentColor}" id="bca-s2-${containerId}">—</div><div class="bca-lbl" id="bca-l2-${containerId}">Loading…</div></div>
          <div class="bca-stat-box"><div class="bca-num" style="color:${accentColor}" id="bca-s3-${containerId}">—</div><div class="bca-lbl" id="bca-l3-${containerId}">Loading…</div></div>
          <div class="bca-stat-box"><div class="bca-num" style="color:${accentColor}" id="bca-s4-${containerId}">—</div><div class="bca-lbl" id="bca-l4-${containerId}">Loading…</div></div>
        </div>
        <div class="bca-insight-box" id="bca-insight-${containerId}">
          <h4>🤖 AI Analysis</h4>
          <span style="color:rgba(255,255,255,0.4); font-style:italic;">Loading your service history analysis…</span>
        </div>
        <button class="bca-ai-btn" style="background:linear-gradient(135deg,${accentColor},${accentColor}cc);color:#fff;align-self:flex-start;"
          onclick="window.bcaRefreshAnalytics('${containerId}','${businessType}','${role}','${accentColor}')">🔄 Refresh Analysis</button>
      </div>`;
    window.bcaRefreshAnalytics(containerId, businessType, role, accentColor);
  }

  window.bcaRefreshAnalytics = async function(containerId, businessType, role, accentColor) {
    const userId = window._bcaCustomerId || window._bcaProviderId;
    if (!userId) return;
    const insightBox = document.getElementById(`bca-insight-${containerId}`);
    if (insightBox) insightBox.innerHTML = '<h4>🤖 AI Analysis</h4><span style="color:rgba(255,255,255,0.4);font-style:italic;">Analyzing…</span>';

    try {
      const res = await fetch(`${getBase()}/biz-analytics/${businessType}/${role}/${userId}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const stats = data.stats || {};
      const statDefs = getStatDefs(businessType, role, stats, accentColor);
      statDefs.forEach((def, i) => {
        const n = document.getElementById(`bca-s${i+1}-${containerId}`);
        const l = document.getElementById(`bca-l${i+1}-${containerId}`);
        if (n) n.textContent = def.num;
        if (l) l.textContent = def.lbl;
      });

      const insight = generateInsight(businessType, role, stats);
      if (insightBox) insightBox.innerHTML = `<h4>🤖 AI Analysis</h4><span>${insight.replace(/\n/g,'<br>')}</span>`;
    } catch(e) {
      if (insightBox) insightBox.innerHTML = '<h4>🤖 AI Analysis</h4><span style="color:rgba(255,255,255,0.4);">Could not load analytics. Please try again.</span>';
    }
  };

  function getStatDefs(businessType, role, s, ac) {
    const maps = {
      agrovet: {
        customer: [
          { num: s.totalOrders ?? 0, lbl: 'Total Orders' },
          { num: s.pendingOrders ?? 0, lbl: 'Pending Orders' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.vetBookings ?? 0, lbl: 'Vet Bookings' },
        ],
        provider: [
          { num: s.totalOrders ?? 0, lbl: 'Total Orders' },
          { num: s.activeCustomers ?? 0, lbl: 'Active Customers' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Total Revenue' },
          { num: s.lowStockItems ?? 0, lbl: 'Low Stock Items' },
        ]
      },
      boutique: {
        customer: [
          { num: s.totalOrders ?? 0, lbl: 'Orders Placed' },
          { num: s.fittingsBooked ?? 0, lbl: 'Fittings Booked' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.wishlistItems ?? 0, lbl: 'Wishlist Items' },
        ],
        provider: [
          { num: s.totalOrders ?? 0, lbl: 'Total Orders' },
          { num: s.activeProducts ?? 0, lbl: 'Active Products' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Revenue' },
          { num: s.pendingFittings ?? 0, lbl: 'Pending Fittings' },
        ]
      },
      cyber: {
        customer: [
          { num: s.totalSessions ?? 0, lbl: 'PC Sessions' },
          { num: s.totalPrints ?? 0, lbl: 'Print Jobs' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.totalHours ?? 0, lbl: 'Hours Used' },
        ],
        provider: [
          { num: s.totalSessions ?? 0, lbl: 'Total Sessions' },
          { num: s.activePCs ?? 0, lbl: 'Active PCs' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Revenue' },
          { num: s.totalCustomers ?? 0, lbl: 'Customers' },
        ]
      },
      hardware: {
        customer: [
          { num: s.totalOrders ?? 0, lbl: 'Orders Placed' },
          { num: s.pendingOrders ?? 0, lbl: 'Pending Orders' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.quotesRequested ?? 0, lbl: 'Quotes Requested' },
        ],
        provider: [
          { num: s.totalOrders ?? 0, lbl: 'Total Orders' },
          { num: s.activeProducts ?? 0, lbl: 'Products Listed' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Revenue' },
          { num: s.lowStockItems ?? 0, lbl: 'Low Stock' },
        ]
      },
      restaurant: {
        customer: [
          { num: s.totalOrders ?? 0, lbl: 'Orders Made' },
          { num: s.reservations ?? 0, lbl: 'Table Reservations' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.reviews ?? 0, lbl: 'Reviews Given' },
        ],
        provider: [
          { num: s.totalOrders ?? 0, lbl: 'Total Orders' },
          { num: s.tablesReserved ?? 0, lbl: 'Tables Reserved' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Revenue' },
          { num: s.avgRating ? s.avgRating.toFixed(1) + '⭐' : '—', lbl: 'Avg Rating' },
        ]
      },
      salon: {
        customer: [
          { num: s.totalAppointments ?? 0, lbl: 'Appointments' },
          { num: s.upcomingAppointments ?? 0, lbl: 'Upcoming' },
          { num: `KSh ${(s.totalSpent || 0).toLocaleString()}`, lbl: 'Total Spent' },
          { num: s.reviews ?? 0, lbl: 'Reviews Given' },
        ],
        provider: [
          { num: s.totalAppointments ?? 0, lbl: 'Total Bookings' },
          { num: s.todayAppointments ?? 0, lbl: 'Today\'s Bookings' },
          { num: `KSh ${(s.totalRevenue || 0).toLocaleString()}`, lbl: 'Revenue' },
          { num: s.avgRating ? s.avgRating.toFixed(1) + '⭐' : '—', lbl: 'Avg Rating' },
        ]
      }
    };
    return (maps[businessType] || maps.agrovet)[role] || maps.agrovet.customer;
  }

  function generateInsight(businessType, role, s) {
    const tips = [];
    if (businessType === 'agrovet') {
      if (role === 'provider') {
        if ((s.lowStockItems || 0) > 0) tips.push(`⚠️ You have ${s.lowStockItems} low-stock items — restock soon to avoid losing sales.`);
        if ((s.totalOrders || 0) === 0) tips.push('📢 No orders yet. Consider promoting your products to nearby farmers.');
        if ((s.activeCustomers || 0) > 5) tips.push('✅ Great customer base! Offer loyalty discounts to keep them coming back.');
      } else {
        if ((s.pendingOrders || 0) > 2) tips.push('⏳ You have pending orders. Chat with your agrovet provider for updates.');
        if ((s.vetBookings || 0) === 0) tips.push('🐄 No vet bookings yet. Book a vet visit for your livestock health check.');
      }
    } else if (businessType === 'boutique') {
      if (role === 'provider') {
        if ((s.pendingFittings || 0) > 0) tips.push(`📅 ${s.pendingFittings} fitting appointments need confirmation.`);
        if ((s.activeProducts || 0) < 5) tips.push('📸 Add more products with good photos to attract more customers.');
      } else {
        if ((s.wishlistItems || 0) > 0) tips.push(`💜 You have ${s.wishlistItems} items in your wishlist — check if they\'re in stock!`);
        if ((s.totalOrders || 0) === 0) tips.push('🛍️ Browse our catalogue and place your first order today!');
      }
    } else if (businessType === 'cyber') {
      if (role === 'provider') {
        if ((s.activePCs || 0) === 0) tips.push('💻 Add your PC inventory so customers can book sessions.');
        if ((s.totalRevenue || 0) > 0) tips.push(`💰 Revenue earned: KSh ${(s.totalRevenue || 0).toLocaleString()}. Keep promoting your services!`);
      } else {
        if ((s.totalHours || 0) > 10) tips.push(`⏱️ You\'ve used ${s.totalHours} hours — consider a bulk session package for savings.`);
        if ((s.totalPrints || 0) === 0) tips.push('🖨️ Need to print a document? Book a session and use our printing service.');
      }
    } else if (businessType === 'hardware') {
      if (role === 'provider') {
        if ((s.lowStockItems || 0) > 0) tips.push(`⚠️ ${s.lowStockItems} products are running low on stock. Restock now!`);
        if ((s.totalOrders || 0) > 10) tips.push('🏗️ Busy business! Consider hiring delivery staff to handle more orders.');
      } else {
        if ((s.pendingOrders || 0) > 0) tips.push(`📦 You have ${s.pendingOrders} order(s) being processed. Chat with your supplier for updates.`);
        if ((s.quotesRequested || 0) === 0) tips.push('📋 Request a quote for bulk building materials — it can save you up to 15%!');
      }
    } else if (businessType === 'restaurant') {
      if (role === 'provider') {
        if ((s.tablesReserved || 0) > 0) tips.push(`🪑 ${s.tablesReserved} tables reserved today. Prepare your team for service!`);
        if ((s.avgRating || 0) < 4) tips.push('⭐ Your average rating is below 4. Focus on food quality and quick service.');
      } else {
        if ((s.totalOrders || 0) === 0) tips.push('🍽️ Haven\'t ordered yet? Browse our menu and place your first order!');
        if ((s.reviews || 0) === 0) tips.push('⭐ Share your experience — leave a review and help other diners!');
      }
    } else if (businessType === 'salon') {
      if (role === 'provider') {
        if ((s.todayAppointments || 0) > 0) tips.push(`📅 You have ${s.todayAppointments} appointment(s) today. Stay on schedule!`);
        if ((s.avgRating || 0) >= 4.5) tips.push('🌟 Excellent rating! Encourage happy clients to share your salon on social media.');
      } else {
        if ((s.upcomingAppointments || 0) === 0) tips.push('📅 No upcoming appointments. Book your next salon visit today!');
        if ((s.totalAppointments || 0) > 5) tips.push(`💅 You\'ve visited ${s.totalAppointments} times — you qualify for a loyalty reward! Ask your stylist.`);
      }
    }
    if (!tips.length) tips.push('📊 Your service history looks good! Keep using SmartServe for a seamless experience.');
    return tips.join('\n\n');
  }

  /* ─────────────── PUBLIC API ─────────────── */
  window.bcaDashboard = {
    renderChat,
    loadChat,
    renderAI,
    renderAnalytics,
    setIds(customerId, providerId) {
      window._bcaCustomerId = customerId;
      window._bcaProviderId = providerId;
    }
  };
})();
