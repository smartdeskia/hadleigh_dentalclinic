// Sofia — menu-driven website assistant
// Structured topic menu (no free-text input). Replaces the earlier keyword-matched placeholder chat.

(function () {
  const launcher = document.getElementById('chat-launcher');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close-btn');

  if (!launcher || !panel) return;

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

  panel.querySelectorAll('#chat-messages, #chat-quick-replies, #chat-input-form').forEach((el) => el.remove());

  const menuRoot = document.createElement('div');
  menuRoot.className = 'chat-menu';
  menuRoot.innerHTML = `
    <div class="chat-emergency-bar">
      <span class="chat-emergency-label">Urgent? Call now</span>
      <a class="chat-emergency-phone" href="tel:01702553106">01702 553 106</a>
    </div>
    <p class="chat-menu-intro">Choose a topic below and we'll take you straight to the right place.</p>
    <nav class="chat-menu-list" aria-label="Help topics"></nav>
  `;
  panel.appendChild(menuRoot);

  const menuList = menuRoot.querySelector('.chat-menu-list');

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

  function toggleChat() {
    document.body.classList.toggle('chat-open');
  }

  launcher.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
})();
