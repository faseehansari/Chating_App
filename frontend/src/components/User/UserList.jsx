
import { useState } from "react";
import { Search, Users, UserRound } from "lucide-react";

const UserList = ({
  users = [],
  loading = false,
  error = "",
  onSearch,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch?.(value.trim());
  };

  return (
    <section className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] md:w-80">
      {/* Header */}
      <div className="border-b border-[var(--border)] p-5">
        <div className="mb-5 flex items-center gap-3">
          <Users size={23} className="text-[var(--primary)]" />

          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Users
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Find people to start chatting
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3">
          <Search size={18} className="shrink-0 text-[var(--text-muted)]" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search username or email..."
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]"
          />
        </div>
      </div>

      {/* User Count */}
      <div className="px-5 py-3">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {users.length} {users.length === 1 ? "USER" : "USERS"}
        </p>
      </div>

      {/* Users */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-5 text-center text-sm text-[var(--text-secondary)]">
            Loading users...
          </p>
        ) : error ? (
          <p className="p-5 text-center text-sm text-[var(--error)]">
            {error}
          </p>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <UserRound
              size={35}
              className="mb-3 text-[var(--text-muted)]"
            />

            <p className="text-sm font-medium text-[var(--text-primary)]">
              No users found
            </p>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Try searching with another username or email.
            </p>
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => onSelectUser?.(user)}
              className="flex w-full items-center gap-3 border-b border-[var(--border)] px-5 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-semibold text-[var(--primary)]">
                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
                    user.isOnline
                      ? "bg-[var(--online)]"
                      : "bg-[var(--offline)]"
                  }`}
                />
              </div>

              {/* User Details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {user.username}
                </p>

                <p className="truncate text-xs text-[var(--text-secondary)]">
                  {user.email}
                </p>
              </div>

              <span className="text-xs text-[var(--text-muted)]">
                {user.isOnline ? "Online" : "Offline"}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
};

export default UserList;
