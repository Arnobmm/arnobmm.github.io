// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, remove } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Chat elements
const chatContainer = document.getElementById("chat-container");
const messageBox = document.getElementById("message-box");
const sendButton = document.getElementById("send-button");
const clearButton = document.getElementById("clear-button");
const openChatboxButton = document.getElementById("open-chatbox");

// Show chatbox when button is clicked
openChatboxButton.addEventListener("click", function() {
    chatContainer.classList.remove("hidden");
});

// Send message
sendButton.addEventListener("click", function() {
    const message = messageBox.value.trim();
    if (message !== "") {
        push(ref(db, 'messages'), { text: message });
        messageBox.value = "";
    }
});

// Receive messages
onChildAdded(ref(db, 'messages'), (snapshot) => {
    const msg = snapshot.val();
    const msgDiv = document.createElement("div");
    msgDiv.innerText = msg.text;
    document.getElementById("chat-messages").appendChild(msgDiv);
});

// Clear chat
clearButton.addEventListener("click", function() {
    remove(ref(db, 'messages'));
    document.getElementById("chat-messages").innerHTML = "";
});
