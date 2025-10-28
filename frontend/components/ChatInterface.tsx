'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Sparkles, CheckCircle, Mic, MicOff, Volume2 } from 'lucide-react'
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
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    loadModels()
    initVoice()
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

  const initVoice = () => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      // Initialize Speech Synthesis
      synthRef.current = window.speechSynthesis
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const speakMessage = (text: string, index: number) => {
    if (!synthRef.current) {
      alert('Speech synthesis not supported in your browser')
      return
    }

    // If already speaking this message, stop it
    if (speakingIndex === index) {
      synthRef.current.cancel()
      setSpeakingIndex(null)
      return
    }

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)

    synthRef.current.speak(utterance)
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
            <div className="flex flex-col gap-2 max-w-[70%]">
              <div
                className={`px-4 py-3 rounded-2xl ${
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
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakMessage(msg.content, idx)}
                  className={`self-start flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-all ${
                    speakingIndex === idx
                      ? 'bg-green-500/30 text-green-300 animate-pulse'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  title={speakingIndex === idx ? 'Stop speaking' : 'Listen to this message'}
                >
                  <Volume2 className="w-4 h-4" />
                  {speakingIndex === idx ? 'Speaking...' : 'Listen'}
                </button>
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
        <button
          onClick={toggleListening}
          disabled={loading}
          className={`px-4 py-3 rounded-lg transition-all ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-white/20 text-white hover:bg-white/30'
          } disabled:opacity-50`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={isListening ? 'Listening...' : 'Ask me anything about courses...'}
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
