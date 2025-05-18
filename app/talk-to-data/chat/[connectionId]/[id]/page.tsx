"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Settings,
  Share2,
  Activity,
  MoreVertical,
  Play,
} from "lucide-react";
import Image from "next/image";
import {
  useDatabaseList,
  useSelectedDatabase,
} from "@/contexts/database-context";
import { aiAgentServices } from "@/lib/services/ai-agent";
import { databaseService } from "@/lib/services/database.service";
import Role from "@/app/enums/role";
import { FormattedMessage } from "@/components/common/formatted-message";
import { useParams } from "next/navigation";
import { sqlQueriesService } from "@/lib/services/sql-queries";

interface Message {
  role: Role;
  content: string;
}

interface ChatMessage extends Message {
  id: number;
  timestamp: Date;
}

interface ChatOptions {
  table_name: string;
  columns?: string[];
  filter: string;
  limit: number;
}

interface ChatRequest {
  database_server_connection_id: string | undefined;
  options: ChatOptions;
  user_message: string;
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

// Add new interface for selected items
interface SelectedItems {
  tableName: string;
  columns: string[];
}

interface SidePanel {
  isOpen: boolean;
  type: "history" | "configure" | "monitoring" | "share" | "menu" | null;
}

interface QueryResultColumn {
  name: string;
  type: string;
}

interface QueryExecutionResult {
  id: string;
  executed_query: string;
  execution_result: string;
  execution_status: boolean;
  error_message: string;
  execution_time_ms: number;
  user_id: string;
  database_id: string;
  created_at: string;
  result: {
    columns: QueryResultColumn[];
    rows: any[][];
    row_count: number;
    execution_time_ms: number;
  };
}

interface QueryResult {
  executionResult: QueryExecutionResult;
  error?: string;
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
      <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
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

const GenQueryAiChat = ({
  isOpen,
  onClose,
  selectedDatabaseId,
}: AiAgentProps) => {
  const params = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const { databases, fetchTableColumns } = useDatabaseList();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    tableName: "",
    columns: [],
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>({
    isOpen: false,
    type: null,
  });
  const [queryResults, setQueryResults] = useState<{
    [key: string]: QueryResult;
  }>({});
  const [activeContent, setActiveContent] = useState<{
    [key: string]: "none" | "description" | "code";
  }>({});

  const selectedDatabase = params.id;
  const selectedConnection = params.connectionId;

  // Create a memoized list of database items from the context
  const databaseItems = useMemo(() => {
    if (!selectedDatabase || !selectedDatabase.tables) return [];

    const items: DropdownItem[] = [];

    // Add tables
    selectedDatabase.tables.forEach((table) => {
      items.push({
        id: `table-${table.name}`,
        label: table.name,
        icon: <Table className="w-4 h-4" />,
        type: "table",
        schema: table.schema || "public",
      });

      // Add columns for each table
      if (table.columns) {
        table.columns.forEach((column) => {
          items.push({
            id: `column-${table.name}-${column.name}`,
            label: `${column.name} (${column.data_type})`,
            icon: <Columns className="w-4 h-4" />,
            type: "column",
            parentTable: table.name,
            schema: table.schema || "public",
          });
        });
      }
    });

    return items;
  }, [selectedDatabase]);

  // Fetch tables when database changes
  useEffect(() => {
    const shouldFetchTables =
      selectedDatabase &&
      (!selectedDatabase.tables || selectedDatabase.tables.length === 0);

    if (shouldFetchTables) {
      fetchTableColumns(selectedDatabase.id);
    }
  }, [selectedDatabase?.id]); // Only depend on the database ID

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: 1,
      text: "Write a select query to get all users?",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
    {
      id: 2,
      text: "How can I create a Live Table?",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
    {
      id: 3,
      text: "Show me the schema of users table",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
    {
      id: 4,
      text: "Generate a query to find active users",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
    {
      id: 5,
      text: "Help me write a complex join query",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
    {
      id: 6,
      text: "How to filter data by date range?",
      icon: <Sparkles className="w-4 h-4 text-primary-600" />,
    },
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  const extractAndExecuteSQL = async (content: string) => {
    const sqlMatches = content.match(/```sql\n([\s\S]*?)```/g);
    if (!sqlMatches) return null;

    const results: { [key: string]: QueryResult } = {};

    for (const match of sqlMatches) {
      const sql = match
        .replace(/```sql\n/, "")
        .replace(/```$/, "")
        .trim();
      try {
        const response = await sqlQueriesService.executeSQLQuery({
          query_text: sql,
          database_id: selectedDatabase || "",
          params: {},
        });

        results[sql] = {
          executionResult: response,
        };
      } catch (error) {
        console.error("Error executing SQL:", error);
        results[sql] = {
          executionResult: {
            id: "",
            executed_query: sql,
            execution_result: "",
            execution_status: false,
            error_message:
              error instanceof Error
                ? error.message
                : "Failed to execute query",
            execution_time_ms: 0,
            user_id: "",
            database_id: selectedDatabase || "",
            created_at: new Date().toISOString(),
            result: {
              columns: [],
              rows: [],
              row_count: 0,
              execution_time_ms: 0,
            },
          },
          error:
            error instanceof Error ? error.message : "Failed to execute query",
        };
      }
    }

    return results;
  };

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
      const payload: ChatRequest = {
        database_server_connection_id: selectedConnection || "",
        options: {
          table_name: selectedItems.tableName,
          columns:
            selectedItems.columns.length > 0
              ? selectedItems.columns
              : undefined,
          filter: "",
          limit: 100,
        },
        user_message: text,
      };

      const response = await aiAgentServices.sendMessage(
        payload,
        currentConversationId || undefined
      );

      if (response) {
        const newAssistantMessage: ChatMessage = {
          id: messages.length + 2,
          role: response.role as Role,
          content: response.content,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newAssistantMessage]);

        // Extract and execute SQL if present
        const results = await extractAndExecuteSQL(response.content);
        if (results) {
          setQueryResults((prev) => ({ ...prev, ...results }));
        }

        if (!currentConversationId && response.conversation_id) {
          setCurrentConversationId(response.conversation_id);
        }
      }

      setSelectedItems({ tableName: "", columns: [] });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          role: Role.ASSISTANT,
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.includes("@")) {
      const searchTerm = value.split("@").pop()?.toLowerCase() || "";
      updateFilteredItems(searchTerm);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const updateFilteredItems = (searchTerm: string = "") => {
    const filtered = databaseItems.filter((item) => {
      if (searchTerm.includes(".")) {
        // If searching for columns with table prefix (e.g., @table.column)
        const [tableSearch, columnSearch] = searchTerm.split(".");
        return (
          item.type === "column" &&
          item.parentTable?.toLowerCase().includes(tableSearch) &&
          item.label.toLowerCase().includes(columnSearch)
        );
      } else {
        // Regular search across all items
        return (
          item.label.toLowerCase().includes(searchTerm) ||
          (item.type === "column" &&
            item.parentTable?.toLowerCase().includes(searchTerm))
        );
      }
    });
    setFilteredItems(filtered);
  };

  const handleAtButtonClick = () => {
    if (buttonRef.current) {
      updateFilteredItems();
      setShowDropdown(true);
    }
  };

  const handleItemSelect = (item: DropdownItem) => {
    const parts = inputMessage.split("@");
    const prefix = parts.slice(0, -1).join("@");
    const insertText =
      item.type === "column" && item.parentTable
        ? `${item.parentTable}.${item.label.split(" ")[0]}` // Extract column name without type
        : item.label;
    const newValue = `${prefix}${insertText} `;
    setInputMessage(newValue);
    setShowDropdown(false);
    inputRef.current?.focus();

    // Update selected items based on selection
    if (item.type === "table") {
      setSelectedItems((prev) => ({
        ...prev,
        tableName: item.label,
      }));
    } else if (item.type === "column") {
      setSelectedItems((prev) => ({
        ...prev,
        columns: [...prev.columns, item.label.split(" ")[0]], // Extract column name without type
      }));
    }
  };

  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await aiAgentServices.getChatHistory();
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

  const handlePanelOpen = (type: SidePanel["type"]) => {
    setSidePanel({ isOpen: true, type });
    if (type === "history") {
      fetchChatHistory();
    }
  };

  const handlePanelClose = () => {
    setSidePanel({ isOpen: false, type: null });
  };

  const renderQueryResult = (sql: string, result: QueryResult) => {
    const { executionResult } = result;

    if (!executionResult.execution_status || result.error) {
      return (
        <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {result.error || executionResult.error_message}
        </div>
      );
    }

    return (
      <div className="mt-2">
        {/* Execution Stats */}
        <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
          <span>Rows: {executionResult.result.row_count}</span>
          <span>•</span>
          <span>
            Time: {(executionResult.result.execution_time_ms / 1000).toFixed(2)}
            s
          </span>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {executionResult.result.columns.map((column, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group"
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.name}</span>
                      <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ({column.type})
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executionResult.result.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {cell?.toString() || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const toggleContent = (
    messageId: number,
    sql: string,
    type: "description" | "code"
  ) => {
    setActiveContent((prev) => ({
      ...prev,
      [`${messageId}-${sql}`]:
        prev[`${messageId}-${sql}`] === type ? "none" : type,
    }));
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative h-[calc(100vh-65px)] transition-all duration-300 ease-in-out z-50 overflow-hidden">
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setConversationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      <div className="p-4 h-full flex max-w-[calc(100vw-186px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">New Chat 1</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNewChat()}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                New Chat
              </button>
              <button
                onClick={() => handlePanelOpen("history")}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => handlePanelOpen("configure")}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button
                onClick={() => handlePanelOpen("monitoring")}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Activity className="w-4 h-4" />
                Monitoring
              </button>
              <button
                onClick={() => handlePanelOpen("share")}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => handlePanelOpen("menu")}
                className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Panel */}
          {sidePanel.isOpen && (
            <div className="absolute right-4 top-16 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 capitalize">
                    {sidePanel.type}
                  </h3>
                  <button
                    onClick={handlePanelClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {sidePanel.type === "history" && (
                  <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {chatHistory.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="group relative bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer"
                      >
                        <button
                          onClick={() => loadConversation(conversation)}
                          className="w-full p-3 text-left"
                        >
                          {/* First Message */}
                          <div className="flex items-start gap-2">
                            <div className="p-1 bg-primary-50 rounded">
                              <MessageSquare className="w-4 h-4 text-primary-600" />
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
                                <span className="text-xs text-primary-400">
                                  •
                                </span>
                                <span className="text-xs text-gray-400">
                                  {conversation.messages.length} messages
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) =>
                            deleteConversation(conversation.id, e)
                          }
                          className="absolute right-2 top-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Add other panel content based on type */}
              </div>
            </div>
          )}

          {showHistory ? (
            // Chat History View
            <div className="flex-1 flex flex-col min-h-0">
              {/* History Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary-600" />
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
                    <Bot className="w-5 h-5 text-primary-600 animate-spin" />
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
                        className="group relative bg-white rounded-lg border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer"
                      >
                        <button
                          onClick={() => loadConversation(conversation)}
                          className="w-full p-3 text-left"
                        >
                          {/* First Message */}
                          <div className="flex items-start gap-2">
                            <div className="p-1 bg-primary-50 rounded">
                              <MessageSquare className="w-4 h-4 text-primary-600" />
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
                                <span className="text-xs text-primary-400">
                                  •
                                </span>
                                <span className="text-xs text-gray-400">
                                  {conversation.messages.length} messages
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) =>
                            deleteConversation(conversation.id, e)
                          }
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
            <div className="flex-1 flex flex-col justify-center overflow-y-auto">
              <p className="text-sm text-gray-500 mb-8 max-w-[80%] flex-shrink-0">
                The Assistant can make mistakes, always review the accuracy of
                responses.
              </p>
              {/* Suggested Questions */}
              <div className="max-w-[800px] space-y-3 flex-shrink-0">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSendMessage(question.text)}
                    className="mr-2 inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-primary-200 hover:bg-primary-50 transition-colors text-gray-700 text-sm"
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
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0"
                ref={messagesContainerRef}
              >
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
                            ? "bg-primary-100 text-primary-600"
                            : "bg-gray-200"
                        }`}
                      >
                        {message.role === Role.USER && (
                          <FormattedMessage
                            content={message.content}
                            isDark={message.role === Role.USER}
                          />
                        )}
                        {message.role === Role.ASSISTANT &&
                          Object.entries(queryResults).map(([sql, result]) => {
                            if (message.content.includes(sql)) {
                              const contentKey = `${message.id}-${sql}`;
                              const activeTab =
                                activeContent[contentKey] || "none";

                              return (
                                <div key={sql} className="mt-4">
                                  {/* Links */}
                                  <div className="flex gap-3 mb-3 text-sm">
                                    <button
                                      onClick={() =>
                                        toggleContent(message.id, sql, "code")
                                      }
                                      className={`flex items-center gap-1 ${
                                        activeTab === "code"
                                          ? "text-primary-600 font-medium"
                                          : "text-gray-500 hover:text-gray-700"
                                      }`}
                                    >
                                      <span>
                                        {activeTab === "code"
                                          ? "Hide Code"
                                          : "Show Code"}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Description Content */}
                                  {activeTab === "description" && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                      {message.content}
                                    </div>
                                  )}

                                  {/* Code Content */}
                                  {activeTab === "code" && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                        {result.executionResult
                                          .executed_query ||
                                          "No code available"}
                                      </pre>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Code className="w-4 h-4 text-primary-600" />
                                      <span className="text-sm font-medium">
                                        Query Result
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleSendMessage(`Execute: ${sql}`)
                                      }
                                      className="p-1 hover:bg-primary-50 rounded transition-colors"
                                      title="Re-run query"
                                    >
                                      <Play className="w-4 h-4 text-primary-600" />
                                    </button>
                                  </div>
                                  {renderQueryResult(sql, result)}
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-600 animate-pulse" />
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
              <div className="relative">
                {/* <button
                ref={buttonRef}
                onClick={handleAtButtonClick}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-500 text-sm font-medium">@</span>
              </button> */}
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type @ for tables and columns"
                  className="w-full px-2 py-3 text-sm border border-gray-200 rounded-lg pr-10 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 resize-none overflow-hidden"
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
                      : "text-primary-600 hover:bg-primary-50 border border-primary-200"
                  }`}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenQueryAiChat;
