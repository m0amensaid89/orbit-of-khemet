with open("src/app/chat/[hero]/chat-client.tsx", "r") as f:
    text = f.read()

text = text.replace('import { consumeEnergyAsync, trackMessage, getEnergyCost } from "@/lib/energy";',
                    'import { trackMessage, getEnergyCost } from "@/lib/energy";\nimport { useChat } from "@ai-sdk/react";')

text = text.replace('const [messages, setMessages] = useState<{ id: string; role: string; content: string; modelUsed?: string }[]>([]);\n  const [input, setInput] = useState("");\n  const [isLoading, setIsLoading] = useState(false);',
                    '''const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, data } = useChat({
    api: "/api/chat",
    body: { hero: heroParam, agent: agentParam },
    onFinish: () => trackMessage(),
    onError: (err) => {
      if (err.message.includes("ENERGY DEPLETED")) {
        setMessages(prev => [...prev, {
          id: "energy-" + Date.now(),
          role: "assistant",
          content: `⚡ GRID ENERGY DEPLETED — You've used all your daily energy. It resets at midnight UTC.\n\nUpgrade to Explorer for 200 energy/day, or Commander for unlimited.`,
        }]);
      } else {
        setMessages(prev => [...prev, { id: "err-"+Date.now(), role: "assistant", content: "Connection interrupted. Please try again." }]);
      }
    }
  });''')

text = text.replace('''  useEffect(() => {
    if (agent && "prompt" in agent && agent.prompt) {
      const onboarding = getOnboardingMessage();
      if (onboarding) {
        setMessages([{ id: "onboarding", role: "assistant", content: onboarding }]);
      } else {
        setMessages([{ id: "onboarding", role: "assistant", content: `I am ${agentName}. ${agent.description || ""} How can I assist you today?` }]);
      }
    } else if (isMaster) {
      setMessages([{ id: "onboarding", role: "assistant", content: `The Empire Engine is online. All 85 agents are standing by. What directive shall I execute?` }]);
    }
  }, [agentParam, heroParam, agent, agentName, isMaster]);''',
                    '''  useEffect(() => {
    if (messages.length === 0) {
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
  }, [agentParam, heroParam, agent, agentName, isMaster, hero, setMessages]);''')

text = text.replace('''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Energy gate
    const energyResult = await consumeEnergyAsync(currentModel);
    if (!energyResult.success) {
      setMessages(prev => [...prev, {
        id: "energy-" + Date.now(),
        role: "assistant",
        content: `⚡ GRID ENERGY DEPLETED — You've used all your daily energy. It resets at midnight UTC.\n\nUpgrade to Explorer for 200 energy/day, or Commander for unlimited.`,
      }]);
      setIsLoading(false);
      return;
    }

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          hero: heroParam,
          agent: agentParam,
          customSystemPrompt: agentParam.startsWith("custom_") ? getCustomAgentById(agentParam)?.systemPrompt : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      let finalContent = data.response || '';
      if (data.modelUsed && data.modelUsed !== 'xiaomi/mimo-7b') {
        finalContent += `\n\n---\n*Model: ${data.modelUsed}*`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(),
        role: 'assistant',
        content: finalContent,
        modelUsed: data.modelUsed
      }]);
      trackMessage();
    } catch {
      setMessages(prev => [...prev, { id: "err-"+Date.now(), role: "assistant", content: "Connection interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };''', '')


text = text.replace('''                  onChange={e => setInput(e.target.value)}''',
                    '''                  onChange={handleInputChange}''')


text = text.replace('''                    {m.modelUsed === "xiaomi/mimo-7b" && (
                      <div className="self-start px-2 py-0.5 mt-1 rounded text-[10px] font-bold tracking-wider"
                        style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                        MiMo
                      </div>
                    )}''',
                    '''                    {((m as any).modelUsed === "xiaomi/mimo-7b" || modelUsed === "xiaomi/mimo-7b") && (
                      <div className="self-start px-2 py-0.5 mt-1 rounded text-[10px] font-bold tracking-wider"
                        style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                        MiMo
                      </div>
                    )}''')


with open("src/app/chat/[hero]/chat-client.tsx", "w") as f:
    f.write(text)
