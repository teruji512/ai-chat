"use client";

import { useState } from "react";
import type { Message } from "@/types/chat";
import { CHARACTER } from "@/lib/character";
import ChatWindow from "@/components/ChatWindow";
import InputForm from "@/components/InputForm";
import CharacterAvatar from "@/components/CharacterAvatar";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const assistantId = crypto.randomUUID();
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed) as {
              type: string;
              delta?: { type: string; text: string };
            };
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta"
            ) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.delta!.text }
                    : m
                )
              );
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "メッセージの送信に失敗しました。もう一度お試しください。", isError: true }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm shrink-0">
        <CharacterAvatar />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{CHARACTER.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isStreaming ? "入力中…" : "オンライン"}
          </p>
        </div>
        <button
          onClick={() => setMessages([])}
          disabled={isStreaming || messages.length === 0}
          className="ml-auto p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="会話をリセット"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </header>
      <ChatWindow messages={messages} isStreaming={isStreaming} />
      <InputForm onSend={sendMessage} isStreaming={isStreaming} />
    </main>
  );
}
