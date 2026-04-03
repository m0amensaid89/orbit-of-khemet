"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, Zap } from "lucide-react";
import Image from "next/image";
import { heroAgents, getOnboardingMessage } from "@/lib/agents";
import { getHero } from "@/lib/heroes";
import { getCustomAgentById } from "@/lib/custom-agents";
import { trackMessage, getEnergyCost } from "@/lib/energy";
import { useChat } from "@ai-sdk/react";
import { detectArtifact, extractTitle, stripCodeBlocks } from '@/lib/artifacts';
import { ArtifactRenderer } from '@/components/ArtifactRenderer';
import { ExportToolbar } from '@/components/ExportToolbar';

function VoiceWaveform({ audioLevel, isLocked }: { audioLevel: number; isLocked: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(28).fill(3));

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setBars(prev => prev.map((_, i) => {
        const wave = Math.sin(i * 0.8 + Date.now() / 180) * 0.5 + 0.5;
        return Math.max(3, (audioLevel / 100) * 18 * wave + 3);
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [audioLevel]);

  return (
    <div className="flex items-center gap-[2px] flex-1" style={{ height: '24px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: '2px',
          height: `${h}px`,
          background: isLocked ? `rgba(255,68,68,0.7)` : `rgba(212,175,55,0.7)`,
          borderRadius: '1px',
          transition: 'height 0.05s ease',
        }} />
      ))}
    </div>
  );
}

export default function ChatPage({ heroSlug }: { heroSlug?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroParam = (heroSlug || searchParams.get("hero") || "MASTER").toLowerCase();
  const agentParam = searchParams.get("agent") || "";
  const isMaster = heroParam === "master";

  const agents = heroAgents[heroParam] || [];
  const customAgent = agentParam.startsWith("custom_") ? getCustomAgentById(agentParam) : null;
  const agent = customAgent || (agentParam ? agents.find(a => a.id === agentParam) || null : null);
  const hero = getHero(heroParam);

  const accentColor = hero?.palette?.accent || "#D4AF37";
  const primaryColor = hero?.palette?.primary || "#C0C0C0";
  const bgDeep = hero?.palette?.["bg-deep"] || "#0d0f14";
  const bgMid = hero?.palette?.["bg-mid"] || "#151820";
  const cardBorder = hero?.palette?.["card-border"] || "rgba(212,175,55,0.15)";

  const agentName = agent?.name || (isMaster ? "Master Orbit" : (hero?.name || heroParam.toUpperCase()));
  const agentRole = agent?.role_summary || (isMaster ? "Full Council of 85 Agents" : hero?.class_title || "");
  const agentInitials = agentName.substring(0, 2).toUpperCase();
  const heroName = hero?.name || heroParam.toUpperCase();

  const threadId = searchParams.get("thread");

  const [isListening, setIsListening] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // locked recording mode
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0-100 for waveform bar
  const [interimText, setInterimText] = useState(''); // live transcript
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const keyPressRef = useRef<{ win: boolean; ctrl: boolean }>({ win: false, ctrl: false });

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setVoiceSupported(true);
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, append } = useChat({
    api: "/api/chat",
    body: { hero: heroParam, agent: agentParam, threadId },
    onFinish: () => trackMessage(),
    onError: (err) => {
      if (err.message.includes("ENERGY DEPLETED")) {
        setMessages(prev => [...prev, {
          id: "energy-" + Date.now(),
          role: "assistant",
          content: `⚡ GRID ENERGY DEPLETED: You've used all your daily energy. It resets at midnight UTC.

Upgrade to Explorer for 200 energy/day, or Commander for unlimited.`,
        }]);
      } else {
        setMessages(prev => [...prev, { id: "err-"+Date.now(), role: "assistant", content: "Connection interrupted. Please try again." }]);
      }
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const heroModelMap: Record<string, string> = {
    master:  "anthropic/claude-sonnet-4-5:online",
    thoren:  "anthropic/claude-sonnet-4-5:online",
    nexar:   "openai/o3-mini:online",
    ramet:   "google/gemini-2.5-flash:online",
    lyra:    "anthropic/claude-sonnet-4-5:online",
    kairo:   "xiaomi/mimo-7b",
    nefra:   "xiaomi/mimo-7b",
    horusen: "openai/gpt-4o:online",
  };
  const currentModel = heroModelMap[heroParam] || "google/gemini-2.5-flash";
  const energyCost = getEnergyCost(currentModel);

  // Start audio analyser for waveform visualization
  const startAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic permission denied — continue without waveform */ }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    micStreamRef.current = null;
    setAudioLevel(0);
  };

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setIsLocked(false);
    setInterimText('');
    stopAudioAnalyser();
  }, []);

  const startListening = useCallback((locked = false) => {
    if (!voiceSupported) return;

    const SpeechRecognitionAPI = (window as typeof window & {
      SpeechRecognition?: typeof SpeechRecognition;
      webkitSpeechRecognition?: typeof SpeechRecognition;
    }).SpeechRecognition || (window as typeof window & {
      webkitSpeechRecognition?: typeof SpeechRecognition;
    }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();

    // Support English (all accents) + Arabic (all dialects)
    recognition.lang = 'ar'; // will be overridden by grammars — browser auto-detects
    recognition.continuous = locked; // continuous only in locked mode
    recognition.interimResults = true; // show live transcript

    // Use multilingual detection: try both languages
    // Web Speech API does not support multiple langs simultaneously
    // but we set to auto-detect by leaving lang empty or using BCP-47 wildcard
    // Best cross-browser approach: detect from input or default to en-US with Arabic support
    // We set lang to empty string to let browser use system locale + English fallback
    try {
      (recognition as SpeechRecognition & { lang: string }).lang = '';
    } catch {
      recognition.lang = 'en-US';
    }

    recognition.onstart = () => {
      setIsListening(true);
      setIsLocked(locked);
      setInterimText('');
      startAudioAnalyser();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (interim) setInterimText(interim);
      if (final) {
        handleInputChange({ target: { value: (input + ' ' + final).trim() } } as React.ChangeEvent<HTMLInputElement>);
        setInterimText('');
        if (!locked) {
          stopListening();
        }
      }
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      if (!isLocked) stopListening();
      // In locked mode, restart automatically
      else {
        try { recognition.start(); } catch { stopListening(); }
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { /* already started */ }
  }, [voiceSupported, input, handleInputChange, isLocked, stopListening]);

  const handleVoiceInput = useCallback(() => {
    if (isListening && !isLocked) {
      stopListening();
    } else if (isListening && isLocked) {
      stopListening(); // single click stops locked mode
    } else {
      startListening(false); // normal single-click = one-shot
    }
  }, [isListening, isLocked, startListening, stopListening]);

  // Keyboard shortcut: Win+Ctrl = start/lock recording
  useEffect(() => {
    if (!voiceSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Track Win key (Meta) and Ctrl
      if (e.key === 'Meta' || e.key === 'OS') keyPressRef.current.win = true;
      if (e.key === 'Control') keyPressRef.current.ctrl = true;

      // Win + Ctrl pressed together
      if (keyPressRef.current.win && keyPressRef.current.ctrl) {
        e.preventDefault();
        if (!isListening) {
          // First press: start one-shot recording
          startListening(false);
        } else if (isListening && !isLocked) {
          // Second press while recording: lock it (continuous)
          stopListening();
          setTimeout(() => startListening(true), 100);
        } else if (isLocked) {
          // Press while locked: stop
          stopListening();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'OS') keyPressRef.current.win = false;
      if (e.key === 'Control') keyPressRef.current.ctrl = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [voiceSupported, isListening, isLocked, startListening, stopListening]);

  useEffect(() => {
    if (threadId) {
      fetch(`/api/chat-history?threadId=${threadId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMessages(data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              modelUsed: m.model_used
            })));
          }
        })
        .catch(err => console.error("Failed to load chat history:", err));
    }
  }, [threadId, setMessages]);

  // Agent speaks first: onboarding message
  useEffect(() => {
    if (messages.length === 0 && !threadId) {
      if (hero && hero.welcomeMessage) {
        setMessages([{ id: "onboarding", role: "assistant", content: hero.welcomeMessage }]);
      } else if (agent && "prompt" in agent && agent.prompt) {
        const onboarding = getOnboardingMessage();
        if (onboarding) {
          setMessages([{ id: "onboarding", role: "assistant", content: onboarding }]);
        } else {
          setMessages([{ id: "onboarding", role: "assistant", content: `I am ${agentName}. ${agent.description || ""} How can I assist you today?` }]);
        }
      } else if (isMaster) {
        setMessages([{ id: "onboarding", role: "assistant", content: `The Empire Engine is online. All 85 agents are standing by. What directive shall I execute?` }]);
      }
    }
  }, [agentParam, heroParam, agent, agentName, isMaster, hero, messages.length, setMessages, threadId]);

  const autoprompt = searchParams.get('autoprompt');

  useEffect(() => {
    if (autoprompt && messages.length === 1 && !isLoading) {
      const decoded = decodeURIComponent(autoprompt);
      setTimeout(() => {
        append({ role: 'user', content: decoded });
      }, 800);
    }
  }, [autoprompt, messages.length, isLoading, append]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const taskParam = searchParams.get('task');
    if (taskParam && !input && messages.length === 0) {
      handleInputChange({ target: { value: decodeURIComponent(taskParam) } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [searchParams, handleInputChange, input, messages.length]);

  return (
    <>
      {/* Outer — true full height, no padding, no scroll */}
      <div className="h-screen overflow-hidden flex flex-col w-full"
        style={{ background: bgDeep }}>

        {/* Inner card — fills remaining space */}
        <div className="w-full h-full flex flex-col overflow-hidden"
          style={{ background: bgMid, borderLeft: `1px solid ${cardBorder}` }}>

        {/* Header — shrink-0, never scrolls */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b w-full"
          style={{ borderColor: cardBorder, background: bgMid }}>
          <button onClick={() => router.back()} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Agent avatar */}
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-[Orbitron] font-bold text-sm border-2"
            style={{ background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.15)`, borderColor: accentColor, color: accentColor }}>
            {agentInitials}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2"
              style={{ borderColor: bgMid }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-[Orbitron] text-xs font-bold tracking-wider truncate" style={{ color: primaryColor }}>
                {agentName}
              </p>
              {agentParam.startsWith("custom_") && (
                <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                  ✦ CUSTOM
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase truncate" style={{ color: accentColor, opacity: 0.7 }}>
              {agentRole}
            </p>
          </div>

          {/* Hero attribution badge */}
          <button onClick={() => router.push(`/heroes/${heroParam}`)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ borderColor: cardBorder, color: accentColor, background: `rgba(${hero?.palette?.["accent-rgb"] || "212,175,55"},0.08)` }}>
            <div className="w-4 h-4 rounded-full overflow-hidden">
              <Image src={`/${heroParam}.png`} alt={heroName} width={16} height={16} className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            {agentName !== heroName ? agentName : heroName}
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="shrink-0 px-4 py-2 text-[10px] font-mono tracking-widest flex items-center gap-2"
          style={{ color: accentColor, opacity: 0.5, borderBottom: `0.5px solid ${cardBorder}` }}>
          <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => router.push('/')}>Universe</span>
          <span>›</span>
          <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => router.push(`/heroes/${heroParam}`)}>{heroName}</span>
          <span>›</span>
          <span style={{ opacity: 1, color: primaryColor }}>{agentName}</span>
        </div>

          {/* Messages — flex-1, scrolls internally */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6"
            style={{ background: bgDeep }}>
            {messages.map((m) => {
              // Extract model badge if present
              const contentParts = m.content.split("\n\n---\n*Model:");
              const cleanContent = contentParts[0];
              const modelUsed = contentParts.length > 1 ? contentParts[1].replace("*", "").trim() : null;

              return (
                <div key={m.id} className={`flex gap-3 w-full ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-[Orbitron] text-xs border shadow-lg ${m.role === "user" ? "mt-auto" : "mt-1"}`}
                    style={m.role === "user"
                      ? { background: "#1A1A1A", borderColor: "#D4AF37", color: "#D4AF37" }
                      : { background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.1)`, borderColor: accentColor, color: accentColor }}>
                    {m.role === "user" ? "YOU" : agentInitials}
                  </div>

                  {/* Bubble Container */}
                  <div className={`flex flex-col max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"}`}>

                    {/* Header (Agent Name) */}
                    {m.role === "assistant" && (
                      <span className="font-[Orbitron] text-[10px] tracking-widest uppercase mb-1.5 ml-1" style={{ color: primaryColor }}>
                        {agentName}
                      </span>
                    )}

                    {/* Bubble */}
                    <div className={`px-5 py-3.5 text-sm leading-relaxed shadow-md font-[Rajdhani] max-w-3xl ${m.role === "user" ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-tl-sm"}`}
                      style={m.role === "user"
                        ? { background: "linear-gradient(135deg, #1A1A1A, #0A0A0A)", border: "1px solid #D4AF37", color: "#F5D38C" }
                        : { background: bgMid, border: `1px solid ${cardBorder}`, color: "rgba(255,255,255,0.9)", borderLeftColor: accentColor, borderLeftWidth: "3px" }}>
                      <div className="whitespace-pre-wrap break-words">
                        {(() => {
                          const artifact = detectArtifact(m.content);
                          return artifact ? stripCodeBlocks(cleanContent) : cleanContent;
                        })()}
                      </div>
                      {(() => {
                        if (m.role !== 'assistant') return null;
                        const artifact = detectArtifact(m.content);
                        if (!artifact) return null;
                        const title = extractTitle(m.content, artifact);
                        return <ArtifactRenderer artifact={artifact} title={title} />;
                      })()}

                      {m.role === 'assistant' && cleanContent.length > 100 && !isLoading && (
                        <ExportToolbar
                          content={cleanContent}
                          title={(() => {
                            const match = cleanContent.match(/# (.*?)\n/);
                            if (match) return match[1];
                            return `${agentName} Report`;
                          })()}
                        />
                      )}
                    </div>
                    {(((m as { modelUsed?: string }).modelUsed) === "xiaomi/mimo-7b" || modelUsed === "xiaomi/mimo-7b") && (
                      <div className="self-start px-2 py-0.5 mt-1 rounded text-[10px] font-bold tracking-wider"
                        style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                        MiMo
                      </div>
                    )}

                    {/* Model Badge */}
                    {modelUsed && m.role === "assistant" && (
                      <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                        <Zap className="w-2.5 h-2.5" style={{ color: primaryColor }} /> {modelUsed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 w-full flex-row">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-[Orbitron] text-xs border mt-1 shadow-lg"
                  style={{ background: `rgba(${hero?.palette?.["primary-rgb"] || "192,192,192"},0.1)`, borderColor: accentColor, color: accentColor }}>
                  {agentInitials}
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <span className="font-[Orbitron] text-[10px] tracking-widest uppercase mb-1.5 ml-1" style={{ color: primaryColor }}>
                    {agentName} <span className="text-white/30 lowercase tracking-normal">is typing...</span>
                  </span>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-md"
                    style={{ background: bgMid, border: `1px solid ${cardBorder}`, borderLeftColor: accentColor, borderLeftWidth: "3px" }}>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: '300ms' }} />
                  </div>
                </div>
                </div>
              )}
            <div ref={messagesEndRef} />
            </div>

          {/* Input — shrink-0, never scrolls */}
          <div className="shrink-0 px-6 pb-6 pt-3 border-t w-full" style={{ borderColor: cardBorder, background: bgMid }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
              {/* Voice recording UI — WhatsApp style waveform bar */}
              {isListening && (
                <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg"
                  style={{
                    background: isLocked
                      ? 'rgba(255,68,68,0.08)'
                      : 'rgba(212,175,55,0.06)',
                    border: `1px solid ${isLocked ? 'rgba(255,68,68,0.2)' : 'rgba(212,175,55,0.15)'}`,
                  }}>

                  {/* Pulsing dot */}
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                    style={{ background: isLocked ? '#FF4444' : '#D4AF37' }} />

                  {/* Waveform bars — WhatsApp style */}
                  <VoiceWaveform audioLevel={audioLevel} isLocked={isLocked} />

                  {/* Live interim transcript */}
                  {interimText && (
                    <span className="font-[Rajdhani] text-xs italic shrink-0 max-w-[120px] truncate"
                      style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {interimText}
                    </span>
                  )}

                  {/* Status label */}
                  <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase shrink-0"
                    style={{ color: isLocked ? 'rgba(255,68,68,0.8)' : 'rgba(212,175,55,0.7)' }}>
                    {isLocked ? 'LOCKED' : 'LISTENING'}
                  </span>

                  {/* Stop button */}
                  <button type="button" onClick={stopListening}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: isLocked ? 'rgba(255,68,68,0.2)' : 'rgba(212,175,55,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="w-2 h-2 rounded-sm"
                      style={{ background: isLocked ? '#FF4444' : '#D4AF37' }} />
                  </button>
                </div>
              )}
              <div className="relative flex items-center w-full">
                <input
                  className={`w-full pl-5 ${voiceSupported ? 'pr-24' : 'pr-16'} py-4 rounded-xl text-base outline-none transition-all shadow-inner placeholder:text-white/20 font-[Rajdhani]`}
                  style={{ background: "#0A0A0A", border: `1px solid ${cardBorder}`, color: "white" }}
                  value={input}
                  placeholder={`Message ${agentName}...`}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  onFocus={e => { e.target.style.borderColor = accentColor; e.target.style.boxShadow = `0 0 15px rgba(${hero?.palette?.["accent-rgb"] || "212,175,55"}, 0.15)`; }}
                  onBlur={e => { e.target.style.borderColor = cardBorder; e.target.style.boxShadow = "none"; }}
                />
                {/* Mic button — gold border, prominent */}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-all"
                    style={{
                      background: isListening
                        ? isLocked ? 'rgba(255,68,68,0.2)' : 'rgba(212,175,55,0.15)'
                        : 'rgba(212,175,55,0.08)',
                      border: isListening
                        ? isLocked ? '1px solid rgba(255,68,68,0.7)' : '1px solid rgba(212,175,55,0.6)'
                        : '1px solid rgba(212,175,55,0.3)',
                    }}
                    title={isListening ? (isLocked ? 'Click to stop locked recording' : 'Click to stop') : 'Voice input (Win+Ctrl to start/lock)'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={isListening ? (isLocked ? '#FF4444' : '#D4AF37') : '#D4AF37'}
                      strokeWidth="1.5" strokeLinecap="round">
                      <ellipse cx="12" cy="10" rx="4" ry="6"/>
                      <line x1="12" y1="16" x2="12" y2="22"/>
                      <line x1="8" y1="22" x2="16" y2="22"/>
                      <line x1="6" y1="13" x2="18" y2="13"/>
                    </svg>
                  </button>
                )}
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="absolute right-2 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-105"
                  style={{ background: accentColor, color: "#000", boxShadow: `0 0 10px rgba(${hero?.palette?.["accent-rgb"] || "212,175,55"}, 0.5)` }}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>

              {voiceSupported && !isListening && (
                <div className="text-center mt-1">
                  <span className="font-[Orbitron] text-[7px] tracking-[2px] uppercase"
                    style={{ color: 'rgba(255,255,255,0.15)' }}>
                    Win + Ctrl to record • Double to lock
                  </span>
                </div>
              )}

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-2">
                    <span className="font-[Orbitron] text-[9px] tracking-widest uppercase text-white/30 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#D4AF37]" /> {energyCost} energy per message
                    </span>
                    <span className="font-[Orbitron] text-[8px] tracking-[2px] uppercase text-white/20">
                      Powered by Empire Engine
                    </span>
                  </div>
                  <div className="text-center w-full px-2">
                    <span className="font-[Rajdhani] text-[10px] text-white/30">
                      Responses are generated using AI and may contain mistakes.
                    </span>
                  </div>
                </div>
              </form>
            </div>
        </div>
      </div>
    </>
  );
}
