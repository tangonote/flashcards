// =======================================
// Flashcard App – New Version (2025-10-09)
// =======================================

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

  // ----------------------------------
  // UI構築
  // ----------------------------------

  // トグルスイッチ（右上外側配置）
  const toggleContainer = document.createElement("div");
  toggleContainer.id = "btn-toggle-container";
  toggleContainer.style.position = "absolute";
  toggleContainer.style.top = "0";
  toggleContainer.style.right = "0";
  toggleContainer.style.margin = "10px";
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.gap = "6px";
  toggleContainer.style.zIndex = "1000"; // カードより前面に固定

  const toggleLabel = document.createElement("span");
  toggleLabel.className = "toggle-label";
  toggleLabel.textContent = "表⇄裏";

  const toggleSwitch = document.createElement("label");
  toggleSwitch.className = "switch";
  toggleSwitch.innerHTML = `
    <input type="checkbox" id="toggle-face">
    <span class="slider"></span>
  `;

  const toggleInput = toggleSwitch.querySelector("input");
  toggleInput.addEventListener("change", () => {
    isReversed = toggleInput.checked;
    updateCard();
  });

  toggleContainer.appendChild(toggleLabel);
  toggleContainer.appendChild(toggleSwitch);
  container.appendChild(toggleContainer);

  // カード
  const card = document.createElement("div");
  card.className = "card front";
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  card.appendChild(cardContent);
  container.appendChild(card);

  // ボタン
  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "おぼえた！";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "もうすこし";

  // 横並びボタンコンテナ
  const btnContainer = document.createElement("div");
  btnContainer.id = "btn-container";
  btnContainer.appendChild(btnKnow);
  btnContainer.appendChild(btnDontKnow);
  container.appendChild(btnContainer);

  // 進捗と結果
  const progress = document.createElement("div");
  progress.id = "progress";
  container.appendChild(progress);

  const result = document.createElement("div");
  result.id = "result";
  container.appendChild(result);

  // ----------------------------------
  // イベント設定
  // ----------------------------------

  toggleSwitch.addEventListener("click", () => {
    isReversed = !isReversed;
    toggleSwitch.classList.toggle("active", isReversed);
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
    const exists = missedWords.some(
      item => item.front === curr.front && item.back === curr.back
    );
    if (!exists) missedWords.push(curr);
    nextCard();
  });

  // ----------------------------------
  // 関数群
  // ----------------------------------

  function updateCard() {
    if (totalCards === 0) {
      cardContent.textContent = "カードがありません";
      progress.textContent = "";
      return;
    }

    const current = cards[currentIndex];
    const frontText = isReversed ? current.back : current.front;
    const backText = isReversed ? current.front : current.back;

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
    btnContainer.style.display = "none";
    toggleContainer.style.display = "none";
    progress.style.display = "none";

    const percent = totalCards === 0 ? 0 : Math.round((learnedCount / totalCards) * 100);

    let missedHTML = "";
    if (missedWords.length > 0) {
      const pairs = missedWords.map(item => {
        return isReversed ? `${item.back} - ${item.front}` : `${item.front} - ${item.back}`;
      });
      missedHTML = `<div class="missed-list">
        <div><strong>まだおぼえていないカード</strong></div>
        ${pairs.map(p => `<div>${p}</div>`).join("")}
      </div>`;
    } else {
      missedHTML = `<div class="missed-list">
        <div><strong>まだおぼえていないカード</strong></div>
        <div>なし（すべておぼえました）</div>
      </div>`;
    }

    result.innerHTML = `
      <div class="complete">🎉 学習完了！</div>
      <div>${totalCards}枚中 ${learnedCount}枚おぼえました。</div>
      <div>達成率：${percent}%</div>
      ${missedHTML}
      <div style="margin-top:12px;"><button id="btn-retry">もう一度トライ</button></div>
    `;
    result.style.display = "block";

    document.getElementById("btn-retry").addEventListener("click", () => {
      currentIndex = 0;
      showBack = false;
      learnedCount = 0;
      missedWords = [];

      card.style.display = "";
      btnContainer.style.display = "";
      toggleContainer.style.display = "";
      progress.style.display = "";
      result.style.display = "none";

      updateCard();
    });
  }

  // 初期表示
  if (totalCards > 0) {
    updateCard();
  } else {
    cardContent.textContent = "カードがありません";
  }
}