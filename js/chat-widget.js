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
      topicChoice: true,
      topicLabel: 'dental implants',
      bookingTreatment: 'Dental implants',
    },
    {
      title: "I'd like to learn about Invisalign",
      description: 'Platinum Elite provider. Free consultation available.',
      href: 'invisalign.html#five-steps',
      topicChoice: true,
      topicLabel: 'Invisalign',
      bookingTreatment: 'Invisalign',
    },
    {
      title: "I'm interested in Teeth Whitening",
      description: 'From £20/month, interest-free plans available.',
      href: 'teeth-whitening.html#pricing',
      topicChoice: true,
      topicLabel: 'teeth whitening',
      bookingTreatment: 'Teeth whitening',
    },
    {
      title: "I'd like to know about Family Dentistry / NHS pricing",
      description: 'See NHS bands from £23.80.',
      href: 'family-dentistry.html#nhs-pricing',
      topicChoice: true,
      topicLabel: 'family dentistry and NHS pricing',
      bookingTreatment: 'General check-up',
    },
    {
      title: 'I need a hygienist appointment',
      description: 'No referral needed — direct access available.',
      href: 'hygiene-plus.html#what-we-do',
      topicChoice: true,
      topicLabel: 'hygiene appointments',
      bookingTreatment: 'Hygiene / cleaning',
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
      href: 'new-patients.html',
      topicChoice: true,
      topicLabel: 'becoming a new patient',
    },
    {
      title: 'More options',
      description: 'Browse all our treatments.',
      href: 'index.html#treatment-highlights',
    },
  ];

  // Make.com webhook — PLACEHOLDER: replace with real URL once the
  // "Website Chat Booking Request" scenario is built in Make (Supabase + SMS/email).
  const BOOKING_WEBHOOK_URL = 'https://hook.make.com/PLACEHOLDER_BOOKING_WEBHOOK_ID';

  const notifyBookingRequest = (payload) => {
    fetch(BOOKING_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Fire-and-forget: booking intake is best-effort; never affect visitor UX.
    });
  };

  const BOOKING_TREATMENTS = [
    'General check-up',
    'Hygiene / cleaning',
    'Invisalign',
    'Teeth whitening',
    'Dental implants',
    'Cosmetic treatment',
    'Not sure — help me choose',
  ];

  const BOOKING_SLOTS = [
    'Mon 9:00 AM',
    'Tue 2:00 PM',
    'Wed 10:30 AM',
    'Thu 4:00 PM',
    'Fri 11:00 AM',
    'Flexible — any time',
  ];

  let visitorName = null;
  let greetingState = 'idle';
  let hasShownOpeningGreeting = false;
  let bookingState = null;

  panel.querySelectorAll('#chat-messages, #chat-quick-replies, #chat-input-form, .chat-body, .chat-transcript').forEach((el) => {
    el.remove();
  });

  const chatBody = document.createElement('div');
  chatBody.className = 'chat-body';
  chatBody.innerHTML = `
    <p class="chat-menu-intro">Tap an option below to get started.</p>
    <nav class="chat-menu-list" aria-label="Help topics"></nav>
  `;
  panel.appendChild(chatBody);

  const menuList = chatBody.querySelector('.chat-menu-list');
  MENU_ITEMS.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-menu-item';
    if (item.urgent) btn.classList.add('chat-menu-item-urgent');
    btn.innerHTML = `
      <span class="chat-menu-item-content">
        <span class="chat-menu-item-title">${item.title}</span>
        <span class="chat-menu-item-desc">${item.description}</span>
      </span>
      <span class="chat-menu-item-chevron" aria-hidden="true">›</span>
    `;
    btn.addEventListener('click', (event) => {
      handleMenuItemClick(item, event);
    });
    menuList.appendChild(btn);
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
  const quickRepliesEl = document.createElement('div');
  quickRepliesEl.id = 'chat-quick-replies';
  quickRepliesEl.className = 'chat-quick-replies';
  panel.appendChild(quickRepliesEl);
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
    const t = normalizeForMatch(text);
    if (/^cheers$/.test(t)) return true;
    const hasThanks = /\b(thank\s*you|thanks?|thnk|thx)\b/.test(t);
    const hasBye = /\b(bye|goodbye|good bye)\b/.test(t);
    const maxWords = hasThanks && hasBye ? 5 : 4;
    // Short closings only — skip longer messages like "thanks for explaining…"
    if (t.split(/\s+/).length > maxWords) return false;
    if (/thanks?\s+(for|about|regarding)\b/.test(t)) return false;
    if (hasThanks) return true;
    if (/^(ok(ay)?|great|lovely|perfect)\s+(thank|thnk|thx)/.test(t)) return true;
    return false;
  }

  function isBye(text) {
    const t = normalizeForMatch(text);
    if (/^(bye|goodbye|good bye|see you|see ya|take care|cheerio)[!.?\s]*$/i.test(t)) return true;
    if (/^(ok(ay)?|night|goodnight|good night)[!.?\s]*$/i.test(t)) return true;
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

  function normalizeForMatch(text) {
    return text.trim().toLowerCase().replace(/[?!.,;:]+$/g, '').trim();
  }

  function mentionsInvisalign(text) {
    const t = normalizeForMatch(text);
    // inv\w*lign covers invisalign, invaslign, and trailing punctuation after normalize.
    return /inv\w*lign/.test(t) || t.includes('aligner') || t.includes('brace');
  }

  function isBotName(text) {
    const t = text.trim().toLowerCase();
    return t === 'sofia' || t === 'sophie';
  }

  function formatName(text) {
    return text
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  function extractName(text) {
    let cleaned = text.trim().replace(/[!.?]+$/, '').trim();
    if (!cleaned) return null;

    let fromExplicitIntro = false;

    // "name is" anywhere — handles typos ("may name is Rich") and extra lead-ins ("Hi my name is Sophie").
    const nameIsMatch = cleaned.match(/\bname is\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i);
    if (nameIsMatch) {
      cleaned = nameIsMatch[1].trim();
      fromExplicitIntro = true;
    } else {
      const explicitMatch = cleaned.match(
        /(?:i am|i'?m|im|it'?s|its|this is|call me)\s+([a-zA-Z][a-zA-Z\s'-]{0,38})/i
      );
      if (explicitMatch) {
        cleaned = explicitMatch[1].trim();
        fromExplicitIntro = true;
      } else {
        const leadPatterns = [
          /^(hi|hello|hey|hiya|good morning|good afternoon|good evening)[,!\s]+/i,
          /^(hi|hello|hey|hiya)$/i,
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
    if (!fromExplicitIntro && isBotName(cleaned)) return null;

    return formatName(cleaned);
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
    if (isBye(userText)) {
      return 'Goodbye! Take care &mdash; we\'re here whenever you need us.';
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
      && mentionsInvisalign(userText)
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
    if (mentionsInvisalign(userText)) {
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
    messagesEl.lastElementChild?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  function advanceAfterPatientType() {
    if (bookingState.data.treatment) {
      promptRequestedSlot();
    } else {
      promptTreatment();
    }
  }

  function handleMenuItemClick(item, event) {
    event.preventDefault();

    if (!item.topicChoice) {
      document.body.classList.remove('chat-open');
      window.location.href = item.href;
      return;
    }

    greetingState = 'ready';
    clearQuickReplies();
    addMessage(item.title, 'user');

    const topicLabel = item.topicLabel || 'this';
    replyWithDelay(
      maybePersonalize(`Would you like to read more about ${topicLabel}, or book an appointment?`),
      {
        skipQuickReplies: true,
        onComplete: () => {
          showQuickReplies(
            [
              { label: 'Tell me more', value: 'read' },
              { label: 'Book an appointment', value: 'book' },
            ],
            (value) => {
              if (value === 'read') {
                document.body.classList.remove('chat-open');
                window.location.href = item.href;
                return;
              }
              startBookingFlow(false, { treatment: item.bookingTreatment || null, fromTopicChoice: true });
            }
          );
        },
      }
    );
  }

  function setBookingActive(active) {
    document.body.classList.toggle('chat-booking-active', active);
  }

  function clearQuickReplies() {
    quickRepliesEl.innerHTML = '';
    quickRepliesEl.classList.remove('is-visible');
  }

  function showQuickReplies(options, onSelect) {
    clearQuickReplies();
    options.forEach((option) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-quick-btn';
      btn.textContent = option.label;
      btn.addEventListener('click', () => {
        clearQuickReplies();
        addMessage(option.label, 'user');
        onSelect(option.value);
      });
      quickRepliesEl.appendChild(btn);
    });
    quickRepliesEl.classList.add('is-visible');
    scrollTranscriptToLatest();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }

  function exitBookingFlow() {
    bookingState = null;
    setBookingActive(false);
    clearQuickReplies();
    input.placeholder = 'Ask Sofia anything\u2026';
    showDefaultQuickReplies();
  }

  function showDefaultQuickReplies() {
    if (bookingState) return;
    showQuickReplies(
      [
        { label: 'Book an appointment', value: '__book__' },
        { label: 'Opening hours', value: '__hours__' },
        { label: 'Price list', value: '__price__' },
      ],
      (value) => {
        if (value === '__book__') {
          startBookingFlow();
          return;
        }
        sendBtn.disabled = true;
        if (value === '__hours__') {
          replyWithDelay(
            finalizeReply(
              maybePersonalize('We\'re open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.')
            )
          );
          return;
        }
        if (value === '__price__') {
          replyWithDelay(
            finalizeReply(
              maybePersonalize(
                'Our full price list is on the <a href="about.html#pricing">About page</a> &mdash; everything from check-ups to Invisalign is listed there.'
              )
            )
          );
        }
      }
    );
  }

  function promptBookingName() {
    bookingState.step = 'name';
    addMessage('Great — let\'s get your appointment request started. What\'s your name?', 'bot');
    input.placeholder = 'Your name\u2026';
  }

  function promptPatientType() {
    bookingState.step = 'patientType';
    addMessage('Are you a new or existing patient?', 'bot');
    showQuickReplies(
      [
        { label: 'New patient', value: 'New patient' },
        { label: 'Existing patient', value: 'Existing patient' },
      ],
      (value) => {
        bookingState.data.patientType = value;
        advanceAfterPatientType();
      }
    );
  }

  function promptTreatment() {
    bookingState.step = 'treatment';
    addMessage('What would you like to book?', 'bot');
    showQuickReplies(
      BOOKING_TREATMENTS.map((label) => ({ label, value: label })),
      (value) => {
        bookingState.data.treatment = value;
        promptRequestedSlot();
      }
    );
  }

  function promptRequestedSlot() {
    bookingState.step = 'requestedSlot';
    addMessage('When would you prefer to come in?', 'bot');
    showQuickReplies(
      BOOKING_SLOTS.map((label) => ({ label, value: label })),
      (value) => {
        bookingState.data.requestedSlot = value;
        promptContactType();
      }
    );
  }

  function promptContactType() {
    bookingState.step = 'contactType';
    addMessage('How should our team confirm your appointment?', 'bot');
    showQuickReplies(
      [
        { label: 'Text me', value: 'phone' },
        { label: 'Email me', value: 'email' },
      ],
      (value) => {
        bookingState.data.contactType = value;
        promptContactValue();
      }
    );
  }

  function promptContactValue() {
    bookingState.step = 'contactValue';
    const channel = bookingState.data.contactType === 'phone' ? 'mobile number' : 'email address';
    addMessage(`What's your ${channel}?`, 'bot');
    input.placeholder = bookingState.data.contactType === 'phone' ? 'e.g. 07xxx xxxxxx' : 'you@example.com';
    input.focus();
  }

  function promptBookingConfirm() {
    bookingState.step = 'confirm';
    const { patientType, treatment, requestedSlot, contactType, contactValue } = bookingState.data;
    const channelLabel = contactType === 'phone' ? 'Text' : 'Email';
    addMessage(
      'Please check your details:' +
      '<ul>' +
      `<li><strong>Patient:</strong> ${escapeHtml(patientType)}</li>` +
      `<li><strong>Treatment:</strong> ${escapeHtml(treatment)}</li>` +
      `<li><strong>Preferred time:</strong> ${escapeHtml(requestedSlot)}</li>` +
      `<li><strong>${channelLabel}:</strong> ${escapeHtml(contactValue)}</li>` +
      '</ul>' +
      'Tap confirm to send your request — our team will be in touch to confirm.',
      'bot'
    );
    showQuickReplies(
      [
        { label: 'Confirm request', value: 'confirm' },
        { label: 'Start over', value: 'restart' },
      ],
      (value) => {
        if (value === 'restart') {
          startBookingFlow(true);
          return;
        }
        submitBookingRequest();
      }
    );
    input.placeholder = 'Ask Sofia anything\u2026';
  }

  function submitBookingRequest() {
    const name = visitorName || bookingState.data.name || 'Guest';
    const payload = {
      name,
      patientType: bookingState.data.patientType,
      treatment: bookingState.data.treatment,
      requestedSlot: bookingState.data.requestedSlot,
      contactType: bookingState.data.contactType,
      contactValue: bookingState.data.contactValue,
    };

    notifyBookingRequest(payload);

    const contactChannel = payload.contactType === 'phone' ? 'by text' : 'by email';
    addMessage(
      `Thanks ${escapeHtml(name)} — we\'ve received your request for ${escapeHtml(payload.treatment)} on ${escapeHtml(payload.requestedSlot)}. Our team will confirm shortly, ${contactChannel}.`,
      'bot'
    );

    exitBookingFlow();
    sendBtn.disabled = false;
  }

  function startBookingFlow(restart, options = {}) {
    if (!restart) {
      greetingState = 'ready';
    }
    setBookingActive(true);
    clearQuickReplies();
    bookingState = { step: null, data: {} };

    if (options.treatment) {
      bookingState.data.treatment = options.treatment;
    }

    if (restart) {
      addMessage('No problem — let\'s start again.', 'bot');
    } else if (!options.fromTopicChoice) {
      addMessage('Happy to help you request an appointment.', 'bot');
    }

    if (visitorName) {
      promptPatientType();
    } else {
      promptBookingName();
    }
  }

  function handleBookingInput(text) {
    if (!bookingState) return false;

    const trimmed = text.trim();
    if (!trimmed) return true;

    if (bookingState.step === 'name') {
      const name = extractName(text) || (trimmed.length <= 40 ? formatName(trimmed) : null);
      if (!name || isBotName(name)) {
        addMessage('Please enter your name so we know who to confirm with.', 'bot');
        sendBtn.disabled = false;
        return true;
      }
      visitorName = name;
      promptPatientType();
      sendBtn.disabled = false;
      return true;
    }

    if (bookingState.step === 'contactValue') {
      const { contactType } = bookingState.data;
      if (contactType === 'phone' && !isValidPhone(trimmed)) {
        addMessage('Please enter a valid UK mobile number (at least 10 digits).', 'bot');
        sendBtn.disabled = false;
        return true;
      }
      if (contactType === 'email' && !isValidEmail(trimmed)) {
        addMessage('Please enter a valid email address.', 'bot');
        sendBtn.disabled = false;
        return true;
      }
      bookingState.data.contactValue = trimmed;
      promptBookingConfirm();
      sendBtn.disabled = false;
      return true;
    }

    if (['patientType', 'treatment', 'requestedSlot', 'contactType', 'confirm'].includes(bookingState.step)) {
      addMessage('Please pick one of the options above.', 'bot');
      sendBtn.disabled = false;
      return true;
    }

    return false;
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
    hideTyping();
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.classList.add('has-messages', 'is-typing');
    messagesEl.appendChild(typing);
    scrollTranscriptToLatest();
  }

  function hideTyping() {
    const typing = document.getElementById('chat-typing-indicator');
    if (typing) typing.remove();
    messagesEl.classList.remove('is-typing');
  }

  function showOpeningGreeting() {
    if (hasShownOpeningGreeting) return;
    hasShownOpeningGreeting = true;
    greetingState = 'awaiting_name';
    replyWithDelay('Hi! I\'m Sofia 👋 What\'s your name?', { skipQuickReplies: true });
  }

  function replyWithDelay(replyText, options = {}) {
    const { skipQuickReplies = false, onComplete = null } = options;
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(replyText, 'bot');
      sendBtn.disabled = false;
      if (!skipQuickReplies && !bookingState) {
        showDefaultQuickReplies();
      }
      if (onComplete) onComplete();
    }, 700 + Math.random() * 500);
  }

  function handleSend(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;

    if (handleBookingInput(text)) {
      return;
    }

    if (greetingState === 'awaiting_name' || greetingState === 'awaiting_name_retry') {
      const name = extractName(text);
      if (name) {
        visitorName = name;
        greetingState = 'ready';
        replyWithDelay(`Nice to meet you, ${escapeHtml(name)}! How can I help you today?`);
        return;
      }

      if (looksLikeQuestion(text)) {
        greetingState = 'ready';
        replyWithDelay(getBotReply(text));
        return;
      }

      if (greetingState === 'awaiting_name') {
        greetingState = 'awaiting_name_retry';
        replyWithDelay('I didn\'t quite catch your name &mdash; what should I call you?');
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
      showDefaultQuickReplies();
    } else if (bookingState) {
      exitBookingFlow();
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  showDefaultQuickReplies();
})();
