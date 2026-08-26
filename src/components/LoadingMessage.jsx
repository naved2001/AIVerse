import { Bot } from "lucide-react";

function LoadingMessage() {
  return (
    <div className="chat-message ai-message">
      <div className="message-avatar">
        <Bot size={18} />
      </div>

      <div className="message-content">
        <div className="message-role">AIVerse</div>

        <div className="loading-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default LoadingMessage;