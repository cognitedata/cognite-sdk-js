/** @hidden */
export function scheduleTask(
  task: () => any,
  triggerTimeInMs: number,
  intervalInMs: number
): () => void {
  const interval = setInterval(() => {
    const nowInMs = Date.now();
    if (nowInMs >= triggerTimeInMs) {
      clearInterval(interval);
      task();
    }
  }, intervalInMs);

  return function cancel() {
    clearInterval(interval);
  };
}
