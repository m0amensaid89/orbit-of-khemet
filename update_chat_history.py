import re

with open('src/app/chat/[hero]/chat-client.tsx', 'r') as f:
    content = f.read()

pattern = r'useEffect\(\(\) => \{\n\s*if \(threadId\) \{\n\s*fetch\(`/api/chat-history\?threadId=\$\{threadId\}`\)\n\s*\.then.*?catch.*?;\n\s*\}\n\s*\}, \[threadId, setMessages\]\);'

new_code = '''useEffect(() => {
  if (!threadId) return
  const loadMessages = async () => {
    const supabase = createClient()
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (msgs && msgs.length > 0) {
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        modelUsed: m.model_used
      })))
    }
  }
  loadMessages()
}, [threadId, setMessages])'''

content = re.sub(pattern, new_code, content, flags=re.DOTALL)

with open('src/app/chat/[hero]/chat-client.tsx', 'w') as f:
    f.write(content)
