import { ArrowUp, Image as ImageIcon, X, Square, } from "lucide-react";
import { useRef, useState } from "react";

function MessageInput({ onSend, onStop, disabled, }) {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (
      (!trimmedMessage && !selectedImage) ||
      disabled
    ) {
      return;
    }

    onSend(trimmedMessage, selectedImage);

    setMessage("");
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSubmit(e);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      className="message-form"
      onSubmit={handleSubmit}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageSelect}
        disabled={disabled}
      />

      <button
        type="button"
        className="image-upload-button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={disabled}
        aria-label="Upload image"
      >
        <ImageIcon size={20} />
      </button>

      {selectedImage && (
        <div className="image-preview">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
          />

          <button
            type="button"
            className="remove-image-button"
            onClick={handleRemoveImage}
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "AIVerse is thinking..."
            : selectedImage
              ? "Ask AIVerse about this image..."
              : "Ask AIVerse anything..."
        }
        rows="1"
        disabled={disabled}
      />

      {disabled ? (
        <button
          type="button"
          className="stop-button"
          onClick={onStop}
          aria-label="Stop generating"
        >
          <Square size={15} />
        </button>
      ) : (
        <button
          type="submit"
          className="send-button"
          disabled={
            !message.trim() &&
            !selectedImage
          }
          aria-label="Send message"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </form>
  );
}

export default MessageInput;