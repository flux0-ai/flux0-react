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
import { useStreamContext } from "./useStreamContext";

export type MessageStreamOptions = {} & InitialEventsOptions &
  StreamOptions &
  Omit<MessageStreamByEventsOptions, "sessionStream" | "correlationId">;

export function useMessageStream({
  serverTemplateUrl,
  events,
}: MessageStreamOptions) {
  const streamOptions = useMemo(
    () => ({ serverTemplateUrl }),
    [serverTemplateUrl],
  );

  const {
    events: emittedEvents,
    correlationId,
    streaming,
    resetEvents,
    startStreaming,
    stopStreaming,
    error,
  } = useStreamContext(streamOptions);

  const {
    messages: streamedMessages,
    isThinking,
    resetMessages,
  } = useMessageStreamByEvents({
    correlationId,
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
    resetEvents,
    startStreaming,
    stopStreaming,
    error,
    resetMessages,
  };
}
