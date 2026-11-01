
import { useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conversation) => {
    const name = conversation.name || "";
    return name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  return (
    <section className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] md:w-80">
      {/* Header */}
      <div className="border-b border-[var(--border)] p-5">
        <div className="mb-5 flex items-center gap-3">
          <MessageCircle size={23} className="text-[var(--primary)]" />

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Messages
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Your conversations
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3">
          <Search size={18} className="shrink-0 text-[var(--text-muted)]" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Count */}
      <div className="px-5 py-3">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {filteredConversations.length}{" "}
          {filteredConversations.length === 1
            ? "CONVERSATION"
            : "CONVERSATIONS"}
        </p>
      </div>

      {/* Conversation Items */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-5 text-center text-sm text-[var(--text-secondary)]">
            Loading conversations...
          </p>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <MessageCircle
              size={35}
              className="mb-3 text-[var(--text-muted)]"
            />

            <p className="text-sm font-medium text-[var(--text-primary)]">
              {searchQuery.trim()
                ? "No matching conversations"
                : "No conversations yet"}
            </p>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {searchQuery.trim()
                ? "Try searching with another name."
                : "Find someone in the Users section to start chatting."}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const conversationId = conversation._id || conversation.id;

            return (
              <ConversationItem
                key={conversationId}
                conversation={conversation}
                isSelected={selectedConversation === conversationId}
                onClick={() => onSelectConversation(conversation)}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default ConversationList;
