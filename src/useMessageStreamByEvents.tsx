import { useEffect, useRef, useState } from "react";
import { processEvent } from "./process_events";
import type { EmittedEvent, Message } from "./types";
import { useStream } from "./useStream";

/**
 * Custom hook for processing streamed events into messages.
 *
 * @param events - Array of emitted events from the stream.
 * @returns { messages, isThinking, resetMessages }
 */
export function useMessageStreamByEvents(events: EmittedEvent[]) {
  const [messages, setMessages] = useState<Map<string, Message>>(new Map());
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    if (!events?.length) return;
    if (lastProcessedIndexRef.current >= events.length) return;

    const newEvents = events.slice(lastProcessedIndexRef.current);
    if (!newEvents.length) return;

    setMessages((currentMessages) =>
      newEvents.reduce(
        (msgs, event) => processEvent(msgs, event, setIsThinking),
        currentMessages,
      ),
    );

    lastProcessedIndexRef.current = events.length;
  }, [events]);

  const resetMessages = () => {
    setMessages(new Map());
    lastProcessedIndexRef.current = 0;
  };

  return { messages, isThinking, resetMessages };
}

export function useMessageStream({ serverUrl }: { serverUrl: string }) {
  const { events, streaming, startStreaming, stopStreaming, error } = useStream(
    { serverUrl },
  );
  const { messages, isThinking, resetMessages } =
    useMessageStreamByEvents(events);

  return {
    messages: Array.from(messages.values()),
    isThinking,
    streaming,
    startStreaming,
    stopStreaming,
    error,
    resetMessages,
    events,
  };
}
