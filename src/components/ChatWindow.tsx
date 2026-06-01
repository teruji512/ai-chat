"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";
import { CHARACTER } from "@/lib/character";
import MessageBubble from "./MessageBubble";
import CharacterAvatar from "./CharacterAvatar";

interface Props {
  messages: Message[];
  isStreaming: boolean;
}

export default function ChatWindow({ messages, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center gap-3 pt-12 text-center">
          <CharacterAvatar />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            こんにちは！{CHARACTER.name}です。<br />
            何でも気軽に話しかけてくださいね。
          </p>
        </div>
      )}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
