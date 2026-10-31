
import { io } from "socket.io-client";
import readline from "readline";

const token = process.argv[2];
const conversationId = process.argv[3];

if (!token || !conversationId) {
  console.log("Usage: node test-chat.js YOUR_TOKEN CONVERSATION_ID");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: { token },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("> ");

socket.on("connect", () => {
  console.log("\nSocket connected:", socket.id);
  console.log("\nCommands:");
  console.log("Type a message to send");
  console.log("/read - Mark messages as read");
  console.log("/exit - Disconnect\n");
  rl.prompt();
});

socket.on("connect_error", (error) => {
  console.log("Connection Error:", error.message);
});

socket.on("new_message", (message) => {
  console.log("\nNEW MESSAGE RECEIVED");
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

socket.on("message_status_update", (data) => {
  console.log("\nMESSAGE STATUS UPDATED");
  console.log("Message ID:", data.messageId);
  console.log("Status:", data.status);
  console.log("Read At:", data.readAt || "Not read yet");
  rl.prompt();
});

rl.on("line", (input) => {
  const content = input.trim();

  if (!content) {
    rl.prompt();
    return;
  }

  if (content === "/exit") {
    rl.close();
    return;
  }

  if (content === "/read") {
    console.log("\nMarking messages as read...");

    socket.emit(
      "mark_messages_read",
      { conversationId },
      (response) => {
        console.log("\nREAD RESPONSE:");
        console.log(response);
        rl.prompt();
      }
    );

    return;
  }

  socket.emit(
    "send_message",
    { conversationId, content },
    (response) => {
      console.log("\nSERVER RESPONSE:");
      console.log(response);
      rl.prompt();
    }
  );
});

socket.on("disconnect", (reason) => {
  console.log("\nSocket disconnected:", reason);
});

rl.on("close", () => {
  socket.disconnect();
  process.exit(0);
});
