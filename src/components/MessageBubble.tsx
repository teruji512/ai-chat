import type { Message } from "@/types/chat";
import CharacterAvatar from "./CharacterAvatar";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: Props) {
  const isAssistant = message.role === "assistant";
  const isThinking = isStreaming && isAssistant && message.content === "";

  return (
    <div className={`flex items-end gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && <CharacterAvatar />}
      <div
        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          message.isError
            ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-bl-sm"
            : isAssistant
            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm"
            : "bg-rose-400 text-white rounded-br-sm"
        }`}
      >
        {isThinking ? (
          <span className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" />
          </span>
        ) : (
          <>
            {message.content}
            {isStreaming && isAssistant && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
