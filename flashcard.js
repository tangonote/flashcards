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
    container.innerHTML = ""; // 既存内容クリア
  
    let currentIndex = 0;
    let showBack = false;
  
    const card = document.createElement("div");
    card.className = "card";
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    card.appendChild(cardContent);
    container.appendChild(card);
  
    const btnKnow = document.createElement("button");
    btnKnow.textContent = "覚えた";
    const btnDontKnow = document.createElement("button");
    btnDontKnow.textContent = "まだ";
    container.appendChild(btnKnow);
    container.appendChild(btnDontKnow);
  
    function updateCard() {
      if (data.length === 0) {
        cardContent.textContent = "カードがありません";
        return;
      }
      const current = data[currentIndex % data.length];
      cardContent.textContent = showBack ? current.back : current.front;
    }
  
    card.addEventListener("click", () => {
      showBack = !showBack;
      updateCard();
    });
  
    btnKnow.addEventListener("click", () => {
      currentIndex++;
      showBack = false;
      updateCard();
    });
  
    btnDontKnow.addEventListener("click", () => {
      currentIndex++;
      showBack = false;
      updateCard();
    });
  
    updateCard();
  }