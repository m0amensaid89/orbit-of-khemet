with open("src/app/api/chat/route.ts", "r") as f:
    text = f.read()

import re
text = re.sub(r'messages: messages\.map\(\(m: \{ role: string; content: string \}\) => \(\{ \.\.\.m, content: sanitizeForFetch\(m\.content\) \}\) as any\),',
              r'messages: messages.map((m: { role: string; content: string }) => ({ ...m, content: sanitizeForFetch(m.content) }) as Parameters<typeof streamText>[0]["messages"]),', text)

with open("src/app/api/chat/route.ts", "w") as f:
    f.write(text)
