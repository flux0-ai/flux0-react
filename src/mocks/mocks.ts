import type { Event } from "../types";

export const USER_MESSAGE_EVENT: Event = {
  id: "FU2bnzueQf",
  source: "user",
  type: "message",
  offset: 0,
  correlation_id: "RID(9TLjkivlMq)::Xjd2ZFnGK0",
  data: {
    tags: [],
    type: "message",
    parts: [
      {
        type: "content",
        content: "hi",
      },
    ],
    flagged: false,
    participant: {
      id: "NPqnTCAkC5",
      name: "Anonymous",
    },
  },
  deleted: false,
  created_at: "2025-02-21 20:57:21.259563+00",
};

export const PROCESSING_EVENT: Event = {
  id: "1yHOKWZT-B",
  source: "ai_agent",
  type: "status",
  offset: 1,
  correlation_id: "RID(9TLjkivlMq)::Xjd2ZFnGK0",
  data: {
    data: {},
    type: "status",
    status: "processing",
    acknowledged_offset: 0,
  },
  deleted: false,
  created_at: "2025-02-21 20:57:21.454741+00",
};

export const TYPING_EVENT: Event = {
  id: "NIxrIDHJHK",
  source: "ai_agent",
  type: "status",
  offset: 2,
  correlation_id: "RID(9TLjkivlMq)::Xjd2ZFnGK0",
  data: {
    data: {},
    type: "status",
    status: "typing",
    acknowledged_offset: 0,
  },
  deleted: false,
  created_at: "2025-02-21 20:57:21.916889+00",
};

export const AI_MESSAGE_CONTENT_EVENT: Event = {
  id: "D0UnRlQH4k",
  source: "ai_agent",
  type: "message",
  offset: 3,
  correlation_id: "RID(9TLjkivlMq)::Xjd2ZFnGK0",
  data: {
    type: "message",
    parts: [
      {
        type: "content",
        content:
          "Hi there! 👋 I'm Drizzle, your friendly weather agent! Would you like a weather forecast for a specific location?",
      },
    ],
    participant: {
      id: "7kBmpzx53w",
      name: "WeTale Beginner",
    },
  },
  deleted: false,
  created_at: "2025-02-21 20:57:22.219832+00",
  metadata: {
    node_name: "gatherer",
  },
};
