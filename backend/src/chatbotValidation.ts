export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const maximumMessages = 11;
const maximumMessageLength = 2000;
const maximumConversationLength = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeMessage(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function parseChatMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximumMessages) {
    return null;
  }

  const messages: ChatMessage[] = [];
  let totalLength = 0;
  for (let index = 0; index < value.length; index += 1) {
    const message = value[index];
    if (
      !isRecord(message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string"
    ) {
      return null;
    }

    const content = sanitizeMessage(message.content);
    if (!content || content.length > maximumMessageLength) return null;
    if (message.role !== (index % 2 === 0 ? "user" : "assistant")) return null;
    totalLength += content.length;
    if (totalLength > maximumConversationLength) return null;
    messages.push({ role: message.role, content });
  }

  return messages.at(-1)?.role === "user" ? messages : null;
}
