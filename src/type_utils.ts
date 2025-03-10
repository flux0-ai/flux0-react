import type {
  ChunkEvent,
  Event,
  SessionStream,
  StatusEventData,
  ToolEventData,
} from "./types";

// Type guard for ChunkEvent
export function isStreamChunkEvent(
  event: SessionStream,
): event is SessionStream & { data: ChunkEvent } {
  return event.event === "chunk";
}

export function isStreamStatusEvent(
  event: SessionStream,
): event is SessionStream & { data: { data: StatusEventData } } {
  return event.event === "status";
}

export function isStatusEvent(event: Event): boolean {
  return event.type === "status";
}

export function isMessageEvent(
  event: Event,
): event is Event & { data: StatusEventData } {
  return event.type === "message";
}

export function isToolEvent(
  event: Event,
): event is Event & { data: ToolEventData } {
  return event.type === "tool";
}
