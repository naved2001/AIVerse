import {
  MessageSquare, Plus, Search, Trash2, X, Pencil, Check, LogOut,
  UserCircle, Settings
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ conversations, activeConversationId, onNewChat, onSelectConversation,
  onDeleteConversation, onRenameConversation, onClearConversations, isOpen, onClose,
  onSettings, onAccount }) {

  const { user, signOut } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      const isShortcut =
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k";

      if (isShortcut) {
        e.preventDefault();

        searchInputRef.current?.focus();
      }

      if (
        e.key === "Escape" &&
        document.activeElement ===
        searchInputRef.current
      ) {
        setSearchQuery("");

        searchInputRef.current?.blur();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboardShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
    };
  }, []);

  const filteredConversations =
    conversations.filter((conversation) =>
      conversation.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const groupedConversations = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  const getConversationGroup = (timestamp) => {
    if (!timestamp) return "Older";

    const date = new Date(timestamp);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfYesterday = new Date(
      startOfToday
    );

    startOfYesterday.setDate(
      startOfYesterday.getDate() - 1
    );

    const sevenDaysAgo = new Date(
      startOfToday
    );

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    if (date >= startOfToday) {
      return "Today";
    }

    if (date >= startOfYesterday) {
      return "Yesterday";
    }

    if (date >= sevenDaysAgo) {
      return "Previous 7 days";
    }

    return "Older";
  };

  filteredConversations.forEach(
    (conversation) => {
      const group =
        getConversationGroup(
          conversation.updated_at
        );

      groupedConversations[group].push(
        conversation
      );
    }
  );

  const startEditing = (conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const saveTitle = (conversationId) => {
    const trimmedTitle = editingTitle.trim();

    if (trimmedTitle) {
      onRenameConversation(
        conversationId,
        trimmedTitle
      );
    }

    setEditingId(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (e, conversationId) => {
    if (e.key === "Enter") {
      saveTitle(conversationId);
    }

    if (e.key === "Escape") {
      setEditingId(null);
      setEditingTitle("");
    }
  };


  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString();
  };



  const renderConversation = (
    conversation
  ) => (
    <div
      key={conversation.id}
      className={`history-item-wrapper ${activeConversationId ===
        conversation.id
        ? "active-history"
        : ""
        }`}
    >
      {editingId === conversation.id ? (
        <input
          className="rename-input"
          value={editingTitle}
          onChange={(e) =>
            setEditingTitle(e.target.value)
          }
          onBlur={() =>
            saveTitle(conversation.id)
          }
          onKeyDown={(e) =>
            handleTitleKeyDown(
              e,
              conversation.id
            )
          }
          autoFocus
        />
      ) : (
        <button
          className="history-item"
          onClick={() =>
            onSelectConversation(
              conversation.id
            )
          }
        >
          <MessageSquare size={17} />

          <div className="history-item-text">
            <span className="history-item-title">
              {conversation.title}
            </span>

            <span className="history-item-time">
              {formatTimestamp(
                conversation.updated_at
              )}
            </span>
          </div>
        </button>
      )}

      <button
        className="chat-action-button"
        onClick={() =>
          editingId === conversation.id
            ? saveTitle(conversation.id)
            : startEditing(conversation)
        }
        aria-label={
          editingId === conversation.id
            ? "Save title"
            : "Rename conversation"
        }
      >
        {editingId === conversation.id ? (
          <Check size={15} />
        ) : (
          <Pencil size={15} />
        )}
      </button>

      <button
        className="chat-action-button"
        onClick={() =>
          onDeleteConversation(
            conversation.id
          )
        }
        aria-label="Delete conversation"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(
        "Failed to sign out:",
        error
      );
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <button
          className="new-chat-button"
          onClick={onNewChat}
        >
          <Plus size={19} />
          <span>New Chat</span>
        </button>

        <button
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="search-button">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search chats"
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          aria-label="Search conversations"
        />

        {!searchQuery && (
          <kbd className="search-shortcut">
            Ctrl K
          </kbd>
        )}

        {searchQuery && (
          <button
            type="button"
            className="search-clear-button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-heading">
          <p className="section-title"> {searchQuery ? "Search results" : "Recent"} </p>

          {searchQuery && (
            <span className="search-result-count">
              {filteredConversations.length}
            </span>
          )}
        </div>

        <div className="chat-history">
          {conversations.length === 0 ? (
            <p className="empty-history">
              No conversations yet
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="empty-history">
              No chats found
            </p>
          ) : (
            <>
              {Object.entries(
                groupedConversations
              ).map(
                ([groupName, groupConversations]) => {
                  if (
                    groupConversations.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      className="conversation-group"
                      key={groupName}
                    >
                      <p className="conversation-group-title">
                        {groupName}
                      </p>

                      <div className="conversation-group-list">
                        {groupConversations.map(
                          renderConversation
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </>
          )}
        </div>
      </div>

      <div className="sidebar-footer">

        <button
          type="button"
          className={`profile-card ${profileOpen
            ? "profile-card-open"
            : ""
            }`}
          onClick={() =>
            setProfileOpen((previous) => !previous)
          }
          aria-expanded={profileOpen}
          aria-label="Open profile menu"
        >
          <div className="profile-avatar">
            {user?.user_metadata?.display_name
              ?.charAt(0)
              .toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              "U"}
          </div>

          <div className="profile-info">
            <span className="profile-name">
              {user?.user_metadata?.display_name ||
                user?.email?.split("@")[0] ||
                "User"}
            </span>

            <span className="profile-email">
              {user?.email || ""}
            </span>
          </div>

          <UserCircle
            size={18}
            className="profile-menu-icon"
          />
        </button>


        {profileOpen && (
          <div className="profile-menu">
            <button
              type="button"
              className="profile-menu-item"
              onClick={() => {
                setProfileOpen(false);
                onAccount();
              }}
            >
              <UserCircle size={17} />
              <span>Account</span>
            </button>

            <button
              type="button"
              className="profile-menu-item"
              onClick={() => {
                setProfileOpen(false);
                onSettings();
              }}
            >
              <Settings size={17} />
              <span>Settings</span>
            </button>

            <div className="profile-menu-divider" />

            <button
              type="button"
              className="profile-menu-item profile-signout"
              onClick={handleSignOut}
            >
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </div>
        )}

        <button
          className="delete-button"
          onClick={onClearConversations}
          disabled={conversations.length === 0}
        >
          <Trash2 size={17} />
          <span>Clear conversations</span>
        </button>

        <button
          className="signout-button"
          onClick={handleSignOut}
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>

      </div>
    </aside>
  );
}

export default Sidebar;