type PersistedSaveTask<T> = {
  run: () => Promise<T>;
  onError?: (error: unknown) => void;
  onSuccess?: (result: T) => void | Promise<void>;
};

export function createLatestPersistedSaveQueue() {
  let latestRequestId = 0;
  let chain: Promise<void> = Promise.resolve();

  const enqueue = <T>({ run, onError, onSuccess }: PersistedSaveTask<T>) => {
    const requestId = latestRequestId + 1;
    latestRequestId = requestId;

    chain = chain
      .catch(() => undefined)
      .then(async () => {
        if (requestId !== latestRequestId) return;

        try {
          const result = await run();
          if (requestId === latestRequestId) {
            await onSuccess?.(result);
          }
        } catch (error) {
          if (requestId === latestRequestId) {
            onError?.(error);
          }
        }
      });

    return requestId;
  };

  return {
    enqueue,
    getLatestRequestId: () => latestRequestId,
  };
}

export const persistedSaveQueue = createLatestPersistedSaveQueue();
