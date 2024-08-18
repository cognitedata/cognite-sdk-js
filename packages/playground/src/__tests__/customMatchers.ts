declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toContainObject(argument: object): R;
      toContainObjectMatching(argument: object): R;
    }
  }
}

export const matchers = {
  toContainObject(
    this: jest.MatcherContext,
    received: object[],
    argument: object
  ) {
    const pass = this.equals(
      received,
      expect.arrayContaining([expect.objectContaining(argument)])
    );

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} not to contain object ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: () =>
        `expected ${this.utils.printReceived(
          received
        )} to contain object ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
};
