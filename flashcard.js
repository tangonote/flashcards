// =======================================
// Flashcard App – New Version (2025-10)
// =======================================

// CSV を読み込む関数
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

// Flashcard アプリを生成する関数
function createFlashcardApp(data, targetId = "flashcard-app") {
  const container = document.getElementById(targetId);
  container.innerHTML = ""; // 初期化

  let currentIndex = 0;
  let showBack = false;
  let learnedCount = 0;
  const totalCards = data.length;

  // カード要素
  const card = document.createElement("div");
  card.className = "card front";
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  card.appendChild(cardContent);
  container.appendChild(card);

  // ボタン
  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "覚えた";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "まだ";

  container.appendChild(btnKnow);
  container.appendChild(btnDontKnow);

  // 枚数表示
  const progress = document.createElement("div");
  progress.id = "progress";
  container.appendChild(progress);

  // 一周完了時の結果表示
  const result = document.createElement("div");
  result.id = "result";
  container.appendChild(result);

  // カード更新処理
  function updateCard() {
    if (data.length === 0) {
      cardContent.textContent = "カードがありません";
      return;
    }

    const current = data[currentIndex];
    cardContent.textContent = showBack ? current.back : current.front;

    // クラス切替（色分け）
    card.className = showBack ? "card back" : "card front";

    // 進捗表示（例：3 / 20）
    progress.textContent = `${currentIndex + 1} / ${totalCards}`;
  }

  // 一周完了時の処理
  function showResult() {
    const percent = Math.round((learnedCount / totalCards) * 100);
    result.innerHTML = `
      <div class="complete">🎉 学習完了！</div>
      <div>${totalCards}枚中 ${learnedCount}枚覚えました。</div>
      <div>達成率：${percent}%</div>
    `;
    result.style.display = "block";
  }

  // カード反転
  card.addEventListener("click", () => {
    showBack = !showBack;
    updateCard();
  });

  // 「覚えた」ボタン
  btnKnow.addEventListener("click", () => {
    learnedCount++;
    nextCard();
  });

  // 「まだ」ボタン
  btnDontKnow.addEventListener("click", () => {
    nextCard();
  });

  // 次のカードへ
  function nextCard() {
    currentIndex++;
    showBack = false;

    if (currentIndex >= totalCards) {
      showResult();
      btnKnow.disabled = true;
      btnDontKnow.disabled = true;
      card.style.cursor = "default";
      cardContent.textContent = "お疲れさまでした！";
      return;
    }

    updateCard();
  }

  // 初期表示
  updateCard();
}
