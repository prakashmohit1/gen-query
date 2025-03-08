"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Code,
  Database,
  X,
  Send,
  Table,
  Columns,
  History,
  MessageSquare,
  Search,
  Trash2,
  PlusIcon,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useSelectedDatabase } from "@/contexts/database-context";
import { aiAgentServices } from "@/lib/services/ai-agent";
import { databaseService } from "@/lib/services/database.service";
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

interface ChatConversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface AiAgentProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDatabaseId?: string;
}

interface DropdownItem {
  id: string;
  label: string;
  icon: JSX.Element;
  type: "table" | "column";
  parentTable?: string;
  schema?: string;
}

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Conversation
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this conversation? This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AiAgent = ({ isOpen, onClose, selectedDatabaseId }: AiAgentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [databaseItems, setDatabaseItems] = useState<DropdownItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const { selectedConnection } = useSelectedDatabase();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

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

  useEffect(() => {
    const fetchDatabaseItems = async () => {
      if (!selectedConnection) return;

      try {
        const tablesData = await databaseService.getDatabaseTables(
          selectedConnection.id,
          selectedConnection.db_type
        );

        if (!tablesData?.rows) return;

        const items: DropdownItem[] = [];
        const processedTables = new Set<string>();

        // Process the rows to group by table
        tablesData.rows.forEach((row) => {
          const tableName = row[0]; // table_name
          const columnName = row[1]; // column_name
          const dataType = row[2]; // data_type
          const schemaName = row.length > 3 ? row[3] : "default"; // schema name if available

          // Add table if not already added
          if (!processedTables.has(tableName)) {
            items.push({
              id: `table-${tableName}`,
              label: tableName,
              icon: <Table className="w-4 h-4" />,
              type: "table",
              schema: schemaName,
            });
            processedTables.add(tableName);
          }

          // Add column
          items.push({
            id: `column-${tableName}-${columnName}`,
            label: columnName,
            icon: <Columns className="w-4 h-4" />,
            type: "column",
            parentTable: tableName,
            schema: schemaName,
          });
        });

        // Sort items: first by schema, then by table name
        items.sort((a, b) => {
          if (a.schema !== b.schema) {
            return (a.schema || "").localeCompare(b.schema || "");
          }
          if (a.type !== b.type) {
            return a.type === "table" ? -1 : 1;
          }
          return a.label.localeCompare(b.label);
        });

        setDatabaseItems(items);
      } catch (error) {
        console.error("Error fetching database items:", error);
      }
    };

    fetchDatabaseItems();
  }, [selectedConnection]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

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
      const updatedMessages = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: Role.USER, content: text },
      ];

      const response = await aiAgentServices.sendMessage(
        {
          database_connection_id: selectedConnection?.id,
          messages: updatedMessages,
        },
        currentConversationId || undefined
      );

      // Add assistant's response to the messages
      if (response.messages) {
        const newMessages = [
          ...messages,
          newUserMessage,
          {
            id: messages.length + 2,
            role: Role.ASSISTANT,
            content: response.messages.slice(-1)[0].content,
            timestamp: new Date(),
          },
        ];

        setMessages(newMessages);

        // If this was a new conversation (POST), set the conversation ID from response
        if (!currentConversationId && response.id) {
          setCurrentConversationId(response.id);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.includes("@")) {
      setShowDropdown(true);
      // Get the text after the last @ symbol
      const searchText = value.split("@").pop()?.toLowerCase() || "";

      // Filter items based on search text
      const filtered = databaseItems.filter((item) => {
        if (searchText === "") return true;
        if (item.type === "table") {
          return item.label.toLowerCase().includes(searchText);
        } else {
          // For columns, show them only if their table or column name matches
          return (
            item.label.toLowerCase().includes(searchText) ||
            (item.parentTable &&
              item.parentTable.toLowerCase().includes(searchText))
          );
        }
      });

      setFilteredItems(filtered);
    } else {
      setShowDropdown(false);
    }
  };

  const handleItemSelect = (item: DropdownItem) => {
    const parts = inputMessage.split("@");
    const prefix = parts.slice(0, -1).join("@");
    const insertText =
      item.type === "column"
        ? `"${item.parentTable}.${item.label}"`
        : `"${item.label}"`;
    const newValue = `${prefix}${insertText} `;
    setInputMessage(newValue);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await aiAgentServices.getChatHistory();
      console.log("data", data);
      setChatHistory(data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadConversation = async (conversation: ChatConversation) => {
    const formattedMessages = conversation.messages.map((msg, index) => ({
      id: index + 1,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
    }));
    setMessages(formattedMessages);
    setCurrentConversationId(conversation.id);
    setShowHistory(false);
  };

  const deleteConversation = async (
    conversationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setConversationToDelete(conversationId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await aiAgentServices.deleteConversation(conversationToDelete);

      // Update local state to remove the deleted conversation
      setChatHistory((prev) =>
        prev.filter((conv) => conv.id !== conversationToDelete)
      );

      // If the deleted conversation was the current one, reset the chat
      if (currentConversationId === conversationToDelete) {
        setMessages([]);
        setCurrentConversationId(null);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // Show error message to user
      alert("Failed to delete conversation. Please try again.");
    } finally {
      setShowDeleteConfirmation(false);
      setConversationToDelete(null);
    }
  };

  // Reset conversation when starting new chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  // Update the history button click handler
  const handleHistoryClick = () => {
    fetchChatHistory();
    setShowHistory(true);
  };

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  return (
    <div
      className={`relative top-[65px] right-0 h-[calc(100vh-65px)] bg-white shadow-lg transition-all duration-300 ease-in-out z-50 overflow-hidden ${
        isOpen ? "w-80" : "w-0"
      }`}
    >
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="p-4 h-full flex flex-col w-80">
        {showHistory ? (
          // Chat History View
          <div className="flex-1 flex flex-col min-h-0">
            {/* History Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-medium text-gray-900">
                  Chat History
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Bot className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">
                    Loading conversations...
                  </span>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="group relative bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer"
                    >
                      <button
                        onClick={() => loadConversation(conversation)}
                        className="w-full p-3 text-left"
                      >
                        {/* First Message */}
                        <div className="flex items-start gap-2">
                          <div className="p-1 bg-purple-50 rounded">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.messages[0]?.content}
                            </p>

                            {/* Last Response Preview */}
                            {conversation.messages.length > 1 && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {
                                  conversation.messages[
                                    conversation.messages.length - 1
                                  ]?.content
                                }
                              </p>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(
                                  conversation.created_at
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  conversation.created_at
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-xs text-purple-400">•</span>
                              <span className="text-xs text-gray-400">
                                {conversation.messages.length} messages
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        className="absolute right-2 top-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : messages.length === 0 ? (
          // Empty State - Initial View
          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
            <div className="absolute top-0 right-0 p-2">
              <button
                onClick={handleHistoryClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="w-16 h-16 mb-6 flex-shrink-0">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-lg transform rotate-45"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex-shrink-0">
              Gen Query Assistant
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[80%] flex-shrink-0">
              The Assistant can make mistakes, always review the accuracy of
              responses.
            </p>
            {/* Suggested Questions */}
            <div className="flex flex-col items-center space-y-3 flex-shrink-0">
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
        ) : (
          // Chat View
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="New Chat"
                >
                  <PlusIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleHistoryClick}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <History className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === Role.USER
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === Role.USER ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === Role.USER
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200"
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

        {/* Input Area - Only shown when chat history is not open */}
        {!showHistory && (
          <div className="relative flex-shrink-0 mt-auto">
            {showDropdown && (
              <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mb-1 max-h-[300px] overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-700">
                    Tables
                  </div>
                </div>
                <div className="py-0.5">
                  {/* Tables Section */}
                  {filteredItems
                    .filter((item) => item.type === "table")
                    .map((table) => (
                      <button
                        key={table.id}
                        onClick={() => handleItemSelect(table)}
                        className="w-full px-3 py-1 text-left flex items-center hover:bg-gray-50 text-sm group"
                      >
                        <Table className="w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {table.label}
                        </span>
                        {table.schema && (
                          <span className="ml-2 text-gray-500 text-xs">
                            {table.schema}
                          </span>
                        )}
                      </button>
                    ))}
                </div>

                <div className="sticky top-0 bg-gray-50 px-3 py-1.5 border-y border-gray-200">
                  <div className="text-sm font-medium text-gray-700">
                    Columns
                  </div>
                </div>
                <div className="py-0.5">
                  {/* Columns Section */}
                  {filteredItems
                    .filter((item) => item.type === "column")
                    .map((column) => (
                      <button
                        key={column.id}
                        onClick={() => handleItemSelect(column)}
                        className="w-full px-3 py-1 text-left flex items-center hover:bg-gray-50 text-sm group"
                      >
                        <Columns className="w-4 h-4 mr-2 text-gray-400 group-hover:text-gray-600" />
                        <span className="text-gray-900">{column.label}</span>
                        <span className="ml-auto text-gray-500 text-xs">
                          {column.parentTable}
                        </span>
                      </button>
                    ))}
                  {filteredItems.length === 0 && (
                    <div className="px-3 py-1 text-sm text-gray-500">
                      No matching tables or columns found
                    </div>
                  )}
                </div>
              </div>
            )}
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="@ for objects or / for commands"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg pr-10 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none overflow-hidden"
              disabled={isLoading}
              rows={1}
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                !inputMessage.trim() || isLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-purple-600 hover:bg-purple-50 border border-purple-200"
              }`}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAgent;
