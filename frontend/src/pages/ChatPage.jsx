
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { connectSocket } from "../services/socket";

import Sidebar from "../components/layout/Sidebar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import UserList from "../components/User/UserList";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
// ================= HELPERS =================

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
};

const getConversationView = (conversation, currentUserId) => {
  const otherParticipant = conversation.participants?.find(
    (participant) => getId(participant) !== String(currentUserId)
  );

  const lastMessage =
    conversation.lastMessage &&
      typeof conversation.lastMessage === "object"
      ? conversation.lastMessage
      : null;

  const lastMessageSenderId = getId(lastMessage?.sender);

  return {
    ...conversation,
    id: getId(conversation),
    name: otherParticipant?.username || "Unknown User",
    avatar: otherParticipant?.profilePicture || "",
    isOnline: Boolean(otherParticipant?.isOnline),
    lastMessage: lastMessage?.content || "",
    lastMessageAt: lastMessage?.createdAt || conversation.updatedAt,
    lastMessageStatus:
      lastMessageSenderId === String(currentUserId)
        ? lastMessage?.status
        : undefined,
    unreadCount: 0,
  };
};

const sortConversations = (conversations) => {
  return [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime()
  );
};

const upsertMessage = (messages, newMessage) => {
  const newMessageId = getId(newMessage);

  if (!newMessageId) return messages;

  const existingIndex = messages.findIndex(
    (message) => getId(message) === newMessageId
  );

  if (existingIndex === -1) {
    return [...messages, newMessage];
  }

  return messages.map((message, index) =>
    index === existingIndex ? { ...message, ...newMessage } : message
  );
};

// ================= API HELPERS =================

const getUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};

const searchUsers = async (query) => {
  const response = await API.get("/users/search", {
    params: { query },
  });

  return response.data;
};

const getConversations = async () => {
  const response = await API.get("/conversations");
  return response.data;
};

const createConversation = async (receiverId) => {
  const response = await API.post("/conversations", {
    receiverId,
  });

  return response.data;
};

const getMessages = async (conversationId) => {
  const response = await API.get(`/messages/${conversationId}`, {
    params: {
      page: 1,
      limit: 50,
    },
  });

  return response.data;
};

// ================= CHAT PAGE =================

const ChatPage = () => {
  const { user, token } = useAuth();

  const currentUserId = getId(user);

  const [activeSection, setActiveSection] = useState("messages");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState("");

  const [chatError, setChatError] = useState("");

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const selectedConversationId = getId(selectedConversation);

  const selectedConversationView = selectedConversation
    ? getConversationView(selectedConversation, currentUserId)
    : null;

  // ================= UPDATE USER PRESENCE =================

  const updateUserPresence = (userId, isOnline, lastSeen = null) => {
    const targetUserId = String(userId);

    // Update Users section
    setUsers((previousUsers) =>
      previousUsers.map((item) =>
        getId(item) === targetUserId
          ? {
            ...item,
            isOnline,
            lastSeen: lastSeen || item.lastSeen,
          }
          : item
      )
    );

    // Update conversation participants
    const updateConversation = (conversation) => {
      if (!conversation?.participants) return conversation;

      return {
        ...conversation,
        participants: conversation.participants.map((participant) =>
          getId(participant) === targetUserId
            ? {
              ...participant,
              isOnline,
              lastSeen: lastSeen || participant.lastSeen,
            }
            : participant
        ),
      };
    };

    setConversations((previousConversations) =>
      previousConversations.map(updateConversation)
    );

    setSelectedConversation((previousConversation) =>
      updateConversation(previousConversation)
    );
  };

  // ================= FETCH CONVERSATIONS =================

  useEffect(() => {
    let isActive = true;

    const fetchConversations = async () => {
      try {
        setConversationsLoading(true);
        setConversationsError("");

        const response = await getConversations();

        if (isActive) {
          setConversations(
            sortConversations(response.conversations || [])
          );
        }
      } catch (error) {
        if (isActive) {
          setConversationsError(
            error.response?.data?.message ||
            "Unable to load conversations."
          );
        }
      } finally {
        if (isActive) {
          setConversationsLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isActive = false;
    };
  }, []);

  // ================= FETCH USERS =================

  useEffect(() => {
    if (activeSection !== "users") return;

    let isActive = true;

    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError("");

        const response = searchQuery.trim()
          ? await searchUsers(searchQuery.trim())
          : await getUsers();

        if (isActive) {
          setUsers(response.users || []);
        }
      } catch (error) {
        if (isActive) {
          setUsers([]);
          setUsersError(
            error.response?.data?.message ||
            "Unable to load users."
          );
        }
      } finally {
        if (isActive) {
          setUsersLoading(false);
        }
      }
    };

    const timer = setTimeout(
      fetchUsers,
      searchQuery.trim() ? 350 : 0
    );

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [activeSection, searchQuery]);

  // ================= FETCH MESSAGE HISTORY =================

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setIsTyping(false);
      setTypingUserName("");
      return;
    }

    let isActive = true;

    const fetchMessages = async () => {
      try {
        setMessages([]);
        setMessagesLoading(true);
        setChatError("");

        const response = await getMessages(selectedConversationId);

        if (isActive) {
          setMessages(response.messages || []);
        }

        const socket = connectSocket(token);

        socket.emit(
          "mark_messages_read",
          { conversationId: selectedConversationId },
          (result) => {
            if (!isActive || !result?.success) return;

            setMessages((previousMessages) =>
              previousMessages.map((message) => {
                if (
                  getId(message.receiver) === currentUserId &&
                  message.status !== "read"
                ) {
                  return {
                    ...message,
                    status: "read",
                    readAt: new Date().toISOString(),
                  };
                }

                return message;
              })
            );
          }
        );
      } catch (error) {
        if (isActive) {
          setMessages([]);
          setChatError(
            error.response?.data?.message ||
            "Unable to load messages."
          );
        }
      } finally {
        if (isActive) {
          setMessagesLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isActive = false;
    };
  }, [selectedConversationId, token, currentUserId]);

  // ================= UPDATE CONVERSATION PREVIEW =================

  const updateConversationPreview = (message) => {
    const conversationId = getId(message.conversation);

    if (!conversationId) return;

    setConversations((previousConversations) => {
      const updatedConversations = previousConversations.map(
        (conversation) =>
          getId(conversation) === conversationId
            ? {
              ...conversation,
              lastMessage: message,
              updatedAt: message.createdAt || new Date().toISOString(),
            }
            : conversation
      );

      return sortConversations(updatedConversations);
    });

    setSelectedConversation((previousConversation) => {
      if (getId(previousConversation) !== conversationId) {
        return previousConversation;
      }

      return {
        ...previousConversation,
        lastMessage: message,
        updatedAt: message.createdAt || new Date().toISOString(),
      };
    });
  };

  // ================= SOCKET.IO EVENTS =================

  useEffect(() => {
    if (!token || !currentUserId) return;

    const socket = connectSocket(token);

    // Incoming message
    const handleNewMessage = (message) => {
      const messageConversationId = getId(message.conversation);

      updateConversationPreview(message);

      if (messageConversationId === selectedConversationId) {
        setMessages((previousMessages) =>
          upsertMessage(previousMessages, message)
        );

        socket.emit(
          "mark_messages_read",
          { conversationId: messageConversationId },
          (result) => {
            if (!result?.success) return;

            setMessages((previousMessages) =>
              previousMessages.map((item) => {
                if (
                  getId(item.receiver) === currentUserId &&
                  item.status !== "read"
                ) {
                  return {
                    ...item,
                    status: "read",
                    readAt: new Date().toISOString(),
                  };
                }

                return item;
              })
            );
          }
        );
      }
    };

    // Message sent
    const handleMessageSent = (message) => {
      updateConversationPreview(message);

      if (getId(message.conversation) === selectedConversationId) {
        setMessages((previousMessages) =>
          upsertMessage(previousMessages, message)
        );
      }
    };

    // Message status update
    const handleMessageStatusUpdate = (data) => {
      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          getId(message) === getId(data.messageId)
            ? {
              ...message,
              status: data.status,
              deliveredAt: data.deliveredAt || message.deliveredAt,
              readAt: data.readAt || message.readAt,
            }
            : message
        )
      );

      setConversations((previousConversations) =>
        previousConversations.map((conversation) => {
          const lastMessage = conversation.lastMessage;

          if (
            getId(conversation) === getId(data.conversationId) &&
            getId(lastMessage) === getId(data.messageId)
          ) {
            return {
              ...conversation,
              lastMessage: {
                ...lastMessage,
                status: data.status,
                deliveredAt: data.deliveredAt || lastMessage.deliveredAt,
                readAt: data.readAt || lastMessage.readAt,
              },
            };
          }

          return conversation;
        })
      );

      setSelectedConversation((previousConversation) => {
        if (
          getId(previousConversation) !== getId(data.conversationId)
        ) {
          return previousConversation;
        }

        const lastMessage = previousConversation.lastMessage;

        if (getId(lastMessage) !== getId(data.messageId)) {
          return previousConversation;
        }

        return {
          ...previousConversation,
          lastMessage: {
            ...lastMessage,
            status: data.status,
            deliveredAt: data.deliveredAt || lastMessage.deliveredAt,
            readAt: data.readAt || lastMessage.readAt,
          },
        };
      });
    };

    // Typing indicator
    const handleUserTyping = (data) => {
      if (
        getId(data.conversationId) !== selectedConversationId ||
        getId(data.userId) === currentUserId
      ) {
        return;
      }

      setIsTyping(Boolean(data.isTyping));

      if (data.isTyping) {
        const otherParticipant = selectedConversation?.participants?.find(
          (participant) => getId(participant) === getId(data.userId)
        );

        setTypingUserName(otherParticipant?.username || "");
      } else {
        setTypingUserName("");
      }
    };

    // User comes online
    const handleUserOnline = (data) => {
      updateUserPresence(data.userId, true);
    };

    // User goes offline
    const handleUserOffline = (data) => {
      updateUserPresence(
        data.userId,
        false,
        data.lastSeen
      );
    };

    const handleConnect = () => {
      setChatError("");
    };

    const handleDisconnect = () => {
      setIsSending(false);
    };

    // Register socket listeners
    socket.on("new_message", handleNewMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_status_update", handleMessageStatusUpdate);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_status_update", handleMessageStatusUpdate);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [token, currentUserId, selectedConversationId]);

  // ================= NAVIGATION =================

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSelectedConversation(null);
    setChatError("");
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setActiveSection("messages");
    setChatError("");
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      setChatError("");
      setUsersError("");

      const response = await createConversation(selectedUser._id);
      const conversation = response.conversation;

      if (!conversation) {
        throw new Error("Conversation was not returned by the server.");
      }

      setConversations((previousConversations) => {
        const exists = previousConversations.some(
          (item) => getId(item) === getId(conversation)
        );

        return sortConversations(
          exists
            ? previousConversations.map((item) =>
              getId(item) === getId(conversation)
                ? conversation
                : item
            )
            : [conversation, ...previousConversations]
        );
      });

      setSelectedConversation(conversation);
      setActiveSection("messages");
    } catch (error) {
      setUsersError(
        error.response?.data?.message ||
        error.message ||
        "Unable to open conversation."
      );
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    setIsTyping(false);
    setTypingUserName("");
  };

  // ================= SEND MESSAGE =================

  const handleSendMessage = (content) => {
    if (!selectedConversationId || !content.trim()) return;

    try {
      const socket = connectSocket(token);

      setIsSending(true);
      setChatError("");

      socket.emit(
        "send_message",
        {
          conversationId: selectedConversationId,
          content,
        },
        (response) => {
          setIsSending(false);

          if (!response?.success) {
            setChatError(
              response?.message || "Unable to send message."
            );
            return;
          }

          const message = response.data;

          setMessages((previousMessages) =>
            upsertMessage(previousMessages, message)
          );

          updateConversationPreview(message);
        }
      );
    } catch (error) {
      setIsSending(false);
      setChatError(error.message || "Unable to send message.");
    }
  };

  // ================= TYPING EVENTS =================

  const handleTyping = () => {
    if (!selectedConversationId) return;

    const socket = connectSocket(token);

    socket.emit("typing_start", {
      conversationId: selectedConversationId,
    });
  };

  const handleStopTyping = () => {
    if (!selectedConversationId) return;

    const socket = connectSocket(token);

    socket.emit("typing_stop", {
      conversationId: selectedConversationId,
    });
  };

  // ================= UI DATA =================

  const conversationListItems = conversations.map((conversation) =>
    getConversationView(conversation, currentUserId)
  );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Mobile Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
        <MessageCircle
          size={22}
          className="text-[var(--primary)]"
        />

        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          ChatApp
        </h1>
      </header>

      {/* Dashboard */}
      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Messages Section */}
        {activeSection === "messages" && (
          <div className="flex min-h-0 min-w-0 flex-1">
            <div
              className={`${selectedConversation ? "hidden md:flex" : "flex"
                } min-h-0 w-full md:w-auto`}
            >
              <ConversationList
                conversations={conversationListItems}
                selectedConversation={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                loading={conversationsLoading}
              />
            </div>

            <div
              className={`${selectedConversation ? "flex" : "hidden md:flex"
                } min-h-0 min-w-0 flex-1 flex-col`}
            >
              {chatError && (
                <p
                  role="alert"
                  className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--error)]"
                >
                  {chatError}
                </p>
              )}

              {messagesLoading && selectedConversation ? (
                <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-secondary)]">
                  Loading messages...
                </div>
              ) : (
                <ChatWindow
                  conversation={selectedConversationView}
                  messages={messages}
                  currentUserId={currentUserId}
                  onBack={handleBack}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  onStopTyping={handleStopTyping}
                  isTyping={isTyping}
                  typingUserName={typingUserName}
                  isSending={isSending}
                />
              )}
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div className="flex min-h-0 min-w-0 flex-1">
            <UserList
              users={users}
              loading={usersLoading}
              error={usersError}
              onSearch={setSearchQuery}
              onSelectUser={handleSelectUser}
            />
          </div>
        )}

        {/* Profile Section */}
        {activeSection === "profile" && <ProfilePage />}

        {/* Settings Section */}
        {activeSection === "settings" && <SettingsPage />}
      </div>
    </main>
  );
};

export default ChatPage;
