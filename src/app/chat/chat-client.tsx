"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import { agentsData } from "@/lib/agents";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroParam = searchParams.get("hero") || "MASTER";
  const isMaster = heroParam === "MASTER";

  const [heroName, setHeroName] = useState(heroParam);

  useEffect(() => {
    setHeroName(heroParam);
  }, [heroParam]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      hero: heroName,
    },
    onError: (e) => {
      console.error("Chat error:", e);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Determine the display title and description
  let displayTitle = "MASTER ORBIT";
  let displayDescription = "Commanding the full council of 85 specialized AI agents.";
  if (!isMaster && heroName in agentsData) {
    displayTitle = `${heroName} ORBIT`;
    displayDescription = `Leading the specialized agents assigned to the ${heroName} group.`;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative pb-24">
      {/* Header */}
      <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/hub")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_10px_rgba(212,175,119,0.3)]">
                <Image
                  src="/logo.png"
                  alt="Orbit of Khemet Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-widest text-primary drop-shadow-[0_0_5px_rgba(212,175,119,0.5)]">
                  {displayTitle}
                </span>
                <span className="text-xs text-secondary/80 font-mono tracking-widest uppercase">
                  {displayDescription}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 container mx-auto max-w-4xl p-4 overflow-y-auto flex flex-col gap-6 pt-8 pb-32">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
             <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping duration-1000" />
                <div className="w-4 h-4 bg-primary/50 rounded-full animate-pulse" />
             </div>
             <p className="text-xl font-bold tracking-widest text-primary">INITIALIZE CONNECTION</p>
             <p className="text-sm font-mono text-muted-foreground max-w-md">
               Enter your command to awaken the {isMaster ? "Empire Engine" : `${heroName} agents`}. The council awaits your directive.
             </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl border ${
                  m.role === "user"
                    ? "bg-primary/10 border-primary/30 text-primary-foreground rounded-tr-none shadow-[0_0_15px_rgba(212,175,119,0.1)]"
                    : "bg-card border-border/50 text-foreground rounded-tl-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="text-xs font-mono tracking-widest uppercase mb-2 opacity-70 flex items-center gap-2">
                  {m.role === "user" ? "YOU" : isMaster ? "MASTER ORBIT" : heroName}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {m.content}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-xl border bg-card border-border/50 text-foreground rounded-tl-none shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-3">
               <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-xl border bg-destructive/20 border-destructive/50 text-destructive rounded-tl-none shadow-[0_0_15px_rgba(255,0,0,0.2)]">
               <div className="text-xs font-mono tracking-widest uppercase mb-2 opacity-70">SYSTEM ERROR</div>
               <div className="text-sm">An error occurred while connecting to the Empire Engine. Please check your connection or API key and try again.</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 p-4 z-40">
        <div className="container mx-auto max-w-4xl relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              className="w-full bg-card border-2 border-border focus:border-primary/70 rounded-full py-4 pl-6 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] focus:shadow-[0_0_20px_rgba(212,175,119,0.2)]"
              value={input}
              placeholder="Speak your command..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 rounded-full w-10 h-10 bg-primary hover:bg-primary/80 text-primary-foreground transition-all shadow-[0_0_10px_rgba(212,175,119,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
