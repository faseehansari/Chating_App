
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

const MessageInput = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      onStopTyping?.();
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setMessage(value);

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled) return;

    stopTyping();
    onSendMessage?.(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      stopTyping();
    }
  }, [disabled]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-end gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-3 sm:gap-3 sm:p-4"
    >
      <textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={stopTyping}
        placeholder="Type a message..."
        aria-label="Type a message"
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--border-focus)] disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] transition-colors hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={19} />
      </button>
    </form>
  );
};

export default MessageInput;
