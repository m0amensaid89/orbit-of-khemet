import { Suspense } from 'react';
import ChatPage from './chat-client';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
