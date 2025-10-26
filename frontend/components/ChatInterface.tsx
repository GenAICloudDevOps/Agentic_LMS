'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, CheckCircle } from 'lucide-react'
import { chatApi } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  enrolled?: boolean
}

interface ChatInterfaceProps {
  studentId: number
  onEnrollmentChange?: () => void
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export default function ChatInterface({ studentId, onEnrollmentChange, messages, setMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash-lite')
  const [models, setModels] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadModels = async () => {
    try {
      const response = await chatApi.getModels()
      setModels(response.data.models)
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSuggestions([])

    try {
      const response = await chatApi.sendMessage({
        message: text,
        student_id: studentId,
        model: model
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        enrolled: response.data.enrolled
      }
      setMessages(prev => [...prev, assistantMessage])
      
      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions)
      }
      
      // If enrollment happened, trigger refresh
      if (response.data.enrolled && onEnrollmentChange) {
        onEnrollmentChange()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Model Selector */}
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="bg-slate-800">
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.enrolled && (
                <div className="flex items-center gap-2 mt-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Enrollment successful!</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="bg-white/20 text-white px-4 py-3 rounded-2xl">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(suggestion)}
              className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/30 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about courses..."
          className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg hover:from-blue-600 hover:to-violet-600 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
