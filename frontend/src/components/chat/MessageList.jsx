
import { useEffect, useRef } from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageList = ({ messages = [], currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const formatTime = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);

    if (Number.isNaN(messageDate.getTime())) return "";

    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderId = (sender) => {
    if (!sender) return "";

    if (typeof sender === "object") {
      return String(sender._id || sender.id || "");
    }

    return String(sender);
  };

  const getMessageStatus = (status) => {
    if (status === "read") return "read";
    if (status === "delivered") return "delivered";
    return "sent";
  };

  return (
    <div
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--bg-primary)] px-3 py-5 sm:px-5"
    >
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="rounded-xl bg-[var(--surface)] px-4 py-3 text-center text-sm text-[var(--text-secondary)]">
            No messages yet. Say hello!
          </p>
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-3">
          {messages.map((message) => {
            const isSent =
              getSenderId(message.sender) === String(currentUserId || "");

            const status = getMessageStatus(message.status);
            const messageId = message._id || message.id;

            return (
              <div
                key={messageId}
                className={`flex ${
                  isSent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[70%] ${
                    isSent
                      ? "rounded-br-sm bg-[var(--chat-sent)] text-[var(--chat-sent-text)]"
                      : "rounded-bl-sm bg-[var(--chat-received)] text-[var(--chat-received-text)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.content}
                  </p>

                  <div className="mt-1 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatTime(message.createdAt)}
                    </span>

                    {isSent && (
                      <>
                        {status === "sent" && (
                          <Check
                            size={13}
                            aria-label="Sent"
                            className="text-[var(--text-muted)]"
                          />
                        )}

                        {status === "delivered" && (
                          <CheckCheck
                            size={14}
                            aria-label="Delivered"
                            className="text-[var(--text-muted)]"
                          />
                        )}

                        {status === "read" && (
                          <CheckCheck
                            size={14}
                            aria-label="Read"
                            className="text-[var(--info)]"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
