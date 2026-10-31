
import { io } from "socket.io-client";
import readline from "readline";

const token = process.argv[2];
const conversationId = process.argv[3];

if (!token || !conversationId) {
  console.log(
    "Usage: node test-chat.js YOUR_JWT_TOKEN CONVERSATION_ID"
  );
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connect", () => {
  console.log("\nSocket connected:", socket.id);
  console.log("Type a message and press Enter to send.\n");
});

socket.on("connect_error", (error) => {
  console.log("Connection Error:", error.message);
});

socket.on("new_message", (message) => {
  console.log("\n\nNEW MESSAGE RECEIVED");
  console.log("Sender:", message.sender?.username);
  console.log("Message:", message.content);
  console.log("Status:", message.status);
  rl.prompt();
});

socket.on("message_sent", (message) => {
  console.log("\nMESSAGE SENT");
  console.log("Message:", message.content);
  console.log("Status:", message.status);
  rl.prompt();
});

rl.on("line", (content) => {
  if (!content.trim()) {
    rl.prompt();
    return;
  }

  socket.emit(
    "send_message",
    {
      conversationId,
      content,
    },
    (response) => {
      console.log("\nSERVER RESPONSE:", response);
      rl.prompt();
    }
  );
});

socket.on("disconnect", (reason) => {
  console.log("\nSocket disconnected:", reason);
  rl.close();
});

rl.on("close", () => {
  socket.disconnect();
  process.exit(0);
});
