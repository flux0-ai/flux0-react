import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { expect } from "vitest";
import { StreamProvider, useStreamContext } from "../useStreamContext";
import { test } from "./test_extended";

// Test that the StreamProvider correctly provides the stream context.
test("should provide stream context using StreamProvider", async () => {
  // Create a wrapper that includes the StreamProvider.
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StreamProvider sessionId="sess123">{children}</StreamProvider>
  );

  const { result } = renderHook(() => useStreamContext(), { wrapper });

  // Start streaming via the context
  act(() => {
    result.current.startStreaming("Hello from context");
  });

  // Wait until streaming stops
  await waitFor(() => expect(result.current.streaming).toBe(false), {
    timeout: 2000,
  });

  // Check that events were processed (assumes the SSE returns at least 39 events)
  expect(result.current.events.length).toBeGreaterThanOrEqual(39);
});

// Test that useStreamContext throws an error when used outside of a StreamProvider.
test("should throw error when useStreamContext is used outside of StreamProvider", () => {
  expect(() => renderHook(() => useStreamContext())).toThrow(
    "useStreamContext must be used within a StreamProvider",
  );
});
