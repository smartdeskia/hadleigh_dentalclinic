// Sofia — hybrid website assistant
// Structured topic menu + keyword-matched free-text replies (no AI backend).

(function () {
  const launcher = document.getElementById('chat-launcher');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');

  if (!launcher || !panel) return;

  const CONTACT_FOOTER =
    ' For anything else, our team can help directly — <a href="contact.html">get in touch here</a>.';

  const QUESTION_HINTS = [
    'book', 'appointment', 'consult', 'hour', 'open', 'close', 'price', 'cost', 'how much',
    'where', 'address', 'location', 'park', 'nhs', 'finance', 'payment', 'implant', 'invisalign',
    'whiten', 'hygien', 'family', 'child', 'new patient', 'first visit', 'nervous', 'cosmetic',
    'botox', 'filler', 'email', 'phone', 'call', 'emergency', 'pain', 'urgent', 'toothache',
  ];

  const MENU_ITEMS = [
    {
      title: "I'm interested in Dental Implants",
      description: 'From £2,000 per tooth. Book a free consultation.',
      href: 'dental-implants.html#cost',
    },
    {
      title: "I'd like to learn about Invisalign",
      description: 'Platinum Elite provider. Free consultation available.',
      href: 'invisalign.html#five-steps',
    },
    {
      title: "I'm interested in Teeth Whitening",
      description: 'From £20/month, interest-free plans available.',
      href: 'teeth-whitening.html#pricing',
    },
    {
      title: "I'd like to know about Family Dentistry / NHS pricing",
      description: 'See NHS bands from £23.80.',
      href: 'family-dentistry.html#nhs-pricing',
    },
    {
      title: 'I need a hygienist appointment',
      description: 'No referral needed — direct access available.',
      href: 'hygiene-plus.html#what-we-do',
    },
    {
      title: "I have a dental emergency / I'm in pain",
      description: 'Please contact us urgently to arrange an appointment.',
      href: 'contact.html',
      urgent: true,
    },
    {
      title: "I'm a new patient",
      description: 'See what your first visit covers.',
      href: 'contact.html',
      booking: true,
    },
    {
      title: 'More options',
      description: 'Browse all our treatments.',
      href: 'index.html#treatment-highlights',
    },
  ];

  let visitorName = null;
  let greetingState = 'idle';
  let hasShownOpeningGreeting = false;

  panel.querySelectorAll('#chat-messages, #chat-quick-replies, #chat-input-form, .chat-body, .chat-transcript').forEach((el) => {
    el.remove();
  });

  const chatBody = document.createElement('div');
  chatBody.className = 'chat-body';
  chatBody.innerHTML = `
    <div class="chat-emergency-bar">
      <span class="chat-emergency-label">Urgent? Call now</span>
      <a class="chat-emergency-phone" href="tel:01702553106">01702 553 106</a>
    </div>
    <p class="chat-menu-intro">Choose a topic below and we'll take you straight to the right place.</p>
    <nav class="chat-menu-list" aria-label="Help topics"></nav>
  `;
  panel.appendChild(chatBody);

  const menuList = chatBody.querySelector('.chat-menu-list');
  MENU_ITEMS.forEach((item) => {
    const link = document.createElement('a');
    link.className = 'chat-menu-item';
    if (item.urgent) link.classList.add('chat-menu-item-urgent');
    link.href = item.href;
    link.innerHTML = `
      <span class="chat-menu-item-title">${item.title}</span>
      <span class="chat-menu-item-desc">${item.description}</span>
    `;
    link.addEventListener('click', () => {
      document.body.classList.remove('chat-open');
    });
    menuList.appendChild(link);
  });

  const messagesEl = document.createElement('div');
  messagesEl.id = 'chat-messages';
  messagesEl.className = 'chat-transcript';
  messagesEl.setAttribute('aria-live', 'polite');
  panel.appendChild(messagesEl);

  const form = document.createElement('form');
  form.id = 'chat-input-form';
  form.className = 'chat-input-row';
  form.innerHTML = `
    <input id="chat-input" type="text" placeholder="Ask Sofia anything&hellip;" autocomplete="off">
    <button id="chat-send-btn" type="submit" class="chat-send-btn" aria-label="Send">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 18 9-18 9 4-9-4-9z"/></svg>
    </button>
  `;
  panel.appendChild(form);

  const input = form.querySelector('#chat-input');
  const sendBtn = form.querySelector('#chat-send-btn');

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBotReply(text) {
    // Safety net: convert any markdown links to HTML (replies should use HTML directly).
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  function finalizeReply(text) {
    if (text.includes('contact.html') || text.includes('tel:01702553106')) {
      return text;
    }
    return text + CONTACT_FOOTER;
  }

  function isGreeting(text) {
    const t = text.trim().toLowerCase();
    return /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[!.?\s]*$/i.test(t);
  }

  function isThankYou(text) {
    const t = text.trim().toLowerCase().replace(/[!.?]+$/, '').trim();
    if (/^(thank you|thanks|thankyou|cheers)$/.test(t)) return true;
    if (/^(ok(ay)?|great|lovely|perfect)\s+(thanks|thank you|thankyou|cheers)$/.test(t)) return true;
    return false;
  }

  function looksLikeQuestion(text) {
    const t = text.toLowerCase();
    if (t.includes('?')) return true;
    return QUESTION_HINTS.some((hint) => t.includes(hint));
  }

  function mentionsCleaning(text) {
    const t = text.toLowerCase();
    // "clean" covers cleaning/cleanings and typos like "teetgh cleaning" (no exact "teeth" required).
    return t.includes('hygien') || t.includes('clean') || t.includes('scale') || t.includes('polish');
  }

  function extractName(text) {
    let cleaned = text.trim().replace(/[!.?]+$/, '').trim();
    if (!cleaned) return null;

    // "name is" anywhere — handles typos ("may name is Rich") and extra lead-ins ("Hi my name is Sophie").
    const nameIsMatch = cleaned.match(/\bname is\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
    if (nameIsMatch) {
      cleaned = nameIsMatch[1].trim();
    } else {
      const explicitMatch = cleaned.match(
        /(?:i am|i'?m|im|it'?s|its|this is|call me)\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i
      );
      if (explicitMatch) {
        cleaned = explicitMatch[1].trim();
      } else {
        const leadPatterns = [
          /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[,!\s]+/i,
          /^(i am|i'?m|im)\s+/i,
          /^(this is|it'?s|its|call me)\s+/i,
        ];
        let changed = true;
        while (changed) {
          changed = false;
          for (const pattern of leadPatterns) {
            const next = cleaned.replace(pattern, '').trim();
            if (next !== cleaned) {
              cleaned = next;
              changed = true;
            }
          }
        }
      }
    }

    cleaned = cleaned.replace(/[!.?]+$/, '').trim();
    if (!cleaned || cleaned.length > 40 || cleaned.split(/\s+/).length > 3) return null;
    if (looksLikeQuestion(cleaned) || isGreeting(cleaned)) return null;

    return cleaned
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  function maybePersonalize(text) {
    if (!visitorName) return text;
    if (text.startsWith('That\'s a great question')) {
      return text.replace('That\'s a great question', `That's a great question, ${escapeHtml(visitorName)},`);
    }
    return text;
  }

  function getGeneralBookingReply() {
    return maybePersonalize(
      'We offer a range of treatments, including:' +
      '<ul>' +
      '<li>General Dentistry (check-ups, fillings, root canal)</li>' +
      '<li>Invisalign</li>' +
      '<li>Teeth Whitening</li>' +
      '<li>Dental Implants</li>' +
      '<li>Dental Hygiene (no referral needed)</li>' +
      '</ul>' +
      'To book, call us on <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> and let us know which you\'re interested in.'
    );
  }

  function getBotReply(userText) {
    const t = userText.toLowerCase();

    if (t.includes('emergency') || t.includes('pain') || t.includes('urgent') || t.includes('toothache')) {
      return finalizeReply(
        maybePersonalize(
          'If you\'re in pain, please call us urgently on <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> so we can arrange an appointment as soon as possible.'
        )
      );
    }
    if (isThankYou(userText)) {
      return 'You\'re welcome! Let us know if there\'s anything else I can help with.';
    }
    if (t.includes('reschedule') || t.includes('change my appointment') || t.includes('move my appointment')) {
      return finalizeReply(
        maybePersonalize(
          'I\'m not able to reschedule appointments directly here — please call us on <a href="tel:01702553106">01702 553 106</a> and our team can help right away, or use our <a href="contact.html">contact form</a> and mention you\'d like to reschedule.'
        )
      );
    }
    if (t.includes('cancel')) {
      return finalizeReply(
        maybePersonalize(
          'I\'m not able to cancel appointments directly here — please call us on <a href="tel:01702553106">01702 553 106</a> and our team can help right away, or use our <a href="contact.html">contact form</a> and mention you\'d like to cancel.'
        )
      );
    }
    if (
      (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule')))
      && mentionsCleaning(userText)
    ) {
      return finalizeReply(
        maybePersonalize(
          'Direct-access hygiene is available with no referral needed — visits from &pound;52 for 30 minutes. See our <a href="hygiene-plus.html#what-we-do">Hygiene Plus page</a>, then <a href="contact.html">get in touch to book</a>.'
        )
      );
    }
    if (
      (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule')))
      && (t.includes('implant'))
    ) {
      return finalizeReply(
        maybePersonalize(
          'Dental implants generally start from around &pound;2,000 per tooth. See <a href="dental-implants.html#cost">costs and the 5-step process</a>, then <a href="contact.html">book a free consultation</a>.'
        )
      );
    }
    if (
      (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule')))
      && (t.includes('invisalign') || t.includes('brace') || t.includes('aligner'))
    ) {
      return finalizeReply(
        maybePersonalize(
          'We\'re a Platinum Elite Invisalign provider. See the <a href="invisalign.html#five-steps">5-step Invisalign process</a>, then <a href="contact.html">book a free consultation</a>.'
        )
      );
    }
    if (
      (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule')))
      && (t.includes('whiten') || t.includes('bleach'))
    ) {
      return finalizeReply(
        maybePersonalize(
          'Teeth whitening starts from as little as &pound;20 per month on interest-free plans. See <a href="teeth-whitening.html#pricing">whitening options and pricing</a>, then <a href="contact.html">get in touch to book</a>.'
        )
      );
    }
    if (t.includes('book') || t.includes('appointment') || t.includes('consult') || (t.includes('schedule') && !t.includes('reschedule'))) {
      return finalizeReply(getGeneralBookingReply());
    }
    if (t.includes('hour') || t.includes('open') || t.includes('close') || t.includes('when are you')) {
      return finalizeReply(
        maybePersonalize('We\'re open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.')
      );
    }
    if (t.includes('address') || t.includes('where') || t.includes('location') || t.includes('find you')) {
      return finalizeReply(
        maybePersonalize(
          'We\'re at 279 London Road, Hadleigh, Essex, SS7 2BN. You\'ll find a map on our <a href="contact.html">Contact page</a>.'
        )
      );
    }
    if (t.includes('park')) {
      return finalizeReply(
        maybePersonalize(
          'There is parking available near the practice on London Road, Hadleigh. For exact directions, see the map on our <a href="contact.html">Contact page</a>.'
        )
      );
    }
    if (t.includes('nhs') || t.includes('band 1') || t.includes('band 2') || t.includes('band 3')) {
      return finalizeReply(
        maybePersonalize(
          'NHS treatment is charged in bands &mdash; Band 1 from &pound;23.80, Band 2 &pound;65.20, Band 3 &pound;282.80. See the full breakdown on our <a href="family-dentistry.html#nhs-pricing">Family Dentistry page</a> or the <a href="about.html#pricing">price list</a>.'
        )
      );
    }
    if (t.includes('finance') || t.includes('payment plan') || t.includes('0%') || t.includes('interest free') || t.includes('monthly')) {
      return finalizeReply(
        maybePersonalize(
          '0% finance is available on treatment from &pound;500. See <a href="about.html#finance">finance options on our About page</a> or ask when you <a href="contact.html">get in touch</a>.'
        )
      );
    }
    if (t.includes('implant')) {
      return finalizeReply(
        maybePersonalize(
          'Dental implants generally start from around &pound;2,000 per tooth. See <a href="dental-implants.html#cost">costs and the 5-step process</a>, or <a href="contact.html">book a free consultation</a>.'
        )
      );
    }
    if (t.includes('invisalign') || t.includes('brace') || t.includes('aligner')) {
      return finalizeReply(
        maybePersonalize(
          'We\'re a Platinum Elite Invisalign provider. See the <a href="invisalign.html#five-steps">5-step Invisalign process</a> or <a href="contact.html">book a free consultation</a>.'
        )
      );
    }
    if (t.includes('whiten') || t.includes('bleach')) {
      return finalizeReply(
        maybePersonalize(
          'Teeth whitening starts from as little as &pound;20 per month on interest-free plans. See <a href="teeth-whitening.html#pricing">whitening options and pricing</a>.'
        )
      );
    }
    if (mentionsCleaning(userText) || t.includes('direct access')) {
      return finalizeReply(
        maybePersonalize(
          'Direct-access hygiene is available with no referral needed &mdash; visits from &pound;52 for 30 minutes. Learn more on our <a href="hygiene-plus.html#what-we-do">Hygiene Plus page</a>.'
        )
      );
    }
    if (t.includes('family') || t.includes('child') || t.includes('children') || t.includes('kids')) {
      return finalizeReply(
        maybePersonalize(
          'We welcome families and children. See <a href="family-dentistry.html#nhs-pricing">Family Dentistry and NHS pricing</a> for more information.'
        )
      );
    }
    if (t.includes('price') || t.includes('cost') || t.includes('how much') || t.includes('fee')) {
      return finalizeReply(
        maybePersonalize(
          'Our full price list is on the <a href="about.html#pricing">About page</a> &mdash; everything from check-ups to Invisalign is listed there.'
        )
      );
    }
    if (t.includes('new patient') || t.includes('first visit') || t.includes('nervous') || t.includes('haven\'t been') || t.includes('hasnt been')) {
      return finalizeReply(
        maybePersonalize(
          'No pressure at all &mdash; our <a href="new-patients.html">New Patients page</a> covers exactly what to expect at your first visit. Ready to book? Use our <a href="contact.html">contact form</a>.'
        )
      );
    }
    if (t.includes('cosmetic') || t.includes('botox') || t.includes('filler') || t.includes('dermal')) {
      return finalizeReply(
        maybePersonalize(
          'For smile-focused care see <a href="cosmetic-dentistry.html">Cosmetic Dentistry</a> (Invisalign, implants, whitening). For facial aesthetics see <a href="cosmetic-treatments.html">Cosmetic Treatments</a> (fillers, Botox).'
        )
      );
    }
    if (t.includes('email') || t.includes('info@')) {
      return finalizeReply(
        maybePersonalize(
          'You can email us at <a href="mailto:info@hdp.me.uk">info@hdp.me.uk</a> or use the <a href="contact.html">contact form</a>.'
        )
      );
    }
    if (t.includes('phone') || t.includes('call') || t.includes('number') || t.includes('01702')) {
      return finalizeReply(
        maybePersonalize(
          'Call us on <a href="tel:01702553106">01702 553 106</a> &mdash; we\'re happy to help with any question.'
        )
      );
    }
    if (isGreeting(userText)) {
      if (visitorName) {
        return finalizeReply(
          `Hi ${escapeHtml(visitorName)}! Pick a topic above or ask me about opening hours, pricing, treatments, or booking &mdash; I\'ll point you to the right place.`
        );
      }
      greetingState = 'awaiting_name';
      return 'Hi! I\'m Sofia 👋 What\'s your name?';
    }
    return finalizeReply(
      maybePersonalize(
        'That\'s a great question &mdash; I don\'t have the specific details on hand, but our team can help with almost anything dental, from routine check-ups to cosmetic treatments like Invisalign and whitening. For a precise answer, call us on <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> and we\'ll get back to you directly.'
      )
    );
  }

  function scrollTranscriptToLatest() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
    messagesEl.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function addMessage(text, sender) {
    messagesEl.classList.add('has-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + sender;
    if (sender === 'user') {
      msg.textContent = text;
    } else {
      msg.innerHTML = formatBotReply(text);
    }
    messagesEl.appendChild(msg);
    scrollTranscriptToLatest();
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.classList.add('has-messages');
    scrollTranscriptToLatest();
  }

  function hideTyping() {
    const typing = document.getElementById('chat-typing-indicator');
    if (typing) typing.remove();
  }

  function showOpeningGreeting() {
    if (hasShownOpeningGreeting) return;
    hasShownOpeningGreeting = true;
    greetingState = 'awaiting_name';
    addMessage('Hi! I\'m Sofia 👋 What\'s your name?', 'bot');
  }

  function replyWithDelay(replyText) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(replyText, 'bot');
      sendBtn.disabled = false;
    }, 700 + Math.random() * 500);
  }

  function handleSend(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;

    if (greetingState === 'awaiting_name') {
      const name = extractName(text);
      if (name) {
        visitorName = name;
        greetingState = 'ready';
        replyWithDelay(`Nice to meet you, ${escapeHtml(name)}! How can I help you today?`);
        return;
      }

      if (isGreeting(text)) {
        replyWithDelay('Hi! I\'m Sofia 👋 What\'s your name?');
        return;
      }

      if (looksLikeQuestion(text)) {
        greetingState = 'ready';
        replyWithDelay(getBotReply(text));
        return;
      }

      greetingState = 'ready';
      replyWithDelay(getBotReply(text));
      return;
    }

    replyWithDelay(getBotReply(text));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend(input.value);
  });

  function toggleChat() {
    const isOpen = document.body.classList.toggle('chat-open');
    if (isOpen) {
      showOpeningGreeting();
      input.focus();
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
})();
