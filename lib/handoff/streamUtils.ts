import type { IncomingHandoffEvent } from "@/types";

export async function* streamResponse(
  response: Response,
  abortController: AbortController,
): AsyncGenerator<IncomingHandoffEvent> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No reader");
  }

  const decoder = new TextDecoder();

  try {
    while (!abortController.signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const events = chunk.split("\n\n");
      for (const event of events) {
        if (event.startsWith("data: ")) {
          try {
            const jsonData = JSON.parse(event.slice(6));
            if (jsonData.message.type !== "keep-alive") {
              yield jsonData.message;
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
