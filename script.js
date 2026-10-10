const loginScreen = document.getElementById("loginScreen");
const linksScreen = document.getElementById("linksScreen");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const linkGrid = document.getElementById("linkGrid");
const resultCount = document.getElementById("resultCount");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-button");

const LOGIN_STORAGE_KEY = "secret-links-login";

// 簡易ロック用のSHA-256ハッシュです。秘密情報の保護には使用できません。
const PASSWORD_HASH = "1471dd23b36096ee8f815f65e9ccba81276a5decfa8fe7bb54741cc5c938900e";

const tools = [
  {
    id: "timer",
    name: "自分用タイマー",
    description: "勉強・作業・休憩に使えるシンプルタイマー",
    category: "management",
    icon: "⏱️",
    url: "https://kentaro0810.github.io/timer-app/",
    version: "1.0.0"
  },
  {
    id: "memo",
    name: "自分用メモ帳",
    description: "思いついたことをすぐ保存できます",
    category: "study",
    icon: "📘",
    url: "https://kentaro0810.github.io/memo-app/",
    version: "1.0.0"
  },
  {
    id: "todo",
    name: "自分用ToDo管理サイト",
    description: "やることを登録して管理できます",
    category: "management",
    icon: "🎮",
    url: "https://kentaro0810.github.io/todo-site/",
    version: "1.0.0"
  },
  {
    id: "roulette",
    name: "ルーレット抽選アプリ",
    description: "登録した候補からルーレットで抽選できます",
    category: "selection",
    icon: "⭐️",
    url: "https://kentaro0810.github.io/roulette-picker/",
    version: "1.0.0"
  },
  {
    id: "password-generator",
    name: "パスワード自動生成ツール",
    description: "安全な乱数を使ってランダムなパスワードを生成します",
    category: "development",
    icon: "🛠️",
    url: "https://kentaro0810.github.io/password-generator/",
    version: "1.0.0"
  },
  {
    id: "bulk-url-opener",
    name: "一括URLオープンツール",
    description: "複数のURLをまとめて新しいタブで開けます",
    category: "development",
    icon: "📁",
    url: "https://kentaro0810.github.io/bulk-url-opener/",
    version: "1.0.0"
  },
  {
    id: "color-palette",
    name: "カラーパレット作成ツール",
    description: "色を生成して気に入った配色を保存できます",
    category: "design",
    icon: "🎨",
    url: "https://kentaro0810.github.io/color-palette-maker/",
    version: "1.0.0"
  },
  {
    id: "character-counter",
    name: "文字数カウンター",
    description: "文字数・行数・段落数・原稿用紙換算・読了時間を確認できます",
    category: "study",
    icon: "🔢",
    url: "https://kentaro0810.github.io/character-counter/",
    version: "1.0.0"
  },
  {
    id: "reaction-test",
    name: "反射神経テスト",
    description: "画面が緑色に変わった瞬間にタップして反応時間を測定します",
    category: "game",
    icon: "⚡",
    url: "https://kentaro0810.github.io/reaction-test/",
    version: "1.0.0"
  },
  {
    id: "habit-tracker",
    name: "習慣トラッカー",
    description: "毎日の習慣を記録し、達成率と連続達成日数を確認できます",
    category: "management",
    icon: "🌱",
    url: "https://kentaro0810.github.io/habit-tracker/",
    version: "1.0.0"
  },
  {
    id: "countdown-manager",
    name: "カウントダウン管理",
    description: "予定日時までの残り日数と時間をリアルタイムで確認できます",
    category: "management",
    icon: "📅",
    url: "https://kentaro0810.github.io/countdown-manager/",
    version: "1.0.0"
  },
  {
    id: "flashcard-app",
    name: "暗記カード",
    description: "問題と答えを登録し、ランダム出題や苦手カードの復習ができます",
    category: "study",
    icon: "📚",
    url: "https://kentaro0810.github.io/flashcard-app/",
    version: "1.0.0"
  }
];

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createToolCard(tool) {
  const card = document.createElement("a");
  card.className = "link-card";
  card.href = tool.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.dataset.toolId = tool.id;
  card.dataset.category = tool.category;
  card.setAttribute("aria-label", `${tool.name}を新しいタブで開く`);

  const icon = document.createElement("span");
  icon.className = "icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = tool.icon;

  const title = document.createElement("h2");
  title.textContent = tool.name;

  const description = document.createElement("p");
  description.textContent = tool.description;

  card.append(icon, title, description);
  return card;
}

function renderTools(toolList) {
  const fragment = document.createDocumentFragment();
  toolList.forEach((tool) => fragment.appendChild(createToolCard(tool)));
  linkGrid.replaceChildren(fragment);

  resultCount.textContent = `${toolList.length}件のツールを表示中`;
  emptyMessage.classList.toggle("hidden", toolList.length !== 0);
}

function selectCategory(category) {
  const filteredTools = category === "all"
    ? tools
    : tools.filter((tool) => tool.category === category);

  filterButtons.forEach((button) => {
    const selected = button.dataset.category === category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  renderTools(filteredTools);
}

function showLinksScreen() {
  loginScreen.classList.add("hidden");
  linksScreen.classList.remove("hidden");
}

function showLoginScreen() {
  linksScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
}

function showMessage(text, type = "error") {
  loginMessage.textContent = text;
  loginMessage.style.color = type === "success" ? "#15803d" : "#dc2626";
}

async function handleLogin(event) {
  event.preventDefault();
  const inputPassword = passwordInput.value;

  if (!inputPassword) {
    showMessage("パスワードを入力してください。");
    return;
  }

  const inputHash = await sha256(inputPassword);

  if (inputHash === PASSWORD_HASH) {
    sessionStorage.setItem(LOGIN_STORAGE_KEY, "true");
    passwordInput.value = "";
    showMessage("");
    showLinksScreen();
  } else {
    showMessage("パスワードが違います。");
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function logout() {
  sessionStorage.removeItem(LOGIN_STORAGE_KEY);
  showLoginScreen();
  showMessage("");
  passwordInput.focus();
}

function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem(LOGIN_STORAGE_KEY) === "true";
  isLoggedIn ? showLinksScreen() : showLoginScreen();
}

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", logout);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => selectCategory(button.dataset.category));
});

renderTools(tools);
checkLoginStatus();
