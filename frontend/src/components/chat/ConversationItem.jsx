
import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";

const ConversationItem = ({
  conversation = {},
  isSelected = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  const {
    name = "Unknown User",
    avatar,
    lastMessage,
    lastMessageAt,
    unreadCount = 0,
    isOnline = false,
    lastMessageStatus,
  } = conversation;

  const formatTime = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);

    if (Number.isNaN(messageDate.getTime())) return "";

    const now = new Date();
    const isToday =
      messageDate.toDateString() === now.toDateString();

    return isToday
      ? messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : messageDate.toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
  };

  const showAvatar = avatar && !imageError;
  const safeUnreadCount = Math.max(0, Number(unreadCount) || 0);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-4 text-left transition-colors ${
        isSelected
          ? "bg-[var(--primary-soft)]"
          : "hover:bg-[var(--surface-hover)]"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {showAvatar ? (
          <img
            src={avatar}
            alt={name}
            onError={() => setImageError(true)}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] text-base font-semibold text-[var(--primary)]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <span
          aria-label={isOnline ? "Online" : "Offline"}
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
            isOnline
              ? "bg-[var(--online)]"
              : "bg-[var(--offline)]"
          }`}
        />
      </div>

      {/* Conversation Details */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {name}
          </h3>

          <span className="shrink-0 text-xs text-[var(--text-muted)]">
            {formatTime(lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {lastMessageStatus === "sent" && (
              <Check
                size={14}
                className="shrink-0 text-[var(--text-muted)]"
              />
            )}

            {(lastMessageStatus === "delivered" ||
              lastMessageStatus === "read") && (
              <CheckCheck
                size={14}
                className={`shrink-0 ${
                  lastMessageStatus === "read"
                    ? "text-[var(--info)]"
                    : "text-[var(--text-muted)]"
                }`}
              />
            )}

            <p className="truncate text-xs text-[var(--text-secondary)]">
              {lastMessage || "Start a conversation"}
            </p>
          </div>

          {safeUnreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-semibold text-[var(--button-primary-text)]">
              {safeUnreadCount > 99 ? "99+" : safeUnreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;
