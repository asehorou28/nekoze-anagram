const sourceWord = "nekoze";
const targetWord = "knoeze";
const totalPatterns = 360;
const bestKey = "knoezeBeatBest";
const youtubeUrl = "https://www.youtube.com/watch?v=fLp2TZi7Qyk";

let currentWord = sourceWord;
let attempts = 0;
let isClear = false;
let isRedirecting = false;
let history = [];
let stepIndex = 0;

const machine = document.getElementById("machine");
const currentWordEl = document.getElementById("currentWord");
const shuffleBtn = document.getElementById("shuffleBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBestBtn = document.getElementById("clearBestBtn");
const promoCodeInput = document.getElementById("promoCode");
const attemptCountEl = document.getElementById("attemptCount");
const matchCountEl = document.getElementById("matchCount");
const bestRecordEl = document.getElementById("bestRecord");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const compareRow = document.getElementById("compareRow");
const matchBar = document.getElementById("matchBar");
const historyEl = document.getElementById("history");
const sequencer = document.getElementById("sequencer");
const vuBars = document.querySelectorAll(".vu span");
const toast = document.getElementById("toast");
const dropFlash = document.getElementById("dropFlash");
const dropOverlay = document.getElementById("dropOverlay");

const normalMessages = [
  "まだグルーヴが合っていません。",
  "knoezeのキックを探しています。",
  "もう少しでドロップしそうです。",
  "シーケンスを再構築中です。",
  "次のテイクで決まるかもしれません。",
  "nekozeのサンプルを切り刻んでいます。",
  "まだミックス途中です。"
];

function shuffleWord(word) {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function countPositionMatches(word) {
  let count = 0;
  for (let i = 0; i < targetWord.length; i++) {
    if (word[i] === targetWord[i]) count++;
  }
  return count;
}

function getBestRecord() {
  const value = localStorage.getItem(bestKey);
  return value ? Number(value) : null;
}

function setBestRecord(value) {
  localStorage.setItem(bestKey, String(value));
}

function renderPads() {
  const hit = currentWord === targetWord;
  currentWordEl.innerHTML = "";

  currentWord.split("").forEach((char, index) => {
    const pad = document.createElement("div");
    pad.className = "pad";

    if (hit) {
      pad.classList.add("hit");
    } else if (char === targetWord[index]) {
      pad.classList.add("match");
    }

    pad.textContent = char;
    currentWordEl.appendChild(pad);
  });
}

function renderCompare() {
  const matchCount = countPositionMatches(currentWord);
  compareRow.innerHTML = "";

  targetWord.split("").forEach((char, index) => {
    const pad = document.createElement("div");
    pad.className = "target-pad";
    if (currentWord[index] === char) pad.classList.add("ok");
    pad.textContent = char;
    compareRow.appendChild(pad);
  });

  matchCountEl.textContent = `${matchCount}/6`;
  matchBar.style.width = `${(matchCount / targetWord.length) * 100}%`;
}

function renderBest() {
  const best = getBestRecord();
  bestRecordEl.textContent = best ? `${best}` : "--";
}

function renderHistory() {
  historyEl.innerHTML = "";

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "まだ履歴はありません。";
    historyEl.appendChild(empty);
    return;
  }

  history.forEach((word) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (word === targetWord ? " hit" : "");
    chip.textContent = word;
    historyEl.appendChild(chip);
  });
}

function renderSequencer() {
  const steps = sequencer.querySelectorAll("span");
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === stepIndex);
  });
}

function renderVu() {
  const matchCount = countPositionMatches(currentWord);
  vuBars.forEach((bar, index) => {
    const base = 14 + Math.random() * 26;
    const bonus = matchCount * 9 + index * 3;
    bar.style.height = `${Math.min(100, base + bonus)}%`;
  });
}

function updateMessage() {
  const matchCount = countPositionMatches(currentWord);

  if (isClear) {
    messageTitle.textContent = "DROP!!";
    messageText.textContent = `${attempts}テイク目で、knoezeのビートが完成しました。`;
    return;
  }

  if (attempts === 0) {
    messageTitle.textContent = "READY";
    messageText.textContent = "PLAYを押して、knoezeのドロップを狙ってください。";
    return;
  }

  if (matchCount >= 5) {
    messageTitle.textContent = "ALMOST DROP";
    messageText.textContent = `6パッド中${matchCount}個が一致。かなり完成形に近いです。`;
  } else if (matchCount >= 3) {
    messageTitle.textContent = "GOOD GROOVE";
    messageText.textContent = `6パッド中${matchCount}個が一致。knoezeの気配があります。`;
  } else {
    const text = normalMessages[Math.floor(Math.random() * normalMessages.length)];
    messageTitle.textContent = "MISS TAKE";
    messageText.textContent = `${text} MATCHは${matchCount}/6です。`;
  }
}

function render() {
  machine.classList.toggle("drop", isClear);
  attemptCountEl.textContent = attempts;
  renderPads();
  renderCompare();
  renderBest();
  renderHistory();
  renderSequencer();
  renderVu();
  updateMessage();

  shuffleBtn.disabled = isRedirecting;
  resetBtn.disabled = isRedirecting;
  promoCodeInput.disabled = isRedirecting;

  if (isRedirecting) {
    shuffleBtn.innerHTML = '<span class="play-icon">✓</span>OPENING YOUTUBE';
  } else if (isClear) {
    shuffleBtn.innerHTML = '<span class="play-icon">↻</span>NEXT TAKE';
  } else {
    shuffleBtn.innerHTML = '<span class="play-icon">▶</span>PLAY / SHUFFLE';
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1300);
}

function playSynthTone(frequency, duration = 0.12, type = "sine", gainValue = 0.045) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(gainValue, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  } catch {
  }
}

function playShuffleSound(matchCount) {
  const frequencies = [164.81, 196.00, 246.94, 293.66, 329.63, 392.00];
  const frequency = frequencies[Math.min(matchCount, frequencies.length - 1)];
  playSynthTone(frequency, 0.11, "square", 0.028);
}

function playDropSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const notes = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = index < 2 ? "sawtooth" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.075);

      gain.gain.setValueAtTime(0, context.currentTime + index * 0.075);
      gain.gain.linearRampToValueAtTime(0.07, context.currentTime + index * 0.075 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.075 + 0.45);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(context.currentTime + index * 0.075);
      oscillator.stop(context.currentTime + index * 0.075 + 0.48);
    });
  } catch {
  }
}

function launchDropEffects() {
  document.body.classList.add("drop-mode");

  dropFlash.classList.remove("active");
  dropFlash.offsetHeight;
  dropFlash.classList.add("active");

  dropOverlay.classList.remove("show");
  dropOverlay.offsetHeight;
  dropOverlay.classList.add("show");

  playDropSound();

  setTimeout(() => dropFlash.classList.remove("active"), 900);
  setTimeout(() => dropOverlay.classList.remove("show"), 2600);
  setTimeout(() => {
    window.location.href = youtubeUrl;
  }, 2600);
}

function playOnce() {
  if (isRedirecting) {
    return;
  }

  if (isClear) {
    resetGame(false);
  }

  attempts++;

  const promoCode = promoCodeInput.value.trim();
  if (promoCode === "528") {
    currentWord = targetWord;
    promoCodeInput.value = "";
  } else {
    currentWord = shuffleWord(sourceWord);
  }

  history.unshift(currentWord);
  history = history.slice(0, 20);
  stepIndex = (stepIndex + 1) % 16;

  if (currentWord === targetWord) {
    isClear = true;
    isRedirecting = true;
    const best = getBestRecord();

    if (!best || attempts < best) {
      setBestRecord(attempts);
    }

    launchDropEffects();
  } else {
    playShuffleSound(countPositionMatches(currentWord));
  }

  render();
}

function resetGame(clearHistory) {
  currentWord = sourceWord;
  attempts = 0;
  isClear = false;
  isRedirecting = false;
  stepIndex = 0;
  document.body.classList.remove("drop-mode");

  if (clearHistory) {
    history = [];
  }

  render();
}

async function copyResult() {
  const matchCount = countPositionMatches(currentWord);
  const text = isClear
    ? `KNOEZE Beat Machine DROP!!\nnekoze → knoeze\nTAKE：${attempts}\nRATE：約1/${totalPatterns}`
    : `KNOEZE Beat Machine\n現在：${currentWord}\nTAKE：${attempts}\nMATCH：${matchCount}/6\nTARGET：knoeze`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("copied");
  } catch {
    showToast("copy failed");
  }
}

promoCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") playOnce();
});

shuffleBtn.addEventListener("click", playOnce);
resetBtn.addEventListener("click", () => resetGame(true));
copyBtn.addEventListener("click", copyResult);

clearBestBtn.addEventListener("click", () => {
  localStorage.removeItem(bestKey);
  renderBest();
  showToast("best cleared");
});

render();
