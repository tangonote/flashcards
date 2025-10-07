// =======================================
// Flashcard App – New Version (2025-10)
// =======================================

// flashcard.js v20251008a
// 機能：表裏入れ替えスイッチ / 初回シャッフル / 一周結果で「まだ」一覧（両面表示） / 再挑戦（同じ並びで再スタート）

// CSV を読み込む関数（既存）
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

// Fisher–Yates シャッフル関数（安全なシャッフル）
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Flashcard アプリを生成する関数
function createFlashcardApp(data, targetId = "flashcard-app") {
  const container = document.getElementById(targetId);
  container.innerHTML = ""; // 初期化

  // ----- 初期データ（シャッフルして cards に保持） -----
  let cards = shuffleArray(data); // ページ読み込みごとにシャッフル（その順序を retry でも維持）
  let totalCards = cards.length;

  // 状態変数
  let currentIndex = 0;
  let showBack = false;          // 現在のカードが裏を表示中か
  let isReversed = false;        // 表裏入れ替えモードか
  let learnedCount = 0;
  let missedWords = [];          // 「まだ」に選んだカードをオブジェクトのまま保持

  // ----- UI 要素作成 -----
  // スイッチ（表裏入れ替え）
  const toggleSwitch = document.createElement("button");
  toggleSwitch.id = "btn-toggle";
  toggleSwitch.textContent = "表裏入れ替え";
  container.appendChild(toggleSwitch);

  // カード
  const card = document.createElement("div");
  card.className = "card front";
  const cardContent = document.createElement("div");
  cardContent.className = "card-content";
  card.appendChild(cardContent);
  container.appendChild(card);

  // ボタン群
  const btnKnow = document.createElement("button");
  btnKnow.id = "btn-know";
  btnKnow.textContent = "覚えた";

  const btnDontKnow = document.createElement("button");
  btnDontKnow.id = "btn-dont-know";
  btnDontKnow.textContent = "まだ";

  container.appendChild(btnKnow);
  container.appendChild(btnDontKnow);

  // 進捗と結果表示領域
  const progress = document.createElement("div");
  progress.id = "progress";
  container.appendChild(progress);

  const result = document.createElement("div");
  result.id = "result";
  container.appendChild(result);

  // ----- イベント定義 -----
  // 表裏切替ボタン
  toggleSwitch.addEventListener("click", () => {
    isReversed = !isReversed;
    toggleSwitch.textContent = isReversed ? "通常表示に戻す" : "表裏入れ替え";
    updateCard();
  });

  // カード反転（表⇄裏）
  card.addEventListener("click", () => {
    showBack = !showBack;
    updateCard();
  });

  // 覚えたボタン
  btnKnow.addEventListener("click", () => {
    learnedCount++;
    nextCard();
  });

  // まだボタン（現在のカードオブジェクトを missedWords に保存して進む）
  btnDontKnow.addEventListener("click", () => {
    // 重複を避けるため、同一オブジェクトが既に入っていないかチェック（任意）
    const curr = cards[currentIndex];
    const exists = missedWords.some(item => item.front === curr.front && item.back === curr.back);
    if (!exists) missedWords.push(curr);
    nextCard();
  });

  // ----- 画面更新関数 -----
  function updateCard() {
    if (totalCards === 0) {
      cardContent.textContent = "カードがありません";
      progress.textContent = "";
      return;
    }

    const current = cards[currentIndex];

    // 表裏切替ロジック（isReversed が true なら front/back を入れ替えて表示）
    // showBack は「裏面を表示中か」を示すフラグ（クリックで切替）
    let frontText = isReversed ? current.back : current.front;
    let backText  = isReversed ? current.front : current.back;
    cardContent.textContent = showBack ? backText : frontText;

    // 見た目のクラス（単純に表面／裏面の見た目切替）
    card.className = showBack ? "card back" : "card front";

    // 進捗表示（例：3 / 20）
    progress.textContent = `${currentIndex + 1} / ${totalCards}`;
  }

  // 次のカードへ（インデックス進める）
  function nextCard() {
    showBack = false;
    currentIndex++;

    if (currentIndex >= totalCards) {
      // 一周完了
      endSession();
      return;
    }
    updateCard();
  }

  // 一周完了時の処理（結果表示）
  function endSession() {
    // hide interactive UI
    card.style.display = "none";
    btnKnow.style.display = "none";
    btnDontKnow.style.display = "none";
    toggleSwitch.style.display = "none";
    progress.style.display = "none";

    const percent = totalCards === 0 ? 0 : Math.round((learnedCount / totalCards) * 100);

    // 「まだ」一覧を JP - EN 形式で表示
    let missedHTML = "";
    if (missedWords.length > 0) {
      // 表示は現在の isReversed 状態を考慮して決める
      const pairs = missedWords.map(item => {
        return isReversed ? `${item.back} - ${item.front}` : `${item.front} - ${item.back}`;
      });
      // カンマや句点の代わりに「、」で連結
      missedHTML = `<div class="missed-list">まだの単語：${pairs.join("、 ")}</div>`;
    } else {
      missedHTML = `<div class="missed-list">まだの単語：なし（全て覚えました）</div>`;
    }

    result.innerHTML = `
      <div class="complete">🎉 学習完了！</div>
      <div>${totalCards}枚中 ${learnedCount}枚覚えました。</div>
      <div>達成率：${percent}%</div>
      ${missedHTML}
      <div style="margin-top:12px;"><button id="btn-retry">再挑戦</button></div>
    `;
    result.style.display = "block";

    // 再挑戦ボタン：同じ cards 配列（並び）で最初から
    const retryBtn = document.getElementById("btn-retry");
    retryBtn.addEventListener("click", () => {
      cards = shuffleArray(data);
      currentIndex = 0;
      showBack = false;
      learnedCount = 0;
      missedWords = [];

      // show interactive UI again
      card.style.display = "";
      btnKnow.style.display = "";
      btnDontKnow.style.display = "";
      toggleSwitch.style.display = "";
      progress.style.display = "";
      result.style.display = "none";

      // re-enable buttons if disabled
      btnKnow.disabled = false;
      btnDontKnow.disabled = false;
      card.style.cursor = "pointer";

      updateCard();
    });
  }

  // ----- 初期表示 -----
  if (totalCards > 0) {
    updateCard();
  } else {
    cardContent.textContent = "カードがありません";
  }
}