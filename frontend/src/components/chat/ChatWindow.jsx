
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({
  conversation,
  messages = [],
  currentUserId,
  onSendMessage,
  onTyping,
  onStopTyping,
  onBack,
  isTyping = false,
  typingUserName = "",
  isSending = false,
}) => {
  if (!conversation) {
    return (
      <section className="hidden min-h-0 flex-1 flex-col items-center justify-center bg-[var(--bg-primary)] px-5 text-center md:flex">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-soft)]">
          <span className="text-3xl text-[var(--primary)]" aria-hidden="true">
            ✉
          </span>
        </div>

        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Welcome to ChatApp
        </h2>

        <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
          Select a conversation from your messages to start chatting.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label={`Chat with ${conversation.name || "user"}`}
      className="flex min-h-0 flex-1 flex-col bg-[var(--bg-primary)]"
    >
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
      />

      <TypingIndicator
        isTyping={isTyping}
        userName={typingUserName}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={isSending}
      />
    </section>
  );
};

export default ChatWindow;
