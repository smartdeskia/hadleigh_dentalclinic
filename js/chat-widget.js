// Sofia — self-contained chat widget for Hadleigh Dental & Cosmetic Centre
// Injects its own styles and markup — does not depend on any external CSS.
// Drop-in replacement for js/chat-widget.js. Include once per page:
//   <script src="js/chat-widget.js" defer></script>
// Requires no matching HTML — it builds its own launcher + panel.

(function () {
  'use strict';

  /* ======================================================================
     STYLES — injected once, self-contained
     ====================================================================== */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #sofia-root {
      --primary: #17332e;
      --accent: #e8735f;
      --bg: #f4f6f5;
      --text: #1e2b2b;
      --muted: #7c8c8a;
      --line: rgba(30,43,43,0.1);
      font-family: 'Inter', -apple-system, sans-serif;
    }
    #sofia-launcher {
      position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px;
      border-radius: 50%; background: var(--accent); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; z-index: 9998;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18); transition: transform 0.15s ease;
    }
    #sofia-launcher:hover { transform: scale(1.06); }
    #sofia-launcher::before {
      content: ''; position: absolute; inset: 0; border-radius: 50%;
      background: var(--accent); opacity: 0.5;
      animation: sofia-pulse 2.2s ease-out infinite; z-index: -1; pointer-events: none;
    }
    body.sofia-open #sofia-launcher::before { animation: none; opacity: 0; }
    @keyframes sofia-pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.9); opacity: 0; } }
    #sofia-launcher .icon-close { display: none; }
    body.sofia-open #sofia-launcher .icon-chat { display: none; }
    body.sofia-open #sofia-launcher .icon-close { display: block; }

    #sofia-panel {
      position: fixed; bottom: 84px; right: 24px; width: 380px; max-width: calc(100vw - 32px);
      max-height: calc(100vh - 120px); background: var(--bg); border-radius: 18px; overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25); z-index: 9997;
      display: flex; flex-direction: column;
      opacity: 0; transform: translateY(16px) scale(0.98); pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    body.sofia-open #sofia-panel { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

    #sofia-header {
      background: var(--primary); color: #fff; padding: 16px 18px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    #sofia-avatar {
      width: 38px; height: 38px; border-radius: 50%; background: var(--accent);
      display: flex; align-items: center; justify-content: center;
      font-family: Georgia, serif; font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    #sofia-header-text { flex: 1; }
    #sofia-header-name { font-family: Georgia, serif; font-weight: 600; font-size: 16px; }
    #sofia-header-sub { font-size: 12px; color: rgba(255,255,255,0.65); display: flex; align-items: center; gap: 6px; }
    #sofia-header-sub::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
    #sofia-close-btn {
      background: none; border: none; color: rgba(255,255,255,0.75); cursor: pointer;
      width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; flex-shrink: 0;
    }
    #sofia-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

    #sofia-body { flex: 0 1 auto; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }

    .sofia-instruction { font-size: 13px; color: var(--muted); margin: 4px 0 2px; }

    .sofia-card {
      position: relative; background: #fff; border: 1px solid var(--line); border-radius: 14px;
      padding: 14px 36px 14px 16px; cursor: pointer;
      transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
    }
    .sofia-card:hover, .sofia-card:focus-visible {
      box-shadow: 0 3px 10px rgba(0,0,0,0.08); border-color: var(--accent);
      transform: translateY(-1px); outline: none;
    }
    .sofia-card-title { font-family: Georgia, serif; font-weight: 700; font-size: 14.5px; color: var(--primary); margin-bottom: 3px; }
    .sofia-card-sub { font-size: 12.5px; color: var(--muted); line-height: 1.4; }
    .sofia-card-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--accent); font-size: 18px; }
    .sofia-card-urgent .sofia-card-title { color: #b84a3a; }

    .sofia-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
    .sofia-msg-bot { background: #fff; border: 1px solid var(--line); align-self: flex-start; border-bottom-left-radius: 4px; }
    .sofia-msg-user { background: var(--primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .sofia-msg a { color: #b8503a; font-weight: 600; }
    .sofia-msg ul { margin: 8px 0 0; padding-left: 18px; }

    .sofia-quick-replies { display: flex; flex-wrap: wrap; gap: 8px; align-self: flex-start; max-width: 92%; }
    .sofia-quick-btn {
      background: #fff; border: 1px solid var(--accent); color: var(--accent);
      font-weight: 600; font-size: 12.5px; padding: 8px 14px; border-radius: 100px;
      cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
    }
    .sofia-quick-btn:hover, .sofia-quick-btn:focus-visible { background: var(--accent); color: #fff; outline: none; }

    .sofia-typing { align-self: flex-start; background: #fff; border: 1px solid var(--line); border-radius: 14px; border-bottom-left-radius: 4px; padding: 12px 16px; display: flex; gap: 4px; }
    .sofia-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: sofia-bounce 1.2s infinite ease-in-out; }
    .sofia-typing span:nth-child(2) { animation-delay: 0.15s; }
    .sofia-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes sofia-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

    #sofia-input-row { border-top: 1px solid var(--line); padding: 12px; display: flex; gap: 8px; flex-shrink: 0; background: var(--bg); }
    #sofia-input { flex: 1; border: 1px solid #d5dcd9; border-radius: 100px; padding: 11px 16px; font-size: 16px; background: #fff; color: var(--text); }
    #sofia-input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
    #sofia-send { width: 42px; height: 42px; border-radius: 50%; background: var(--accent); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
    #sofia-send:hover { opacity: 0.9; }

    @media (max-width: 480px) {
      #sofia-panel { right: 16px; left: 16px; width: auto; bottom: 84px; max-height: min(88vh, calc(100dvh - 100px)); }
      #sofia-launcher { right: 16px; bottom: 16px; }
    }
    body.sofia-menu-open #sofia-launcher, body.sofia-menu-open #sofia-panel { display: none; }
  `;
  document.head.appendChild(styleEl);

  /* ======================================================================
     MARKUP — injected once
     ====================================================================== */
  const root = document.createElement('div');
  root.id = 'sofia-root';
  root.innerHTML = `
    <button id="sofia-launcher" aria-label="Open chat with Sofia">
      <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div id="sofia-panel" role="dialog" aria-label="Chat with Sofia">
      <div id="sofia-header">
        <div id="sofia-avatar">S</div>
        <div id="sofia-header-text">
          <div id="sofia-header-name">Sofia</div>
          <div id="sofia-header-sub">Hadleigh Dental Assistant</div>
        </div>
        <button id="sofia-close-btn" aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
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

  /* ======================================================================
     STATE + CONSTANTS
     ====================================================================== */
  const body = document.getElementById('sofia-body');
  const launcher = document.getElementById('sofia-launcher');
  const panel = document.getElementById('sofia-panel');
  const closeBtn = document.getElementById('sofia-close-btn');
  const input = document.getElementById('sofia-input');
  const sendBtn = document.getElementById('sofia-send');

  let visitorName = null;
  let greetingState = 'idle';
  let hasOpenedBefore = false;
  let bookingState = null;
  let bookingData = {};

  const BOOKING_WEBHOOK_URL = 'https://hook.make.com/PLACEHOLDER_BOOKING_WEBHOOK_ID';
  const BOOKING_TREATMENTS = ['General Check-up', 'Invisalign', 'Teeth Whitening', 'Dental Implants', 'Hygienist'];
  const BOOKING_SLOTS = ['Tuesday 10:00 AM', 'Wednesday 2:30 PM', 'Thursday 4:00 PM'];

  const QUESTION_HINTS = [
    'book', 'appointment', 'consult', 'hour', 'open', 'close', 'price', 'cost', 'how much',
    'where', 'address', 'location', 'park', 'nhs', 'finance', 'payment', 'implant', 'invisalign',
    'whiten', 'hygien', 'family', 'child', 'new patient', 'first visit', 'nervous', 'cosmetic',
    'botox', 'filler', 'email', 'phone', 'call', 'emergency', 'pain', 'urgent', 'toothache',
  ];

  const MENU_ITEMS = [
    { title: "I'm interested in Dental Implants", desc: 'From £2,000 per tooth. Book a free consultation.', href: 'dental-implants.html#cost', treatment: 'Dental Implants' },
    { title: "I'd like to learn about Invisalign", desc: 'Platinum Elite provider. Free consultation available.', href: 'invisalign.html#five-steps', treatment: 'Invisalign' },
    { title: "I'm interested in Teeth Whitening", desc: 'From £20/month, interest-free plans available.', href: 'teeth-whitening.html#pricing', treatment: 'Teeth Whitening' },
    { title: "I'd like to know about Family Dentistry / NHS pricing", desc: 'See NHS bands from £23.80.', href: 'family-dentistry.html#nhs-pricing' },
    { title: 'I need a hygienist appointment', desc: 'No referral needed — direct access available.', href: 'hygiene-plus.html#what-we-do', treatment: 'Hygienist' },
    { title: "I have a dental emergency / I'm in pain", desc: 'Please contact us urgently to arrange an appointment.', href: 'contact.html', urgent: true },
    { title: "I'm a new patient", desc: 'See what your first visit covers.', href: 'contact.html' },
    { title: 'More options', desc: 'Browse all our treatments.', href: 'index.html#treatment-highlights' },
  ];

  /* ======================================================================
     DOM HELPERS
     ====================================================================== */
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addBotMsg(html) {
    const div = document.createElement('div');
    div.className = 'sofia-msg sofia-msg-bot';
    div.innerHTML = html;
    body.appendChild(div);
    scrollDown();
  }

  function addUserMsg(text) {
    const div = document.createElement('div');
    div.className = 'sofia-msg sofia-msg-user';
    div.textContent = text;
    body.appendChild(div);
    scrollDown();
  }

  function addQuickReplies(options, handler) {
    const wrap = document.createElement('div');
    wrap.className = 'sofia-quick-replies';
    options.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sofia-quick-btn';
      btn.textContent = label;
      btn.onclick = () => {
        wrap.remove();
        addUserMsg(label);
        handler(label);
      };
      wrap.appendChild(btn);
    });
    body.appendChild(wrap);
    scrollDown();
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'sofia-typing';
    t.id = 'sofia-typing-indicator';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    scrollDown();
  }
  function hideTyping() {
    const t = document.getElementById('sofia-typing-indicator');
    if (t) t.remove();
  }

  function replyWithDelay(text, afterCallback) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addBotMsg(text);
      if (afterCallback) afterCallback();
    }, 700 + Math.random() * 500);
  }

  function showMenu() {
    const instruction = document.createElement('div');
    instruction.className = 'sofia-instruction';
    instruction.textContent = 'Tap an option below to get started.';
    body.appendChild(instruction);

    MENU_ITEMS.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'sofia-card' + (item.urgent ? ' sofia-card-urgent' : '');
      card.tabIndex = 0;
      card.innerHTML = `
        <div class="sofia-card-title">${item.title}</div>
        <div class="sofia-card-sub">${item.desc}</div>
        <span class="sofia-card-chevron" aria-hidden="true">&#8250;</span>
      `;
      card.onclick = () => handleMenuClick(item);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMenuClick(item); } };
      body.appendChild(card);
    });
    scrollDown();
  }

  /* ======================================================================
     MENU ROUTING
     ====================================================================== */
  function handleMenuClick(item) {
    addUserMsg(item.title);
    if (item.treatment) {
      replyWithDelay(`Sure — would you like to read more about ${item.treatment} first, or go ahead and book?`, () => {
        addQuickReplies(['Tell me more', 'Book an appointment'], (choice) => {
          if (choice === 'Tell me more') {
            window.location.href = item.href;
          } else {
            startBooking(item.treatment);
          }
        });
      });
      return;
    }
    addBotMsg("For that, our team can help directly — <a href='contact.html'>get in touch here</a>, or call <a href='tel:01702553106'>01702 553 106</a>.");
  }

  /* ======================================================================
     BOOKING FLOW — no race conditions: buttons only render inside the
     callback that fires after the message that introduces them.
     ====================================================================== */
  function startBooking(preselectedTreatment) {
    bookingState = 'patient-type';
    replyWithDelay("Great — let's get you booked in. Are you a new or existing patient?", () => {
      addQuickReplies(['New patient', 'Existing patient'], (choice) => {
        bookingData.patientType = choice;
        if (preselectedTreatment) {
          bookingData.treatment = preselectedTreatment;
          showSlots(preselectedTreatment);
        } else {
          replyWithDelay('What would you like to book?', () => {
            addQuickReplies(BOOKING_TREATMENTS, (treatment) => {
              bookingData.treatment = treatment;
              showSlots(treatment);
            });
          });
        }
      });
    });
  }

  function showSlots(treatment) {
    replyWithDelay(`I have openings for ${treatment}:`, () => {
      addQuickReplies(BOOKING_SLOTS, (slot) => {
        bookingData.slot = slot;
        if (visitorName) {
          askContactPreference();
        } else {
          bookingState = 'awaiting-booking-name';
          replyWithDelay('What name should I book this under?');
        }
      });
    });
  }

  function askContactPreference() {
    replyWithDelay(`Thanks, ${visitorName}! How would you like your confirmation — by text or email?`, () => {
      addQuickReplies(['Text me', 'Email me'], (choice) => {
        bookingState = choice === 'Text me' ? 'awaiting-phone' : 'awaiting-email';
        replyWithDelay(choice === 'Text me' ? 'What number should I send it to?' : 'What email address should I send it to?');
      });
    });
  }

  function submitBooking(contactValue, contactType) {
    bookingData.contact = contactValue;
    bookingData.contactType = contactType;
    bookingState = null;
    const contactLine = contactType === 'email'
      ? `We'll email a confirmation to ${contactValue} once it's set.`
      : `We'll text a confirmation to ${contactValue} once it's set.`;
    replyWithDelay(`Thanks, ${visitorName} — we've received your request. ${bookingData.treatment} on ${bookingData.slot}. Our team will confirm shortly. ${contactLine}`);

    fetch(BOOKING_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: visitorName, patientType: bookingData.patientType, treatment: bookingData.treatment,
        requestedSlot: bookingData.slot, contactType: bookingData.contactType, contactValue: bookingData.contact,
      }),
    }).catch((err) => console.error('Sofia booking webhook failed:', err));
  }

  /* ======================================================================
     GENERAL KEYWORD REPLIES — real content, ported from the site's copy
     ====================================================================== */
  function normalize(text) { return text.trim().toLowerCase().replace(/[?!.,;:]+$/g, '').trim(); }
  function looksLikeQuestion(text) {
    const t = text.toLowerCase();
    if (t.includes('?')) return true;
    return QUESTION_HINTS.some((h) => t.includes(h));
  }
  function isGreeting(text) { return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[!.?\s]*$/i.test(text.trim().toLowerCase()); }
  function isThankYou(text) {
    const t = normalize(text);
    if (t.split(/\s+/).length > 5) return false;
    return /\b(thank\s*you|thanks?|thnk|thx|cheers)\b/.test(t) && !/thanks?\s+(for|about|regarding)\b/.test(t);
  }
  function isBotName(text) { const t = text.trim().toLowerCase(); return t === 'sofia' || t === 'sophie'; }
  function mentionsInvisalign(text) { const t = normalize(text); return /inv\w*lign/.test(t) || t.includes('aligner') || t.includes('brace'); }
  function mentionsCleaning(text) { const t = text.toLowerCase(); return t.includes('hygien') || t.includes('clean') || t.includes('scale') || t.includes('polish'); }
  function formatName(text) { return text.split(/\s+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' '); }

  function extractName(text) {
    let cleaned = text.trim().replace(/[!.?]+$/, '').trim();
    if (!cleaned) return null;
    let fromExplicit = false;
    const nameIsMatch = cleaned.match(/\bname is\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
    if (nameIsMatch) {
      cleaned = nameIsMatch[1].trim();
      fromExplicit = true;
    } else {
      const explicitMatch = cleaned.match(/(?:i am|i'?m|im|it'?s|its|this is|call me)\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
      if (explicitMatch) {
        cleaned = explicitMatch[1].trim();
        fromExplicit = true;
      } else {
        const leadPatterns = [
          /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[,!\s]+/i,
          /^(hi|hello|hey|hiya)$/i, /^(i am|i'?m|im)\s+/i, /^(this is|it'?s|its|call me)\s+/i,
        ];
        let changed = true;
        while (changed) {
          changed = false;
          for (const p of leadPatterns) {
            const next = cleaned.replace(p, '').trim();
            if (next !== cleaned) { cleaned = next; changed = true; }
          }
        }
      }
    }
    cleaned = cleaned.replace(/[!.?]+$/, '').trim();
    if (!cleaned || cleaned.length > 40 || cleaned.split(/\s+/).length > 3) return null;
    if (looksLikeQuestion(cleaned) || isGreeting(cleaned)) return null;
    if (!fromExplicit && isBotName(cleaned)) return null;
    return formatName(cleaned);
  }

  function personalize(text) {
    if (!visitorName) return text;
    if (text.startsWith("That's a great question")) return text.replace("That's a great question", `That's a great question, ${visitorName},`);
    return text;
  }

  function getBotReply(userText) {
    const t = userText.toLowerCase();
    const footer = ' For anything else, call <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a>.';

    if (t.includes('emergency') || t.includes('pain') || t.includes('urgent') || t.includes('toothache'))
      return personalize('If you\'re in pain, please call us urgently on <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> so we can arrange an appointment as soon as possible.');
    if (isThankYou(userText)) return "You're welcome! Let us know if there's anything else I can help with.";
    if (t.includes('reschedule') || t.includes('move my appointment'))
      return personalize('I\'m not able to reschedule appointments directly here — please call us on <a href="tel:01702553106">01702 553 106</a>, or use our <a href="contact.html">contact form</a> and mention you\'d like to reschedule.');
    if (t.includes('cancel'))
      return personalize('I\'m not able to cancel appointments directly here — please call us on <a href="tel:01702553106">01702 553 106</a>, or use our <a href="contact.html">contact form</a> and mention you\'d like to cancel.');
    if (mentionsCleaning(userText))
      return personalize('Direct-access hygiene is available with no referral needed. See our <a href="hygiene-plus.html#what-we-do">Hygiene Plus page</a>.' + footer);
    if (t.includes('implant'))
      return personalize('Dental implants generally start from around &pound;2,000 per tooth. See <a href="dental-implants.html#cost">costs and the 5-step process</a>.' + footer);
    if (mentionsInvisalign(userText))
      return personalize('We\'re a Platinum Elite Invisalign provider. See the <a href="invisalign.html#five-steps">5-step Invisalign process</a>.' + footer);
    if (t.includes('whiten') || t.includes('bleach'))
      return personalize('Teeth whitening starts from as little as &pound;20 per month on interest-free plans. See <a href="teeth-whitening.html#pricing">pricing</a>.' + footer);
    if (t.includes('book') || t.includes('appointment') || t.includes('consult'))
      return personalize('We offer a range of treatments, including:<ul><li>General Dentistry</li><li>Invisalign</li><li>Teeth Whitening</li><li>Dental Implants</li><li>Dental Hygiene (no referral needed)</li></ul>' + footer);
    if (t.includes('hour') || t.includes('open') || t.includes('close'))
      return personalize("We're open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.");
    if (t.includes('address') || t.includes('where') || t.includes('location'))
      return personalize('We\'re at 279 London Road, Hadleigh, Essex, SS7 2BN.' + footer);
    if (t.includes('nhs'))
      return personalize('NHS treatment is charged in bands &mdash; Band 1 from &pound;23.80, Band 2 &pound;65.20, Band 3 &pound;282.80. See <a href="family-dentistry.html#nhs-pricing">Family Dentistry</a>.');
    if (t.includes('finance') || t.includes('payment plan'))
      return personalize('0% finance is available on treatment from &pound;500.' + footer);
    if (t.includes('price') || t.includes('cost') || t.includes('how much'))
      return personalize('Our full price list is on the <a href="about.html#pricing">About page</a>.');
    if (t.includes('new patient') || t.includes('first visit') || t.includes('nervous'))
      return personalize('No pressure at all &mdash; our <a href="new-patients.html">New Patients page</a> covers exactly what to expect.' + footer);
    if (t.includes('email'))
      return personalize('You can email us at <a href="mailto:info@hdp.me.uk">info@hdp.me.uk</a> or use the <a href="contact.html">contact form</a>.');
    if (t.includes('phone') || t.includes('call') || t.includes('01702'))
      return personalize('Call us on <a href="tel:01702553106">01702 553 106</a>.');
    return personalize('That\'s a great question — I don\'t have the specific details on hand, but our team can help with almost anything dental.' + footer);
  }

  /* ======================================================================
     INPUT HANDLING
     ====================================================================== */
  function handleGeneralInput(text) {
    if (bookingState === 'awaiting-booking-name') {
      const name = extractName(text) || text.trim();
      visitorName = formatName(name);
      greetingState = 'ready';
      askContactPreference();
      return;
    }
    if (bookingState === 'awaiting-phone') { submitBooking(text.trim(), 'phone'); return; }
    if (bookingState === 'awaiting-email') { submitBooking(text.trim(), 'email'); return; }

    if (!visitorName) {
      const name = extractName(text);
      if (!name) {
        replyWithDelay("I didn't quite catch your name — what should I call you?");
        return;
      }
      visitorName = name;
      replyWithDelay(`Nice to meet you, ${name}! How can I help you today?`, () => {
        showMenu();
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
    if (!hasOpenedBefore) {
      hasOpenedBefore = true;
      replyWithDelay("Hi! I'm Sofia 👋 What's your name?");
    }
  }
  function closePanel() { document.body.classList.remove('sofia-open'); }
  function toggle() {
    if (document.body.classList.contains('sofia-open')) closePanel();
    else openPanel();
  }

  launcher.addEventListener('click', toggle);
  closeBtn.addEventListener('click', closePanel);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  const mobileMenuObserver = new MutationObserver(() => {
    document.body.classList.toggle('sofia-menu-open', document.body.classList.contains('menu-open'));
  });
  mobileMenuObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
