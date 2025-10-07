// flashcard.js v20251007b
// 機能追加：カードの順番を毎回シャッフルする

async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text.trim().split("\n").map(line => {
    const [front, back] = line.split(",");
    return { front: front.trim(), back: back.trim() };
  });
}

// ▼ 配列シャッフル関数（Fisher–Yates）
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFlashcardApp(data, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  // ▼ 毎回ランダム順に並べ替える
  let cards = shuffleArray(data);

  let currentIndex = 0;
  let correct = [];
  let incorrect = [];
  let isFlipped = false;
  let reversed = false;

  // ▼ 表裏切り替えスイッチ
  const switchWrapper = document.createElement("div");
  switchWrapper.className = "switch-wrapper";
  const switchLabel = document.createElement("label");
  switchLabel.className = "switch-label";
  switchLabel.textContent = "表と裏を入れ替える";
  const switchInput = document.createElement("input");
  switchInput.type = "checkbox";
  switchInput.addEventListener("change", () => {
    reversed = switchInput.checked;
    showCard();
  });
  switchWrapper.appendChild(switchInput);
  switchWrapper.appendChild(switchLabel);
  container.appendChild(switchWrapper);

  // ▼ カード表示エリア
  const card = document.createElement("div");
  card.className = "card";
  card.addEventListener("click", () => {
    isFlipped = !isFlipped;
    showCard();
  });
  container.appendChild(card);

  // ▼ ボタン群
  const buttonArea = document.createElement("div");
  buttonArea.className = "button-area";
  const correctBtn = document.createElement("button");
  correctBtn.textContent = "できた";
  const wrongBtn = document.createElement("button");
  wrongBtn.textContent = "まだ";
  buttonArea.append(correctBtn, wrongBtn);
  container.appendChild(buttonArea);

  // ▼ 結果表示
  const resultArea = document.createElement("div");
  resultArea.className = "result-area";
  container.appendChild(resultArea);

  correctBtn.addEventListener("click", () => {
    correct.push(cards[currentIndex]);
    nextCard();
  });

  wrongBtn.addEventListener("click", () => {
    incorrect.push(cards[currentIndex]);
    nextCard();
  });

  function showCard() {
    const item = cards[currentIndex];
    if (!item) return;
    const front = reversed ? item.back : item.front;
    const back = reversed ? item.front : item.back;
    card.textContent = isFlipped ? back : front;
    card.classList.toggle("flipped", isFlipped);
  }

  function nextCard() {
    isFlipped = false;
    currentIndex++;
    if (currentIndex < cards.length) {
      showCard();
    } else {
      showResult();
    }
  }

  function showResult() {
    card.style.display = "none";
    buttonArea.style.display = "none";
    switchWrapper.style.display = "none";

    let resultHTML = `<h3>結果</h3>`;
    resultHTML += `<p>${correct.length} / ${cards.length} 正解</p>`;

    if (incorrect.length > 0) {
      resultHTML += `<h4>まだの単語</h4><ul>`;
      incorrect.forEach(item => {
        const a = reversed ? `${item.back} - ${item.front}` : `${item.front} - ${item.back}`;
        resultHTML += `<li>${a}</li>`;
      });
      resultHTML += `</ul>`;
    }

    // ▼ 再挑戦ボタン（シャッフルを含む）
    resultHTML += `<button class="retry-btn" id="retry-btn">再挑戦</button>`;
    resultArea.innerHTML = resultHTML;

    document.getElementById("retry-btn").addEventListener("click", () => {
      cards = shuffleArray(data); // ← ここで毎回新しくランダムに
      currentIndex = 0;
      correct = [];
      incorrect = [];
      card.style.display = "";
      buttonArea.style.display = "";
      switchWrapper.style.display = "";
      resultArea.innerHTML = "";
      isFlipped = false;
      showCard();
    });
  }

  // 初期カード表示
  showCard();
}