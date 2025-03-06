"use client";

import { useState } from "react";
import { Bot, Sparkles, Code, Database, X, Send } from "lucide-react";
import Image from "next/image";
import { useSelectedDatabase } from "@/contexts/database-context";
import { aiAgentServices } from "@/lib/services/ai-agent";
import Role from "@/app/enums/role";
import { FormattedMessage } from "./formatted-message";

interface Message {
  role: Role;
  content: string;
}

interface ChatMessage extends Message {
  id: number;
  timestamp: Date;
}

interface SuggestedQuestion {
  id: number;
  text: string;
  icon: JSX.Element;
}

interface AiAgentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDatabaseId?: string;
}

const AiAgent = ({ isOpen, onClose, selectedDatabaseId }: AiAgentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedConnection } = useSelectedDatabase();

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: 1,
      text: "Write a select query?",
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 2,
      text: "How can I create a Live Table?",
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    },
  ];

  const handleSendMessage = async (text: string = inputMessage) => {
    if (!text.trim()) return;

    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      role: Role.USER,
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await aiAgentServices.sendMessage({
        database_connection_id: selectedConnection?.id,
        messages: [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: Role.USER, content: text },
        ],
      });

      // Add assistant's response to the messages
      if (response.messages) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 2,
            role: Role.ASSISTANT,
            content: response.messages.slice(-1)[0].content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`absolute top-[65px] right-0 h-[calc(100vh-65px)] w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 h-full flex flex-col">
        {messages.length === 0 ? (
          <>
            {/* Header - Only shown when no messages */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-6">
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-lg transform rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Gen Query Assistant
              </h2>
              <p className="text-sm text-gray-500 mb-8 text-center max-w-[80%]">
                The Assistant can make mistakes, always review the accuracy of
                responses.
              </p>
              {/* Suggested Questions */}
              <div className="flex flex-col items-center space-y-3">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSendMessage(question.text)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full border border-purple-200 hover:bg-purple-50 transition-colors text-gray-700 text-sm"
                  >
                    {question.icon}
                    <span>{question.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Chat interface - Shown after chat starts
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-lg transform rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Gen Query Assistant
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === Role.USER
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {message.role === Role.ASSISTANT && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div
                    className={`flex-1 ${
                      message.role === Role.USER ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === Role.USER
                          ? "bg-purple-600 text-white"
                          : ""
                      }`}
                    >
                      <FormattedMessage
                        content={message.content}
                        isDark={message.role === Role.USER}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
                  </div>
                  <p>Thinking...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area - Always shown */}
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="@ for objects or / for commands"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg pr-10 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:hover:text-gray-400"
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAgent;
