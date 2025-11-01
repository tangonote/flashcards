/* =======================================================
   Flashcard App – 完全版 (2025-11-01b)
   ======================================================= */

// CSV読み込み関数（UTF-8チェック付き）
async function loadCSV(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // 🔸 UTF-8判定
    const text = await blob.text();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const decoded = decoder.decode(await blob.arrayBuffer());
    if (decoded.includes("�")) {
      alert("⚠️ このCSVファイルはUTF-8形式ではない可能性があります。文字化けの恐れがあります。");
    }

    return parseCSV(text);
  } catch (error) {
    console.error("CSVの読み込みに失敗しました:", error);
    alert("CSVファイルの読み込みに失敗しました。");
    return [];
  }
}

// CSV文字列 → 配列
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.split(",").map((s) => s.trim()))
    .filter((row) => row.length >= 2);
}

// 配列をシャッフル
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// -----------------------------------------------
// Flashcardアプリ本体
// -----------------------------------------------
function createFlashcardApp(data, targetId = "flashcard-app", limitTo10 = false) {
  const container = document.getElementById(targetId);
  if (!container) return;
  container.innerHTML = "";

  // 🔹 出題数を制御
  let cards = shuffleArray(data);
  if (limitTo10) {
    cards = cards.slice(0, 10);
  }
  const totalCards = cards.length;

  // 🔹 カードエリア
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  const card = document.createElement("div");
  card.className = "card front";
  const content = document.createElement("div");
  content.className = "card-content";
  card.appendChild(content);
  cardContainer.appendChild(card);
  container.appendChild(cardContainer);

  // 🔹 ボタン群
  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "覚えた";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "まだ";

  container.appendChild(btnKnow);
  container.appendChild(btnDontKnow);

  // 🔹 進捗
  const progress = document.createElement("div");
  progress.id = "progress";
  container.appendChild(progress);

  // 🔹 結果表示
  const result = document.createElement("div");
  result.id = "result";
  container.appendChild(result);

  // 🔹 内部状態
  let current = 0;
  let knownCount = 0;
  let missed = [];
  let showFront = true;

  // 🔹 表裏トグル制御（外部から呼ばれる）
  window.toggleFlashcardSide = function (isBack) {
    showFront = !isBack;
    updateCard();
  };

  // 🔹 カード更新
  function updateCard() {
    if (current >= totalCards) {
      showResult();
      return;
    }
    const [front, back] = cards[current];
    content.textContent = showFront ? front : back;
    card.className = showFront ? "card front" : "card back";
    progress.textContent = `進捗: ${current + 1} / ${totalCards}`;
  }

  // 🔹 結果表示
  function showResult() {
    cardContainer.style.display = "none";
    btnKnow.style.display = "none";
    btnDontKnow.style.display = "none";
    progress.style.display = "none";

    result.style.display = "block";
    result.classList.add("complete");
    result.innerHTML = `
      学習完了 🎉<br>
      覚えた: ${knownCount} / ${totalCards}
      <div class="missed-list">
        ${
          missed.length
            ? "<strong>復習が必要なカード:</strong><br>" +
              missed.map((m) => `<div>${m}</div>`).join("")
            : "すべて覚えました！"
        }
      </div>
    `;

    const retryBtn = document.createElement("button");
    retryBtn.id = "btn-retry";
    retryBtn.textContent = "もう一度";
    retryBtn.addEventListener("click", () => createFlashcardApp(data, targetId, limitTo10));
    container.appendChild(retryBtn);
  }

  // 🔹 イベント設定
  btnKnow.addEventListener("click", () => {
    knownCount++;
    current++;
    updateCard();
  });

  btnDontKnow.addEventListener("click", () => {
    missed.push(cards[current][0]);
    current++;
    updateCard();
  });

  // 🔹 カードクリックで表裏反転
  card.addEventListener("click", () => {
    showFront = !showFront;
    updateCard();
  });

  // 初回表示
  updateCard();
}
