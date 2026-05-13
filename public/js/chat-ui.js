// Cylin Painters - AI Assistant UI (front-end only)

let chatTypingTimer = null;

function setButtonLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = !!loading;
  btn.setAttribute('aria-busy', loading ? 'true' : 'false');
}

function appendMessage({ role, text }) {
  const messagesEl = document.getElementById('aiMessages');
  if (!messagesEl) return;

  const msg = document.createElement('div');
  msg.className = `chat-message ${role === 'user' ? 'user' : 'assistant'}`;
  msg.innerHTML = `
    <div class="bubble">${escapeHtml(text).replace(/\n/g, '<br/>')}</div>
  `;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return msg;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function fakeStreamToElement(targetEl, fullText) {
  if (chatTypingTimer) {
    clearInterval(chatTypingTimer);
    chatTypingTimer = null;
  }

  targetEl.textContent = '';
  const words = fullText.split(/\s+/).filter(Boolean);
  let i = 0;

  chatTypingTimer = setInterval(() => {
    i += 1;
    targetEl.textContent = words.slice(0, i).join(' ');

    if (i >= words.length) {
      clearInterval(chatTypingTimer);
      chatTypingTimer = null;
    }
  }, 35);
}

function handleSend() {
  const input = document.getElementById('aiInput');
  const messagesEl = document.getElementById('aiMessages');
  const sendBtn = document.getElementById('aiSend');
  if (!input || !messagesEl) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = '';

  appendMessage({ role: 'user', text: prompt });

  const assistantWrap = document.createElement('div');
  assistantWrap.className = 'chat-message assistant';
  assistantWrap.innerHTML = `<div class="bubble" id="aiStreamingBubble"></div>`;
  messagesEl.appendChild(assistantWrap);

  messagesEl.scrollTop = messagesEl.scrollHeight;

  const bubble = assistantWrap.querySelector('#aiStreamingBubble');

  const loadingReply = getAssistantReply(prompt);
  setButtonLoading(sendBtn, true);

  // streaming
  fakeStreamToElement(bubble, loadingReply);

  const doneTimer = setTimeout(() => {
    setButtonLoading(sendBtn, false);
    clearTimeout(doneTimer);
  }, Math.max(900, loadingReply.length * 18));
}

function getAssistantReply(prompt) {
  const p = prompt.toLowerCase();

  // Lightweight canned responses to feel "smart" without backend.
  if (p.includes('blue') || p.includes('navy') || p.includes('teal')) {
    return "For blue-toned rooms, look for paintings with soft neutrals and balanced contrast. Try warm accents—cream, sand, or muted terracotta—so the space feels inviting rather than cold.";
  }
  if (p.includes('warm') || p.includes('beige') || p.includes('cream') || p.includes('tan')) {
    return "Warm rooms pair beautifully with art that adds depth: rich browns, gentle reds, or textured landscapes. Choose pieces with a little variation in tone so your walls feel layered and dynamic.";
  }
  if (p.includes('modern') || p.includes('minimal') || p.includes('scandinavian')) {
    return "Modern interiors usually love clean composition and restrained palettes. Select artwork with bold negative space and a limited color range—then let one accent color do the talking.";
  }
  if (p.includes('size') || p.includes('wall') || p.includes('height')) {
    return "Quick sizing rule: art width should be about 2/3 to 3/4 of the furniture or wall space it’s meant to balance. If it’s above a sofa, center it and keep the bottom edge roughly 8–10 inches from the top of the furniture.";
  }

  return "Here’s a great starting point: tell me your room color (or share a vibe like modern, cozy, or luxury). I’ll suggest paintings that match your palette and style, and recommend the best placement size.";
}

function initChatUI() {
  const launcher = document.getElementById('aiLauncher');
  const panel = document.getElementById('aiPanel');
  const closeBtn = document.getElementById('aiClose');

  const sendBtn = document.getElementById('aiSend');
  const form = document.getElementById('aiForm');

  if (!launcher || !panel) return;

  launcher.addEventListener('click', () => {
    panel.classList.add('open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });
  }

  const closeOnEsc = (e) => {
    if (e.key === 'Escape') panel.classList.remove('open');
  };
  window.addEventListener('keydown', closeOnEsc);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSend();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
}

document.addEventListener('DOMContentLoaded', initChatUI);

