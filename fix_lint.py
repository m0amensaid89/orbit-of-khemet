# Fix 1: route.ts
with open("src/app/api/chat/route.ts", "r") as f:
    route_text = f.read()

route_text = route_text.replace("const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);", "const { data: { user } } = await supabaseAdmin.auth.getUser(token);")
route_text = route_text.replace("messages: messages.map((m: any) => ({ ...m, content: sanitizeForFetch(m.content) })),", "messages: messages.map((m: { role: string; content: string }) => ({ ...m, content: sanitizeForFetch(m.content) }) as any),") # ai sdk type expects specific CoreMessage

with open("src/app/api/chat/route.ts", "w") as f:
    f.write(route_text)

# Fix 2: chat-client.tsx
with open("src/app/chat/[hero]/chat-client.tsx", "r") as f:
    chat_text = f.read()

chat_text = chat_text.replace('import { useEffect, useRef, useState } from "react";', 'import { useEffect, useRef } from "react";')
chat_text = chat_text.replace('const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, data } = useChat({', 'const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({')
chat_text = chat_text.replace('}, [agentParam, heroParam, agent, agentName, isMaster, hero, setMessages]);', '}, [agentParam, heroParam, agent, agentName, isMaster, hero, messages.length, setMessages]);')
chat_text = chat_text.replace('{((m as any).modelUsed === "xiaomi/mimo-7b"', '{(((m as { modelUsed?: string }).modelUsed) === "xiaomi/mimo-7b"')

with open("src/app/chat/[hero]/chat-client.tsx", "w") as f:
    f.write(chat_text)
