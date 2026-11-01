
import { useState } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

const ChatHeader = ({ conversation, onBack }) => {
  const [imageError, setImageError] = useState(false);

  if (!conversation) return null;

  const name = conversation.name || "Unknown User";
  const showAvatar = conversation.avatar && !imageError;

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-5">
      {/* User Information */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] md:hidden"
        >
          <ArrowLeft size={21} />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          {showAvatar ? (
            <img
              src={conversation.avatar}
              alt={name}
              onError={() => setImageError(true)}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--secondary-soft)] text-lg font-semibold text-[var(--text-primary)]">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--online)]" />
          )}
        </div>

        {/* Name and Status */}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
            {name}
          </h2>

          <p className="text-xs text-[var(--text-secondary)]">
            {conversation.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* More Options */}
      <button
        type="button"
        aria-label="More options"
        title="More options"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
      >
        <MoreVertical size={20} />
      </button>
    </header>
  );
};

export default ChatHeader;
