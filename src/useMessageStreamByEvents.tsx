import { useEffect, useRef, useState } from "react";
import { processEmittedEvent as processSessionStream } from "./process_events";
import type { Message, SessionStream } from "./types";

export type MessageStreamByEventsOptions = {
  sessionStream: SessionStream[];
};

/**
 * Custom hook for processing streamed events into messages.
 *
 * @param events - Array of emitted events from the stream.
 * @returns { messages, isThinking, resetMessages }
 */
export function useMessageStreamByEvents({
  sessionStream,
}: MessageStreamByEventsOptions): {
  messages: Message[];
  isThinking: boolean;
  resetMessages: () => void;
} {
  const [messages, setMessages] = useState<Map<string, Message>>(new Map());
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const lastProcessedIndexRef = useRef(0);

  useEffect(() => {
    if (!sessionStream?.length) return;
    if (lastProcessedIndexRef.current >= sessionStream.length) return;

    const newEvents = sessionStream.slice(lastProcessedIndexRef.current);
    if (!newEvents.length) return;

    setMessages((currentMessages) =>
      newEvents.reduce(
        (msgs, event) => processSessionStream(msgs, event, setIsThinking),
        currentMessages,
      ),
    );

    lastProcessedIndexRef.current = sessionStream.length;
  }, [sessionStream]);

  const resetMessages = () => {
    setMessages(new Map());
    lastProcessedIndexRef.current = 0;
  };

  return { messages: Array.from(messages.values()), isThinking, resetMessages };
}
