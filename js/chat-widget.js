// Sofia — simple, self-contained chat widget for Hadleigh Dental & Cosmetic Centre
// Menu-first: pick a topic, see real info, one button routes to the real Contact page.
// No simulated booking flow inside the chat — booking happens on the real Contact form.
// Injects its own styles and markup. Drop-in: <script src="js/chat-widget.js" defer></script>

(function () {
  'use strict';

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #sofia-root { --primary: #17332e; --accent: #e8735f; --bg: #f4f6f5; --text: #1e2b2b; --muted: #7c8c8a; --line: rgba(30,43,43,0.1); font-family: 'Inter', -apple-system, sans-serif; }
    @keyframes sofia-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    #sofia-launcher { position: fixed; bottom: 24px; right: 24px; height: 64px; padding: 0 6px 0 24px; border: none; border-radius: 100px; background: linear-gradient(135deg, var(--accent), #c85c48); cursor: pointer; display: inline-flex; align-items: center; gap: 14px; z-index: 9998; box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(232,115,95,0.55); transition: transform 0.15s ease, padding 0.15s ease, width 0.15s ease, border-radius 0.15s ease; animation: sofia-glow-intro 1.8s ease-out 3, sofia-glow-idle 4.5s ease-in-out 5.4s infinite; }
    #sofia-launcher:hover { transform: scale(1.03); }
    #sofia-launcher-text { color: #fff; font-weight: 600; font-size: 15px; white-space: nowrap; }
    #sofia-launcher-icon-wrap { position: relative; width: 52px; height: 52px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    #sofia-badge { position: absolute; top: -4px; right: -4px; width: 22px; height: 22px; border-radius: 50%; background: #e2483a; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
    #sofia-launcher .icon-close { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    body.sofia-open #sofia-launcher { padding: 0; width: 60px; height: 60px; justify-content: center; border-radius: 50%; animation: none; box-shadow: 0 4px 16px rgba(0,0,0,0.22); }
    body.sofia-open #sofia-launcher-text, body.sofia-open #sofia-launcher-icon-wrap { display: none; }
    body.sofia-open #sofia-launcher .icon-close { display: block; }
    @keyframes sofia-glow-intro { 0% { box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(232,115,95,0.55); } 60% { box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 0 16px rgba(232,115,95,0); } 100% { box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 0 0 rgba(232,115,95,0); } }
    @keyframes sofia-glow-idle { 0%, 100% { box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 8px 1px rgba(232,115,95,0.22); } 50% { box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 15px 3px rgba(232,115,95,0.42); } }
    @media (prefers-reduced-motion: reduce) { #sofia-launcher { animation: none; box-shadow: 0 6px 20px rgba(0,0,0,0.25), 0 0 10px 2px rgba(232,115,95,0.3); } }
    #sofia-panel { position: fixed; bottom: 84px; right: 24px; width: 380px; max-width: calc(100vw - 32px); max-height: calc(100vh - 120px); background: var(--bg); border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.25); z-index: 9997; display: flex; flex-direction: column; opacity: 0; transform: translateY(16px) scale(0.98); pointer-events: none; transition: opacity 0.22s ease, transform 0.22s ease; }
    body.sofia-open #sofia-panel { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    #sofia-header { background: var(--primary); color: #fff; padding: 16px 18px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    #sofia-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    #sofia-header-name { font-family: Georgia, serif; font-weight: 600; font-size: 16px; }
    #sofia-header-sub { font-size: 12px; color: rgba(255,255,255,0.65); display: flex; align-items: center; gap: 6px; }
    #sofia-header-sub::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
    #sofia-header-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
    #sofia-refresh-btn, #sofia-close-btn { background: none; border: none; color: rgba(255,255,255,0.75); cursor: pointer; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-shrink: 0; }
    #sofia-refresh-btn:hover, #sofia-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    #sofia-refresh-btn.spinning svg { animation: sofia-spin 0.5s ease; }
    @keyframes sofia-spin { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
    #sofia-body { flex: 0 1 auto; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
    .sofia-instruction { font-size: 13px; color: var(--muted); margin: 4px 0 2px; }
    .sofia-card { position: relative; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px 36px 14px 16px; cursor: pointer; animation: sofia-fade-up 0.25s ease backwards; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
    .sofia-card:hover { border-color: var(--accent); box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
    .sofia-card-title { font-family: Georgia, serif; font-weight: 700; font-size: 14.5px; color: var(--primary); }
    .sofia-card-sub { font-size: 12.5px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
    .sofia-card-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--accent); font-size: 18px; }
    .sofia-card-urgent .sofia-card-title { color: #b84a3a; }
    .sofia-msg { max-width: 88%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; animation: sofia-fade-up 0.28s ease; font-weight: 500; }
    .sofia-msg-bot { background: #fef4f1; border: 1px solid var(--line); border-left: 3px solid var(--accent); align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); color: var(--text); }
    .sofia-msg-user { background: var(--primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
    .sofia-msg a { color: #b8503a; font-weight: 600; }
    .sofia-cta-btn { align-self: flex-start; background: var(--accent); color: #fff; border: none; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 100px; cursor: pointer; animation: sofia-fade-up 0.28s ease; text-decoration: none; display: inline-block; }
    .sofia-cta-btn:hover { opacity: 0.92; }
    .sofia-quick-replies { display: flex; flex-wrap: wrap; gap: 8px; animation: sofia-fade-up 0.28s ease; }
    .sofia-quick-btn { background: #fff; border: 1px solid var(--accent); color: var(--accent); font-weight: 600; font-size: 12.5px; padding: 8px 14px; border-radius: 100px; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
    .sofia-quick-btn:hover { background: var(--accent); color: #fff; }
    .sofia-typing { align-self: flex-start; background: #fff; border: 1px solid var(--line); border-radius: 14px; border-bottom-left-radius: 4px; padding: 12px 16px; display: flex; gap: 4px; }
    .sofia-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: sofia-bounce 1.2s infinite ease-in-out; }
    .sofia-typing span:nth-child(2) { animation-delay: 0.15s; }
    .sofia-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes sofia-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }
    #sofia-input-row { border-top: 1px solid var(--line); padding: 12px; display: flex; gap: 8px; flex-shrink: 0; background: var(--bg); }
    #sofia-input { flex: 1; border: 1px solid #d5dcd9; border-radius: 100px; padding: 11px 16px; font-size: 16px; background: #fff; color: var(--text); }
    #sofia-input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
    #sofia-send { width: 42px; height: 42px; border-radius: 50%; background: var(--accent); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    @media (max-width: 480px) {
      #sofia-panel { right: 16px; left: 16px; width: auto; bottom: 84px; max-height: min(88vh, calc(100dvh - 100px)); }
      #sofia-launcher { right: 16px; bottom: 16px; }
    }
    body.sofia-menu-open #sofia-launcher, body.sofia-menu-open #sofia-panel { display: none; }
    @media (prefers-reduced-motion: reduce) { .sofia-msg, .sofia-card, .sofia-cta-btn { animation: none !important; } }
  `;
  document.head.appendChild(styleEl);

  const root = document.createElement('div');
  root.id = 'sofia-root';
  root.innerHTML = `
    <button id="sofia-launcher" aria-label="Chat with Sofia">
      <span id="sofia-launcher-text">Chat with Sofia</span>
      <span id="sofia-launcher-icon-wrap">
        <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8735f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <span id="sofia-badge">1</span>
      </span>
      <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div id="sofia-panel" role="dialog" aria-label="Chat with Sofia">
      <div id="sofia-header">
        <div id="sofia-avatar">S</div>
        <div>
          <div id="sofia-header-name">Sofia</div>
          <div id="sofia-header-sub">Hadleigh Dental Assistant</div>
        </div>
        <div id="sofia-header-actions">
          <button id="sofia-refresh-btn" aria-label="Start over">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/></svg>
          </button>
          <button id="sofia-close-btn" aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div id="sofia-body"></div>
      <div id="sofia-input-row">
        <input id="sofia-input" type="text" placeholder="Ask Sofia anything..." autocomplete="off">
        <button id="sofia-send" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const body = document.getElementById('sofia-body');
  const launcher = document.getElementById('sofia-launcher');
  const closeBtn = document.getElementById('sofia-close-btn');
  const refreshBtn = document.getElementById('sofia-refresh-btn');
  const input = document.getElementById('sofia-input');
  const sendBtn = document.getElementById('sofia-send');
  const badge = document.getElementById('sofia-badge');

  let visitorName = null;
  let hasOpenedBefore = false;
  // TODO: replace with the real Make.com webhook URL once that scenario is built
  const BOOKING_WEBHOOK_URL = 'https://hook.eu1.make.com/qh379w7lj34nize5v5ns3a7sbeg4mn99';

  // Real info per topic — 2-3 lines, no simulated booking, one button to the real Contact page.
  const TOPICS = [
    {
      title: 'Routine Check-up',
      desc: 'General examination and advice.',
      brief: 'A full examination of your teeth and gums, advice on any concerns, and X-rays if needed.',
      anchor: 'general-dentistry.html',
      service: 'Routine Check-up',
    },
    {
      title: 'Teeth Cleaning / Hygienist',
      desc: 'No referral needed — direct access available.',
      brief: 'A professional scale and polish, plus advice on keeping teeth and gums healthy between visits. No referral needed.',
      anchor: 'hygiene-plus.html#what-we-do',
      service: 'Teeth Cleaning / Hygienist',
    },
    {
      title: 'Teeth Whitening',
      desc: 'From £20/month, interest-free plans available.',
      brief: 'In-surgery and take-home kit options, from as little as £20/month on interest-free plans.',
      anchor: 'teeth-whitening.html#pricing',
      service: 'Teeth Whitening',
    },
    {
      title: 'Invisalign',
      desc: 'Platinum Elite provider. Free consultation available.',
      brief: "We're a Platinum Elite Invisalign provider — clear, removable aligners with regular check-ins to track progress.",
      anchor: 'invisalign.html#five-steps',
      service: 'Invisalign',
    },
    {
      title: 'Dental Implants',
      desc: 'From £2,000 per tooth. Free consultation available.',
      brief: 'A titanium root and porcelain crown matched to your natural teeth, generally from £2,000 per tooth.',
      anchor: 'dental-implants.html#cost',
      service: 'Dental Implants',
    },
    {
      title: 'Family Dentistry / NHS Pricing',
      desc: 'NHS bands from £23.80.',
      brief: 'NHS treatment in standard bands: Band 1 from £23.80, Band 2 £65.20, Band 3 £282.80.',
      anchor: 'family-dentistry.html#nhs-pricing',
      service: 'Family Dentistry / NHS',
    },
  ];

  const NEW_PATIENT_ITEM = {
    title: "I'm a new patient",
    desc: 'See what your first visit covers.',
    brief: 'A conversation about your dental health, a full inspection with X-rays if needed, and a no-obligation discussion of options.',
    anchor: 'new-patients.html',
    service: 'New Patient Consultation',
    isNewPatient: true,
  };

  const EMERGENCY = { title: "I have a dental emergency / I'm in pain", desc: 'Please contact us urgently.', urgent: true };

  function scrollDown() {
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }
  function addBotMsg(html) {
    const d = document.createElement('div'); d.className = 'sofia-msg sofia-msg-bot'; d.innerHTML = html; body.appendChild(d); scrollDown();
  }
  function addUserMsg(t) {
    const d = document.createElement('div'); d.className = 'sofia-msg sofia-msg-user'; d.textContent = t; body.appendChild(d); scrollDown();
  }
  function addQuickReplies(options, handler) {
    const wrap = document.createElement('div'); wrap.className = 'sofia-quick-replies';
    options.forEach((label) => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sofia-quick-btn'; btn.textContent = label;
      btn.onclick = () => { wrap.remove(); addUserMsg(label); handler(label); };
      wrap.appendChild(btn);
    });
    body.appendChild(wrap); scrollDown();
  }
  function showTyping() {
    const t = document.createElement('div'); t.className = 'sofia-typing'; t.id = 'sofia-typing-indicator'; t.innerHTML = '<span></span><span></span><span></span>'; body.appendChild(t); scrollDown();
  }
  function hideTyping() {
    const t = document.getElementById('sofia-typing-indicator'); if (t) t.remove();
  }
  function replyWithDelay(text, cb) {
    showTyping();
    setTimeout(() => { hideTyping(); addBotMsg(text); if (cb) cb(); }, 600 + Math.random() * 400);
  }

  function showMenu() {
    const instr = document.createElement('div'); instr.className = 'sofia-instruction'; instr.textContent = 'Tap an option below to get started.'; body.appendChild(instr);
    [...TOPICS, NEW_PATIENT_ITEM, EMERGENCY].forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'sofia-card' + (item.urgent ? ' sofia-card-urgent' : '');
      card.style.animationDelay = (i * 40) + 'ms';
      card.tabIndex = 0;
      card.innerHTML = `<div class="sofia-card-title">${item.title}</div><div class="sofia-card-sub">${item.desc}</div><span class="sofia-card-chevron" aria-hidden="true">&#8250;</span>`;
      card.onclick = () => handleTopicClick(item);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTopicClick(item); } };
      body.appendChild(card);
    });
    scrollDown();
  }

  function handleTopicClick(item) {
    addUserMsg(item.title);
    if (item.urgent) {
      replyWithDelay("Please call us urgently on <a href='tel:01702553106'>01702 553 106</a> so we can help right away.");
      return;
    }
    replyWithDelay('Would you like to know more first, or go ahead and book?', () => {
      addQuickReplies(['Tell me more', 'Book now'], (choice) => {
        if (choice === 'Tell me more') {
          addBotMsg(`${item.brief} <a href="${item.anchor}" id="sofia-details-link" rel="noopener">See full details</a>`);
          const link = document.getElementById('sofia-details-link');
          if (link) {
            link.addEventListener('click', () => {
              // Real page navigation is about to happen — save state so the widget
              // reopens picking up where it left off, instead of forgetting everything.
              try {
                sessionStorage.setItem('sofia_visitor_name', visitorName || '');
                sessionStorage.setItem('sofia_should_reopen', '1');
              } catch (e) { /* sessionStorage unavailable — degrade gracefully, no persistence */ }
            });
          }
        } else if (item.isNewPatient) {
          startNewPatientBooking();
        } else {
          startBookingIntent(item.service, null);
        }
      });
    });
  }

  function startNewPatientBooking() {
    replyWithDelay('Which service would you like to book for your first visit?', () => {
      addQuickReplies(TOPICS.map((t) => t.title), (chosenTitle) => {
        const chosen = TOPICS.find((t) => t.title === chosenTitle);
        // Patient type already known — skip asking again
        startBookingIntent(chosen ? chosen.service : chosenTitle, 'New patient');
      });
    });
  }

  let bookingIntentData = {};
  let bookingState = null;

  function startBookingIntent(service, presetPatientType) {
    bookingIntentData = { service: service };

    function askContactMethod() {
      replyWithDelay('How would you like us to contact you to confirm — text or email?', () => {
        addQuickReplies(['Text me', 'Email me'], (choice) => {
          bookingState = choice === 'Text me' ? 'awaiting-phone' : 'awaiting-email';
          replyWithDelay(choice === 'Text me' ? 'What number should I send it to?' : 'What email address should I send it to?');
        });
      });
    }

    if (presetPatientType) {
      bookingIntentData.patientType = presetPatientType;
      askContactMethod();
      return;
    }

    replyWithDelay('Are you a new or existing patient?', () => {
      addQuickReplies(['New patient', 'Existing patient'], (patientType) => {
        bookingIntentData.patientType = patientType;
        askContactMethod();
      });
    });
  }

  let pendingConfirm = null;

  function confirmContactValue(val, contactType) {
    pendingConfirm = { val, contactType };
    bookingState = 'confirming-contact';
    const label = contactType === 'phone' ? 'number' : 'email address';
    replyWithDelay(`Just to confirm — is <strong>${val}</strong> the right ${label}?`, () => {
      addQuickReplies(['Yes, that\'s right', 'No, let me retype it'], (choice) => {
        bookingState = null;
        if (choice === 'Yes, that\'s right') {
          pendingConfirm = null;
          reviewBookingIntent(val, contactType);
        } else {
          pendingConfirm = null;
          bookingState = contactType === 'phone' ? 'awaiting-phone' : 'awaiting-email';
          replyWithDelay(contactType === 'phone' ? 'What number should I send it to?' : 'What email address should I send it to?');
        }
      });
    });
  }

  function reviewBookingIntent(contactValue, contactType) {
    bookingState = null;
    bookingIntentData.contactType = contactType;
    bookingIntentData.contactValue = contactValue;
    const contactLabel = contactType === 'phone' ? 'Phone' : 'Email';
    const summary = `
      <strong>Please check your details:</strong><br>
      &bull; Name: ${visitorName || 'Not given'}<br>
      &bull; Patient type: ${bookingIntentData.patientType}<br>
      &bull; Service: ${bookingIntentData.service}<br>
      &bull; ${contactLabel}: ${contactValue}<br><br>
      Tap Confirm to send your request, or Start Over to change something.
    `;
    replyWithDelay(summary, () => {
      addQuickReplies(['Confirm request', 'Start over'], (choice) => {
        if (choice === 'Confirm request') {
          submitBookingIntent();
        } else {
          startOver();
        }
      });
    });
  }

  function submitBookingIntent() {
    replyWithDelay(`Thanks${visitorName ? ', ' + visitorName : ''} — we've received your request for ${bookingIntentData.service}. Our team will contact you shortly to confirm a time.`);

    fetch(BOOKING_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: visitorName, patientType: bookingIntentData.patientType, service: bookingIntentData.service,
        contactType: bookingIntentData.contactType, contactValue: bookingIntentData.contactValue,
      }),
    }).catch((err) => console.error('Sofia booking-intent webhook failed:', err));
  }

  function startOver() {
    bookingIntentData = {};
    bookingState = null;
    replyWithDelay('No problem — let\'s start again. What would you like help with?', showMenu);
  }

  function extractName(text) {
    let cleaned = text.trim().replace(/[!.?]+$/, '').trim();
    if (!cleaned) return null;
    let usedExplicitIntro = false;
    const nameIsMatch = cleaned.match(/\bname is\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
    if (nameIsMatch) { cleaned = nameIsMatch[1].trim(); usedExplicitIntro = true; }
    else {
      const explicitMatch = cleaned.match(/(?:i am|i'?m|im|it'?s|its|this is|call me)\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
      if (explicitMatch) { cleaned = explicitMatch[1].trim(); usedExplicitIntro = true; }
      else {
        const leads = [/^(hi|hello|hey|hiya)[,!\s]+/i, /^(hi|hello|hey|hiya)$/i, /^(i am|i'?m|im)\s+/i, /^(this is|it'?s|its|call me)\s+/i];
        let changed = true;
        while (changed) { changed = false; for (const p of leads) { const n = cleaned.replace(p, '').trim(); if (n !== cleaned) { cleaned = n; changed = true; } } }
      }
    }
    // If we matched "name is"/"I'm" etc., the capture is greedy and may run on into the
    // rest of the sentence ("name is nick i would like to book..."). Trim at the first
    // word that clearly isn't part of a name, capping at 3 name-words either way.
    if (usedExplicitIntro) {
      const stopWords = /^(i|and|but|so|who|that|would|like|want|need|please|to|im|is|was|will|can|could|d|ll|ve)$/i;
      const words = cleaned.split(/\s+/);
      const nameWords = [];
      for (const w of words) {
        const bare = w.replace(/'/g, '');
        if (stopWords.test(bare)) break;
        nameWords.push(w);
        if (nameWords.length >= 3) break;
      }
      cleaned = nameWords.join(' ');
    }
    cleaned = cleaned.replace(/[!.?]+$/, '').trim();
    if (!cleaned || cleaned.length > 40 || cleaned.split(/\s+/).length > 3) return null;
    if (/\?/.test(cleaned)) return null;
    if (/^(sofia|sophie)$/i.test(cleaned)) return null;
    return cleaned.split(/\s+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }

  function getBotReply(userText) {
    const t = userText.toLowerCase();
    const footer = ' Call <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a>.';
    if (t.includes('emergency') || t.includes('pain') || t.includes('urgent')) return "Please call us urgently on <a href='tel:01702553106'>01702 553 106</a>.";
    if (/\b(thank\s*(you|u)|thanks?|thnk|thx|ty|cheers)\b/i.test(t) && t.split(/\s+/).length <= 5) return "You're welcome! Let us know if there's anything else I can help with.";
    if (t.includes('cancel')) return "I'm not able to cancel appointments here — please call us on <a href='tel:01702553106'>01702 553 106</a>.";
    if (t.includes('reschedule')) return "I'm not able to reschedule appointments here — please call us on <a href='tel:01702553106'>01702 553 106</a>.";
    if (t.includes('hour') || t.includes('open') || t.includes('close')) return "We're open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.";
    if (t.includes('address') || t.includes('where')) return 'We\'re at 279 London Road, Hadleigh, Essex, SS7 2BN.' + footer;
    if (t.includes('phone') || t.includes('call')) return 'Call us on <a href="tel:01702553106">01702 553 106</a>.';
    return "That's a great question — I don't have the specific details on hand, but our team can help with almost anything dental." + footer;
  }

  function matchServiceFromText(text) {
    const t = text.toLowerCase();
    // Order matters slightly — more specific checks first to avoid one keyword
    // accidentally matching the wrong service.
    if (/inv\w*lign/.test(t) || t.includes('aligner') || t.includes('brace')) {
      return TOPICS.find((s) => s.service === 'Invisalign');
    }
    if (t.includes('implant')) {
      return TOPICS.find((s) => s.service === 'Dental Implants');
    }
    if (t.includes('whiten') || t.includes('bleach')) {
      return TOPICS.find((s) => s.service === 'Teeth Whitening');
    }
    if (t.includes('hygien') || t.includes('clean') || t.includes('scale') || t.includes('polish')) {
      return TOPICS.find((s) => s.service === 'Teeth Cleaning / Hygienist');
    }
    if (t.includes('check-up') || t.includes('checkup') || t.includes('check up') || t.includes('routine')) {
      return TOPICS.find((s) => s.service === 'Routine Check-up');
    }
    if (t.includes('nhs') || t.includes('family')) {
      return TOPICS.find((s) => s.service === 'Family Dentistry / NHS');
    }
    return null;
  }

  function isGenericBookingIntent(text) {
    const t = text.toLowerCase();
    const hasBookingWord = (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule')))
      && !t.includes('cancel') && !t.includes('reschedul');
    return hasBookingWord;
  }

  function handleGeneralInput(text) {
    if (bookingState === 'confirming-contact' && pendingConfirm) {
      const t = text.trim().toLowerCase();
      if (/\bemail\b/i.test(t) && pendingConfirm.contactType !== 'email') {
        pendingConfirm = null;
        bookingState = 'awaiting-email';
        replyWithDelay('Sure — what\'s your email address?');
        return;
      }
      if (/\b(phone|text|number|mobile)\b/i.test(t) && pendingConfirm.contactType !== 'phone') {
        pendingConfirm = null;
        bookingState = 'awaiting-phone';
        replyWithDelay('No problem — what\'s your phone number?');
        return;
      }
      if (/^(yes|yeah|yep|correct|right|that'?s right|yup)\b/i.test(t)) {
        const { val, contactType } = pendingConfirm;
        pendingConfirm = null;
        bookingState = null;
        reviewBookingIntent(val, contactType);
        return;
      }
      if (/^(no|nope|wrong|incorrect)\b/i.test(t)) {
        const { contactType } = pendingConfirm;
        pendingConfirm = null;
        bookingState = contactType === 'phone' ? 'awaiting-phone' : 'awaiting-email';
        replyWithDelay(contactType === 'phone' ? 'What number should I send it to?' : 'What email address should I send it to?');
        return;
      }
      replyWithDelay('Just tap Yes or No above, or let me know if you\'d rather switch to phone or email.');
      return;
    }
    if (bookingState === 'awaiting-phone') {
      const val = text.trim();
      if (/\bemail\b/i.test(val)) {
        bookingState = 'awaiting-email';
        replyWithDelay('Sure — what\'s your email address?');
        return;
      }
      const digits = val.replace(/[^0-9]/g, '');
      const looksValid = /^[0-9+()\s-]{7,}$/.test(val) && digits.length >= 7;
      if (!looksValid) { replyWithDelay("That doesn't look like a valid phone number — could you try again? Or just say \"email\" if you'd rather use that instead."); return; }
      confirmContactValue(val, 'phone');
      return;
    }
    if (bookingState === 'awaiting-email') {
      const val = text.trim().toLowerCase();
      if (/\b(phone|text|number|mobile)\b/i.test(val)) {
        bookingState = 'awaiting-phone';
        replyWithDelay('No problem — what\'s your phone number?');
        return;
      }
      const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!looksValid) { replyWithDelay("That doesn't look like a valid email address — could you try again? Or just say \"phone\" if you'd rather use that instead."); return; }
      confirmContactValue(val, 'email');
      return;
    }
    if (!visitorName) {
      const name = extractName(text);
      if (!name) { replyWithDelay("I didn't quite catch your name — what should I call you?"); return; }
      visitorName = name;
      replyWithDelay(`Nice to meet you, ${name}! How can I help you today?`, showMenu);
      return;
    }
    if (/^(not sure|i don'?t know|idk|no idea|dunno|not yet)\b/i.test(text.trim())) {
      bookingState = null;
      replyWithDelay('No worries — take a look through the options below, or ask me anything specific.', showMenu);
      return;
    }
    if (/^(ok\s+)?(nothing|no thanks|no thank you|nope|no|that'?s all|that'?s it|all good|i'?m good|all set|im good|bye|goodbye|good bye|cheers)[.!]*$/i.test(text.trim()) && text.trim().split(/\s+/).length <= 4) {
      bookingState = null;
      replyWithDelay("No problem — thanks for stopping by! We're here whenever you need us.");
      return;
    }
    if (isGenericBookingIntent(text)) {
      replyWithDelay('Sure — which service would you like to book?', () => {
        addQuickReplies(TOPICS.map((t) => t.title), (chosenTitle) => {
          const chosen = TOPICS.find((t) => t.title === chosenTitle);
          startBookingIntent(chosen ? chosen.service : chosenTitle, null);
        });
      });
      return;
    }
    const matchedService = matchServiceFromText(text);
    if (matchedService) {
      // Reuse the exact same flow as clicking the button — "read more or book?" —
      // so a typed mention (even partial, like "whitening" or "implants") gets the
      // same helpful, guided experience as a menu click, not just a static blurb.
      replyWithDelay('Would you like to know more first, or go ahead and book?', () => {
        addQuickReplies(['Tell me more', 'Book now'], (choice) => {
          if (choice === 'Tell me more') {
            addBotMsg(`${matchedService.brief} <a href="${matchedService.anchor}" target="_blank" rel="noopener">See full details</a>`);
          } else {
            startBookingIntent(matchedService.service, null);
          }
        });
      });
      return;
    }
    replyWithDelay(getBotReply(text));
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addUserMsg(text);
    input.value = '';
    handleGeneralInput(text);
  }

  function openPanel() {
    document.body.classList.add('sofia-open');
    if (badge) badge.style.display = 'none';
    if (!hasOpenedBefore) { hasOpenedBefore = true; replyWithDelay("Hi! I'm Sofia 👋 What's your name?"); }
  }

  // Check once, on load, whether we should reopen automatically (visitor just followed
  // a "See full details" link from the chat). A normal page refresh never sets this flag,
  // so an ordinary reload still resets the conversation as expected.
  (function checkReopen() {
    try {
      if (sessionStorage.getItem('sofia_should_reopen') === '1') {
        const savedName = sessionStorage.getItem('sofia_visitor_name');
        sessionStorage.removeItem('sofia_should_reopen');
        sessionStorage.removeItem('sofia_visitor_name');
        if (savedName) {
          visitorName = savedName;
          hasOpenedBefore = true;
          document.body.classList.add('sofia-open');
          if (badge) badge.style.display = 'none';
          replyWithDelay(`Welcome back, ${savedName}! Pick another option below, or ask me anything.`, showMenu);
        }
      }
    } catch (e) { /* sessionStorage unavailable — just behaves like a normal fresh load */ }
  })();
  function closePanel() { document.body.classList.remove('sofia-open'); }
  function toggle() { document.body.classList.contains('sofia-open') ? closePanel() : openPanel(); }

  function fullReset() {
    visitorName = null;
    bookingState = null;
    bookingIntentData = {};
    body.innerHTML = '';
    refreshBtn.classList.add('spinning');
    setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    replyWithDelay("Hi! I'm Sofia 👋 What's your name?");
  }

  launcher.addEventListener('click', toggle);
  closeBtn.addEventListener('click', closePanel);
  refreshBtn.addEventListener('click', fullReset);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  const mobileMenuObserver = new MutationObserver(() => {
    document.body.classList.toggle('sofia-menu-open', document.body.classList.contains('menu-open'));
  });
  mobileMenuObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
