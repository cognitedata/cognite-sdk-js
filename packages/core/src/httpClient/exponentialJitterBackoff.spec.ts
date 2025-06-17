import { describe, expect, vi, beforeEach, test } from 'vitest';
import { ExponentialJitterBackoff } from './exponentialJitterBackoff';

describe(ExponentialJitterBackoff.name, () => {
  let mathRandomCallback: typeof Math.random;

  beforeEach(() => {
    mathRandomCallback = vi.fn(() => 0.5);
  });

  test.each([
    { retryCount: 0, minExpectedDelay: 0, maxExpectedDelay: 200 },
    { retryCount: 1, minExpectedDelay: 0, maxExpectedDelay: 400 },
    { retryCount: 2, minExpectedDelay: 0, maxExpectedDelay: 800 },
    { retryCount: 3, minExpectedDelay: 0, maxExpectedDelay: 1600 },
    { retryCount: 4, minExpectedDelay: 0, maxExpectedDelay: 3200 },
    { retryCount: 10, minExpectedDelay: 0, maxExpectedDelay: 2 * (2**10) * 100 },
  ])("should have expected range for retry count $retryCount", ({ retryCount, minExpectedDelay, maxExpectedDelay }) => {
    // Arrange
    const backoff = new ExponentialJitterBackoff(100, Infinity, mathRandomCallback);

    // Act
    vi.mocked(mathRandomCallback).mockReturnValue(0);
    const min = backoff.calculateDelayInMs(retryCount);
    vi.mocked(mathRandomCallback).mockReturnValue(1);
    const max = backoff.calculateDelayInMs(retryCount);
    
    // Assert
    expect(min).toEqual(minExpectedDelay);
    expect(max).toEqual(maxExpectedDelay);
  });

  test("should increase delay when random value is increased", () => {
    // Arrange
    const backoff = new ExponentialJitterBackoff(100, Infinity, mathRandomCallback);

    // Act
    vi.mocked(mathRandomCallback).mockReturnValue(0.1);
    const low = backoff.calculateDelayInMs(5);
    vi.mocked(mathRandomCallback).mockReturnValue(0.9);
    const high = backoff.calculateDelayInMs(5);

    // Assert
    expect(low).toBeLessThan(high);
  });

  test('should apply random jitter to exponential delay', () => {
    // Arrange
    const backoff = new ExponentialJitterBackoff(100, 1000, mathRandomCallback);

    // Act/Assert (=random * 2**(2+1) * 100)
    vi.mocked(mathRandomCallback).mockReturnValue(0.25);
    expect(backoff.calculateDelayInMs(2)).toEqual(200);
    vi.mocked(mathRandomCallback).mockReturnValue(0.5);
    expect(backoff.calculateDelayInMs(2)).toEqual(400);
    vi.mocked(mathRandomCallback).mockReturnValue(0.75);
    expect(backoff.calculateDelayInMs(2)).toEqual(600);
  });

  test('should cap delay to max delay', () => { 
    vi.mocked(mathRandomCallback).mockReturnValue(1.0);
    const backoff = new ExponentialJitterBackoff(100000, 1000, mathRandomCallback);
    expect(backoff.calculateDelayInMs(100)).toEqual(1000);
  });

  test('should not grow indefinitely when number of attempts is huge', () => { 
    vi.mocked(mathRandomCallback).mockReturnValue(1.0);
    const backoff = new ExponentialJitterBackoff(100, 1000, mathRandomCallback);
    const retryCount = Number.MAX_SAFE_INTEGER - 1;
    expect(backoff.calculateDelayInMs(retryCount)).toEqual(1000);
  });

});
