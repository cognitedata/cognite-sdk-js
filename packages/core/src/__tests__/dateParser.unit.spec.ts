// Copyright 2020 Cognite AS
import { beforeEach, describe, expect, test } from 'vitest';
import DateParser from '../dateParser';

describe('DateParser', () => {
  const now = new Date();
  const nowInUnixTimestamp = now.getTime();
  let dateParser: DateParser;

  beforeEach(() => {
    dateParser = new DateParser(
      ['items', 'columns'],
      ['createdTime', 'deletedTime']
    );
  });

  test('transform Date in object to unix timestamp', async () => {
    const input = { time: now, items: [{ timestamp: now }] };
    const output = DateParser.parseFromDates(input);
    expect(output.time).toEqual(nowInUnixTimestamp);
    expect(output.items[0].timestamp).toEqual(nowInUnixTimestamp);
  });

  test('transform unix timestamp in response to Date', async () => {
    const input = {
      createdTime: nowInUnixTimestamp,
      items: [
        {
          createdTime: nowInUnixTimestamp,
          value: nowInUnixTimestamp,
          columns: { createdTime: nowInUnixTimestamp },
        },
      ],
      metadata: { createdTime: nowInUnixTimestamp },
      [0]: nowInUnixTimestamp,
    };
    const output = dateParser.parseToDates(input);
    expect(output.createdTime).toEqual(now);
    expect(output.items[0].createdTime).toEqual(now);
    expect(output.items[0].value).toEqual(nowInUnixTimestamp);
    expect(output.items[0].columns.createdTime).toEqual(now);
    expect(output.metadata.createdTime).toEqual(nowInUnixTimestamp);
    expect(output[0]).toEqual(nowInUnixTimestamp);
  });
});
