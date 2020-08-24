// Copyright 2020 Cognite AS
export type LoggerFunc = (event: LoggerEvent) => void;

export interface LoggerEventData {
  [key: string]: any;
}

export interface LoggerEvent {
  message: string;
  data?: LoggerEventData;
}

const defaultLogger = (event: LoggerEvent) => console.log(event);

export class Logger {
  private logger: LoggerFunc;
  private active: boolean;

  constructor(active = false, logger?: LoggerFunc) {
    this.logger = logger || defaultLogger;
    this.active = active;
  }

  public log(event: string | LoggerEvent) {
    if (!this.active) {
      return;
    }

    const loggedEvent = typeof event === 'string' ? { message: event } : event;

    this.logger(loggedEvent);
  }

  public enable() {
    this.active = true;
  }

  public disable() {
    this.active = false;
  }

  public attach(logger: LoggerFunc): Logger {
    this.logger = logger;

    return this;
  }

  public detach(): Logger {
    this.logger = defaultLogger;

    return this;
  }
}
