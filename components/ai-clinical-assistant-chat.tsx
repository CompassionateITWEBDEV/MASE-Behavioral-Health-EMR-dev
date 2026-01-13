"use client";

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIClinicalAssistantChatProps {
  patientId: string;
  specialtyId?: string;
  onClose: () => void;
}

/**
 * AIClinicalAssistantChat
 * A simple chat interface for interacting with the AI assistant.
 * Displays the conversation history and allows the user to send messages.
 */
export default function AIClinicalAssistantChat({
  patientId,
  specialtyId = "primary-care",
  onClose,
}: AIClinicalAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant" as const,
      content: "Hello! How can I assist you with this patient today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user" as const, content },
    ];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          specialtyId,
          messages: updatedMessages,
        }),
      });
      const data = await response.json();
      setMessages([
        ...updatedMessages,
        { role: "assistant" as const, content: data.answer || "(No response)" },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: "Sorry, an error occurred. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg whitespace-pre-wrap ${
              msg.role === "assistant" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="p-3 bg-gray-100 text-gray-500 rounded-lg">
            Generating response...
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your question..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring"
        />
        <button
          onClick={sendMessage}
          disabled={loading || input.trim().length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <button
        onClick={onClose}
        className="mt-2 text-sm text-gray-500 underline self-start"
      >
        Close Chat
      </button>
    </div>
  );
}