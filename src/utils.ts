// Copyright 2019 Cognite AS

/** @hidden */
export function sleepPromise(durationInMs: number) {
  return new Promise(resolve => {
    setTimeout(resolve, durationInMs);
  });
}
