import { act, renderHook, waitFor } from "@testing-library/react";
import { useMemo } from "react";
import { expect } from "vitest";
import { STORED_EVENTS } from "../mocks/handlers";
import { AI_MESSAGE_CONTENT_EVENT, USER_MESSAGE_EVENT } from "../mocks/mocks";
import { useMessageStream } from "../useMessageStream";
import { test } from "./test_extended";

const sessId = "sess123";
test("should handle persisted events and streamed events", async () => {
  const { result } = renderHook(() =>
    useMessageStream({
      events: useMemo(() => STORED_EVENTS, []),
    }),
  );

  await act(async () => {
    result.current.startStreaming(sessId, "Hello");
  });
  expect(result.current.streaming).toBe(true);

  // Wait for streaming to complete
  await waitFor(() => expect(result.current.streaming).toBe(false), {
    timeout: 2000,
  });

  expect(result.current.streaming).toBe(false);
  expect(result.current.processing).toBe(undefined);
  expect(result.current.error).toBeNull();
  expect(result.current.messages.length).toEqual(4);
  expect(result.current.messages[0]).toEqual(
    expect.objectContaining({
      source: "user",
      content: (USER_MESSAGE_EVENT.data as { parts: { content: unknown }[] })
        .parts[0].content,
    }),
  );
  expect(result.current.messages[1]).toEqual(
    expect.objectContaining({
      source: "ai_agent",
      content: (
        AI_MESSAGE_CONTENT_EVENT.data as { parts: { content: unknown }[] }
      ).parts[0].content,
    }),
  );
  expect(result.current.messages[2]).toHaveProperty("tool_calls");
  expect(result.current.messages[2].source).toBe("ai_agent");
  expect(result.current.messages[3].content).toEqual([
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
  expect(result.current.messages[3].source).toBe("ai_agent");
});

test("should handle empty events", async () => {
  const { result } = renderHook(() =>
    useMessageStream({
      events: useMemo(() => [], []),
    }),
  );

  await act(async () => {
    result.current.startStreaming(sessId, "Hello");
  });

  // Wait for streaming to complete
  await waitFor(() => expect(result.current.streaming).toBe(false), {
    timeout: 2000,
  });

  expect(result.current.streaming).toBe(false);
  expect(result.current.processing).toBe(undefined);
  expect(result.current.error).toBeNull();
  expect(result.current.messages.length).toEqual(2);
});
