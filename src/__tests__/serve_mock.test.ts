import { fetchEventSource } from "@microsoft/fetch-event-source";
import { expect } from "vitest";
import { test } from "./test_extended";

test("Should run hook", async () => {
  let counter = 0;
  await fetchEventSource("/api/sessions/sess123/events/stream", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
    },
    onmessage(event) {
      counter++;
    },
    onclose() {
      expect(counter).greaterThan(40);
    },
    onerror(err: Error) {
      throw err;
    },
  });
});
