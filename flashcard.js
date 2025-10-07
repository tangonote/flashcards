// =======================================
// Flashcard App – New Version (2025-10)
// =======================================

// flashcard.js v20251008b
// 機能：表裏入れ替えスイッチ / 初回シャッフル / 一周結果で「まだ」一覧（縦並び・スクロール） / 再挑戦

async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text
    .trim()
    .split("\n")
    .map(line => {
      const [front, back] = line.split(",");
      return { front: front.trim(), back: back.trim() };
    });
}

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFlashcardApp(data, targetId = "flashcard-app") {
  const container = document.getElementById(targetId);
  container.innerHTML = "";

  let cards = shuffleArray(data);
  const totalCards = cards.length;

  let currentIndex = 0;
  let showBack = false;
  let isReversed = false;
  let learnedCount = 0;
  let missedWords = [];

  // ----- UI作成 -----
  const toggleSwitch = document.createElement("button");
  toggleSwitch.id = "btn-toggle";
  toggleSwitch.textContent = "表裏入れ替え";
  container.appendChild(toggleSwitch);

  const card = document.createElement("div");
  card.className = "card front";
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  card.appendChild(cardContent);
  container.appendChild(card);

  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "覚えた";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "まだ";

  container.appendChild(btnKnow);
  container.appendChild(btnDontKnow);

  const progress = document.createElement("div");
  progress.id = "progress";
  container.appendChild(progress);

  const result = document.createElement("div");
  result.id = "result";
  container.appendChild(result);

  // ----- イベント定義 -----
  toggleSwitch.addEventListener("click", () => {
    isReversed = !isReversed;
    toggleSwitch.textContent = isReversed ? "通常表示に戻す" : "表裏入れ替え";
    updateCard();
  });

  card.addEventListener("click", () => {
    showBack = !showBack;
    updateCard();
  });

  btnKnow.addEventListener("click", () => {
    learnedCount++;
    nextCard();
  });

  btnDontKnow.addEventListener("click", () => {
    const curr = cards[currentIndex];
    const exists = missedWords.some(item => item.front === curr.front && item.back === curr.back);
    if (!exists) missedWords.push(curr);
    nextCard();
  });

  function updateCard() {
    if (totalCards === 0) {
      cardContent.textContent = "カードがありません";
      progress.textContent = "";
      return;
    }

    const current = cards[currentIndex];
    const frontText = isReversed ? current.back : current.front;
    const backText  = isReversed ? current.front : current.back;
    cardContent.textContent = showBack ? backText : frontText;

    card.className = showBack ? "card back" : "card front";
    progress.textContent = `${currentIndex + 1} / ${totalCards}`;
  }

  function nextCard() {
    showBack = false;
    currentIndex++;
    if (currentIndex >= totalCards) {
      endSession();
      return;
    }
    updateCard();
  }

  function endSession() {
    card.style.display = "none";
    btnKnow.style.display = "none";
    btnDontKnow.style.display = "none";
    toggleSwitch.style.display = "none";
    progress.style.display = "none";

    const percent = totalCards === 0 ? 0 : Math.round((learnedCount / totalCards) * 100);

    // 「まだ」一覧を縦並びで表示
    let missedHTML = "";
    if (missedWords.length > 0) {
      const pairs = missedWords.map(item => {
        return isReversed ? `${item.back} - ${item.front}` : `${item.front} - ${item.back}`;
      });
      missedHTML = `<div class="missed-list">
        <div><strong>まだ覚えていないカード</strong></div>
        ${pairs.map(p => `<div>${p}</div>`).join("")}
      </div>`;
    } else {
      missedHTML = `<div class="missed-list">
        <div><strong>まだ覚えていないカード</strong></div>
        <div>なし（全て覚えました）</div>
      </div>`;
    }

    result.innerHTML = `
      <div class="complete">🎉 学習完了！</div>
      <div>${totalCards}枚中 ${learnedCount}枚覚えました。</div>
      <div>達成率：${percent}%</div>
      ${missedHTML}
      <div style="margin-top:12px;"><button id="btn-retry">再挑戦</button></div>
    `;
    result.style.display = "block";

    const retryBtn = document.getElementById("btn-retry");
    retryBtn.addEventListener("click", () => {
      // 同じ順序で再スタート
      currentIndex = 0;
      showBack = false;
      learnedCount = 0;
      missedWords = [];

      card.style.display = "";
      btnKnow.style.display = "";
      btnDontKnow.style.display = "";
      toggleSwitch.style.display = "";
      progress.style.display = "";
      result.style.display = "none";

      btnKnow.disabled = false;
      btnDontKnow.disabled = false;
      card.style.cursor = "pointer";

      updateCard();
    });
  }

  if (totalCards > 0) {
    updateCard();
  } else {
    cardContent.textContent = "カードがありません";
  }
}