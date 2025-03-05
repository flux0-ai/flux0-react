import { renderHook } from "@testing-library/react";
import { useMemo } from "react";
import { expect, test } from "vitest";
import {
  AI_MESSAGE_CONTENT_EVENT,
  PROCESSING_EVENT,
  USER_MESSAGE_EVENT,
} from "../mocks/mocks";
import { useInitialEvents } from "../useInitialEvents";

test("should handle user message event", async () => {
  const { result } = renderHook(() =>
    useInitialEvents({ events: useMemo(() => [USER_MESSAGE_EVENT], []) }),
  );

  expect(result.current.messages.length).toBe(1);
  expect(result.current.messages[0]).toEqual(
    expect.objectContaining({
      content: (USER_MESSAGE_EVENT.data as { parts: { content: unknown }[] })
        .parts[0].content,
    }),
  );
});

test("should handle both user and ai messages", async () => {
  const { result } = renderHook(() =>
    useInitialEvents({
      events: useMemo(() => [USER_MESSAGE_EVENT, AI_MESSAGE_CONTENT_EVENT], []),
    }),
  );

  expect(result.current.messages.length).toBe(2);
  expect(result.current.messages[0]).toEqual(
    expect.objectContaining({
      content: (USER_MESSAGE_EVENT.data as { parts: { content: unknown }[] })
        .parts[0].content,
    }),
  );
  expect(result.current.messages[1]).toEqual(
    expect.objectContaining({
      content: (
        AI_MESSAGE_CONTENT_EVENT.data as { parts: { content: unknown }[] }
      ).parts[0].content,
    }),
  );
});

test("should ignore status event", async () => {
  const { result } = renderHook(() =>
    useInitialEvents({ events: useMemo(() => [PROCESSING_EVENT], []) }),
  );

  expect(result.current.messages).toEqual([]);
});

test("should handle empty events", async () => {
  const { result } = renderHook(() =>
    useInitialEvents({ events: useMemo(() => [], []) }),
  );

  expect(result.current.messages).toEqual([]);
});
