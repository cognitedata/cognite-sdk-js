// Copyright 2018 Cognite AS

import { scheduleTask } from '../../helpers/scheduler';

jest.useFakeTimers();

describe('scheduler', () => {
  test('cancel task', () => {
    const taskMock = jest.fn();
    const nowInMs = new Date().getTime();
    const triggerTimeInMs = nowInMs + 5000;
    const cancelTask = scheduleTask(taskMock, triggerTimeInMs, 1000);
    cancelTask();
    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledWith(expect.any(Number));

    jest.runOnlyPendingTimers();
    expect(taskMock).not.toBeCalled();
  });

  test('task is called', () => {
    const taskMock = jest.fn();
    const nowInMs = new Date().getTime();
    const triggerTimeInMs = nowInMs;
    const cancelTask = scheduleTask(taskMock, triggerTimeInMs, 1000);
    expect(taskMock).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    expect(taskMock).toHaveBeenCalledTimes(1);

    // not called twice
    jest.runOnlyPendingTimers();
    expect(taskMock).toHaveBeenCalledTimes(1);

    cancelTask(); // should not throw anything
  });

  test('task is eventually called', () => {
    const taskMock = jest.fn();
    const nowInMs = Date.now();
    const triggerTimeInMs = nowInMs + 1500;
    scheduleTask(taskMock, triggerTimeInMs, 1000);
    expect(taskMock).not.toHaveBeenCalled();

    const spiedDateNow = jest.spyOn(Date, 'now');

    spiedDateNow.mockReturnValue(nowInMs);
    jest.advanceTimersByTime(1500);
    expect(taskMock).toHaveBeenCalledTimes(0);

    spiedDateNow.mockReturnValue(triggerTimeInMs);
    jest.advanceTimersByTime(2000);
    expect(taskMock).toHaveBeenCalledTimes(1);

    spiedDateNow.mockRestore();
  });
});
