/* ===============================
   flashcard.js（モジュール構成版）
   =============================== */
const FlashcardApp = (() => {

  // 内部状態
  let cards = [];
  let currentIndex = 0;
  let showFront = true;
  let containerId = "";

  /* ---------- CSV読み込み ---------- */
  async function loadCSV(url) {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((h, i) => (obj[h.trim()] = values[i].trim()));
      return obj;
    });
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

    const card = document.createElement("div");
    card.className = "card";

    const front = document.createElement("div");
    front.className = "front";
    const back = document.createElement("div");
    back.className = "back";

    card.appendChild(front);
    card.appendChild(back);
    container.appendChild(card);

    const controls = document.createElement("div");
    controls.className = "controls";
    controls.innerHTML = `
      <button id="prevBtn">←</button>
      <span id="counter"></span>
      <button id="nextBtn">→</button>
    `;
    container.appendChild(controls);

    document.getElementById("prevBtn").addEventListener("click", prevCard);
    document.getElementById("nextBtn").addEventListener("click", nextCard);

    updateCardView();
  }

  /* ---------- 表示更新 ---------- */
  function updateCardView() {
    const card = document.querySelector(`#${containerId} .card`);
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    const counter = document.getElementById("counter");

    if (!cards.length) return;

    front.textContent = cards[currentIndex].front || "";
    back.textContent = cards[currentIndex].back || "";
    counter.textContent = `${currentIndex + 1} / ${cards.length}`;

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
    showFront = !toggle.checked; // トグルOFF＝表、ON＝裏から表示
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

    const render = () => {
      const limited = limitCheckbox.checked ? getRandomSubset(data, 10) : data;
      createFlashcardApp(limited, "flashcard-app");
    };

    limitCheckbox.addEventListener("change", render);
    render();

    const toggle = document.getElementById("toggleSide");
    if (toggle) {
      toggle.addEventListener("change", e => toggleSide(e.target.checked));
    }
  }

  /* ---------- 公開API ---------- */
  return { init };

})();