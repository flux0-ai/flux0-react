import { http, HttpResponse } from "msw";
import {
  AI_MESSAGE_CONTENT_EVENT,
  PROCESSING_EVENT,
  TYPING_EVENT,
  USER_MESSAGE_EVENT,
} from "./mocks";

const encoder = new TextEncoder();

export const RECORDED_EVENTS = [
  `event: status\nid: 63678573-3ac5-45fe-b7b5-1cee2a8a0758\ndata: {"id": "63678573-3ac5-45fe-b7b5-1cee2a8a0758", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "processing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0", "value": {"type": "tool_call", "tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "", "args": []}}, {"op": "replace", "path": "/tool_calls/0/tool_name", "value": "search"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.079927}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 1, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "{\\""}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.080249}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 2, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "query"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.0805361}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 3, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "\\":\\""}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.080714}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 4, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "San"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.080937}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 5, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": " Francisco"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.081384}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 6, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": " weather"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.081633}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 7, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "\\"}"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.0818188}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "10400c61-c763-4b4a-bb83-608ab2759e4a", "seq": 0, "patches": [{"op": "add", "path": "/tool_call_results", "value": []}, {"op": "add", "path": "/tool_call_results/-", "value": {"tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "search", "data": {"result": "It's 60 degrees and foggy."}, "args": {"query": "San Francisco weather"}}}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.083936}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "processing", "data": {}}, "metadata": null}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "The"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.085682}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " weather"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086058}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " in"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086177}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " San"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086282}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " Francisco"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086387}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " is"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086493}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " currently"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.086615}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " "}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.0868359}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "60"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.087005}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " degrees"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.087169}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " and"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.0873961}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " fog"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.0875032}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "gy"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.08761}`,
  `event: status\nid: 17498459-6472-4034-9872-9d1eeeb77e03\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event: chunk\ndata: {"correlation_id": "RID(49WUVZLTnd)::yKEkqsS9aT", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "."}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740673638.087716}`,
];

export const STORED_EVENTS = [
  USER_MESSAGE_EVENT,
  PROCESSING_EVENT,
  TYPING_EVENT,
  AI_MESSAGE_CONTENT_EVENT,
];

export const handlers = [
  http.post("/api/sessions/sess123/events/stream", () => {
    const stream = new ReadableStream({
      async start(controller) {
        for (const event of RECORDED_EVENTS) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 25),
          );
          controller.enqueue(encoder.encode(`${event}\n\n`));
        }
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  }),
  http.get("/api/sessions/sess123/events", () => {
    return HttpResponse.json({ data: STORED_EVENTS });
  }),
];
