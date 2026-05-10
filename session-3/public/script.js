const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  conversation.push({ role: "user", text: userMessage });
  input.value = '';

  const botBubble = appendTyping();

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: conversation }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const aiResponse = data.result || "Sorry, no response received.";

    botBubble.textContent = aiResponse;
    conversation.push({ role: "model", text: aiResponse });

  } catch (error) {
    console.error("Error:", error);
    botBubble.textContent = "Gagal mendapatkan respons dari server.";
  }

  chatBox.scrollTop = chatBox.scrollHeight;
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = '✦';
    msg.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;
  msg.appendChild(bubble);

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

function appendTyping() {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');

  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.textContent = '✦';
  msg.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  const dots = document.createElement('div');
  dots.classList.add('typing-indicator');
  dots.innerHTML = '<span></span><span></span><span></span>';
  bubble.appendChild(dots);

  msg.appendChild(bubble);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  return bubble;
}
