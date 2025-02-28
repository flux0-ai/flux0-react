import type {
  ChunkEvent,
  EmittedEvent,
  Event,
  MessageEventData,
  StatusEventData,
  ToolEventData,
} from "./types";

// Type guard for ChunkEvent
export function isChunkEvent(event: EmittedEvent): event is ChunkEvent {
  return (event as ChunkEvent).event_id !== undefined;
}

export function isEvent(event: EmittedEvent): event is Event {
  return (
    (event as Event).source !== undefined && (event as Event).data !== undefined
  );
}

// Type guard for StatusEventData
export function isStatusEvent(
  event: EmittedEvent,
): event is Event & { data: StatusEventData } {
  return isEvent(event) && event.data.type === "status";
}

export function isMessageEvent(
  event: EmittedEvent,
): event is EmittedEvent & { data: MessageEventData } {
  return isEvent(event) && event.data.type === "message";
}

export function isToolEvent(
  event: EmittedEvent,
): event is EmittedEvent & { data: ToolEventData } {
  return isEvent(event) && event.data.type === "tool_call_result";
}
