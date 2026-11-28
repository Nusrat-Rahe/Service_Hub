"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { apiRequest } from "@/lib/api";
import styles from "./HubBot.module.css";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: Message = {
  id: 0,
  role: "assistant",
  content: "Hi! I'm HubBot. How can I help you today?",
};

export default function HubBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(1);

  useEffect(() => {
    if (isOpen && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [error, isOpen, isSending, messages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const userMessage: Message = {
      id: nextMessageId.current,
      role: "user",
      content,
    };
    nextMessageId.current += 1;
    const previousMessages = messages.filter((message) => message.id !== 0);
    const conversation = [...previousMessages, userMessage].slice(-3);
    setMessages((current) => [...current, userMessage].slice(-50));
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const { reply } = await apiRequest<{ reply: string }>("/api/chatbot", {
        method: "POST",
        body: JSON.stringify({
          messages: conversation.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent.slice(-2000),
          })),
        }),
      });
      setMessages((current) => [
        ...current,
        { id: nextMessageId.current++, role: "assistant", content: reply },
      ]);
    } catch (requestError) {
      setMessages((current) =>
        current.filter((message) => message.id !== userMessage.id),
      );
      setInput(content);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "HubBot could not connect. Please try again or contact support.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") setIsOpen(false);
  }

  return (
    <div className={styles.root}>
      {isOpen && (
        <section
          aria-label="HubBot customer support chat"
          className={styles.panel}
          onKeyDown={handlePanelKeyDown}
          role="dialog"
        >
          <header className={styles.header}>
            <span className={styles.avatar} aria-hidden="true">
              <Bot size={21} />
            </span>
            <div className={styles.headerCopy}>
              <strong>HubBot</strong>
              <span>ServiceHub assistant</span>
            </div>
            <button
              aria-label="Close HubBot chat"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X size={19} />
            </button>
          </header>

          <div
            aria-busy={isSending}
            aria-live="polite"
            className={styles.messages}
            ref={messageListRef}
          >
            {messages.map((message) => (
              <div
                className={`${styles.messageRow} ${
                  message.role === "user" ? styles.userRow : styles.assistantRow
                }`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <span className={styles.messageAvatar} aria-hidden="true">
                    <Bot size={15} />
                  </span>
                )}
                <p
                  className={`${styles.bubble} ${
                    message.role === "user" ? styles.userBubble : styles.assistantBubble
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isSending && (
              <div aria-label="HubBot is typing" className={styles.messageRow}>
                <span className={styles.messageAvatar} aria-hidden="true">
                  <Bot size={15} />
                </span>
                <div className={styles.typing} role="status">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {error && (
              <div className={styles.errorMessage} role="alert">
                <p>{error}</p>
                <Link href="/help-center" onClick={() => setIsOpen(false)}>
                  Visit the Help Center
                </Link>
              </div>
            )}
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <label className={styles.srOnly} htmlFor="hubbot-message">
              Message HubBot
            </label>
            <input
              autoComplete="off"
              id="hubbot-message"
              autoFocus
              maxLength={2000}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about services or booking..."
              value={input}
            />
            <button
              aria-label="Send message"
              className={styles.sendButton}
              disabled={!input.trim() || isSending}
              type="submit"
            >
              <Send size={17} />
            </button>
          </form>
          <p className={styles.disclaimer}>
            Messages go to Google Gemini. Don&apos;t share passwords or payment details.
            Check availability in the booking calendar.
          </p>
        </section>
      )}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close HubBot chat" : "Chat with HubBot"}
        className={styles.launcher}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? <X size={23} /> : <MessageCircle size={24} />}
        {!isOpen && <span className={styles.launcherLabel}>Ask HubBot</span>}
      </button>
    </div>
  );
}
