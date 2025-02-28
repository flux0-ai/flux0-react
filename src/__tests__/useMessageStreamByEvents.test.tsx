import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { expect } from "vitest";
import { useMessageStreamByEvents } from "../useMessageStreamByEvents";
import { useStream } from "../useStream";
import { test } from "./test_extended";

test("should process empty events array", async () => {
  const { result } = renderHook(() => useMessageStreamByEvents([]));
  expect(result.current.isThinking).toBe(false);
  expect(result.current.messages).toEqual(new Map());
});

test("should set isThinking if event is status", async () => {
  const { result } = renderHook(() =>
    useMessageStreamByEvents([
      {
        id: "63678573-3ac5-45fe-b7b5-1cee2a8a0759",
        source: "ai_agent",
        type: "status",
        correlation_id: "sess1",
        data: {
          type: "status",
          acknowledged_offset: 0,
          status: "processing",
          data: {},
        },
        metadata: null,
        offset: 0,
        created_at: "2021-08-26T14:00:00.000",
      },
    ]),
  );

  expect(result.current.isThinking).toBe(true);
  expect(result.current.messages).toEqual(new Map());
});

test("should handle a new chunk", async () => {
  const { result } = renderHook(() =>
    useMessageStreamByEvents([
      {
        id: "a1b2c3d4e5",
        correlation_id: "sess1",
        event_id: "event1",
        seq: 0,
        patches: [{ op: "add", path: "/-", value: "The" }],
        metadata: { agent_id: "foo", agent_name: "test" },
        timestamp: 1740583796.8028002,
      },
    ]),
  );

  expect(result.current.isThinking).toBe(false);
  expect(Array.from(result.current.messages.entries())).toHaveLength(1);
  expect(Array.from(result.current.messages.keys())).toEqual(["event1"]);
  expect(result.current.messages.get("event1")?.content).toEqual(["The"]);
});

test("should handle full run", async () => {
  const { result: useStreamResult } = renderHook(() => useStream());
  await act(async () => {
    useStreamResult.current.startStreaming("sess123", "Hello");
  });

  // Wait for streaming to complete
  await waitFor(() => expect(useStreamResult.current.streaming).toBe(false), {
    timeout: 2000,
  });

  const { result } = renderHook(() =>
    useMessageStreamByEvents(useStreamResult.current.events),
  );

  expect(result.current.isThinking).toBe(false);
  expect(Array.from(result.current.messages.entries())).toHaveLength(2);
  expect(Array.from(result.current.messages.keys())).toEqual([
    "63678573-3ac5-45fe-b7b5-1cee2a8a0759",
    "17498459-6472-4034-9872-9d1eeeb77e03",
  ]);
  expect(
    result.current.messages.get("17498459-6472-4034-9872-9d1eeeb77e03")
      ?.content,
  ).toEqual([
    "The",
    " weather",
    " in",
    " San",
    " Francisco",
    " is",
    " currently",
    " ",
    "60",
    " degrees",
    " and",
    " fog",
    "gy",
    ".",
  ]);
});
