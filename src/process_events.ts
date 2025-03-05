import { apply } from "mini-rfc6902";
import {
  isChunkEvent,
  isMessageEvent,
  isStatusEvent,
  isToolEvent,
} from "./type_utils";
import type {
  ChunkEvent,
  EmittedEvent,
  Event,
  Message,
  MessageEventData,
  StatusEventData,
  ToolEventData,
} from "./types";

function processMessageEvent(
  event: EmittedEvent | (Event & { data: MessageEventData }),
): Message {
  const messageEvent = event as Event & { data: MessageEventData };
  const firstPart = messageEvent.data.parts[0];
  const msg = {
    id: messageEvent.id,
    source: messageEvent.source,
    content:
      firstPart && firstPart.type === "content"
        ? (firstPart.content as
            | string
            | string[]
            | Record<string, unknown>
            | undefined)
        : undefined,
    reasoning:
      firstPart && firstPart.type === "reasoning"
        ? (firstPart.reasoning as
            | string
            | Record<string, unknown>
            | string[]
            | undefined)
        : undefined,
    tool_calls: messageEvent.data.parts
      .filter((part) => part.type === "tool_call")
      .map((toolCall) => ({ ...toolCall, result: undefined })),
    metadata: messageEvent.metadata,
  };
  return msg;
}

function processToolEvent(
  event: (EmittedEvent | Event) & { data: ToolEventData },
  messages: Map<string, Message>,
): Map<string, Message> {
  const toolEvent = event as Event & { data: ToolEventData };
  for (const toolCallResult of toolEvent.data.tool_calls) {
    const { tool_call_id, result } = toolCallResult;
    for (const [messageId, message] of messages) {
      const updatedToolCalls = message.tool_calls.map((toolCall) =>
        toolCall.tool_call_id === tool_call_id
          ? {
              ...toolCall,
              result: result ? (result as { data: unknown }).data : undefined,
            }
          : toolCall,
      );
      messages.set(messageId, { ...message, tool_calls: updatedToolCalls });
    }
  }
  return messages;
}

/**
 * Process a single emitted event and update the messages Map.
 *
 * @param messages - The current messages map.
 * @param event - The emitted event to process.
 * @param updateThinking - Callback to update "thinking" state.
 * @returns An updated messages Map.
 */
export function processEmittedEvent(
  messages: Map<string, Message>,
  event: EmittedEvent,
  updateThinking: (isThinking: boolean) => void,
): Map<string, Message> {
  // Process Status events first.
  if (isStatusEvent(event)) {
    const statusData = event.data as StatusEventData;
    if (statusData.status === "processing") {
      updateThinking(true);
    } else if (statusData.status === "typing") {
      updateThinking(false);
    }
    return messages;
  }

  // Process Message events.
  if (isMessageEvent(event)) {
    const msg = processMessageEvent(event);
    messages.set(event.id, msg);
    return messages;
  }

  // Process Tool events.
  if (isToolEvent(event)) {
    return processToolEvent(event, messages);
  }

  // Process Chunk events (events with patches).
  if (isChunkEvent(event)) {
    const { event_id, patches, metadata } = event as ChunkEvent;
    if (!event_id) {
      console.error("Missing event_id on chunk event:", event);
      return messages;
    }
    // Clone messages for safe updates.
    const updatedMessages = new Map(messages);

    if (patches && patches.length > 0) {
      for (const patch of patches) {
        // Skip a patch that simply adds a container for tool_call_results.
        if (patch.op === "add" && patch.path === "/tool_call_results") {
          continue;
        }
        if (patch.path.startsWith("/tool_call_results/")) {
          // Special handling for tool_call_results patches.
          const toolCallId = (patch.value as { tool_call_id: string })
            ?.tool_call_id;
          for (const [msgId, msg] of updatedMessages) {
            const updatedToolCalls = msg.tool_calls.map((tc) =>
              tc.tool_call_id === toolCallId
                ? {
                    ...tc,
                    result: (patch.value as { data: { result: unknown } })?.data
                      ?.result,
                  }
                : tc,
            );
            updatedMessages.set(msgId, {
              ...msg,
              tool_calls: updatedToolCalls,
            });
          }
          continue;
        }

        // Retrieve (or create) the target message.
        const targetMessage = updatedMessages.get(event_id) || {
          id: event_id,
          source: "ai_agent",
          content: undefined,
          reasoning: undefined,
          tool_calls: [],
          metadata: {},
        };

        // Merge metadata if provided.
        if (metadata) {
          targetMessage.metadata = {
            ...(targetMessage.metadata || {}),
            ...metadata,
          };
        }

        // Clone the target message.
        let updatedMessage = { ...targetMessage };

        // Initialize content if not present.
        if (!updatedMessage.content) {
          if (patch.path === "/-" || /\/\d+$/.test(patch.path)) {
            updatedMessage.content = [] as string[];
          } else if (!patch.path.startsWith("/tool_calls")) {
            updatedMessage.content = {} as Record<string, unknown>;
          }
        }

        // Apply the patch. If the patch targets tool_calls, use apply on the entire message.
        if (patch.path.startsWith("/tool_calls")) {
          updatedMessage = apply(updatedMessage, [patch]) as Message;
        } else {
          updatedMessage.content = apply(updatedMessage.content, [patch]) as
            | string
            | string[]
            | Record<string, unknown>;
        }
        updatedMessages.set(event_id, updatedMessage);
      }
      return updatedMessages;
    }
    return updatedMessages;
  }

  // If no condition matches, return the messages unmodified.
  return messages;
}

/**
 * Processes a persisted event and converts it into a message,
 * updating the provided messages Map.
 *
 * This is a pure function that does not modify the input map but returns a new map
 * with the event applied. It handles two event types:
 *
 * - "message" events: converts the event into a Message and adds it to the map.
 * - "tool" events: updates existing messages that contain a matching tool_call_id.
 *
 * @param messages - The current map of messages keyed by their ID.
 * @param event - The event to process.
 * @returns A new Map of messages with the event processed.
 */
export function processEvent(
  messages: Map<string, Message>,
  event: Event,
): Map<string, Message> {
  if (isStatusEvent(event)) {
    return messages;
  }

  if (isMessageEvent(event)) {
    const msg = processMessageEvent(event);
    messages.set(event.id, msg);
    return messages;
  }

  if (isToolEvent(event)) {
    return processToolEvent(event, messages);
  }

  // For events that don't match the handled kinds, return the messages unmodified.
  console.warn("Unhandled event type:", event.type);
  return messages;
}
