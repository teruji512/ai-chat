import Anthropic from "@anthropic-ai/sdk";
import { CHARACTER } from "@/lib/character";
import type { Message } from "@/types/chat";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("messages is required", { status: 400 });
    }

    const validRoles = new Set(["user", "assistant"]);
    const allValid = messages.every(
      (m) =>
        validRoles.has(m.role) &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    );
    if (!allValid) {
      return new Response("invalid message format", { status: 400 });
    }

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: CHARACTER.systemPrompt,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });

    return new Response(stream.toReadableStream());
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return new Response(error.message, { status: error.status });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
