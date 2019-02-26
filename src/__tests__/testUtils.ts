// Copyright 2019 Cognite AS

/** @hidden */
export function createErrorReponse(status: number, message: string) {
  return {
    error: {
      code: status,
      message,
    },
  };
}

test('createErrorResponse', () => {
  expect(createErrorReponse(200, 'Abc')).toEqual({
    error: {
      code: 200,
      message: 'Abc',
    },
  });
});
