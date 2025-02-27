// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, remove } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAj6sOsUbRDSBBN5HGxqTbGdV29-W-Rp3w",
    authDomain: "arnobmmgg.firebaseapp.com",
    databaseURL: "https://arnobmmgg-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "arnobmmgg",
    storageBucket: "arnobmmgg.firebasestorage.app",
    messagingSenderId: "494369018984",
    appId: "1:494369018984:web:b2957877260ae5d1f2d7dd",
    measurementId: "G-XKKS7WN42G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Select chat container, message input field, and buttons
const chatContainer = document.getElementById("chat-container");
const messageBox = document.getElementById("message-box");
const sendButton = document.getElementById("send-button");
const clearButton = document.getElementById("clear-button");
const backButton = document.getElementById("back-button");
const messagesContainer = document.getElementById("messages");
const chatButton = document.getElementById("chat-button");
const content = document.getElementById("content");

// Switch to chat view
chatButton.addEventListener("click", function() {
    content.style.display = "none";  // Hide normal content
    chatContainer.style.display = "block";  // Show chat
});

// Switch back to the website
backButton.addEventListener("click", function() {
    content.style.display = "block";  // Show normal content
    chatContainer.style.display = "none";  // Hide chat
});

// Send message function
function sendMessage() {
    const message = messageBox.value.trim(); // Get message and trim spaces

    // Only send the message if it's not empty
    if (message !== "") {
        // Push the message to Firebase
        push(ref(db, 'messages'), { text: message });

        // Clear the message input field after sending
        messageBox.value = "";
    }
}

// Receive messages function
onChildAdded(ref(db, 'messages'), (snapshot) => {
    const msg = snapshot.val();
    const msgDiv = document.createElement("div");
    msgDiv.style.padding = "5px";
    msgDiv.style.background = "#d1ecf1";
    msgDiv.style.marginBottom = "5px";
    msgDiv.style.borderRadius = "5px";
    msgDiv.innerText = msg.text;

    // Append the message to the chat container
    messagesContainer.appendChild(msgDiv);

    // Scroll to the bottom of the chat container
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Event listener for the Send button
sendButton.addEventListener("click", function() {
    sendMessage();
});

// Event listener for Enter key in input box
messageBox.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent the Enter key from causing other behaviors (e.g., form submit)
        sendMessage();
    }
});

// Event listener for the Clear button
clearButton.addEventListener("click", function() {
    // Remove all messages from Firebase
    const messagesRef = ref(db, 'messages');
    remove(messagesRef);

    // Clear the chat container in the UI
    messagesContainer.innerHTML = "";
});
