
const TypingIndicator = ({ isTyping = false, userName = "" }) => {
  if (!isTyping) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex shrink-0 items-center gap-2 px-4 py-3"
    >
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[var(--chat-received)] px-4 py-3 shadow-sm"
        aria-hidden="true"
      >
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" />
      </div>

      <p className="text-xs text-[var(--text-secondary)]">
        {userName ? `${userName} is typing...` : "Typing..."}
      </p>
    </div>
  );
};

export default TypingIndicator;
