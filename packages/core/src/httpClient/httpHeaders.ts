export interface HttpHeaders {
  [key: string]: string;
}

/** @hidden */
export function getHeaderField(
  headers: HttpHeaders,
  key: string,
): string | undefined {
  const lowercaseKey = key.toLowerCase();

  for (const headerKey in headers) {
    if (headerKey.toLowerCase() === lowercaseKey) {
      return headers[headerKey];
    }
  }

  return undefined;
}
