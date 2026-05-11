// ---------- Config ----------
const API_BASE = 'http://localhost:3000';

// ---------- State ----------
let config = {
  travelStyle: 'comfort',
  interests: ['culture', 'food'],
  language: 'id',
  persona: 'explorer',
};

let conversation = []; // [{role: "user"|"assistant", content: "..."}]

// ---------- DOM ----------
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const clearBtn = document.getElementById('clearChat');
const applyBtn = document.getElementById('applyConfig');
const sidebar = document.getElementById('sidebar');
const sidebarOpen = document.getElementById('sidebarOpen');
const sidebarClose = document.getElementById('sidebarClose');
const statusText = document.getElementById('statusText');

// Overlay for mobile
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

// ---------- Quick Action Prompts ----------
const QUICK_PROMPTS = {
  id: {
    recommend: 'Rekomendasikan destinasi wisata yang cocok untuk saya berdasarkan preferensi perjalanan saya.',
    food: 'Apa makanan dan kuliner lokal yang wajib dicoba di destinasi populer? Berikan contoh spesifik.',
    budget: 'Bantu saya memahami panduan budget perjalanan untuk wisatawan dengan gaya perjalanan saya.',
    culture: 'Berikan tips etika budaya dan hal-hal yang perlu diperhatikan saat berwisata ke negara asing.',
  },
  en: {
    recommend: 'Recommend travel destinations that match my travel preferences and interests.',
    food: 'What are must-try local foods and culinary experiences? Give specific examples.',
    budget: 'Help me understand budget planning for travelers with my travel style.',
    culture: 'Give me cultural etiquette tips and important customs to be aware of when traveling abroad.',
  },
};

// ---------- Greeting ----------
const GREETINGS = {
  id: {
    title: 'Selamat Datang di WanderlAI!',
    body: 'Saya asisten perjalanan cerdasmu. Tanyakan tentang destinasi, tips budaya, kuliner lokal, atau bantu rencanakan petualanganmu berikutnya!',
  },
  en: {
    title: 'Welcome to WanderlAI!',
    body: "I'm your smart travel companion. Ask me about destinations, cultural tips, local food, or let me help plan your next adventure!",
  },
};

// ---------- Markdown Renderer (simple) ----------
function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // unordered lists (convert consecutive list lines into <ul>)
    .replace(/((?:^- .+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    })
    // numbered lists
    .replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
      const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    })
    // line breaks (double newline = paragraph, single newline = <br>)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// ---------- Message Rendering ----------
function appendMessage(role, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', role === 'user' ? 'user' : 'bot');

  if (role === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '✈';
    msg.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = role === 'assistant' ? `<p>${renderMarkdown(text)}</p>` : escapeHtml(text);
  msg.appendChild(bubble);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function appendTyping() {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '✈';
  msg.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  msg.appendChild(bubble);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return { msg, bubble };
}

function showWelcome() {
  const g = GREETINGS[config.language] || GREETINGS.id;
  const card = document.createElement('div');
  card.className = 'welcome-card';
  card.innerHTML = `
    <div class="wc-icon">✈️</div>
    <h2>${g.title}</h2>
    <p>${g.body}</p>
  `;
  chatBox.appendChild(card);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ---------- API Call ----------
async function sendMessage(userText) {
  conversation.push({ role: 'user', content: userText });

  const { msg: typingMsg, bubble: typingBubble } = appendTyping();
  userInput.disabled = true;
  chatForm.querySelector('button').disabled = true;
  statusText.textContent = 'Thinking...';

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation, config }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Server error');
    }

    const data = await response.json();
    const aiText = data.result || 'Sorry, no response received.';

    typingMsg.remove();
    appendMessage('assistant', aiText);
    conversation.push({ role: 'assistant', content: aiText });
  } catch (error) {
    console.error('Chat error:', error);
    typingMsg.remove();
    appendMessage('assistant', config.language === 'en'
      ? 'Sorry, I could not connect to the server. Please try again.'
      : 'Maaf, tidak bisa terhubung ke server. Silakan coba lagi.');
    conversation.pop(); // remove the failed user message from history
  } finally {
    userInput.disabled = false;
    chatForm.querySelector('button').disabled = false;
    statusText.textContent = 'Online';
    userInput.focus();
  }
}

// ---------- Form Submit ----------
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = '';
  appendMessage('user', text);
  await sendMessage(text);
});

// ---------- Quick Actions ----------
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const promptId = btn.dataset.promptId;
    const lang = config.language;
    const text = (QUICK_PROMPTS[lang] || QUICK_PROMPTS.id)[promptId];
    if (!text) return;
    appendMessage('user', text);
    await sendMessage(text);
  });
});

// ---------- Clear Chat ----------
clearBtn.addEventListener('click', () => {
  conversation = [];
  chatBox.innerHTML = '';
  showWelcome();
});

// ---------- Config Reading ----------
function readConfig() {
  const styleEl = document.querySelector('input[name="travelStyle"]:checked');
  const personaEl = document.querySelector('input[name="persona"]:checked');
  const activeLang = document.querySelector('.lang-btn.active');
  const checkedInterests = [...document.querySelectorAll('.interest-tag input:checked')].map(el => el.value);

  config = {
    travelStyle: styleEl?.value || 'comfort',
    interests: checkedInterests,
    language: activeLang?.dataset.lang || 'id',
    persona: personaEl?.value || 'explorer',
  };
}

// ---------- Apply Config ----------
applyBtn.addEventListener('click', () => {
  readConfig();
  updateQuickActionLabels();
  conversation = [];
  chatBox.innerHTML = '';
  showWelcome();
  closeSidebar();
});

function updateQuickActionLabels() {
  const lang = config.language;
  const labels = {
    id: ['🗺️ Rekomendasi Destinasi', '🍜 Kuliner Lokal', '💰 Panduan Budget', '🌏 Tips Budaya'],
    en: ['🗺️ Recommend Destination', '🍜 Local Food', '💰 Budget Guide', '🌏 Cultural Tips'],
  };
  const ids = ['recommend', 'food', 'budget', 'culture'];
  document.querySelectorAll('.quick-btn').forEach((btn, i) => {
    btn.textContent = (labels[lang] || labels.id)[i];
  });
}

// ---------- Language Toggle ----------
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    userInput.placeholder = btn.dataset.lang === 'en'
      ? 'Ask about your travel destination...'
      : 'Tanyakan tentang destinasi perjalananmu...';
  });
});

// ---------- Sidebar Toggle ----------
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

sidebarOpen.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// ---------- Init ----------
showWelcome();
