// Cylin Painters - AI Assistant UI (front-end only)

let chatTypingTimer = null;
const chatHistory = [];

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
  chatHistory.push({ role, text });
  return msg;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
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
  chatHistory.push({ role: 'assistant', text: loadingReply });

  // streaming
  fakeStreamToElement(bubble, loadingReply);

  const doneTimer = setTimeout(() => {
    setButtonLoading(sendBtn, false);
    clearTimeout(doneTimer);
  }, Math.max(900, loadingReply.length * 18));
}

function getAssistantReply(prompt) {
  const p = prompt.toLowerCase();
  const lastUser = chatHistory.filter((m) => m.role === 'user').slice(-2)[0]?.text.toLowerCase() || '';

  if (/thank|thanks|great|cool|nice/.test(p)) {
    return "Happy to help! If you want, ask me to compare two paint colors, pick an accent wall, or recommend a layout for your space.";
  }

  if (/wall|size|space|above my sofa|above the sofa/.test(p)) {
    return "For wall art size, try choosing a piece that's about 2/3 of the width of the furniture below it. Keep the bottom edge 8–10 inches above a sofa or console for balanced placement.";
  }

  if (/modern|minimal|scandinavian|contemporary/.test(p)) {
    return "Modern rooms work well with art that has clean lines, a calm palette, and a strong focal point. Consider neutral backgrounds with one accent color for depth.";
  }

  if (/warm|beige|cream|tan|earthy/.test(p)) {
    return "Warm spaces look great with pieces that include soft terracotta, muted gold, and creamy neutrals. A textured abstract or landscape can bring warmth without feeling too busy.";
  }

  if (/blue|navy|teal|aqua/.test(p)) {
    return "Blue tones pair beautifully with ivory, warm wood, and gentle brass accents. Choose artwork with subtle warm highlights so the room feels balanced and inviting.";
  }

  if (/paint|finish|wall paint|interior paint|exterior paint/.test(p)) {
    return "For paint, pick a finish based on the room: eggshell for living spaces, satin for trim and doors, and semi-gloss for kitchens or bathrooms that need easy cleaning.";
  }

  if (/follow|next|more|also/.test(p) && lastUser) {
    return "Great, tell me more about the space or the mood you're going for, and I can refine the recommendation.";
  }

  return "I’m here to help with colors and room style. Tell me your room type, current wall color, or the style you want (cozy, modern, luxury), and I’ll suggest the best painting or finish.";
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

