import { useEffect, useState } from "react";
import { processEvent } from "./process_events";
import type { Event, Message } from "./types";

export type InitialEventsOptions = {
  events: Event[];
};

/**
 * Custom hook for processing persisted events into a messages map.
 *
 * This hook takes an array of preloaded events (for example, loaded from the database)
 * and converts them into a Map of messages keyed by their ID. It processes both "message"
 * and "tool" events, handling tool call results and merging them into the corresponding message.
 *
 * @param events - Array of persisted events of type Event.
 * @returns A Map of Message objects keyed by their message IDs.
 */
export function useInitialEvents({ events }: InitialEventsOptions): {
  messages: Message[];
} {
  const [messages, setMessages] = useState<Map<string, Message>>(new Map());

  useEffect(() => {
    setMessages(() =>
      events.reduce((msgs, event) => processEvent(msgs, event), new Map()),
    );
  }, [events]);

  return { messages: Array.from(messages.values()) };
}
