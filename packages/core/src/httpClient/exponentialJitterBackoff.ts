  /**
   * Calculates the delay in milliseconds for the next retry attempt. Uses "exponential backoff with 
   * full jitter" algorithm.
   * 
   * @see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
   * 
   * @param retryCount - The number of retry attempts made so far.
   * @returns The delay in milliseconds for the next retry attempt.
   */
export class ExponentialJitterBackoff {
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly randomCallback: typeof Math.random;

  /**
   * Initializes a new instance of the ExponentialJitterBackoff class.
   * @param baseDelayMs - The base delay in milliseconds. This will be the average delay for the first retry attempt.
   * @param maxDelayMs - The maximum delay in milliseconds. This will be the maximum delay for the last retry attempt.
   * @param randomCallback - The callback to use for generating a random number between 0 and 1. Used by test only.
   */
  constructor(
    baseDelayMs: number = 100,
    maxDelayMs: number = 5000,
    randomCallback: typeof Math.random = Math.random,
  ) {
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.randomCallback = randomCallback;
  }

  public calculateDelayInMs(retryCount: number) {
    const exponentialDelay = this.baseDelayMs * (2 ** (retryCount + 1));
    const cappedDelay = Math.min(exponentialDelay, this.maxDelayMs);

    return Math.floor(this.randomCallback() * cappedDelay);
  }
}
