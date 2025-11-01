/* =======================================================
   Flashcard App – ver.2025-11-01d
   ======================================================= */

// CSV読み込み関数（UTF-8チェック付き）
async function loadCSV(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const text = await blob.text();

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const decoded = decoder.decode(await blob.arrayBuffer());
    if (decoded.includes("�")) {
      alert("⚠️ CSVファイルがUTF-8形式でない可能性があります。");
    }

    return parseCSV(text);
  } catch (error) {
    console.error("CSV読み込み失敗:", error);
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

// =======================================================
// Flashcardアプリ本体
// =======================================================
function createFlashcardApp(data, targetId = "flashcard-app", limitTo10 = false) {
  const container = document.getElementById(targetId);
  if (!container) return;

  // 既存のチェックボックスやトグルは残すため、カードエリアのみ再生成
  let cardSection = container.querySelector(".flashcard-section");
  if (cardSection) container.removeChild(cardSection);

  cardSection = document.createElement("div");
  cardSection.className = "flashcard-section";
  container.appendChild(cardSection);

  // 出題制御
  let cards = shuffleArray(data);
  if (limitTo10) cards = cards.slice(0, 10);
  const totalCards = cards.length;

  // カード表示領域
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";

  const card = document.createElement("div");
  card.className = "card front";
  const content = document.createElement("div");
  content.className = "card-content";
  card.appendChild(content);
  cardContainer.appendChild(card);
  cardSection.appendChild(cardContainer);

  // ボタン
  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "覚えた！";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "もう少し";

  cardSection.appendChild(btnKnow);
  cardSection.appendChild(btnDontKnow);

  // 進捗表示
  const progress = document.createElement("div");
  progress.id = "progress";
  cardSection.appendChild(progress);

  // 結果エリア
  const result = document.createElement("div");
  result.id = "result";
  cardSection.appendChild(result);

  // 状態
  let current = 0;
  let knownCount = 0;
  let missed = [];
  let showFront = true;

  // トグル制御（外部トグルスイッチと連携）
  window.toggleFlashcardSide = function (isBack) {
    showFront = !isBack;
    updateCard();
  };

  // カード更新
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

  // 結果表示（両面表示対応）
  function showResult() {
    cardContainer.style.display = "none";
    btnKnow.style.display = "none";
    btnDontKnow.style.display = "none";
    progress.style.display = "none";

    result.style.display = "block";
    result.classList.add("complete");

    // 🔹 missed配列に「表裏ペア」を格納
    const missedPairs = missed.map((m) => `${m[0]} - ${m[1]}`);

    result.innerHTML = `
      学習完了 🎉<br>
      覚えた: ${knownCount} / ${totalCards}
      <div class="missed-list">
        ${
          missedPairs.length
            ? "<strong>復習が必要なカード:</strong><br>" +
              missedPairs.map((pair) => `<div>${pair}</div>`).join("")
            : "すべて覚えました！"
        }
      </div>
    `;

    const retryBtn = document.createElement("button");
    retryBtn.id = "btn-retry";
    retryBtn.textContent = "もう一度";
    retryBtn.addEventListener("click", () =>
      createFlashcardApp(data, targetId, limitTo10)
    );
    cardSection.appendChild(retryBtn);
  }

  // イベント
  btnKnow.addEventListener("click", () => {
    knownCount++;
    current++;
    updateCard();
  });

  btnDontKnow.addEventListener("click", () => {
    missed.push(cards[current]); // ← 両面情報を保持
    current++;
    updateCard();
  });

  card.addEventListener("click", () => {
    showFront = !showFront;
    updateCard();
  });

  // 初期表示
  updateCard();
}