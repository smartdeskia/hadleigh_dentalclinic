// Sofia — hybrid website assistant
// Structured topic menu + keyword-matched free-text replies (no AI backend).

(function () {
  const launcher = document.getElementById('chat-launcher');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');

  if (!launcher || !panel) return;

  const CONTACT_FOOTER =
    ' For anything else, our team can help directly — <a href="contact.html">get in touch here</a>.';

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

  panel.querySelectorAll('#chat-messages, #chat-quick-replies, #chat-input-form, .chat-body').forEach((el) => {
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
    <div class="chat-ask-divider"><span>Or ask your own question</span></div>
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
  messagesEl.className = 'chat-messages chat-messages-inline';
  messagesEl.setAttribute('aria-live', 'polite');
  chatBody.appendChild(messagesEl);

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

  function finalizeReply(text) {
    if (text.includes('contact.html') || text.includes('tel:01702553106')) {
      return text;
    }
    return text + CONTACT_FOOTER;
  }

  function getBotReply(userText) {
    const t = userText.toLowerCase();

    if (t.includes('emergency') || t.includes('pain') || t.includes('urgent') || t.includes('toothache')) {
      return finalizeReply(
        'If you\'re in pain, please call us urgently on <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> so we can arrange an appointment as soon as possible.'
      );
    }
    if (t.includes('book') || t.includes('appointment') || t.includes('consult')) {
      return finalizeReply(
        'To book, call us on <a href="tel:01702553106">01702 553 106</a> or send a message via our <a href="contact.html">contact form</a> and we\'ll get back to you shortly.'
      );
    }
    if (t.includes('hour') || t.includes('open') || t.includes('close') || t.includes('when are you')) {
      return finalizeReply(
        'We\'re open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.'
      );
    }
    if (t.includes('address') || t.includes('where') || t.includes('location') || t.includes('find you')) {
      return finalizeReply(
        'We\'re at 279 London Road, Hadleigh, Essex, SS7 2BN. You\'ll find a map on our <a href="contact.html">Contact page</a>.'
      );
    }
    if (t.includes('park')) {
      return finalizeReply(
        'There is parking available near the practice on London Road, Hadleigh. For exact directions, see the map on our <a href="contact.html">Contact page</a>.'
      );
    }
    if (t.includes('nhs') || t.includes('band 1') || t.includes('band 2') || t.includes('band 3')) {
      return finalizeReply(
        'NHS treatment is charged in bands &mdash; Band 1 from &pound;23.80, Band 2 &pound;65.20, Band 3 &pound;282.80. See the full breakdown on our <a href="family-dentistry.html#nhs-pricing">Family Dentistry page</a> or the <a href="about.html#pricing">price list</a>.'
      );
    }
    if (t.includes('finance') || t.includes('payment plan') || t.includes('0%') || t.includes('interest free') || t.includes('monthly')) {
      return finalizeReply(
        '0% finance is available on treatment from &pound;500. See <a href="about.html#finance">finance options on our About page</a> or ask when you <a href="contact.html">get in touch</a>.'
      );
    }
    if (t.includes('implant')) {
      return finalizeReply(
        'Dental implants generally start from around &pound;2,000 per tooth. See <a href="dental-implants.html#cost">costs and the 5-step process</a>, or <a href="contact.html">book a free consultation</a>.'
      );
    }
    if (t.includes('invisalign') || t.includes('brace') || t.includes('aligner')) {
      return finalizeReply(
        'We\'re a Platinum Elite Invisalign provider. See the <a href="invisalign.html#five-steps">5-step Invisalign process</a> or <a href="contact.html">book a free consultation</a>.'
      );
    }
    if (t.includes('whiten') || t.includes('bleach')) {
      return finalizeReply(
        'Teeth whitening starts from as little as &pound;20 per month on interest-free plans. See <a href="teeth-whitening.html#pricing">whitening options and pricing</a>.'
      );
    }
    if (t.includes('hygien') || t.includes('scale and polish') || t.includes('direct access')) {
      return finalizeReply(
        'Direct-access hygiene is available with no referral needed &mdash; visits from &pound;52 for 30 minutes. Learn more on our <a href="hygiene-plus.html#what-we-do">Hygiene Plus page</a>.'
      );
    }
    if (t.includes('family') || t.includes('child') || t.includes('children') || t.includes('kids')) {
      return finalizeReply(
        'We welcome families and children. See <a href="family-dentistry.html#nhs-pricing">Family Dentistry and NHS pricing</a> for more information.'
      );
    }
    if (t.includes('price') || t.includes('cost') || t.includes('how much') || t.includes('fee')) {
      return finalizeReply(
        'Our full price list is on the <a href="about.html#pricing">About page</a> &mdash; everything from check-ups to Invisalign is listed there.'
      );
    }
    if (t.includes('new patient') || t.includes('first visit') || t.includes('nervous') || t.includes('haven\'t been') || t.includes('hasnt been')) {
      return finalizeReply(
        'No pressure at all &mdash; our <a href="new-patients.html">New Patients page</a> covers exactly what to expect at your first visit. Ready to book? Use our <a href="contact.html">contact form</a>.'
      );
    }
    if (t.includes('cosmetic') || t.includes('botox') || t.includes('filler') || t.includes('dermal')) {
      return finalizeReply(
        'For smile-focused care see <a href="cosmetic-dentistry.html">Cosmetic Dentistry</a> (Invisalign, implants, whitening). For facial aesthetics see <a href="cosmetic-treatments.html">Cosmetic Treatments</a> (fillers, Botox).'
      );
    }
    if (t.includes('email') || t.includes('info@')) {
      return finalizeReply(
        'You can email us at <a href="mailto:info@hdp.me.uk">info@hdp.me.uk</a> or use the <a href="contact.html">contact form</a>.'
      );
    }
    if (t.includes('phone') || t.includes('call') || t.includes('number') || t.includes('01702')) {
      return finalizeReply(
        'Call us on <a href="tel:01702553106">01702 553 106</a> &mdash; we\'re happy to help with any question.'
      );
    }
    if (t.includes('hi') || t.includes('hello') || t.includes('hey')) {
      return finalizeReply(
        'Hi! I\'m Sofia. Pick a topic above or ask me about opening hours, pricing, treatments, or booking &mdash; I\'ll point you to the right place.'
      );
    }
    return finalizeReply(
      'I\'m not sure about that one &mdash; I don\'t want to guess. Please call <a href="tel:01702553106">01702 553 106</a> or use our <a href="contact.html">contact form</a> and our team will help you directly.'
    );
  }

  function addMessage(text, sender) {
    messagesEl.classList.add('has-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + sender;
    msg.innerHTML = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.classList.add('has-messages');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('chat-typing-indicator');
    if (typing) typing.remove();
  }

  function handleSend(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;

    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(getBotReply(text), 'bot');
      sendBtn.disabled = false;
    }, 700 + Math.random() * 500);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend(input.value);
  });

  function toggleChat() {
    const isOpen = document.body.classList.toggle('chat-open');
    if (isOpen) {
      input.focus();
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
})();
