import { useEffect, useState, useRef } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import MessageInput from "./components/MessageInput";
import ChatWindow from "./components/ChatWindow";
import AuthPage from "./components/AuthPage";
import SettingsPanel from "./components/SettingsPanel";
import AccountPanel from "./components/AccountPanel";

import { useAuth } from "./context/AuthContext";

import { generateResponse } from "./services/gemini";

import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  deleteAllConversations,
} from "./services/conversations";

import { createConversationTitle } from "./utils/createTitle";

function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const abortControllerRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("aiverse-theme") ||
      "system"
    );
  });

  const [enterToSend, setEnterToSend] = useState(() => {
    const savedSetting = localStorage.getItem("enterToSend");

    return savedSetting === null
      ? true
      : JSON.parse(savedSetting);
  });

  useEffect(() => {
    localStorage.setItem(
      "enterToSend",
      JSON.stringify(enterToSend)
    );
  }, [enterToSend]);

  useEffect(() => {
    const root =
      document.documentElement;

    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute(
        "data-theme",
        theme
      );
    }

    localStorage.setItem(
      "aiverse-theme",
      theme
    );
  }, [theme]);

  /*
   * Load conversations when user logs in
   */

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversationId(null);
      setConversationsLoading(false);
      return;
    }

    const loadConversations = async () => {
      try {
        setConversationsLoading(true);

        const data = await getConversations(user.id);

        setConversations(data);

        if (data.length > 0) {
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      } finally {
        setConversationsLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  /*
   * Get currently active conversation
   */

  const activeConversation = conversations.find(
    (conversation) =>
      conversation.id === activeConversationId
  );

  const messages = activeConversation?.messages || [];

  /*
   * Create new chat
   */

  const handleNewChat = () => {
    setActiveConversationId(null);
    setSidebarOpen(false);
  };

  const handleStopGenerating = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsLoading(false);
  };

  /*
   * Send message
   */

  const handleSendMessage = async (message, image) => {
    if (!user) return;

    let conversationId = activeConversationId;

    /*
     * Create conversation if none exists
     */

    if (!conversationId) {
      try {
        const newConversation =
          await createConversation(
            user.id,
            createConversationTitle(message)
          );

        conversationId = newConversation.id;

        setConversations((previousConversations) => [
          newConversation,
          ...previousConversations,
        ]);

        setActiveConversationId(conversationId);
      } catch (error) {
        console.error(
          "Failed to create conversation:",
          error
        );

        return;
      }
    }

    /*
     * Get current messages
     */

    const currentConversation =
      conversations.find(
        (conversation) =>
          conversation.id === conversationId
      );

    const currentMessages =
      currentConversation?.messages || [];

    /*
     * Add user message
     */

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const updatedMessages = [
      ...currentMessages,
      userMessage,
    ];

    /*
     * Update UI immediately
     */

    setConversations((previousConversations) =>
      previousConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
            ...conversation,
            title:
              conversation.messages.length === 0
                ? createConversationTitle(message)
                : conversation.title,
            messages: updatedMessages,
          }
          : conversation
      )
    );

    /*
     * Save user message to database
     */

    try {
      await updateConversation(
        conversationId,
        {
          title:
            currentMessages.length === 0
              ? createConversationTitle(message)
              : currentConversation?.title ||
              "New Chat",

          messages: updatedMessages,
        }
      );
    } catch (error) {
      console.error(
        "Failed to save user message:",
        error
      );
    }

    /*
     * Ask Gemini
     */

    setIsLoading(true);

    const controller = new AbortController();

    abortControllerRef.current = controller;

    const assistantMessageId = crypto.randomUUID();

    let streamedResponse = "";

    const initialAssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    const messagesWithAssistant = [
      ...updatedMessages,
      initialAssistantMessage,
    ];

    setConversations((previousConversations) =>
      previousConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
            ...conversation,
            messages: messagesWithAssistant,
          }
          : conversation
      )
    );

    try {
      await generateResponse(
        message,
        currentMessages,
        (chunk) => {
          streamedResponse += chunk;

          setConversations(
            (previousConversations) =>
              previousConversations.map(
                (conversation) =>
                  conversation.id === conversationId
                    ? {
                      ...conversation,
                      messages:
                        conversation.messages.map(
                          (item) =>
                            item.id ===
                              assistantMessageId
                              ? {
                                ...item,
                                content:
                                  streamedResponse,
                              }
                              : item
                        ),
                    }
                    : conversation
              )
          );
        },
        controller.signal,
        image
      );

      const finalMessages = [
        ...updatedMessages,
        {
          id: assistantMessageId,
          role: "assistant",
          content: streamedResponse,
        },
      ];

      await updateConversation(
        conversationId,
        {
          messages: finalMessages,
        }
      );

      setConversations(
        (previousConversations) =>
          previousConversations.map(
            (conversation) =>
              conversation.id === conversationId
                ? {
                  ...conversation,
                  messages: finalMessages,
                }
                : conversation
          )
      );
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("AI generation stopped by user.");
        return;
      }

      console.error(
        "AI response error:",
        error
      );

      const errorMessage = {
        id: assistantMessageId,
        role: "assistant",
        content:
          "Sorry, I couldn't generate a response. Please try again.",
      };

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ];

      setConversations(
        (previousConversations) =>
          previousConversations.map(
            (conversation) =>
              conversation.id === conversationId
                ? {
                  ...conversation,
                  messages: finalMessages,
                }
                : conversation
          )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async (
    assistantMessageId
  ) => {
    if (isLoading) return;

    const conversation =
      conversations.find(
        (conversation) =>
          conversation.id === activeConversationId
      );

    if (!conversation) return;

    const messages = conversation.messages || [];

    const assistantIndex =
      messages.findIndex(
        (message) =>
          message.id === assistantMessageId
      );

    if (assistantIndex === -1) return;

    /*
     * Find the user message immediately
     * before the assistant response.
     */

    const userMessage =
      messages[assistantIndex - 1];

    if (
      !userMessage ||
      userMessage.role !== "user"
    ) {
      return;
    }

    /*
     * Keep everything before the old
     * assistant response.
     */

    const previousMessages =
      messages.slice(0, assistantIndex);

    /*
     * Create a new assistant message.
     */

    const newAssistantMessageId =
      crypto.randomUUID();

    const initialAssistantMessage = {
      id: newAssistantMessageId,
      role: "assistant",
      content: "",
    };

    const messagesWithNewAssistant = [
      ...previousMessages,
      initialAssistantMessage,
    ];

    /*
     * Update UI immediately.
     */

    setConversations(
      (previousConversations) =>
        previousConversations.map(
          (conversation) =>
            conversation.id ===
              activeConversationId
              ? {
                ...conversation,
                messages:
                  messagesWithNewAssistant,
              }
              : conversation
        )
    );

    setIsLoading(true);

    /*
     * Create AbortController so
     * Stop Generating still works.
     */

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    let streamedResponse = "";

    try {
      /*
       * Send previous conversation history
       * to Gemini.
       */

      const historyForGemini =
        previousMessages;

      await generateResponse(
        userMessage.content,
        historyForGemini,
        (chunk) => {
          streamedResponse += chunk;

          setConversations(
            (previousConversations) =>
              previousConversations.map(
                (conversation) =>
                  conversation.id ===
                    activeConversationId
                    ? {
                      ...conversation,
                      messages:
                        conversation.messages.map(
                          (message) =>
                            message.id ===
                              newAssistantMessageId
                              ? {
                                ...message,
                                content:
                                  streamedResponse,
                              }
                              : message
                        ),
                    }
                    : conversation
              )
          );
        },
        controller.signal
      );

      const finalMessages = [
        ...previousMessages,
        {
          id: newAssistantMessageId,
          role: "assistant",
          content: streamedResponse,
        },
      ];

      /*
       * Save regenerated response.
       */

      await updateConversation(
        activeConversationId,
        {
          messages: finalMessages,
        }
      );

      setConversations(
        (previousConversations) =>
          previousConversations.map(
            (conversation) =>
              conversation.id ===
                activeConversationId
                ? {
                  ...conversation,
                  messages: finalMessages,
                }
                : conversation
          )
      );
    } catch (error) {
      /*
       * Stop Generating is not an error.
       */

      if (error.name === "AbortError") {
        console.log(
          "Regeneration stopped by user."
        );

        return;
      }

      console.error(
        "Regeneration error:",
        error
      );
    } finally {
      setIsLoading(false);

      abortControllerRef.current = null;
    }
  };

  const handleEdit = async (
    messageId,
    editedMessage
  ) => {
    if (isLoading) return;

    const conversation =
      conversations.find(
        (conversation) =>
          conversation.id === activeConversationId
      );

    if (!conversation) return;

    const messages =
      conversation.messages || [];

    const messageIndex =
      messages.findIndex(
        (message) =>
          message.id === messageId
      );

    if (messageIndex === -1) return;

    const originalMessage =
      messages[messageIndex];

    if (originalMessage.role !== "user") {
      return;
    }

    /*
     * Keep messages before the edited
     * user message.
     */

    const previousMessages =
      messages.slice(0, messageIndex);

    /*
     * Create the updated user message.
     */

    const updatedUserMessage = {
      ...originalMessage,
      content: editedMessage,
    };

    /*
     * Create a new assistant message
     * for the regenerated response.
     */

    const assistantMessageId =
      crypto.randomUUID();

    const initialAssistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    const messagesWithNewResponse = [
      ...previousMessages,
      updatedUserMessage,
      initialAssistantMessage,
    ];

    /*
     * Update UI immediately.
     */

    setConversations(
      (previousConversations) =>
        previousConversations.map(
          (conversation) =>
            conversation.id ===
              activeConversationId
              ? {
                ...conversation,
                messages:
                  messagesWithNewResponse,
              }
              : conversation
        )
    );

    setIsLoading(true);

    /*
     * Create AbortController so
     * Stop Generating works here too.
     */

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    let streamedResponse = "";

    try {
      /*
       * Send the conversation history
       * before the edited message.
       */

      await generateResponse(
        editedMessage,
        previousMessages,
        (chunk) => {
          streamedResponse += chunk;

          setConversations(
            (previousConversations) =>
              previousConversations.map(
                (conversation) =>
                  conversation.id ===
                    activeConversationId
                    ? {
                      ...conversation,
                      messages:
                        conversation.messages.map(
                          (message) =>
                            message.id ===
                              assistantMessageId
                              ? {
                                ...message,
                                content:
                                  streamedResponse,
                              }
                              : message
                        ),
                    }
                    : conversation
              )
          );
        },
        controller.signal
      );

      /*
       * Build final conversation.
       */

      const finalMessages = [
        ...previousMessages,
        updatedUserMessage,
        {
          id: assistantMessageId,
          role: "assistant",
          content: streamedResponse,
        },
      ];

      /*
       * Save to Supabase.
       */

      await updateConversation(
        activeConversationId,
        {
          messages: finalMessages,
        }
      );

      /*
       * Make sure UI contains the
       * final saved response.
       */

      setConversations(
        (previousConversations) =>
          previousConversations.map(
            (conversation) =>
              conversation.id ===
                activeConversationId
                ? {
                  ...conversation,
                  messages: finalMessages,
                }
                : conversation
          )
      );
    } catch (error) {
      /*
       * Stopping generation is intentional,
       * so don't show an error message.
       */

      if (error.name === "AbortError") {
        console.log(
          "Edited response stopped by user."
        );

        return;
      }

      console.error(
        "Edited message error:",
        error
      );
    } finally {
      setIsLoading(false);

      abortControllerRef.current = null;
    }
  };

  /*
   * Suggestion card
   */

  const handleSuggestionClick = (prompt) => {
    handleSendMessage(prompt);
  };

  /*
   * Select conversation
   */

  const handleSelectConversation = (
    conversationId
  ) => {
    setActiveConversationId(conversationId);
    setSidebarOpen(false);
  };

  /*
   * Rename conversation
   */

  const handleRenameConversation = async (
    conversationId,
    newTitle
  ) => {
    try {
      const updatedConversation =
        await updateConversation(
          conversationId,
          {
            title: newTitle,
          }
        );

      setConversations(
        (previousConversations) =>
          previousConversations.map(
            (conversation) =>
              conversation.id ===
                conversationId
                ? updatedConversation
                : conversation
          )
      );
    } catch (error) {
      console.error(
        "Failed to rename conversation:",
        error
      );
    }
  };

  /*
   * Delete conversation
   */

  const handleDeleteConversation = async (
    conversationId
  ) => {
    try {
      await deleteConversation(
        conversationId
      );

      setConversations(
        (previousConversations) =>
          previousConversations.filter(
            (conversation) =>
              conversation.id !== conversationId
          )
      );

      if (
        activeConversationId ===
        conversationId
      ) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error(
        "Failed to delete conversation:",
        error
      );
    }
  };

  /*
   * Clear all conversations
   */

  const handleClearConversations = async () => {
    const shouldClear = window.confirm(
      "Are you sure you want to delete all conversations?"
    );

    if (!shouldClear) return;

    try {
      await deleteAllConversations(user.id);

      setConversations([]);
      setActiveConversationId(null);
    } catch (error) {
      console.error(
        "Failed to clear conversations:",
        error
      );
    }
  };

  /*
   * Loading authentication
   */

  if (loading) {
    return (
      <div className="auth-loading">
        Loading AIVerse...
      </div>
    );
  }

  /*
   * Show authentication page
   */

  if (!user) {
    return <AuthPage />;
  }

  /*
   * Loading conversations
   */

  if (conversationsLoading) {
    return (
      <div className="auth-loading">
        Loading your conversations...
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
        onSettings={() =>
          setSettingsOpen(true)
        }
        onAccount={() =>
          setAccountOpen(true)
        }
      />

      <div className="app-layout">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onClearConversations={handleClearConversations}
          onSettings={() => setSettingsOpen(true)}
          onAccount={() => setAccountOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main-content">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={
                handleSuggestionClick
              }
            />
          ) : (
            <ChatWindow
              messages={messages}
              onRegenerate={handleRegenerate}
              onEdit={handleEdit}
              isLoading={isLoading}
            />
          )}

          <div className="input-container">
            <MessageInput
              onSend={handleSendMessage}
              disabled={isLoading}
              onStop={handleStopGenerating}
              enterToSend={enterToSend}
            />

            <p className="disclaimer">
              AIVerse can make mistakes. Check
              important information.
            </p>
          </div>
        </main>
      </div>

      {settingsOpen && (
        <SettingsPanel
          theme={theme}
          onThemeChange={setTheme}
          onClose={() =>
            setSettingsOpen(false)
          }
          enterToSend={enterToSend}
          onEnterToSendChange={setEnterToSend}
        />
      )}

      {accountOpen && (
        <AccountPanel
          onClose={() => setAccountOpen(false)}
        />
      )}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}
    </div>
  );
}

export default App;