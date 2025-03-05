import { useMemo } from "react";
import {
  type InitialEventsOptions,
  useInitialEvents,
} from "./useInitialEvents";
import {
  type MessageStreamByEventsOptions,
  useMessageStreamByEvents,
} from "./useMessageStreamByEvents";
import { type StreamOptions, useStream } from "./useStream";

export type MessageStreamOptions = {} & InitialEventsOptions &
  StreamOptions &
  Omit<MessageStreamByEventsOptions, "emittedEvents">;

export function useMessageStream({ serverUrl, events }: MessageStreamOptions) {
  const {
    events: emittedEvents,
    streaming,
    startStreaming,
    stopStreaming,
    error,
  } = useStream({ serverUrl });

  const {
    messages: streamedMessages,
    isThinking,
    resetMessages,
  } = useMessageStreamByEvents({
    emittedEvents,
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
