import { redirect } from 'next/navigation';

// S47Q-07: /chat without a hero slug returned 404. Redirect to /hub (hero selector).
// The actual chat route is /chat/[hero] — users hitting bare /chat now land on the hub.
export default function ChatIndexPage() {
  redirect('/hub');
}
