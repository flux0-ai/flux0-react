import { http, HttpResponse } from "msw";
import {
  AI_MESSAGE_CONTENT_EVENT,
  PROCESSING_EVENT,
  TYPING_EVENT,
  USER_MESSAGE_EVENT,
} from "./mocks";

const encoder = new TextEncoder();

export const RECORDED_EVENTS = [
  'event:some-event\ndata: {"id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "processing", "data": {}}, "metadata": null}',
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0", "value": {"type": "tool_call", "tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "", "args": []}}, {"op": "replace", "path": "/tool_calls/0/tool_name", "value": "search"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.796541}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "{\\""}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.7967858}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "query"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.79707}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "\\":\\""}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.7973142}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "San"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.7975628}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": " Francisco"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.797842}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": " weather"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.7980769}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "seq": 0, "patches": [{"op": "add", "path": "/tool_calls/0/args/-", "value": "\\"}"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.7982552}`,
  // `event:some-event\ndata: {"id": "63678573-3ac5-45fe-b7b5-1cee2a8a0759", "source": "ai_agent", "type": "message", "correlation_id": "sess1", "data": {"type": "message", "parts": [{"type": "tool_call", "tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "search", "args": {"query": "San Francisco weather"}}], "participant": {"id": "foo", "name": "test"}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "10400c61-c763-4b4a-bb83-608ab2759e4a", "seq": 0, "patches": [{"op": "add", "path": "/tool_call_results", "value": []}, {"op": "add", "path": "/tool_call_results/-", "value": {"tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "search", "data": {"result": "It's 60 degrees and foggy."}, "args": {"query": "San Francisco weather"}}}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.800095}`,
  `event:some-event\ndata: {"id": "10400c61-c763-4b4a-bb83-608ab2759e4a", "source": "ai_agent", "type": "tool", "correlation_id": "sess1", "data": {"type": "tool_call_result", "tool_calls": [{"tool_call_id": "call_fPZx5Enik4QvAdiGHmsvdeeE", "tool_name": "search", "args": {"query": "San Francisco weather"}, "result": {"data": "It's 60 degrees and foggy.", "metadata": {}, "control": {"mode": "auto"}}}]}, "metadata": null}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "processing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "The"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8028002}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " weather"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.80307}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " in"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.803191}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " San"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.803295}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " Francisco"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8034}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " is"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8035069}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " currently"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.803613}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " "}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8037171}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "60"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.803818}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " degrees"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8039181}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " and"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.804068}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": " fog"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.8041668}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "gy"}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.804266}`,
  `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "status", "correlation_id": "sess1", "data": {"type": "status", "acknowledged_offset": 0, "status": "typing", "data": {}}, "metadata": null}`,
  `event:some-event\ndata: {"correlation_id": "sess1", "event_id": "17498459-6472-4034-9872-9d1eeeb77e03", "seq": 0, "patches": [{"op": "add", "path": "/-", "value": "."}], "metadata": {"agent_id": "foo", "agent_name": "test"}, "timestamp": 1740583796.804362}`,
  // `event:some-event\ndata: {"id": "17498459-6472-4034-9872-9d1eeeb77e03", "source": "ai_agent", "type": "message", "correlation_id": "sess1", "data": {"type": "message", "parts": [{"type": "content", "content": "The weather in San Francisco is currently 60 degrees and foggy."}], "participant": {"id": "foo", "name": "test"}}, "metadata": {}}`,
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
