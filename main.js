// LocalStorageからメモデータを取得するヘルパー関数
const getMemos = () => {
  const json_data = localStorage.getItem("memos");
  return json_data ? JSON.parse(json_data) : [];
};

// LocalStorageにメモデータを保存するヘルパー関数
const saveMemos = (data) => {
  localStorage.setItem("memos", JSON.stringify(data));
};

// ★★★ 新機能: テーマカラーをランダムに設定 ★★★
const setRandomThemeColor = () => {
  // 楽しさを出すための明るいテーマカラー
  const colors = [
    "#38d39f",
    "#FFD700",
    "#FF6F61",
    "#6A5ACD",
    "#4682B4",
    "#FF4500",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  // CSS変数 (--theme-color) にランダムカラーを適用
  document.documentElement.style.setProperty("--theme-color", randomColor);
};

// 画面にメモリストを表示する関数
const renderMemoList = () => {
  $("#list").empty();
  const data = getMemos();

  // 新しいものが上に来るように逆順でリストに追加
  for (let i = data.length - 1; i >= 0; i--) {
    const memoObject = data[i];

    // 完了状態に応じてクラスとボタンテキストを変更
    const completedClass = memoObject.completed ? "completed" : "";

    // data-original-index には、配列内の元のインデックスを格納
    const html = `
            <li data-original-index="${i}" class="${completedClass}">
                <div class="memo-content">
                    <span class="memo-text">${memoObject.text}</span>
                    <span class="memo-date">${memoObject.date}</span>
                </div>
                <div class="actions">
                    <button class="complete-btn">${
                      memoObject.completed ? "↩️ 戻す" : "✅ 完了"
                    }</button>
                    <button class="delete-btn">🗑️ 削除</button>
                </div>
            </li>
        `;
    $("#list").prepend(html); // 新しいメモを先頭に追加
  }
};

// イベント処理

// 1. 保存処理
$("#save").on("click", function () {
  const text = $("#text_area").val();

  if (!text.trim()) {
    alert("タスクを入力してください！");
    return;
  }

  const now = new Date();
  const formattedDate =
    now.toLocaleDateString("ja-JP") +
    " " +
    now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const data = getMemos();

  // メモをオブジェクト形式で配列に追加 (completed: false を追加)
  const newMemoObject = {
    text: text,
    date: formattedDate,
    completed: false,
  };
  data.push(newMemoObject);

  saveMemos(data);
  alert("新しいタスクを追加しました！🎉");

  $("#text_area").val("");
  renderMemoList();
});

// 2. 全クリア処理 (変更なし)
$("#clear").on("click", function () {
  if (confirm("全てのタスクを削除しますか？")) {
    saveMemos([]);
    alert("全てのタスクを削除しました！😭");
    $("#text_area").val("");
    renderMemoList();
  }
});

// ★★★ 新機能: 完了済みメモの一括削除 ★★★
$("#clear-completed").on("click", function () {
  const data = getMemos();
  // 完了していないメモだけをフィルタリングして残す
  const remainingMemos = data.filter((memo) => !memo.completed);

  if (data.length === remainingMemos.length) {
    alert("完了済みのタスクはありません！");
    return;
  }

  if (confirm("完了済みのタスクを全て削除しますか？")) {
    saveMemos(remainingMemos);
    alert("完了済みのタスクを削除しました！🧹達成感が得られましたね！");
    renderMemoList();
  }
});

// 3. メモの個別削除処理
$(document).on("click", ".delete-btn", function (e) {
  const li_element = $(this).closest("li");
  const original_index = li_element.data("original-index");

  if (confirm("このタスクを削除しますか？")) {
    const data = getMemos();
    data.splice(original_index, 1);

    saveMemos(data);
    renderMemoList();
  }
  e.stopPropagation();
});

// ★★★ 新機能: 完了/未完了の切り替え処理 ★★★
$(document).on("click", ".complete-btn", function (e) {
  const li_element = $(this).closest("li");
  const original_index = li_element.data("original-index");

  const data = getMemos();
  // completed状態を反転
  data[original_index].completed = !data[original_index].completed;

  saveMemos(data);
  alert(
    data[original_index].completed
      ? "✅ タスク完了おめでとうございます！"
      : "タスクを未完了に戻しました。"
  );

  renderMemoList(); // リストを再描画して視覚的に更新
  e.stopPropagation();
});

// 4. メモの編集開始処理 (メモのli要素がクリックされたとき)
$(document).on("click", "#list li", function () {
  const li_element = $(this);
  const original_index = li_element.data("original-index");

  const data = getMemos();
  const memoToEdit = data[original_index].text;

  if (memoToEdit) {
    // 1. メモの内容をテキストエリアに戻す
    $("#text_area").val(memoToEdit);

    // 2. 配列から古いメモを削除
    data.splice(original_index, 1);

    // 3. 削除後の配列をLocalStorageに保存
    saveMemos(data);

    alert(
      "編集モードにしました。修正後、[🚀 追加！]を押して保存してください。"
    );

    // 4. リストを更新
    renderMemoList();
  }
});

// 5. 起動時の処理
$(document).ready(function () {
  setRandomThemeColor(); // ★★★ テーマカラー設定を最初に行う ★★★
  renderMemoList();
});
