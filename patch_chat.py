import re

with open("src/app/chat/[hero]/chat-client.tsx", "r") as f:
    content = f.read()

# Replace the loadMessages useEffect
old_use_effect = """  useEffect(() => {
  if (!threadId) return
  const loadMessages = async () => {
    const res = await fetch(`/api/chat-history/messages?threadId=${threadId}`)
    const data = await res.json()
    if (data.messages && data.messages.length > 0) {
      setMessages(data.messages.map((m: { id: string; role: string; content: string; model_used?: string }) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        modelUsed: m.model_used
      })))
    }
  }
  loadMessages()
}, [threadId, setMessages])"""

new_use_effect = """  useEffect(() => {
  if (!threadId) return

  // Small delay to allow useChat to finish initializing
  const timer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/chat-history/messages?threadId=${threadId}`)
      const data = await res.json()
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((m: { id: string; role: string; content: string; model_used?: string }) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          modelUsed: m.model_used
        })))
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }, 100)

  return () => clearTimeout(timer)
}, [threadId])"""

if old_use_effect in content:
    content = content.replace(old_use_effect, new_use_effect)
    with open("src/app/chat/[hero]/chat-client.tsx", "w") as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Could not find old useEffect block")
