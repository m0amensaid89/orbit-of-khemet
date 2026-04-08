import { transformOutput } from "@/lib/autopilot/transformer";

// Since useChat from ai-sdk defaults to returning a stream of string text, and our /api/autopilot returns custom SSE with `rendered_output`,
// we will intercept and parse the text content locally in the UI to populate the `rendered_output` property for rendering.
// This is done automatically in the chat render block since m.content will contain the JSON payloads of `data:`
