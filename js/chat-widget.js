// Sofia — website chat widget
// PLACEHOLDER MODE: replies below are canned/keyword-matched, not a real AI yet.
// To go live: replace the body of getBotReply() with a fetch() call to a
// real backend endpoint (see the comment inside that function).

(function () {
  const launcher = document.getElementById('chat-launcher');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');
  const messagesEl = document.getElementById('chat-messages');
  const form = document.getElementById('chat-input-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const quickReplies = document.getElementById('chat-quick-replies');

  if (!launcher || !panel) return;

  function toggleChat() {
    document.body.classList.toggle('chat-open');
    if (document.body.classList.contains('chat-open')) {
      input.focus();
    }
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + sender;
    msg.innerHTML = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('chat-typing-indicator');
    if (typing) typing.remove();
  }

  // ---- PLACEHOLDER reply logic (keyword-matched, no AI) ----
  // Replace this whole function with a real backend call when ready, e.g.:
  //
  //   async function getBotReply(userText) {
  //     const res = await fetch('/api/chat', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ message: userText }),
  //     });
  //     const data = await res.json();
  //     return data.reply;
  //   }
  //
  function getBotReply(userText) {
    const t = userText.toLowerCase();

    if (t.includes('book') || t.includes('appointment') || t.includes('consult')) {
      return "I'd love to help you book. You can call us directly on <a href=\"tel:01702553106\">01702 553 106</a>, or use our <a href=\"contact.html\">contact form</a> and we'll get back to you shortly.";
    }
    if (t.includes('price') || t.includes('cost') || t.includes('how much')) {
      return "You can see our full price list on the <a href=\"about.html#pricing\">About page</a> — everything from check-ups to Invisalign is listed there.";
    }
    if (t.includes('hour') || t.includes('open') || t.includes('close')) {
      return "We're open Mon&ndash;Fri 9:00&ndash;18:00, with occasional Saturdays. Closed Sundays.";
    }
    if (t.includes('invisalign') || t.includes('whiten') || t.includes('cosmetic')) {
      return "Take a look at our <a href=\"cosmetic-dentistry.html\">Cosmetic Dentistry page</a> for details on Invisalign, whitening, and more.";
    }
    if (t.includes('new patient') || t.includes('first visit') || t.includes('nervous')) {
      return "No pressure at all — our <a href=\"new-patients.html\">New Patients page</a> covers exactly what to expect at your first visit.";
    }
    if (t.includes('address') || t.includes('where') || t.includes('location') || t.includes('parking')) {
      return "We're at 279 London Road, Hadleigh, Essex, SS7 2BN. You'll find a map on our <a href=\"contact.html\">Contact page</a>.";
    }
    if (t.includes('hi') || t.includes('hello') || t.includes('hey')) {
      return "Hi there! I'm Sofia, the assistant for Hadleigh Dental. I'm still in demo mode right now, but I can point you toward booking, pricing, or general info &mdash; what can I help with?";
    }
    return "Thanks for your message! I'm still in demo mode, so I can't fully understand everything yet &mdash; but for anything specific, calling <a href=\"tel:01702553106\">01702 553 106</a> or using the <a href=\"contact.html\">contact form</a> will get you a real answer fast.";
  }

  function handleSend(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;
    if (quickReplies) quickReplies.style.display = 'none';

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

  if (quickReplies) {
    quickReplies.querySelectorAll('.chat-quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleSend(btn.textContent));
    });
  }
})();
