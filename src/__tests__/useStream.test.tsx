import { act, renderHook, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import { useStream } from "../useStream";
import { test } from "./test_extended";

const sessId = "sess123";
test("should start streaming and process received events", async () => {
  const { result } = renderHook(() => useStream(sessId));

  await act(async () => {
    result.current.startStreaming("Hello");
  });

  // Wait for streaming to complete
  await waitFor(() => expect(result.current.streaming).toBe(false), {
    timeout: 2000,
  });

  expect(result.current.events.length).greaterThanOrEqual(39);
  expect(result.current.streaming).toBe(false);
});

test("should handle SSE error correctly", async () => {
  const { result } = renderHook(() => useStream("noSession123"));

  act(() => {
    result.current.startStreaming("Hello");
  });

  // Wait for streaming to complete
  await waitFor(
    () => {
      expect(result.current.streaming).toBe(false);
    },
    { timeout: 2000 },
  );

  expect(result.current.error).not.toBeNull();
});

test("should stop streaming", async () => {
  const { result } = renderHook(() => useStream(sessId));

  act(() => {
    result.current.startStreaming("Hello");
  });

  // Ensure streaming starts
  expect(result.current.streaming).toBe(true);

  act(() => {
    result.current.stopStreaming();
  });

  // Wait for streaming to complete
  await waitFor(
    () => {
      expect(result.current.streaming).toBe(false);
    },
    { timeout: 2000 },
  );
});
