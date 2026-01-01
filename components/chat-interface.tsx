"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Send, Trash2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "system",
        content: "ΨI/ONET RULEBOOK SEARCH TERMINAL v2.0.47\nSYSTEM ONLINE // AWAITING INPUT...",
        createdAt: new Date(),
      },
    ],
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const clearHistory = () => {
    setMessages([
      {
        id: "1",
        role: "system",
        content: "ΨI/ONET RULEBOOK SEARCH TERMINAL v2.0.47\nSYSTEM ONLINE // AWAITING INPUT...",
        createdAt: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 border-r border-border bg-sidebar flex flex-col min-h-0">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-primary glitch">ΨI/ONET</h1>
          </div>
          <p className="text-xs text-muted-foreground">RULE SEARCH TERMINAL</p>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="text-muted-foreground">STATUS:</span>
            <span className="text-primary">● ONLINE</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {messages
              .filter((m) => m.role === "user")
              .map((message) => (
                <button
                  key={message.id}
                  className="w-full text-left p-3 rounded bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors border border-sidebar-border"
                >
                  <p className="text-sm text-foreground truncate">
                    {">"} {message.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString("ja-JP") : ""}
                  </p>
                </button>
              ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={clearHistory}>
            <Trash2 className="w-4 h-4" />
            CLEAR HISTORY
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-primary">TERMINAL SESSION #2847</h2>
              <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleString("ja-JP")}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">QUERIES:</span>
                <span className="text-foreground">{messages.filter((m) => m.role === "user").length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">UPTIME:</span>
                <span className="text-primary">99.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-custom">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  ${
                    message.role === "system"
                      ? "bg-muted/30 border-primary/30"
                      : message.role === "user"
                        ? "bg-card border-border"
                        : "bg-secondary/20 border-primary/20"
                  }
                  border rounded p-4
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`
                    text-xs font-bold
                    ${
                      message.role === "system"
                        ? "text-primary"
                        : message.role === "user"
                          ? "text-foreground"
                          : "text-primary"
                    }
                  `}
                  >
                    [{message.role.toUpperCase()}]
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString("ja-JP") : ""}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            ))}

            {isLoading && (
              <div className="bg-secondary/20 border border-primary/20 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary">[ASSISTANT]</span>
                  <span className="text-xs text-muted-foreground">processing...</span>
                </div>
                <p className="text-sm text-foreground">
                  <span className="terminal-cursor">█</span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">{"> "}</span>
                <form onSubmit={handleSubmit} className="flex-1">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter your query..."
                    className="pl-8 bg-background border-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground w-full"
                    disabled={isLoading}
                  />
                </form>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              STATUS: CONNECTED TO GEMINI NEURAL LINK
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
