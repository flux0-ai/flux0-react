import { useEffect, useRef, useState } from "react";
import { processEmittedEvent } from "./process_events";
import type { EmittedEvent, Message } from "./types";

export type MessageStreamByEventsOptions = {
  emittedEvents: EmittedEvent[];
};

/**
 * Custom hook for processing streamed events into messages.
 *
 * @param events - Array of emitted events from the stream.
 * @returns { messages, isThinking, resetMessages }
 */
export function useMessageStreamByEvents({
  emittedEvents,
}: MessageStreamByEventsOptions): {
  messages: Message[];
  isThinking: boolean;
  resetMessages: () => void;
} {
  const [messages, setMessages] = useState<Map<string, Message>>(new Map());
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    if (!emittedEvents?.length) return;
    if (lastProcessedIndexRef.current >= emittedEvents.length) return;

    const newEvents = emittedEvents.slice(lastProcessedIndexRef.current);
    if (!newEvents.length) return;

    setMessages((currentMessages) =>
      newEvents.reduce(
        (msgs, event) => processEmittedEvent(msgs, event, setIsThinking),
        currentMessages,
      ),
    );

    lastProcessedIndexRef.current = emittedEvents.length;
  }, [emittedEvents]);

  const resetMessages = () => {
    setMessages(new Map());
    lastProcessedIndexRef.current = 0;
  };

  return { messages: Array.from(messages.values()), isThinking, resetMessages };
}
