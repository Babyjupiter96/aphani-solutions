// Aphani Solutions — AI Lead Qualification Chatbot

const FLOW = [
  {
    id: 'greeting',
    bot: "Hi there! I'm Aphani AI. I help studio owners figure out if we're the right fit in just a few questions. Ready?",
    quickReplies: ["Let's go", "Sure"],
    next: 'brand',
  },
  {
    id: 'brand',
    bot: "What brand or type of studio do you operate?",
    quickReplies: ['FXB', 'The Max Challenge', 'F45 Training', 'Other boutique fitness'],
    next: 'leads',
    collect: 'brand',
  },
  {
    id: 'leads',
    bot: "How many new leads does your studio receive per month?",
    quickReplies: ['Under 20', '20–50', '50–100', '100+'],
    next: 'challenge',
    collect: 'leads',
  },
  {
    id: 'challenge',
    bot: "What's your biggest sales challenge right now?",
    quickReplies: [
      'Leads not converting',
      'Low trial show rates',
      'No time to follow up',
      'Closing on the first call',
    ],
    next: 'close_rate',
    collect: 'challenge',
  },
  {
    id: 'close_rate',
    bot: "Do you know your current lead-to-member close rate?",
    quickReplies: ['Under 10%', '10–25%', '25–50%', "Not sure"],
    next: 'locations',
    collect: 'close_rate',
  },
  {
    id: 'locations',
    bot: "How many locations do you operate?",
    quickReplies: ['1', '2–3', '4–6', '7+'],
    next: 'name',
    collect: 'locations',
  },
  {
    id: 'name',
    bot: "Great — sounds like Aphani could make a real impact. What's your name?",
    quickReplies: [],
    next: 'email',
    collect: 'name',
    inputOnly: true,
  },
  {
    id: 'email',
    bot: data => `Nice to meet you, ${data.name}! What's the best email to reach you?`,
    quickReplies: [],
    next: 'phone',
    collect: 'email',
    inputOnly: true,
  },
  {
    id: 'phone',
    bot: "And your phone number? Cameron personally reviews every inquiry.",
    quickReplies: [],
    next: 'done',
    collect: 'phone',
    inputOnly: true,
  },
  {
    id: 'done',
    bot: data =>
      `Thanks, ${data.name}! Here's what we've captured:\n\n` +
      `Brand: ${data.brand || '—'}\n` +
      `Monthly Leads: ${data.leads || '—'}\n` +
      `Locations: ${data.locations || '—'}\n` +
      `Close Rate: ${data.close_rate || '—'}\n` +
      `Challenge: ${data.challenge || '—'}\n\n` +
      `Cameron will be in touch at ${data.email} shortly. You can also reach us directly at (945) 412-8283.`,
    quickReplies: ['Call us now', 'View Partnership →'],
    next: null,
  },
];

let currentStep = 0;
let isOpen      = false;
let isTyping    = false;
let leadData    = {};
let started     = false;

function toggleChat() {
  isOpen = !isOpen;
  const win = document.getElementById('chatbot-window');
  win.classList.toggle('chat-open',   isOpen);
  win.classList.toggle('chat-closed', !isOpen);
  if (isOpen && !started) { started = true; setTimeout(() => runStep(0), 420); }
  if (isOpen) setTimeout(() => document.getElementById('chatInput').focus(), 380);
}

function runStep(idx) {
  const step = FLOW[idx];
  if (!step) return;
  currentStep = idx;
  const text = typeof step.bot === 'function' ? step.bot(leadData) : step.bot;
  showTyping(text, () => showQuickReplies(step.quickReplies || []));
}

function showTyping(text, cb) {
  if (isTyping) return;
  isTyping = true;
  clearQuickReplies();
  const msgs = document.getElementById('chatMessages');
  const ind  = document.createElement('div');
  ind.className = 'typing-indicator';
  ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  msgs.appendChild(ind);
  scrollBottom();
  const delay = Math.min(700 + text.length * 10, 2000);
  setTimeout(() => {
    ind.remove();
    isTyping = false;
    addBotMessage(text);
    if (cb) cb();
  }, delay);
}

function addBotMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = 'msg msg-bot';
  const html = escHtml(text).replace(/\n/g, '<br/>');
  div.innerHTML = `<div class="msg-bubble">${html}</div><div class="msg-time">${getTime()}</div>`;
  msgs.appendChild(div);
  scrollBottom();
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div  = document.createElement('div');
  div.className = 'msg msg-user';
  div.innerHTML = `<div class="msg-bubble">${escHtml(text)}</div><div class="msg-time">${getTime()}</div>`;
  msgs.appendChild(div);
  scrollBottom();
}

function showQuickReplies(replies) {
  const c = document.getElementById('quickReplies');
  c.innerHTML = '';
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.className   = 'qr-btn';
    btn.textContent = r;
    btn.onclick     = () => handleQuickReply(r);
    c.appendChild(btn);
  });
}

function clearQuickReplies() {
  document.getElementById('quickReplies').innerHTML = '';
}

function handleQuickReply(text) {
  if (text === 'Call us now') {
    addUserMessage(text);
    clearQuickReplies();
    window.location.href = 'tel:9454128283';
    return;
  }
  if (text === 'View Partnership →') {
    addUserMessage(text);
    clearQuickReplies();
    window.location.href = 'partnership.html#apply';
    return;
  }
  processInput(text);
}

function sendUserMessage() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text || isTyping) return;
  input.value = '';
  processInput(text);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendUserMessage();
}

function processInput(text) {
  addUserMessage(text);
  clearQuickReplies();
  const step = FLOW[currentStep];
  if (step?.collect) leadData[step.collect] = text;
  const nextId  = step?.next;
  if (!nextId) return;
  const nextIdx = FLOW.findIndex(s => s.id === nextId);
  if (nextIdx !== -1) setTimeout(() => runStep(nextIdx), 280);
}

function scrollBottom() {
  const msgs = document.getElementById('chatMessages');
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
