import type { components } from "./api_v1";

export type ChunkEvent = components["schemas"]["ChunkEventDTO"];
export type EmittedEvent = components["schemas"]["EmittedEventDTO"];
export type Event = components["schemas"]["EventDTO"];
export type SessionStream = components["schemas"]["SessionStream"];
export type StatusEventData = components["schemas"]["StatusEventDataDTO"];
export type MessageEventData = components["schemas"]["MessageEventDataDTO"];
export type ToolEventData = components["schemas"]["ToolEventDataDTO"];

interface ToolCall {
  tool_name: string;
  tool_call_id: string;
  result: unknown;
}

export interface Message {
  id: string;
  content?: string[] | string | Record<string, unknown>;
  reasoning?: string[] | string | Record<string, unknown>;
  source: components["schemas"]["EventSourceDTO"];
  tool_calls: ToolCall[];
  metadata?: {
    [key: string]: unknown;
  } | null;
}
