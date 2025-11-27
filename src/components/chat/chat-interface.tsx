
"use client";

import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '@/services/trip-guide';
import { sendMessageToTripGuide } from '@/services/trip-guide';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {

      const aiResponseContent = await sendMessageToTripGuide(trimmedInput);
      const aiMessage: Message = { role: 'ai', content: aiResponseContent };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {

      console.error("Failed to get response from AI:", error);

      const errorMessageContent = error instanceof Error ? error.message : 'An unknown error occurred.';
      const errorMessage: Message = { role: 'ai', content: `Sorry, I encountered an error: ${errorMessageContent}` };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b bg-card shadow-sm">
        <h1 className="text-xl font-semibold text-center text-foreground">CareerPilot</h1> {/* Updated Header */}
        <p className="text-sm text-muted-foreground text-center">Your AI companion for smart career decisions.</p>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'ai' && (
                <Avatar className="w-8 h-8 border shrink-0">
                  {/* Placeholder image for AI */}
                  <AvatarImage src="https://picsum.photos/32/32?grayscale" alt="AI Avatar" data-ai-hint="robot bot" />
                  <AvatarFallback>
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'p-3 rounded-lg max-w-[75%] overflow-x-auto shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'

                    : 'bg-secondary text-secondary-foreground rounded-bl-none'
                )}
                aria-label={message.role === 'user' ? `Your message: ${message.content}` : `AI response: ${message.content}`}
              >

                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8 border shrink-0">
                  {/* Placeholder image for User */}
                  <AvatarImage src="https://picsum.photos/32/32" alt="User Avatar" data-ai-hint="person user" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <Avatar className="w-8 h-8 border">
                {/* Placeholder image for AI loading */}
                <AvatarImage src="https://picsum.photos/32/32?grayscale" alt="AI Avatar" data-ai-hint="robot bot loading" />
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-secondary text-secondary-foreground rounded-bl-none shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <footer className="p-4 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            type="text"
            placeholder="Ask CareerPilot to plan your career, skills, resume .... "
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded-full px-4 py-2 shadow-inner"
            aria-label="Chat input"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
            className="rounded-full bg-accent hover:bg-accent/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
