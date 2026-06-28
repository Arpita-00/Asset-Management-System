import React, { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Bot, Send, User, Sparkles, AlertCircle, Loader, Trash2, Calendar, Search, History, MessageSquare } from 'lucide-react'
import { aiApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'
import Markdown from '../../utils/markdown'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const SUGGESTED = [
  'Show me an asset summary',
  'Which warranties expire this month?',
  'How many assets are under repair?',
  'List available assets',
  'Which assets have low health score?',
  'Which assets should be replaced?',
  'Generate maintenance summary',
]

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'history'
  const { user } = useAuthStore()

  // ─── Chat View States ───────────────────────────────────────────────────────
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI Asset Management Assistant.\n\nI can help you with:\n- Finding available assets\n- Checking warranty expiration alerts\n- Viewing assets under repair\n- Smart replacement recommendations\n\nWhat would you like to know today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  const chatMutation = useMutation({
    mutationFn: (message) => aiApi.chat(message).then(r => r.data),
    onSuccess: (res) => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data?.message || res.message || 'Sorry, I could not process that query.',
        timestamp: new Date()
      }])
      // Refetch history list since a new message was stored
      refetchHistory()
    },
    onError: (err) => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Error: ' + getErrorMessage(err),
        timestamp: new Date(),
        isError: true
      }])
    }
  })

  const sendMessage = (text) => {
    const msg = text || input.trim()
    if (!msg || chatMutation.isLoading) return
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setInput('')
    chatMutation.mutate(msg)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ─── History View States & Handlers ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [historyPage, setHistoryPage] = useState(0)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setHistoryPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['ai-history', historyPage, debouncedSearch],
    queryFn: () => aiApi.getHistory(historyPage, 10, debouncedSearch).then(r => r.data.data),
    enabled: activeTab === 'history',
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id) => aiApi.deleteHistoryItem(id),
    onSuccess: () => {
      toast.success('Conversation log deleted')
      refetchHistory()
    },
    onError: (err) => {
      toast.error('Failed to delete: ' + getErrorMessage(err))
    }
  })

  const clearHistoryMutation = useMutation({
    mutationFn: () => aiApi.clearHistory(),
    onSuccess: () => {
      toast.success('Conversational history cleared')
      refetchHistory()
    },
    onError: (err) => {
      toast.error('Failed to clear: ' + getErrorMessage(err))
    }
  })

  const handleDeleteItem = (id, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation record?')) {
      deleteItemMutation.mutate(id)
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to permanently clear your entire chat history?')) {
      clearHistoryMutation.mutate()
    }
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-130px)]">
      
      {/* ─── Page Header with Tabs ───────────────────────────────────────────── */}
      <div className="page-header flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#7c0a0a] to-rose-500 shadow-md text-white">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="page-title">Enterprise AI Assistant</h1>
            <p className="page-subtitle flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              RAG Engine Connected &bull; Querying Live MySQL DB
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs select-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chat'
                ? 'bg-[#7c0a0a] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <MessageSquare size={13} />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'history'
                ? 'bg-[#7c0a0a] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <History size={13} />
            <span>Chat History</span>
          </button>
        </div>
      </div>

      {/* ─── Content Panels ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-4 min-h-0">
        
        {/* TAB 1: Chat Assistant Feed */}
        {activeTab === 'chat' && (
          <>
            {/* Messages Area */}
            <div className="flex-1 flex flex-col card overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                           style={{ background: msg.isError ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, #7c0a0a, #e11d48)' }}>
                        {msg.isError ? <AlertCircle size={15} className="text-red-400" /> : <Bot size={15} className="text-white" />}
                      </div>
                    )}
                    <div className={msg.role === 'user' ? 'chat-bubble-user max-w-[70%]' : 'chat-bubble-ai max-w-[85%] text-left'}>
                      {msg.role === 'ai' ? (
                        <Markdown content={msg.content} />
                      ) : (
                        <p className="text-xs leading-relaxed font-semibold">{msg.content}</p>
                      )}
                      <p className="text-[10px] mt-2 font-bold opacity-50 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow">
                        {user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                ))}

                {chatMutation.isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#7c0a0a] to-rose-500 shadow text-white">
                      <Bot size={15} />
                    </div>
                    <div className="chat-bubble-ai flex items-center gap-2">
                      <Loader size={12} className="animate-spin text-red-600 dark:text-rose-450" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">RAG Engine Querying MySQL database...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 border-t bg-slate-50/50 dark:bg-slate-950/20" style={{ borderColor: 'rgb(var(--border-color))' }}>
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AI (e.g. Which warranties expire soon? What available laptops are in stock?)..."
                    className="input flex-1 resize-none text-xs"
                    style={{ maxHeight: '120px' }}
                    maxLength={500}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || chatMutation.isLoading}
                    className="btn-primary p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center disabled:opacity-50"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-500 font-semibold select-none">
                  <span>{input.length}/500 Characters Max limit</span>
                  <span>Press <kbd className="px-1 py-0.5 rounded text-[9.5px] bg-slate-200 dark:bg-slate-800">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded text-[9.5px] bg-slate-200 dark:bg-slate-800">Shift+Enter</kbd> for new line</span>
                </div>
              </div>
            </div>

            {/* AI Suggested Prompts Sidebar */}
            <div className="w-64 flex-shrink-0 hidden xl:block">
              <div className="card p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-655 dark:text-slate-300">
                    Suggested Questions
                  </span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {SUGGESTED.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      disabled={chatMutation.isLoading}
                      className="w-full text-left text-xs p-3 rounded-lg border transition-all duration-150 bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#7c0a0a] dark:hover:border-rose-500 hover:text-[#7c0a0a] dark:hover:text-rose-400 font-bold"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Conversation Logs History lookup */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col card overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search past questions or answers..."
                  className="input pl-9 text-xs w-full"
                />
              </div>

              <button
                onClick={handleClearHistory}
                disabled={clearHistoryMutation.isLoading || (historyData?.rows?.length === 0)}
                className="btn-danger btn-sm text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 self-end"
              >
                <Trash2 size={13} />
                <span>Clear All Logs</span>
              </button>
            </div>

            {/* History Feed List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {historyLoading ? (
                <div className="py-12 text-center text-slate-500 font-bold flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin text-red-700" />
                  <span>Loading history logs...</span>
                </div>
              ) : historyData?.rows && historyData.rows.length > 0 ? (
                historyData.rows.map((log) => (
                  <div key={log.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Header info */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 select-none">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Session: {log.sessionId}
                        </span>
                        <span className="text-slate-400">
                          User: {user?.firstName} {user?.lastName} ({user?.username})
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteItem(log.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Delete record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Question / Answer */}
                    <div className="p-4 space-y-3 bg-white dark:bg-slate-950/20">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[9px] mt-0.5">
                          Q
                        </div>
                        <p className="text-[11.5px] font-black text-slate-800 dark:text-white leading-normal text-left">
                          {log.userMessage}
                        </p>
                      </div>

                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800/60 my-2" />

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded bg-gradient-to-tr from-[#7c0a0a] to-rose-500 text-white flex items-center justify-center font-bold text-[9px] mt-0.5">
                          A
                        </div>
                        <div className="flex-1 text-left min-w-0 text-xs">
                          <Markdown content={log.aiResponse} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 font-bold select-none">
                  No conversation logs found.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {historyData && historyData.count > 10 && (
              <div className="flex items-center justify-between border-t pt-3 border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 select-none">
                <span>
                  Showing {historyPage * 10 + 1} - {Math.min((historyPage + 1) * 10, historyData.count)} of {historyData.count} logs
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage(p => p - 1)}
                    className="pagination-btn disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={(historyPage + 1) * 10 >= historyData.count}
                    onClick={() => setHistoryPage(p => p + 1)}
                    className="pagination-btn disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
