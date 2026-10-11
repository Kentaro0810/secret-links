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
const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearchButton");
const viewButtons = document.querySelectorAll(".view-button");
const recentSection = document.getElementById("recentSection");
const recentGrid = document.getElementById("recentGrid");
const clearRecentButton = document.getElementById("clearRecentButton");
const loginButton = loginForm.querySelector('button[type="submit"]');

const LOGIN_STORAGE_KEY = "secret-links-login";
const FAVORITES_KEY = "secret-links-favorites-v1";
const RECENT_KEY = "secret-links-recent-v1";
const RECENT_LIMIT = 6;
const LOGIN_ATTEMPTS_KEY = "secret-links-login-attempts-v2";
const PBKDF2_ITERATIONS = 310000;
const PASSWORD_SALT_HEX = "21a4f641fbab47c8caeae1fce18e97da";
const PASSWORD_DERIVED_KEY_HEX = "11c006cfdb263cb29056c85f02e0984eee647a4b31efa9db7364436fa239370e";
const MAX_ATTEMPTS_BEFORE_DELAY = 5;
const MAX_LOCK_MS = 5 * 60 * 1000;
let currentCategory = "all";
let currentView = "all";
let searchQuery = "";
let favorites = readStringArray(FAVORITES_KEY);
let recentTools = readStringArray(RECENT_KEY);

// パスワード自体は保存せず、PBKDF2-SHA-256で導出した値だけを照合します。

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
  },
  {
    id: "study-time-tracker",
    name: "学習時間記録",
    description: "教科別の学習時間を記録し、今日・今週・今月の合計を確認できます",
    category: "study",
    icon: "📊",
    url: "https://kentaro0810.github.io/study-time-tracker/",
    version: "1.0.0"
  },
  {
    id: "packing-checklist",
    name: "持ち物チェックリスト",
    description: "旅行・学校・部活動などの持ち物を用途別に整理して確認できます",
    category: "management",
    icon: "🎒",
    url: "https://kentaro0810.github.io/packing-checklist/",
    version: "1.0.0"
  },
  {
    id: "seat-change",
    name: "席替えツール",
    description: "前列指定・座席固定・隣接条件・タップ入れ替えに対応し、完成した座席表をPNG画像で保存できます",
    category: "study",
    icon: "🪑",
    url: "https://kentaro0810.github.io/seat-change-tool/",
    version: "1.5.0"
  }
];

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((value) => Number.parseInt(value, 16)));
}
async function derivePasswordKey(password) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: hexToBytes(PASSWORD_SALT_HEX), iterations: PBKDF2_ITERATIONS }, material, 256);
  return new Uint8Array(bits);
}
function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
function readLoginAttempts() {
  try {
    const value = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY));
    return { count: Number.isInteger(value?.count) ? Math.max(0, value.count) : 0, lockedUntil: Number.isFinite(value?.lockedUntil) ? Math.max(0, value.lockedUntil) : 0 };
  } catch { return { count: 0, lockedUntil: 0 }; }
}
function remainingLockSeconds() { return Math.max(0, Math.ceil((readLoginAttempts().lockedUntil - Date.now()) / 1000)); }
function registerFailedAttempt() {
  const count = readLoginAttempts().count + 1;
  const level = Math.max(0, count - MAX_ATTEMPTS_BEFORE_DELAY);
  const delayMs = level === 0 ? 0 : Math.min(MAX_LOCK_MS, 5000 * (2 ** (level - 1)));
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count, lockedUntil: Date.now() + delayMs }));
  return delayMs;
}
function setLoginBusy(isBusy) {
  passwordInput.disabled = isBusy;
  loginButton.disabled = isBusy;
  loginButton.textContent = isBusy ? "確認中…" : "入る";
}

function readStringArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function savePortalState() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  localStorage.setItem(RECENT_KEY, JSON.stringify(recentTools));
}

function isFavorite(id) {
  return favorites.includes(id);
}

function toggleFavorite(id) {
  favorites = isFavorite(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  savePortalState();
  applyFilters();
}

function recordRecent(id) {
  recentTools = [id, ...recentTools.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
  savePortalState();
  renderRecent();
}

function createToolCard(tool) {
  const card = document.createElement("article");
  card.className = "link-card";

  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = `favorite-button${isFavorite(tool.id) ? " active" : ""}`;
  favorite.textContent = isFavorite(tool.id) ? "★" : "☆";
  favorite.setAttribute("aria-label", `${tool.name}をお気に入り${isFavorite(tool.id) ? "から外す" : "に追加"}`);
  favorite.addEventListener("click", () => toggleFavorite(tool.id));

  const link = document.createElement("a");
  link.className = "card-main-link";
  link.href = tool.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${tool.name}を新しいタブで開く`);
  link.addEventListener("click", () => recordRecent(tool.id));

  const icon = document.createElement("span");
  icon.className = "icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = tool.icon;
  const title = document.createElement("h2");
  title.textContent = tool.name;
  const description = document.createElement("p");
  description.textContent = tool.description;
  link.append(icon, title, description);
  card.append(favorite, link);
  return card;
}

function renderTools(toolList) {
  const fragment = document.createDocumentFragment();
  toolList.forEach((tool) => fragment.appendChild(createToolCard(tool)));
  linkGrid.replaceChildren(fragment);
  resultCount.textContent = `${toolList.length}件のツールを表示中`;
  emptyMessage.classList.toggle("hidden", toolList.length !== 0);
}

function renderRecent() {
  const recent = recentTools.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  recentSection.classList.toggle("hidden", recent.length === 0 || currentView === "recent");
  recentGrid.replaceChildren(...recent.map((tool) => {
    const link = document.createElement("a");
    link.className = "quick-link";
    link.href = tool.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.addEventListener("click", () => recordRecent(tool.id));
    const icon = document.createElement("span"); icon.textContent = tool.icon;
    const name = document.createElement("strong"); name.textContent = tool.name;
    link.append(icon, name);
    return link;
  }));
}

function applyFilters() {
  const normalized = searchQuery.trim().toLowerCase();
  let filtered = tools.filter((tool) => currentCategory === "all" || tool.category === currentCategory);
  if (currentView === "favorites") filtered = filtered.filter((tool) => isFavorite(tool.id));
  if (currentView === "recent") filtered = recentTools.map((id) => filtered.find((tool) => tool.id === id)).filter(Boolean);
  if (normalized) filtered = filtered.filter((tool) => `${tool.name} ${tool.description}`.toLowerCase().includes(normalized));
  renderTools(filtered);
  renderRecent();
}

function selectCategory(category) {
  currentCategory = category;
  filterButtons.forEach((button) => {
    const selected = button.dataset.category === category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  applyFilters();
}

function selectView(view) {
  currentView = view;
  viewButtons.forEach((button) => {
    const selected = button.dataset.view === view;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  applyFilters();
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
  const lockSeconds = remainingLockSeconds();
  if (lockSeconds > 0) {
    showMessage(`試行回数が多いため、あと${lockSeconds}秒待ってください。`);
    return;
  }
  const inputPassword = passwordInput.value;
  if (!inputPassword) { showMessage("パスワードを入力してください。"); return; }
  setLoginBusy(true);
  try {
    const inputKey = await derivePasswordKey(inputPassword);
    if (constantTimeEqual(inputKey, hexToBytes(PASSWORD_DERIVED_KEY_HEX))) {
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      sessionStorage.setItem(LOGIN_STORAGE_KEY, "true");
      passwordInput.value = "";
      showMessage("");
      showLinksScreen();
    } else {
      const delayMs = registerFailedAttempt();
      const suffix = delayMs > 0 ? ` ${Math.ceil(delayMs / 1000)}秒後に再試行できます。` : "";
      showMessage(`パスワードが違います。${suffix}`);
      passwordInput.value = "";
      passwordInput.focus();
    }
  } catch (error) {
    console.error("Password verification failed:", error);
    showMessage("確認処理に失敗しました。ページを再読み込みしてください。");
  } finally { setLoginBusy(false); }
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
filterButtons.forEach((button) => button.addEventListener("click", () => selectCategory(button.dataset.category)));
viewButtons.forEach((button) => button.addEventListener("click", () => selectView(button.dataset.view)));
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  clearSearchButton.classList.toggle("hidden", !searchQuery);
  applyFilters();
});
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  clearSearchButton.classList.add("hidden");
  searchInput.focus();
  applyFilters();
});
clearRecentButton.addEventListener("click", () => {
  recentTools = [];
  savePortalState();
  applyFilters();
});

applyFilters();
checkLoginStatus();
