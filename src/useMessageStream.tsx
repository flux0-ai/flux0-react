import { useCallback, useMemo, useRef, useState } from "react";
import type { Message } from "./types";
import {
  type InitialEventsOptions,
  useInitialEvents,
} from "./useInitialEvents";
import {
  type MessageStreamByEventsOptions,
  useMessageStreamByEvents,
} from "./useMessageStreamByEvents";
import type { StreamOptions } from "./useStream";
import { useStreamContext } from "./useStreamContext";

export type MessageStreamOptions = {} & InitialEventsOptions &
  StreamOptions &
  Omit<MessageStreamByEventsOptions, "sessionStream" | "correlationId">;

// Internal-only: placement metadata; extends the public Message
type LocalUserMessage = Message & {
  afterIndex: number;
  seq: number;
};

// Define outside the hook so it doesn't appear in useMemo deps
const toPublicMessage = (m: LocalUserMessage): Message => {
  const { afterIndex: _ai, seq: _seq, ...publicPart } = m;
  return publicPart; // TS infers Omit<LocalUserMessage, "afterIndex" | "seq">, which is Message
};

export function useMessageStream({
  serverTemplateUrl,
  events,
}: MessageStreamOptions) {
  const streamOptions = useMemo(
    () => ({ serverTemplateUrl }),
    [serverTemplateUrl],
  );

  const [localUserMessages, setLocalUserMessages] = useState<
    LocalUserMessage[]
  >([]);
  const seqRef = useRef(0);

  const {
    events: emittedEvents,
    correlationId,
    streaming,
    resetEvents,
    startStreaming: _startStreaming,
    stopStreaming,
    error,
  } = useStreamContext(streamOptions);

  const {
    messages: streamedMessages,
    processing,
    resetMessages: resetStreamedMessages,
  } = useMessageStreamByEvents({
    correlationId,
    sessionStream: emittedEvents,
  });

  const { messages: loadedMessages } = useInitialEvents({ events });

  const startStreaming = useCallback(
    (sessionId: string, input: string) => {
      const afterIndex = streamedMessages.length;

      const base: Message = {
        id: `local-${Date.now()}-${seqRef.current}`,
        source: "user",
        content: input, // satisfy your Message.content type
        tool_calls: [], // <-- required in your Message
      };

      const local: LocalUserMessage = {
        ...base,
        afterIndex,
        seq: seqRef.current++,
      };

      setLocalUserMessages((prev) => [...prev, local]);
      _startStreaming(sessionId, input);
    },
    [_startStreaming, streamedMessages.length],
  );

  const messages: Message[] = useMemo(() => {
    const result: Message[] = [...loadedMessages];

    const localsSorted = [...localUserMessages].sort(
      (a, b) => a.afterIndex - b.afterIndex || a.seq - b.seq,
    );

    let localPtr = 0;

    for (let i = 0; i < streamedMessages.length; i++) {
      while (
        localPtr < localsSorted.length &&
        localsSorted[localPtr].afterIndex === i
      ) {
        result.push(toPublicMessage(localsSorted[localPtr]));
        localPtr++;
      }
      result.push(streamedMessages[i]);
    }

    while (localPtr < localsSorted.length) {
      result.push(toPublicMessage(localsSorted[localPtr]));
      localPtr++;
    }

    return result;
  }, [loadedMessages, localUserMessages, streamedMessages]);

  const resetMessages = useCallback(() => {
    resetEvents();
    resetStreamedMessages();
    setLocalUserMessages([]);
  }, [resetStreamedMessages, resetEvents]);

  return {
    messages,
    emittedEvents,
    processing,
    streaming,
    resetEvents,
    startStreaming,
    stopStreaming,
    error,
    resetMessages,
  };
}
