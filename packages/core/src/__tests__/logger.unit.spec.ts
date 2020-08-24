import { Logger } from '../logger';

describe('Logger', () => {
  const spyConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
    /* ignore console.log */
  });
  const mockLogger = jest.fn();
  const message = 'message';
  const data = { test: 'test' };

  beforeEach(() => {
    spyConsoleLog.mockClear();
    mockLogger.mockReset();
  });

  afterAll(() => {
    spyConsoleLog.mockRestore();
  });

  test('should call console.log by default', () => {
    const logger = new Logger(true);

    logger.log(message);

    expect(spyConsoleLog).toHaveBeenCalledWith({ message });
  });

  test('should be disabled by default', () => {
    const logger = new Logger();

    logger.log('message');

    expect(spyConsoleLog).toHaveBeenCalledTimes(0);
  });

  test('should attach logger if provided', () => {
    const logger = new Logger(true, mockLogger);

    logger.log(message);

    expect(mockLogger).toHaveBeenCalledWith({ message });
  });

  test('should call logger with data if provided', () => {
    const logger = new Logger(true);

    logger.attach(mockLogger).log({ message, data });

    expect(mockLogger).toHaveBeenCalledWith({ message, data });
  });
});
