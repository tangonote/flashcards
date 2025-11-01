// ==============================
// flashcard.js（2025-11-01版）
// ==============================

// CSV読み込み（UTF-8限定チェック付き）
async function loadCSV(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // UTF-8でない可能性がある場合の警告
    const text = await blob.text();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    try {
      decoder.decode(await blob.arrayBuffer());
    } catch (e) {
      alert("⚠ CSVファイルはUTF-8形式で保存してください。");
      throw new Error("CSV encoding error: not UTF-8");
    }

    const rows = text.trim().split(/\r?\n/).map(line => line.split(","));
    return rows.map(([front, back]) => ({ front, back }));
  } catch (error) {
    console.error("CSV読み込みエラー:", error);
    alert("CSVファイルを読み込めませんでした。");
    return [];
  }
}

// 配列をランダムシャッフル
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// フラッシュカードアプリ作成
function createFlashcardApp(data, targetId = "flashcard-app", limitTo10 = false) {
  const container = document.getElementById(targetId);
  container.innerHTML = "";

  // 🔹 出題数制御（10問のみ or 全問）
  let cards = shuffleArray(data);
  if (limitTo10) {
    cards = cards.slice(0, 10);
  }
  const totalCards = cards.length;
  let currentIndex = 0;
  let showingFront = true;

  // メインカード要素
  const card = document.createElement("div");
  card.className = "flashcard";
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  card.appendChild(cardContent);

  // ボタン類
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "次へ";
  nextBtn.className = "next-btn";

  const backBtn = document.createElement("button");
  backBtn.textContent = "戻る";
  backBtn.className = "back-btn";

  // 進捗表示
  const progress = document.createElement("div");
  progress.className = "progress";

  // コンテナに追加
  container.appendChild(progress);
  container.appendChild(card);
  container.appendChild(backBtn);
  container.appendChild(nextBtn);

  // 表示更新関数
  function updateCard() {
    if (cards.length === 0) {
      cardContent.textContent = "カードがありません";
      progress.textContent = "";
      return;
    }
    const cardData = cards[currentIndex];
    cardContent.textContent = showingFront ? cardData.front : cardData.back;
    progress.textContent = `${currentIndex + 1} / ${totalCards}`;
  }

  // クリックで表裏切替
  card.addEventListener("click", () => {
    showingFront = !showingFront;
    updateCard();
  });

  // ボタン操作
  nextBtn.addEventListener("click", () => {
    if (currentIndex < totalCards - 1) {
      currentIndex++;
      showingFront = true;
      updateCard();
    } else {
      cardContent.textContent = "🎉 学習完了！";
      progress.textContent = `${totalCards} / ${totalCards}`;
    }
  });

  backBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      showingFront = true;
      updateCard();
    }
  });

  // 初期表示
  updateCard();
}

// ==============================
// グローバル関数（トグル用）
// ==============================
window.toggleFlashcardSide = function (isBackSide) {
  const app = document.querySelector("#flashcard-app .card-content");
  if (!app) return;

  const currentText = app.textContent;
  const allCards = window.currentFlashcards || [];
  const card = allCards.find(c => c.front === currentText || c.back === currentText);

  if (card) {
    app.textContent = isBackSide ? card.back : card.front;
  }
};