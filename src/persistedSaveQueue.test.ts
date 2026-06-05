import { describe, expect, it, vi } from "vitest";
import { createLatestPersistedSaveQueue } from "./persistedSaveQueue";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("persisted save queue", () => {
  it("runs only the latest queued save when older requests have not started", async () => {
    const queue = createLatestPersistedSaveQueue();
    const firstRun = vi.fn(async () => "first");
    const secondRun = vi.fn(async () => "second");
    const onSuccess = vi.fn();

    queue.enqueue({ run: firstRun, onSuccess });
    queue.enqueue({ run: secondRun, onSuccess });

    await flushPromises();
    await flushPromises();

    expect(firstRun).not.toHaveBeenCalled();
    expect(secondRun).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith("second");
  });

  it("suppresses stale callbacks when a newer save is queued during an in-flight save", async () => {
    const queue = createLatestPersistedSaveQueue();
    let resolveFirst: ((value: string) => void) | undefined;
    const firstRun = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const secondRun = vi.fn(async () => "second");
    const onSuccess = vi.fn();

    queue.enqueue({ run: firstRun, onSuccess });
    await flushPromises();
    queue.enqueue({ run: secondRun, onSuccess });
    resolveFirst?.("first");
    await flushPromises();
    await flushPromises();

    expect(firstRun).toHaveBeenCalledOnce();
    expect(secondRun).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("second");
  });

  it("reports only the latest save error", async () => {
    const queue = createLatestPersistedSaveQueue();
    const firstError = new Error("first");
    const secondError = new Error("second");
    const onError = vi.fn();

    queue.enqueue({ run: async () => Promise.reject(firstError), onError });
    queue.enqueue({ run: async () => Promise.reject(secondError), onError });

    await flushPromises();
    await flushPromises();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(secondError);
  });
});
