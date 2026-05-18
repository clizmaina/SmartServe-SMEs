// ── Smart Items Stocked — Customer Dashboard ──────────────────────────────
// Injected into customer-dashboard.html via <script src="smart-items.js">
// Full order flow: pick item → view samples → select style → delivery → payment → place order

(function() {
  // Inject tab HTML into .content
  const content = document.querySelector('.content');
  if (!content) return;
  const div = document.createElement('div');
  div.id = 'smart-items';
  div.className = 'tab-content';
  div.innerHTML = `
    <div class="page-header">
      <h1>📦 Smart Items Stocked</h1>
      <p>Browse items, pick your style, choose delivery and payment — all in one place</p>
    </div>

    <!-- STEP 1: Choose item -->
    <div class="si-step">
      <div class="si-step-title"><span class="si-step-num">1</span> Choose an Item</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <select id="si-item-select" onchange="siCheckItem()"
          style="flex:1;min-width:200px;padding:12px 16px;margin-bottom:0;font-size:0.92rem;
                 background:rgba(255,255,255,0.08);border:1px solid rgba(212,168,67,0.4);
                 border-radius:10px;color:#fff;">
          <option value="">— Select a fashion item —</option>
        </select>
        <button class="btn btn-gold" style="padding:12px 18px;font-size:0.82rem;" onclick="siLoadStock()">🔄</button>
      </div>
      <div id="si-stock-status" style="margin-top:12px;"></div>
    </div>

    <!-- STEP 2: Pick a style -->
    <div class="si-step" id="si-step2" style="display:none;">
      <div class="si-step-title"><span class="si-step-num">2</span> Pick Your Style</div>
      <p style="font-size:0.85rem;color:rgba(255,255,255,0.55);margin-bottom:14px;">
        Tap a photo to select the style you want. The designer will see your choice.
      </p>
      <div id="si-samples-row" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
      <div id="si-selected-style-box" style="display:none;margin-top:16px;padding:14px 18px;
           background:rgba(212,168,67,0.08);border:1px solid rgba(212,168,67,0.3);border-radius:12px;">
        <p style="font-size:0.78rem;color:rgba(255,255,255,0.45);margin-bottom:8px;">✅ Selected style:</p>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <img id="si-sel-img" src="" style="width:80px;height:80px;object-fit:cover;border-radius:10px;border:2px solid rgba(212,168,67,0.4);">
          <div>
            <p id="si-sel-desc" style="color:#fff;font-weight:600;font-size:0.9rem;margin-bottom:4px;"></p>
            <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;">Style noted ✓ — complete the steps below to place your order.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- STEP 3: Delivery method -->
    <div class="si-step" id="si-step3" style="display:none;">
      <div class="si-step-title"><span class="si-step-num">3</span> Choose Delivery Method</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
        <div class="si-delivery-opt" id="si-opt-pickup" onclick="siSelectDelivery('pickup')">
          <span class="icon">🏪</span>
          <div class="label">Pick Up</div>
          <div class="sub">Collect from the shop</div>
        </div>
        <div class="si-delivery-opt" id="si-opt-delivery" onclick="siSelectDelivery('delivery')">
          <span class="icon">🚚</span>
          <div class="label">Home Delivery</div>
          <div class="sub">Delivered to your door</div>
        </div>
      </div>
      <div id="si-address-fields" style="display:none;">
        <label style="color:rgba(255,255,255,0.65);font-size:0.85rem;display:block;margin-bottom:6px;">📍 Delivery Address</label>
        <input type="text" id="si-address" placeholder="e.g. 14 Moi Avenue, Nairobi CBD" style="margin-bottom:10px;">
        <label style="color:rgba(255,255,255,0.65);font-size:0.85rem;display:block;margin-bottom:6px;">🗺️ Location Notes / Landmark</label>
        <input type="text" id="si-notes" placeholder="e.g. Near KCB Bank, Blue gate, 2nd floor">
      </div>
      <div id="si-pickup-note" style="display:none;padding:12px 16px;background:rgba(212,168,67,0.06);
           border:1px solid rgba(212,168,67,0.2);border-radius:10px;font-size:0.85rem;color:rgba(255,255,255,0.7);">
        🏪 You'll collect your order from the designer's shop. They'll notify you via chat when it's ready.
      </div>
    </div>

    <!-- STEP 4: Payment method -->
    <div class="si-step" id="si-step4" style="display:none;">
      <div class="si-step-title"><span class="si-step-num">4</span> Choose Payment Method</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
        <div class="si-delivery-opt" id="si-pay-mpesa" onclick="siSelectPayment('mpesa')">
          <span class="icon">📱</span>
          <div class="label">M-Pesa</div>
          <div class="sub">Pay via STK push</div>
        </div>
        <div class="si-delivery-opt" id="si-pay-qr" onclick="siSelectPayment('qr')">
          <span class="icon">📷</span>
          <div class="label">QR Code</div>
          <div class="sub">Scan to pay</div>
        </div>
      </div>
      <div id="si-mpesa-fields" style="display:none;">
        <label style="color:rgba(255,255,255,0.65);font-size:0.85rem;display:block;margin-bottom:6px;">M-Pesa Phone Number</label>
        <input type="tel" id="si-mpesa-phone" placeholder="e.g. 0712345678" style="margin-bottom:0;">
      </div>
      <div id="si-qr-fields" style="display:none;text-align:center;margin-top:10px;">
        <p style="color:rgba(255,255,255,0.55);font-size:0.85rem;margin-bottom:12px;">Scan the QR code below to complete payment:</p>
        <img src="images/qr.jpg" alt="QR Code" style="max-width:200px;border-radius:12px;border:2px solid rgba(212,168,67,0.3);">
      </div>
    </div>

    <!-- STEP 5: Place Order -->
    <div id="si-step5" style="display:none;margin-top:4px;">
      <button class="btn btn-gold" style="width:100%;padding:16px;font-size:1rem;border-radius:14px;" onclick="siPlaceOrder()">
        🛒 Place Order &amp; Send to Designer
      </button>
      <p id="si-order-msg" style="margin-top:12px;font-size:0.88rem;text-align:center;"></p>
    </div>
  `;
  content.appendChild(div);
})();

// ── State ──────────────────────────────────────────────────────────────────
window._siAllItems     = [];
window._siCurrentItem  = null;
window._siSelectedStyle = null;
window._siDelivery     = null;
window._siPayment      = null;

function siBase() { return window.API_BASE || 'https://smartserve-smes.onrender.com'; }
function loadSmartItems() { siLoadStock(); }

// ── STEP 1: Load items ─────────────────────────────────────────────────────
async function siLoadStock() {
  try {
    const res  = await fetch(siBase() + '/smart-items/stock', { credentials:'include' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    window._siAllItems = data.items;
    const sel = document.getElementById('si-item-select');
    if (sel) {
      sel.innerHTML = '<option value="">— Select a fashion item —</option>' +
        data.items.map(i =>
          '<option value="' + i.id + '">' + i.name + ' — KSh ' + Number(i.price).toLocaleString() + '</option>'
        ).join('');
    }
  } catch(e) {
    const sel = document.getElementById('si-item-select');
    if (sel) sel.innerHTML = '<option value="">Could not load items</option>';
  }
}

// ── STEP 1: Customer picks item ────────────────────────────────────────────
function siCheckItem() {
  const id   = document.getElementById('si-item-select')?.value;
  const stat = document.getElementById('si-stock-status');
  const step2 = document.getElementById('si-step2');

  ['si-step3','si-step4','si-step5'].forEach(s => {
    const el = document.getElementById(s); if(el) el.style.display='none';
  });
  window._siSelectedStyle = null;
  window._siDelivery = null;
  window._siPayment  = null;

  if (!id) { stat.innerHTML=''; step2.style.display='none'; return; }

  const item = (window._siAllItems||[]).find(i => String(i.id)===String(id));
  if (!item) return;
  window._siCurrentItem = item;

  const isOut = item.stock === 0;
  const isLow = item.stock > 0 && item.stock <= 5;

  if (isOut) {
    stat.innerHTML = '<div style="padding:12px 16px;background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.3);border-radius:10px;color:#ff8a9a;font-size:0.88rem;">' +
      '😔 <strong>' + item.name + '</strong> is currently <strong>out of stock</strong>. ' +
      'The designer has been notified. You\'ll be informed when it\'s restocked.</div>';
    step2.style.display = 'none';
    return;
  }

  stat.innerHTML = isLow
    ? '<div style="padding:12px 16px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:10px;color:#fbbf24;font-size:0.88rem;">⚠️ Only <strong>' + item.stock + ' unit(s)</strong> left — order soon! Price: <strong>KSh ' + Number(item.price).toLocaleString() + '</strong></div>'
    : '<div style="padding:12px 16px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:10px;color:#4ade80;font-size:0.88rem;">✅ <strong>' + item.stock + ' units</strong> available — Price: <strong>KSh ' + Number(item.price).toLocaleString() + '</strong> per unit</div>';

  // Show samples
  step2.style.display = 'block';
  const row    = document.getElementById('si-samples-row');
  const selBox = document.getElementById('si-selected-style-box');
  if (selBox) selBox.style.display = 'none';

  if (!item.samples || !item.samples.length) {
    row.innerHTML = '<div style="padding:14px;background:rgba(255,255,255,0.04);border-radius:10px;color:rgba(255,255,255,0.4);font-size:0.85rem;width:100%;">' +
      '📸 No sample photos uploaded yet. The designer will add samples soon.<br><br>' +
      '<button class="btn btn-gold" style="padding:10px 20px;font-size:0.85rem;margin-top:8px;" ' +
      'onclick="siStyleChosen(\'No specific style\',\'\',undefined)">Continue without selecting a style →</button></div>';
  } else {
    row.innerHTML = item.samples.map((s, idx) =>
      '<div class="si-sample-thumb" id="si-sthumb-' + idx + '" ' +
      'onclick="siStyleChosen(\'' + s.description.replace(/'/g,"\\'") + '\',\'' + siBase() + s.path + '\',' + idx + ')">' +
      '<img src="' + siBase() + s.path + '" alt="' + s.description + '" onerror="this.parentElement.style.display=\'none\'">' +
      '<div class="si-check">✓</div>' +
      '</div>'
    ).join('');
  }
  step2.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

// ── STEP 2: Style selected ─────────────────────────────────────────────────
function siStyleChosen(desc, src, idx) {
  window._siSelectedStyle = { desc, src };

  document.querySelectorAll('.si-sample-thumb').forEach(el => el.classList.remove('selected'));
  if (idx !== undefined) {
    const el = document.getElementById('si-sthumb-' + idx);
    if (el) el.classList.add('selected');
  }

  const box = document.getElementById('si-selected-style-box');
  const img = document.getElementById('si-sel-img');
  const dsc = document.getElementById('si-sel-desc');
  if (box && img && dsc) {
    img.src = src || ''; img.style.display = src ? 'block' : 'none';
    dsc.textContent = desc; box.style.display = 'block';
  }

  const step3 = document.getElementById('si-step3');
  if (step3) { step3.style.display='block'; step3.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── STEP 3: Delivery ───────────────────────────────────────────────────────
function siSelectDelivery(type) {
  window._siDelivery = type;
  document.getElementById('si-opt-pickup').classList.toggle('selected', type==='pickup');
  document.getElementById('si-opt-delivery').classList.toggle('selected', type==='delivery');
  document.getElementById('si-address-fields').style.display = type==='delivery' ? 'block' : 'none';
  document.getElementById('si-pickup-note').style.display    = type==='pickup'   ? 'block' : 'none';
  const step4 = document.getElementById('si-step4');
  if (step4) { step4.style.display='block'; step4.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── STEP 4: Payment ────────────────────────────────────────────────────────
function siSelectPayment(method) {
  window._siPayment = method;
  document.getElementById('si-pay-mpesa').classList.toggle('selected', method==='mpesa');
  document.getElementById('si-pay-qr').classList.toggle('selected', method==='qr');
  document.getElementById('si-mpesa-fields').style.display = method==='mpesa' ? 'block' : 'none';
  document.getElementById('si-qr-fields').style.display    = method==='qr'    ? 'block' : 'none';
  const step5 = document.getElementById('si-step5');
  if (step5) { step5.style.display='block'; step5.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
}

// ── STEP 5: Place order ────────────────────────────────────────────────────
async function siPlaceOrder() {
  const msg      = document.getElementById('si-order-msg');
  const item     = window._siCurrentItem;
  const style    = window._siSelectedStyle;
  const delivery = window._siDelivery;
  const payment  = window._siPayment;

  if (!item)     { msg.style.color='#ff8a9a'; msg.textContent='❌ Please select an item.'; return; }
  if (!style)    { msg.style.color='#ff8a9a'; msg.textContent='❌ Please select a style.'; return; }
  if (!delivery) { msg.style.color='#ff8a9a'; msg.textContent='❌ Please choose a delivery method.'; return; }
  if (!payment)  { msg.style.color='#ff8a9a'; msg.textContent='❌ Please choose a payment method.'; return; }

  const address = document.getElementById('si-address')?.value.trim() || '';
  const notes   = document.getElementById('si-notes')?.value.trim()   || '';

  if (delivery === 'delivery' && !address) {
    msg.style.color='#ff8a9a'; msg.textContent='❌ Please enter your delivery address.'; return;
  }

  const designerId = document.getElementById('designerSelect')?.value;
  if (!designerId) {
    msg.style.color='#ff8a9a'; msg.textContent='❌ Please select a designer first (Select Designer tab).'; return;
  }

  msg.style.color='rgba(212,168,67,0.8)'; msg.textContent='Placing order…';

  try {
    // Save order
    const orderRes = await fetch(siBase() + '/smart-items/order', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        customerId: window.customerId, designerId,
        itemId: item.id, itemName: item.name,
        styleDesc: style.desc, styleImg: style.src,
        deliveryType: delivery, address, notes,
        paymentMethod: payment, price: item.price
      })
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error(orderData.message);

    // Save delivery preference
    await fetch(siBase() + '/delivery-preference', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ customerId:window.customerId, designerId, deliveryType:delivery, address, locationNotes:notes })
    });

    // Notify designer via chat
    const chatMsg = '🛒 NEW ORDER — Item: ' + item.name +
      ' | Style: ' + style.desc +
      ' | Delivery: ' + (delivery==='pickup' ? 'Pick Up from shop' : 'Home Delivery to: ' + address) +
      (notes ? ' (' + notes + ')' : '') +
      ' | Payment: ' + (payment==='mpesa' ? 'M-Pesa' : 'QR Code') +
      ' | Price: KSh ' + Number(item.price).toLocaleString();
    await fetch(siBase() + '/send-message', {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sender:'customer', message:chatMsg, customerId:window.customerId, designerId })
    });

    msg.style.color='#4ade80';
    msg.innerHTML = '✅ Order placed! The designer has been notified via chat.<br>' +
      '<span style="font-size:0.82rem;color:rgba(255,255,255,0.5);">Check the Chat tab to follow up with your designer.</span>';

    // Reset after 5s
    setTimeout(() => {
      document.getElementById('si-item-select').value = '';
      document.getElementById('si-stock-status').innerHTML = '';
      ['si-step2','si-step3','si-step4','si-step5'].forEach(id => {
        const el = document.getElementById(id); if(el) el.style.display='none';
      });
      window._siCurrentItem=null; window._siSelectedStyle=null;
      window._siDelivery=null; window._siPayment=null;
      msg.textContent='';
    }, 5000);

  } catch(e) {
    msg.style.color='#ff8a9a'; msg.textContent='❌ ' + e.message;
  }
}
