import type { components } from "./api_v1";

export type ChunkEvent = components["schemas"]["ChunkEventDTO"];
export type Event = components["schemas"]["EventDTO"];
export type EmittedEvent = ChunkEvent | Event;
