// Copyright 2020 Cognite AS
import { describe, expect, test } from 'vitest';
import { Queue } from '../queue';

describe('Queue', () => {
  const queue = new Queue<number>();
  test('add', () => {
    queue.add(1);
    queue.add(2);
    queue.add(3);
  });

  test('last', () => {
    expect(queue.last()).toBe(1);
  });

  test('first', () => {
    expect(queue.first()).toBe(3);
  });

  test('size', () => {
    expect(queue.size()).toBe(3);
  });

  test('remove', () => {
    queue.remove();
    expect(queue.size()).toBe(2);
    expect(queue.first()).toBe(3);
    expect(queue.last()).toBe(2);
  });
});
