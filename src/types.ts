import type { Patch } from "mini-rfc6902";

/**
 * Defines the structure of an emitted SSE event.
 */
export interface EmittedEvent {
  /** Optional ID of the chunk/status event */
  id?: string;
  /** Unique event ID relevant for chunk tracking */
  event_id: string;
  /** Correlation ID to associate events */
  correlation_id: string;
  /** Type of event being emitted */
  kind: string;
  /** List of patch operations applied to the event */
  patches: Patch;
  /** Optional payload containing event-specific data */
  data?: { [key: string]: unknown };
  /** Optional metadata related to the event */
  metadata?: { [key: string]: unknown } | null;
}
