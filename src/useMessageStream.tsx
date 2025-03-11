import { useMemo } from "react";
import {
  type InitialEventsOptions,
  useInitialEvents,
} from "./useInitialEvents";
import {
  type MessageStreamByEventsOptions,
  useMessageStreamByEvents,
} from "./useMessageStreamByEvents";
import type { StreamOptions } from "./useStream";
import { useStreamSource } from "./useStreamContext";

export type MessageStreamOptions = {} & InitialEventsOptions &
  StreamOptions &
  Omit<MessageStreamByEventsOptions, "sessionStream">;

export function useMessageStream(
  sessionId: string,
  { serverTemplateUrl, events }: MessageStreamOptions,
) {
  const streamOptions = useMemo(
    () => ({ serverTemplateUrl }),
    [serverTemplateUrl],
  );

  const {
    events: emittedEvents,
    streaming,
    startStreaming,
    stopStreaming,
    error,
  } = useStreamSource(sessionId, streamOptions);

  const {
    messages: streamedMessages,
    isThinking,
    resetMessages,
  } = useMessageStreamByEvents({
    sessionStream: emittedEvents,
  });

  const { messages: loadedMessages } = useInitialEvents({
    events,
  });

  const messages = useMemo(
    () => [...loadedMessages, ...streamedMessages],
    [loadedMessages, streamedMessages],
  );

  return {
    messages: Array.from(messages.values()),
    emittedEvents,
    isThinking,
    streaming,
    startStreaming,
    stopStreaming,
    error,
    resetMessages,
  };
}
