import { beforeAll, vi } from 'vitest';

function updateLocation(partialLocation: Partial<Location>) {
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      ...partialLocation,
    },
    writable: true,
  });
}

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'https://localhost',
      hostname: 'localhost',
      href: 'https://localhost/',
      protocol: 'https:',
      assign: vi.fn(),
    },
    writable: true,
  });
  Object.defineProperty(window, 'history', {
    value: {
      pushState: (state: object, unused: null, url: string) => {
        const newUrl = new URL(url, window.location.origin);
        updateLocation({
          href: newUrl.href,
          pathname: newUrl.pathname,
          search: newUrl.search,
          hash: newUrl.hash,
        });
      },
      replaceState: (state: object, unused: null, url: string) => {
        const newUrl = new URL(url, window.location.origin);
        updateLocation({
          href: newUrl.href,
          pathname: newUrl.pathname,
          search: newUrl.search,
          hash: newUrl.hash,
        });
      },
    },
    writable: true,
  });
});
