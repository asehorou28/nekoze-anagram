const sourceWord = "nekoze";
const targetWord = "knoeze";
const totalPatterns = 360;
const bestKey = "knoezeChallengeBest";

let currentWord = sourceWord;
let attempts = 0;
let isClear = false;
let history = [];

const hero = document.getElementById("hero");
const currentWordEl = document.getElementById("currentWord");
const shuffleBtn = document.getElementById("shuffleBtn");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBestBtn = document.getElementById("clearBestBtn");
const attemptCountEl = document.getElementById("attemptCount");
const matchCountEl = document.getElementById("matchCount");
const bestRecordEl = document.getElementById("bestRecord");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const compareRow = document.getElementById("compareRow");
const matchBar = document.getElementById("matchBar");
const historyEl = document.getElementById("history");
const toast = document.getElementById("toast");
const confetti = document.getElementById("confetti");

const normalMessages = [
  "まだnekozeの気配が強いです。",
  "knoeze降臨待ちです。",
  "惜しい気がするけど、まだ違います。",
  "文字たちが迷子になっています。",
  "次こそknoezeかもしれません。",
  "これはknoezeではありません。",
  "nekozeからの進化途中です。"
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
    if (word[i] === targetWord[i]) {
      count++;
    }
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

function renderWord() {
  const matchAll = currentWord === targetWord;
  currentWordEl.innerHTML = "";

  currentWord.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "letter";

    if (matchAll) {
      span.classList.add("hit");
    } else if (char === targetWord[index]) {
      span.classList.add("match");
    }

    span.textContent = char;
    currentWordEl.appendChild(span);
  });

  currentWordEl.style.animation = "none";
  currentWordEl.offsetHeight;
  currentWordEl.style.animation = "";
}

function renderCompare() {
  const matchCount = countPositionMatches(currentWord);
  compareRow.innerHTML = "";

  targetWord.split("").forEach((targetChar, index) => {
    const span = document.createElement("span");
    span.className = "small-letter";

    if (currentWord[index] === targetChar) {
      span.classList.add("ok");
    }

    span.textContent = targetChar;
    compareRow.appendChild(span);
  });

  matchCountEl.textContent = `${matchCount}/6`;
  matchBar.style.width = `${(matchCount / targetWord.length) * 100}%`;
}

function renderBest() {
  const best = getBestRecord();
  bestRecordEl.textContent = best ? `${best}回` : "--";
}

function renderHistory() {
  historyEl.innerHTML = "";

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "まだ履歴はありません。";
    historyEl.appendChild(empty);
    return;
  }

  history.forEach((word) => {
    const button = document.createElement("button");
    button.className = "chip" + (word === targetWord ? " target-chip" : "");
    button.textContent = word;
    historyEl.appendChild(button);
  });
}

function updateMessage() {
  const matchCount = countPositionMatches(currentWord);

  if (isClear) {
    messageTitle.textContent = "KNOEZE 誕生！";
    messageText.textContent = `${attempts}回目で、nekozeはknoezeへ進化しました。`;
    return;
  }

  if (attempts === 0) {
    messageTitle.textContent = "準備完了";
    messageText.textContent = "ボタンを押して、knoezeを召喚してください。";
    return;
  }

  if (matchCount >= 5) {
    messageTitle.textContent = "超ニアピン！";
    messageText.textContent = `6文字中${matchCount}文字が同じ位置です。あと少し。`;
  } else if (matchCount >= 3) {
    messageTitle.textContent = "かなり近い";
    messageText.textContent = `6文字中${matchCount}文字が一致しています。knoezeの気配があります。`;
  } else {
    const text = normalMessages[Math.floor(Math.random() * normalMessages.length)];
    messageTitle.textContent = "召喚失敗";
    messageText.textContent = `${text} 位置一致は${matchCount}文字です。`;
  }
}

function render() {
  hero.classList.toggle("clear", isClear);
  attemptCountEl.textContent = attempts;
  renderWord();
  renderCompare();
  renderBest();
  renderHistory();
  updateMessage();

  if (isClear) {
    shuffleBtn.textContent = "もう一度召喚する";
    shuffleBtn.classList.add("gold");
  } else {
    shuffleBtn.textContent = "KNOEZEを召喚する";
    shuffleBtn.classList.remove("gold");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1300);
}

function launchConfetti() {
  confetti.innerHTML = "";
  const colors = ["#67e8f9", "#a78bfa", "#facc15", "#4ade80", "#fb7185"];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${1.4 + Math.random() * 1.3}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
  }

  setTimeout(() => {
    confetti.innerHTML = "";
  }, 3200);
}

function playOnce() {
  if (isClear) {
    resetGame(false);
  }

  attempts++;
  currentWord = shuffleWord(sourceWord);
  history.unshift(currentWord);
  history = history.slice(0, 20);

  if (currentWord === targetWord) {
    isClear = true;
    const best = getBestRecord();

    if (!best || attempts < best) {
      setBestRecord(attempts);
    }

    launchConfetti();
  }

  render();
}

function resetGame(clearHistory) {
  currentWord = sourceWord;
  attempts = 0;
  isClear = false;

  if (clearHistory) {
    history = [];
  }

  render();
}

async function copyResult() {
  const matchCount = countPositionMatches(currentWord);
  const text = isClear
    ? `KNOEZE Challenge 成功！\nnekoze → knoeze\n挑戦回数：${attempts}回\n確率：約1/${totalPatterns}`
    : `KNOEZE Challenge 挑戦中\n現在：${currentWord}\n挑戦回数：${attempts}回\n位置一致：${matchCount}/6\n目標：knoeze`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("結果をコピーしました");
  } catch {
    showToast("コピーできませんでした");
  }
}

shuffleBtn.addEventListener("click", playOnce);
resetBtn.addEventListener("click", () => resetGame(true));
copyBtn.addEventListener("click", copyResult);

clearBestBtn.addEventListener("click", () => {
  localStorage.removeItem(bestKey);
  renderBest();
  showToast("ベスト記録を消しました");
});

render();
