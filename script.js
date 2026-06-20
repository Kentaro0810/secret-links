const loginScreen = document.getElementById("loginScreen");
const linksScreen = document.getElementById("linksScreen");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");

const LOGIN_STORAGE_KEY = "secret-links-login";

// パスワード: YAJU0810
// パスワードそのものではなく、SHA-256ハッシュを比較します。
const PASSWORD_HASH = "1471dd23b36096ee8f815f65e9ccba81276a5decfa8fe7bb54741cc5c938900e";

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

  if (type === "success") {
    loginMessage.style.color = "#15803d";
  } else {
    loginMessage.style.color = "#dc2626";
  }
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
}

function checkLoginStatus() {
  const isLoggedIn = sessionStorage.getItem(LOGIN_STORAGE_KEY) === "true";

  if (isLoggedIn) {
    showLinksScreen();
  } else {
    showLoginScreen();
  }
}

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", logout);

checkLoginStatus();
