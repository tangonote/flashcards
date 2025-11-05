/* =======================================================
   flashcard.js – ver.2025-11-06
   モジュール構成・ヘッダーなしCSV対応・構造整理版
   ======================================================= */

const FlashcardApp = (() => {

  // 内部状態
  let cards = [];
  let currentIndex = 0;
  let showFront = true;
  let containerId = "";

  /* ---------- CSV読み込み ---------- */
  async function loadCSV(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const lines = text.trim().split("\n");

      // 空ファイル対策
      if (!lines.length) return [];

      const firstRow = lines[0].split(",");
      const hasHeader =
        firstRow[0].toLowerCase() === "front" ||
        firstRow[0].toLowerCase() === "表";

      if (hasHeader) {
        // ✅ ヘッダーありCSV
        const headers = firstRow;
        return lines.slice(1).map(line => {
          const values = line.split(",");
          const obj = {};
          headers.forEach((h, i) => (obj[h.trim()] = values[i]?.trim() ?? ""));
          return obj;
        });
      } else {
        // ✅ ヘッダーなしCSV（2列構成を想定）
        return lines.map(line => {
          const [front, back] = line.split(",");
          return { front: front?.trim() ?? "", back: back?.trim() ?? "" };
        });
      }
    } catch (e) {
      console.error("CSV読み込み失敗:", e);
      alert("CSVファイルの読み込みに失敗しました。");
      return [];
    }
  }

  /* ---------- ランダム抽出 ---------- */
  function getRandomSubset(array, count) {
    const shuffled = array.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /* ---------- カード生成 ---------- */
  function createFlashcardApp(data, containerIdArg) {
    cards = data;
    containerId = containerIdArg;
    currentIndex = 0;

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!cards.length) {
      container.textContent = "カードデータが読み込めませんでした。";
      return;
    }

    // --- カード本体 ---
    const card = document.createElement("div");
    card.className = "card";
    const front = document.createElement("div");
    front.className = "front";
    const back = document.createElement("div");
    back.className = "back";
    card.appendChild(front);
    card.appendChild(back);
    container.appendChild(card);

    // --- 操作ボタン ---
    const controls = document.createElement("div");
    controls.className = "controls";
    controls.innerHTML = `
      <button id="prevBtn">←</button>
      <span id="counter"></span>
      <button id="nextBtn">→</button>
    `;
    container.appendChild(controls);

    // --- イベント登録 ---
    document.getElementById("prevBtn").addEventListener("click", prevCard);
    document.getElementById("nextBtn").addEventListener("click", nextCard);

    // --- 初期表示 ---
    updateCardView();
  }

  /* ---------- 表示更新 ---------- */
  function updateCardView() {
    const card = document.querySelector(`#${containerId} .card`);
    if (!card || !cards.length) return;

    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    const counter = document.getElementById("counter");

    front.textContent = cards[currentIndex].front;
    back.textContent = cards[currentIndex].back;
    counter.textContent = `${currentIndex + 1} / ${cards.length}`;

    // 表裏制御
    card.classList.remove("show-back");
    if (!showFront) card.classList.add("show-back");
  }

  /* ---------- カード切替 ---------- */
  function nextCard() {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      resetSideByToggle();
      updateCardView();
    }
  }

  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
      resetSideByToggle();
      updateCardView();
    }
  }

  /* ---------- 表裏リセット ---------- */
  function resetSideByToggle() {
    const toggle = document.getElementById("toggleSide");
    showFront = !toggle?.checked; // トグルOFF＝表、ON＝裏
  }

  /* ---------- トグル操作 ---------- */
  function toggleSide(isBack) {
    showFront = !isBack;
    updateCardView();
  }

  /* ---------- アプリ初期化 ---------- */
  async function init(csvUrl) {
    const data = await loadCSV(csvUrl);

    const limitCheckbox = document.getElementById("limit10-checkbox");
    const toggle = document.getElementById("toggleSide");

    const render = () => {
      const limited = limitCheckbox?.checked
        ? getRandomSubset(data, 10)
        : data;
      createFlashcardApp(limited, "flashcard-app");
    };

    if (limitCheckbox) {
      limitCheckbox.addEventListener("change", render);
    }

    if (toggle) {
      toggle.addEventListener("change", e => toggleSide(e.target.checked));
    }

    render();
  }

  /* ---------- 公開API ---------- */
  return { init };

})();