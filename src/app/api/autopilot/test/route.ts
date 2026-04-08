export const runtime = 'edge';

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"test","message":"stream alive"}\\n\\n'));
      setTimeout(() => {
        controller.enqueue(encoder.encode('data: {"type":"done"}\\n\\n'));
        controller.close();
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}
