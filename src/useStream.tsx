import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useCallback, useRef, useState } from "react";
import type { EmittedEvent } from "./types";

export type StreamOptions = {
  serverUrl: string;
};

const defaultStreamOptions: StreamOptions = {
  serverUrl: "/api/sessions/{sessionId}/events/stream",
};

/**
 * A custom hook that encapsulates SSE events streaming.
 */
export function useStream(options: StreamOptions = defaultStreamOptions) {
  const [events, setEvents] = useState<EmittedEvent[]>([]);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string | null>(null);
  const eventQueueRef = useRef<EmittedEvent[]>([]);

  // Process the event queue asynchronously
  const processQueue = useCallback(() => {
    if (eventQueueRef.current.length > 0) {
      const nextEvent = eventQueueRef.current.shift();
      if (!nextEvent) return;
      setEvents((prev) => [...prev, nextEvent]);
      setTimeout(processQueue, 0);
    }
  }, []);

  const startStreaming = useCallback(
    (sessionId: string, input: string) => {
      if (!sessionId) {
        console.error("Session ID is required");
        return;
      }
      // Reset if switching sessions
      if (sessionRef.current !== sessionId) {
        sessionRef.current = sessionId;
        setEvents([]);
        eventQueueRef.current = [];
      }
      // Abort any existing stream
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setStreaming(true);
      setError(null);

      const serverUrl = options.serverUrl.replace("{sessionId}", sessionId);
      console.log(serverUrl);

      fetchEventSource(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          kind: "message",
          content: input,
          source: "user",
        }),
        signal: controller.signal,
        openWhenHidden: true,
        onmessage(event) {
          try {
            const parsed: EmittedEvent = JSON.parse(event.data);
            eventQueueRef.current.push(parsed);
            processQueue();
          } catch (e) {
            console.error("Invalid JSON from SSE:", event.data, e);
          }
        },
        onclose() {
          setStreaming(false);
        },
        onerror(err: Error) {
          console.error("SSE error:", err);
          setError(err);
          setStreaming(false);
          // Abort the controller to prevent further events
          controller.abort();

          throw err;
        },
      });
    },
    [options.serverUrl, processQueue],
  );

  const stopStreaming = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setStreaming(false);
    }
  }, []);

  return { events, streaming, error, startStreaming, stopStreaming };
}
