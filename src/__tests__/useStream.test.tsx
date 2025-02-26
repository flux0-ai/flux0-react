import { act, renderHook, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import { useStream } from "../useStream";
import { test } from "./test_extended";

test("should start streaming and process received events", async () => {
  const { result } = renderHook(() => useStream());

  await act(async () => {
    result.current.startStreaming("sess123", "Hello");
  });

  // Wait for streaming to complete
  await waitFor(() => expect(result.current.streaming).toBe(false), {
    timeout: 2000,
  });

  expect(result.current.events.length).toEqual(42);
  expect(result.current.streaming).toBe(false);
});

test("should handle SSE error correctly", async () => {
  const { result } = renderHook(() => useStream());

  act(() => {
    result.current.startStreaming("error-case", "Hello");
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
  const { result } = renderHook(() => useStream());

  act(() => {
    result.current.startStreaming("test-session", "Hello");
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
