sed -i 's/const messagesEndRef/const messages = rawMessages as CustomMessage[];\n  const messagesEndRef/g' src/app/chat/[hero]/chat-client.tsx
