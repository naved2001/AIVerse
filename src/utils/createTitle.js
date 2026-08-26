export function createConversationTitle(message) {
  const cleanedMessage = message.replace(/\s+/g, " ").trim();

  if (cleanedMessage.length <= 20) {
    return cleanedMessage;
  }

  return `${cleanedMessage.slice(0, 20)}...`;
}