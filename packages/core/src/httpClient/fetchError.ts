// Copyright 2026 Cognite AS

const READ_TIMEOUT_CODES = new Set([
  'ETIMEDOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
]);

const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'EPIPE',
  'UND_ERR_CONNECT_TIMEOUT',
]);

function getCauseCode(error: Error): string {
  if (!('cause' in error)) return '';

  const { cause } = error;
  if (typeof cause === 'object' && cause !== null && 'code' in cause) {
    const { code } = cause;
    if (typeof code === 'string') return code;
  }
  return '';
}

export function isReadTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  if (error.name === 'TimeoutError' || error.name === 'AbortError') {
    return true;
  }

  return READ_TIMEOUT_CODES.has(getCauseCode(error));
}

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = getCauseCode(error);
  if (CONNECTION_ERROR_CODES.has(code)) return true;

  // Browser: fetch throws a plain TypeError for network failures
  return error instanceof TypeError && code === '';
}
