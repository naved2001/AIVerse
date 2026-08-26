import { useEffect, useRef } from "react";

import ChatMessage from "./ChatMessage";

function ChatWindow({ messages, onRegenerate, isLoading, onEdit }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
          isLoading={isLoading}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;