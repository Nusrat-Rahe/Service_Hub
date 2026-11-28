import assert from "node:assert/strict";
import test from "node:test";
import { parseChatMessages } from "../src/chatbotValidation";

test("accepts a user message and removes control characters", () => {
  assert.deepEqual(parseChatMessages([{ role: "user", content: "  Hi\u0000 there  " }]), [
    { role: "user", content: "Hi there" },
  ]);
});

test("accepts alternating user and assistant context ending with a user message", () => {
  assert.deepEqual(
    parseChatMessages([
      { role: "user", content: "What services do you offer?" },
      { role: "assistant", content: "We offer several home services." },
      { role: "user", content: "Tell me about cleaning." },
    ])?.map(({ role }) => role),
    ["user", "assistant", "user"],
  );
});

test("rejects malformed, oversized, and incorrectly ordered conversations", () => {
  assert.equal(parseChatMessages([]), null);
  assert.equal(parseChatMessages([{ role: "assistant", content: "Hello" }]), null);
  assert.equal(parseChatMessages([{ role: "user", content: " " }]), null);
  assert.equal(
    parseChatMessages([{ role: "user", content: "x".repeat(2001) }]),
    null,
  );
  assert.equal(
    parseChatMessages([
      { role: "user", content: "first" },
      { role: "user", content: "second" },
    ]),
    null,
  );
  assert.equal(
    parseChatMessages([
      ...Array.from({ length: 5 }, (_, index) => [
        { role: "user", content: "u".repeat(1000) },
        { role: "assistant", content: "a".repeat(1000) },
      ]).flat(),
      { role: "user", content: "last" },
    ]),
    null,
  );
});
