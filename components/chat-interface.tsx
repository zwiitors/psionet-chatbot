"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "ΨI/ONET RULEBOOK SEARCH TERMINAL v2.0.47\nSYSTEM ONLINE // AWAITING INPUT...",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [rulebookContent, setRulebookContent] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const loadRulebook = async () => {
      try {
        const response = await fetch("/rulebook.md")
        if (!response.ok) throw new Error("Failed to load")
        const text = await response.text()
        setRulebookContent(text)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: "[SYSTEM] Default rulebook.md loaded successfully.\n[STATUS] Neural link established.",
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: "[ERROR] Failed to load default rulebook.md. Please check the public directory.\n[STATUS] System degraded.",
            timestamp: new Date(),
          },
        ])
      }
    }
    loadRulebook()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let responseText = ""
      if (!rulebookContent) {
        responseText = `> ERROR: DATABASE NOT LOADED\n\n[STATUS] Please check system connection.`
      } else {
        const searchTerms = input.toLowerCase().split(" ")
        const lines = rulebookContent.split("\n")
        const matches = lines.filter((line) => 
          searchTerms.every(term => line.toLowerCase().includes(term)) && line.trim().length > 0
        )
        
        if (matches.length > 0) {
          responseText = `> SEARCHING DATABASE FOR: "${input}"\n\n[RESULT FOUND]\n${matches.slice(0, 5).map(m => `> ${m}`).join("\n")}\n\n[STATUS] Ready for next query...`
        } else {
          responseText = `> SEARCHING DATABASE FOR: "${input}"\n\n[RESULT] No exact matches found in local database.\n\n[STATUS] Ready for next query...`
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const clearHistory = () => {
    setMessages([
      {
        id: "1",
        role: "system",
        content: "ΨI/ONET RULEBOOK SEARCH TERMINAL v2.0.47\nSYSTEM ONLINE // AWAITING INPUT...",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 border-r border-border bg-sidebar flex flex-col">
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
                  <p className="text-xs text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString("ja-JP")}</p>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
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
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
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
                  <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString("ja-JP")}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            ))}

            {isTyping && (
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
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">{"> "}</span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Enter your query..."
                  className="pl-8 bg-background border-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              STATUS: CONNECTED TO LOCAL ARCHIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
