import { useState } from "react";
import { Bot, User, RotateCcw, Pencil, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import CodeBlock from "./CodeBlock";

function ChatMessage({ message, onRegenerate, isLoading, onEdit }) {

  const [isEditing, setIsEditing] = useState(false);

  const [editedContent, setEditedContent] = useState(message.content);

  const isUser = message.role === "user";

  const isGenerating = !isUser && message.content === "";

  const handleStartEdit = () => {
    setEditedContent(message.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const trimmedContent = editedContent.trim();

    if (!trimmedContent) return;

    setIsEditing(false);

    onEdit(message.id, trimmedContent);
  };


  return (
    <div
      className={`chat-message ${isUser ? "user-message" : "ai-message"
        }`}
    >
      <div className="message-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-content">
        <div className="message-role">
          {isUser ? "You" : "AIVerse"}
        </div>

        <div className="message-text">
          {isUser && isEditing ? (
            <div className="edit-message-container">
              <textarea
                value={editedContent}
                onChange={(e) =>
                  setEditedContent(e.target.value)
                }
                className="edit-message-input"
                autoFocus
                rows={3}
              />

              <div className="edit-message-actions">
                <button
                  type="button"
                  className="edit-cancel-button"
                  onClick={handleCancelEdit}
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="button"
                  className="edit-save-button"
                  onClick={handleSaveEdit}
                  disabled={
                    !editedContent.trim() ||
                    isLoading
                  }
                >
                  <Check size={15} />
                  Save & Resend
                </button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              <ReactMarkdown
                components={{
                  code({
                    inline,
                    className,
                    children,
                    ...props
                  }) {
                    const match =
                      /language-(\w+)/.exec(
                        className || ""
                      );

                    if (!inline && match) {
                      return (
                        <CodeBlock
                          language={match[1]}
                        >
                          {children}
                        </CodeBlock>
                      );
                    }

                    return (
                      <code
                        className={className}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {!isGenerating &&
                !isUser &&
                onRegenerate && (
                  <button
                    type="button"
                    className="regenerate-button"
                    onClick={() =>
                      onRegenerate(message.id)
                    }
                    disabled={isLoading}
                    aria-label="Regenerate response"
                  >
                    <RotateCcw size={15} />
                    <span>Regenerate</span>
                  </button>
                )}
            </>
          )}
        </div>
        {isUser &&
          !isEditing &&
          onEdit && (
            <button
              type="button"
              className="edit-message-button"
              onClick={handleStartEdit}
              disabled={isLoading}
              aria-label="Edit message"
            >
              <Pencil size={15} />
              <span>Edit</span>
            </button>
          )}
      </div>
    </div>
  );
}

export default ChatMessage;