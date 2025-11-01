// =======================================
// Flashcard App – Stable Version (2025-11-01)
// =======================================

// ---------------------------------------
// CSV読み込み（UTF-8想定）
// ---------------------------------------
async function loadCSV(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // UTF-8チェック
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onload = function (e) {
        const text = e.target.result;

        // CSV形式に整形
        const lines = text.trim().split("\n");
        const result = lines.map(line => {
          const [front, back] = line.split(",");
          return { front: front?.trim() ?? "", back: back?.trim() ?? "" };
        });
        resolve(result);
      };

      reader.onerror = function () {
        reject("CSVファイルの読み込みに失敗しました。");
      };

      reader.readAsText(blob, "utf-8");
    });
  } catch (err) {
    console.error("loadCSV エラー:", err);
    alert("❌ CSVファイルの読み込みに失敗しました。UTF-8形式か確認してください。");
    return [];
  }
}

// ---------------------------------------
// カード配列をランダムに並び替える
// ---------------------------------------
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------
// メイン：Flashcardアプリ生成
// ---------------------------------------
function createFlashcardApp(data, targetId = "flashcard-app") {
  const container = document.getElementById(targetId);
  if (!container) {
    console.error("❌ 指定された要素が見つかりません:", targetId);
    return;
  }

  container.innerHTML = "";

  // カードをシャッフルして準備
  const cards = shuffleArray(data);
  const totalCards = cards.length;
  if
