let username = "";
const auth = firebase.auth();
const db = firebase.firestore();
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");

auth.onAuthStateChanged(user => {
  if (user) {
    const usernameInput = document.getElementById("username");
    if (localStorage.getItem("username")) {
      username = localStorage.getItem("username");
    } else if (usernameInput && usernameInput.value.trim()) {
      username = usernameInput.value.trim();
      localStorage.setItem("username", username);
    } else {
      alert("Silakan masukkan nama samaran!");
      auth.signOut();
      return;
    }

    document.getElementById("user-display").textContent = username;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    loadMessages();
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("chat-section").style.display = "none";
  }
});

document.getElementById("login-btn").onclick = () => {
  const usernameInput = document.getElementById("username").value.trim();
  if (!usernameInput) {
    alert("Masukkan nama samaran!");
    return;
  }
  username = usernameInput;
  localStorage.setItem("username", username);
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

document.getElementById("logout-btn").onclick = () => {
  auth.signOut();
  localStorage.removeItem("username");
};

document.getElementById("send-btn").onclick = sendMessage;
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  db.collection("messages").add({
    username: username,
    text: msg,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    uid: auth.currentUser.uid
  });
  messageInput.value = "";
}

function loadMessages() {
  db.collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const isOwn = data.uid === auth.currentUser.uid;

        const messageEl = document.createElement("div");
        messageEl.classList.add("message");
        messageEl.classList.add(isOwn ? "own" : "other");
        messageEl.innerHTML = `<strong>${data.username}</strong><div>${data.text}</div>`;
        chatBox.appendChild(messageEl);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}
