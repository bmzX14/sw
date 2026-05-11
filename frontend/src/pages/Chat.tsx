import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

type Conversation = {
  id: string;
  opponentName: string;
  opponentUniversity: string;
  opponentPhoto: string;
  postTitle: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
};

type Message = {
  id: string;
  conversationId: string;
  sender: "me" | "opponent";
  senderName: string;
  text: string;
  createdAt: string;
};

const sampleConversations: Conversation[] = [
  {
    id: "match-1",
    opponentName: "Mya",
    opponentUniversity: "Myongji University",
    opponentPhoto: "",
    postTitle: "Looking for a roommate near Myongji University",
    lastMessage: "That sounds good. Can we talk more about the room?",
    unreadCount: 2,
    updatedAt: "10:42 AM",
  },
  {
    id: "match-2",
    opponentName: "Nguyen",
    opponentUniversity: "Myongji University",
    opponentPhoto: "",
    postTitle: "Short-term roommate wanted during vacation",
    lastMessage: "I am available from July 1st.",
    unreadCount: 0,
    updatedAt: "Yesterday",
  },
  {
    id: "match-3",
    opponentName: "Hannah",
    opponentUniversity: "Hongik University",
    opponentPhoto: "",
    postTitle: "Looking for someone to share rent and deposit",
    lastMessage: "Is the full address visible after matching?",
    unreadCount: 1,
    updatedAt: "Mon",
  },
];

const sampleMessages: Message[] = [
  {
    id: "m-1",
    conversationId: "match-1",
    sender: "opponent",
    senderName: "Mya",
    text: "Hi! I saw your room post near Myongji University.",
    createdAt: "10:31 AM",
  },
  {
    id: "m-2",
    conversationId: "match-1",
    sender: "me",
    senderName: "Me",
    text: "Hi Mya! Thanks for your interest. Are you looking for a long-term stay?",
    createdAt: "10:33 AM",
  },
  {
    id: "m-3",
    conversationId: "match-1",
    sender: "opponent",
    senderName: "Mya",
    text: "Yes, I prefer at least six months. I also prefer a quiet lifestyle.",
    createdAt: "10:38 AM",
  },
  {
    id: "m-4",
    conversationId: "match-1",
    sender: "opponent",
    senderName: "Mya",
    text: "That sounds good. Can we talk more about the room?",
    createdAt: "10:42 AM",
  },

  {
    id: "m-5",
    conversationId: "match-2",
    sender: "opponent",
    senderName: "Nguyen",
    text: "Hello, I am interested in the short-term rental.",
    createdAt: "Yesterday",
  },
  {
    id: "m-6",
    conversationId: "match-2",
    sender: "me",
    senderName: "Me",
    text: "Sure. When would you like to move in?",
    createdAt: "Yesterday",
  },
  {
    id: "m-7",
    conversationId: "match-2",
    sender: "opponent",
    senderName: "Nguyen",
    text: "I am available from July 1st.",
    createdAt: "Yesterday",
  },

  {
    id: "m-8",
    conversationId: "match-3",
    sender: "opponent",
    senderName: "Hannah",
    text: "Hi, I want to know more about the rent-sharing option.",
    createdAt: "Mon",
  },
  {
    id: "m-9",
    conversationId: "match-3",
    sender: "me",
    senderName: "Me",
    text: "Hi Hannah. The rent and deposit can be shared equally.",
    createdAt: "Mon",
  },
  {
    id: "m-10",
    conversationId: "match-3",
    sender: "opponent",
    senderName: "Hannah",
    text: "Is the full address visible after matching?",
    createdAt: "Mon",
  },
];

export default function Chat() {
  const navigate = useNavigate();

  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [selectedConversationId, setSelectedConversationId] = useState("match-1");
  const [inputValue, setInputValue] = useState("");

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  const currentMessages = useMemo(() => {
    return messages.filter(
      (message) => message.conversationId === selectedConversationId
    );
  }, [messages, selectedConversationId]);

  const totalUnreadCount = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0
  );

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedText = inputValue.trim();

    if (!trimmedText || !selectedConversation) return;

    const now = new Date();
    const createdAt = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage: Message = {
      id: String(Date.now()),
      conversationId: selectedConversation.id,
      sender: "me",
      senderName: "Me",
      text: trimmedText,
      createdAt,
    };

    setMessages((prev) => [...prev, newMessage]);

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: trimmedText,
              updatedAt: createdAt,
            }
          : conversation
      )
    );

    setInputValue("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgAccent} />

      <nav style={styles.nav}>
        <p style={styles.brand}>roomies</p>

        <div style={styles.navRight}>
          <button style={styles.navLink} onClick={() => navigate("/browse")}>
            Browse
          </button>

          <button style={styles.navLinkActive} onClick={() => navigate("/chat")}>
            Chat
            {totalUnreadCount > 0 && (
              <span style={styles.navBadge}>{totalUnreadCount}</span>
            )}
          </button>

          <button style={styles.navLink} onClick={() => navigate("/profile")}>
            Profile
          </button>
        </div>
      </nav>

      <main style={styles.container}>
        <section style={styles.header}>
          <div>
            <p style={styles.kicker}>MESSAGING</p>
            <h1 style={styles.title}>Chat</h1>
            <p style={styles.description}>
              Talk with matched roommates in real time and keep track of active
              conversations.
            </p>
          </div>
        </section>

        <section style={styles.chatPanel}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <div>
                <p style={styles.sectionLabel}>Conversations</p>
                <h2 style={styles.sidebarTitle}>Active Matches</h2>
              </div>

              {totalUnreadCount > 0 && (
                <span style={styles.totalBadge}>{totalUnreadCount}</span>
              )}
            </div>

            <div style={styles.conversationList}>
              {conversations.map((conversation) => {
                const active = conversation.id === selectedConversationId;

                return (
                  <button
                    key={conversation.id}
                    style={{
                      ...styles.conversationItem,
                      ...(active ? styles.activeConversation : {}),
                    }}
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <div style={styles.avatar}>
                      {conversation.opponentPhoto ? (
                        <img
                          src={conversation.opponentPhoto}
                          alt={conversation.opponentName}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <span>{conversation.opponentName.slice(0, 1)}</span>
                      )}
                    </div>

                    <div style={styles.conversationContent}>
                      <div style={styles.conversationTop}>
                        <p style={styles.opponentName}>
                          {conversation.opponentName}
                        </p>
                        <span style={styles.updatedAt}>
                          {conversation.updatedAt}
                        </span>
                      </div>

                      <p style={styles.postTitle}>{conversation.postTitle}</p>
                      <p style={styles.lastMessage}>
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section style={styles.thread}>
            {selectedConversation ? (
              <>
                <div style={styles.threadHeader}>
                  <div style={styles.threadUser}>
                    <div style={styles.threadAvatar}>
                      {selectedConversation.opponentName.slice(0, 1)}
                    </div>

                    <div>
                      <h2 style={styles.threadName}>
                        {selectedConversation.opponentName}
                      </h2>
                      <p style={styles.threadMeta}>
                        {selectedConversation.opponentUniversity} · Matched
                      </p>
                    </div>
                  </div>

                  <button
                    style={styles.viewPostBtn}
                    onClick={() => navigate("/post-detail/sample-1")}
                  >
                    View Post
                  </button>
                </div>

                <div style={styles.matchInfoBox}>
                  <p style={styles.matchInfoTitle}>Matched Post</p>
                  <p style={styles.matchInfoText}>
                    {selectedConversation.postTitle}
                  </p>
                </div>

                <div style={styles.messageList}>
                  {currentMessages.map((message) => {
                    const isMine = message.sender === "me";

                    return (
                      <div
                        key={message.id}
                        style={{
                          ...styles.messageRow,
                          justifyContent: isMine ? "flex-end" : "flex-start",
                        }}
                      >
                        {!isMine && (
                          <div style={styles.messageAvatar}>
                            {message.senderName.slice(0, 1)}
                          </div>
                        )}

                        <div
                          style={{
                            ...styles.messageBubble,
                            ...(isMine
                              ? styles.myMessageBubble
                              : styles.opponentMessageBubble),
                          }}
                        >
                          <p style={styles.messageText}>{message.text}</p>
                          <p
                            style={{
                              ...styles.messageTime,
                              color: isMine ? "#d8d8d8" : "#aaa",
                            }}
                          >
                            {message.createdAt}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form style={styles.inputArea} onSubmit={sendMessage}>
                  <input
                    style={styles.messageInput}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                  />

                  <button style={styles.sendButton} type="submit">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div style={styles.emptyThread}>
                <h2 style={styles.emptyTitle}>No conversation selected</h2>
                <p style={styles.emptyText}>
                  Select a conversation from the sidebar to start chatting.
                </p>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fafaf8",
    fontFamily: "'Georgia', serif",
    position: "relative",
    overflowX: "hidden",
    color: "#1a1a1a",
  },
  bgAccent: {
    position: "fixed",
    top: -200,
    right: -200,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, #e8e4dc 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 48px",
    borderBottom: "1px solid #ebe9e4",
    background: "#fafaf8",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    fontSize: 13,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#888",
    margin: 0,
  },
  navRight: {
    display: "flex",
    gap: 24,
    alignItems: "center",
  },
  navLink: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#888",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.05em",
    position: "relative",
  },
  navLinkActive: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#1a1a1a",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.05em",
    position: "relative",
  },
  navBadge: {
    position: "absolute",
    top: -12,
    right: -14,
    minWidth: 17,
    height: 17,
    padding: "0 5px",
    borderRadius: 20,
    background: "#c0392b",
    color: "#fff",
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    maxWidth: 1120,
    margin: "48px auto",
    padding: "0 40px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: "40px 48px",
    marginBottom: 28,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 16px",
  },
  title: {
    fontSize: 32,
    fontWeight: 400,
    color: "#1a1a1a",
    margin: "0 0 10px",
  },
  description: {
    fontSize: 14,
    color: "#888",
    lineHeight: 1.7,
    maxWidth: 680,
    margin: 0,
  },
  chatPanel: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 28,
    minHeight: 680,
  },
  sidebar: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    padding: 24,
    minHeight: 680,
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 10px",
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: 400,
    margin: 0,
    color: "#1a1a1a",
  },
  totalBadge: {
    minWidth: 24,
    height: 24,
    padding: "0 7px",
    borderRadius: 20,
    background: "#c0392b",
    color: "#fff",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  conversationList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  conversationItem: {
    width: "100%",
    border: "1px solid #f0ede8",
    background: "#ffffff",
    padding: 14,
    display: "grid",
    gridTemplateColumns: "46px 1fr auto",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
  },
  activeConversation: {
    background: "#fafaf8",
    border: "1px solid #ddd8cf",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "#e8e4dc",
    color: "#888",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    border: "2px solid #ebe9e4",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  conversationContent: {
    minWidth: 0,
  },
  conversationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  opponentName: {
    fontSize: 15,
    color: "#1a1a1a",
    margin: 0,
  },
  updatedAt: {
    fontSize: 11,
    color: "#aaa",
    whiteSpace: "nowrap",
  },
  postTitle: {
    fontSize: 11,
    color: "#aaa",
    margin: "5px 0 6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  lastMessage: {
    fontSize: 12,
    color: "#888",
    margin: 0,
    lineHeight: 1.5,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  unreadBadge: {
    alignSelf: "center",
    minWidth: 21,
    height: 21,
    padding: "0 6px",
    borderRadius: 20,
    background: "#c0392b",
    color: "#fff",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thread: {
    background: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
    minHeight: 680,
    display: "flex",
    flexDirection: "column",
  },
  threadHeader: {
    padding: "24px 28px",
    borderBottom: "1px solid #f0ede8",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  threadUser: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  threadAvatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#e8e4dc",
    color: "#888",
    border: "3px solid #ebe9e4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
  },
  threadName: {
    fontSize: 20,
    fontWeight: 400,
    margin: "0 0 5px",
    color: "#1a1a1a",
  },
  threadMeta: {
    fontSize: 12,
    color: "#888",
    margin: 0,
  },
  viewPostBtn: {
    background: "transparent",
    border: "1.5px solid #1a1a1a",
    padding: "10px 18px",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    borderRadius: 1,
    whiteSpace: "nowrap",
  },
  matchInfoBox: {
    margin: "22px 28px 0",
    padding: "16px 18px",
    background: "#fafaf8",
    border: "1px solid #f0ede8",
  },
  matchInfoTitle: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#aaa",
    margin: "0 0 7px",
  },
  matchInfoText: {
    fontSize: 13,
    color: "#666",
    margin: 0,
    lineHeight: 1.5,
  },
  messageList: {
    flex: 1,
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#e8e4dc",
    color: "#888",
    border: "2px solid #ebe9e4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: "68%",
    padding: "12px 15px",
    borderRadius: 2,
  },
  myMessageBubble: {
    background: "#1a1a1a",
    color: "#ffffff",
  },
  opponentMessageBubble: {
    background: "#f0ede8",
    color: "#1a1a1a",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 6px",
  },
  messageTime: {
    fontSize: 10,
    margin: 0,
    textAlign: "right",
  },
  inputArea: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 14,
    padding: "20px 28px",
    borderTop: "1px solid #f0ede8",
  },
  messageInput: {
    border: "none",
    borderBottom: "1.5px solid #ddd",
    padding: "10px 0",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
    background: "transparent",
    outline: "none",
    width: "100%",
  },
  sendButton: {
    background: "#1a1a1a",
    border: "none",
    padding: "12px 24px",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    color: "#fff",
    borderRadius: 1,
  },
  emptyThread: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 400,
    margin: "0 0 10px",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    margin: 0,
  },
};