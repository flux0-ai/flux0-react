import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useCallback, useRef, useState } from "react";
import type { SessionStream } from "./types";

export type StreamOptions = {
  serverTemplateUrl?: string;
};

const DEFUALT_TEMPLATE_SERVER_URL = "/api/sessions/{sessionId}/events/stream";

/**
 * A custom hook that encapsulates SSE events streaming.
 */
export function useStream(
  options: StreamOptions = { serverTemplateUrl: DEFUALT_TEMPLATE_SERVER_URL },
) {
  const [correlationId, setCorrelationId] = useState<string>("");
  const [events, setEvents] = useState<SessionStream[]>([]);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<string | null>(null);
  const eventQueueRef = useRef<SessionStream[]>([]);

  // Function to reset events and clear the queue.
  const resetEvents = useCallback(() => {
    setEvents([]);
    eventQueueRef.current = [];
  }, []);

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
      sessionRef.current = sessionId;
      setEvents([]);
      eventQueueRef.current = [];
      // Abort any existing stream
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      setStreaming(true);
      setError(null);

      const serverTemplateUrl =
        options.serverTemplateUrl || DEFUALT_TEMPLATE_SERVER_URL;
      const serverUrl = serverTemplateUrl.replace("{sessionId}", sessionId);

      fetchEventSource(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          type: "message",
          content: input,
          source: "user",
        }),
        signal: controller.signal,
        openWhenHidden: false,
        onmessage(rawEvent) {
          if (rawEvent.event !== "chunk" && rawEvent.event !== "status") {
            console.error("Invalid event type:", rawEvent.event);
            return;
          }
          try {
            const e: SessionStream = {
              id: rawEvent.id,
              event: rawEvent.event,
              data: JSON.parse(rawEvent.data),
            };
            setCorrelationId(e.data.correlation_id);
            eventQueueRef.current.push(e);
            processQueue();
          } catch (e) {
            console.error("Invalid JSON from SSE:", rawEvent.data, e);
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
    [options.serverTemplateUrl, processQueue],
  );

  const stopStreaming = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setStreaming(false);
    }
  }, []);

  return {
    events,
    correlationId,
    streaming,
    error,
    resetEvents,
    startStreaming,
    stopStreaming,
  };
}
