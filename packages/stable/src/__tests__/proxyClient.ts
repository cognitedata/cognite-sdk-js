// @ts-ignore
// hack to run properly the integration tests with OIDC, cause a bug with azure/msal-node lib.
import fetch from 'node-fetch-with-proxy';

async function sendGetRequestAsync(url: any, options: any) {
  const response = await fetch(url, options);
  const json = await response.json();
  const headers = response.headers.raw();
  return {
    headers: Object.create(Object.prototype, headers),
    body: json,
    status: response.status,
  };
}

async function sendPostRequestAsync(url: any, options: any) {
  const sendingOptions = options || {};
  sendingOptions.method = 'post';
  const response = await fetch(url, sendingOptions);
  const json = await response.json();
  const headers = response.headers.raw();
  return {
    headers: Object.create(Object.prototype, headers),
    body: json,
    status: response.status,
  };
}

export { sendGetRequestAsync, sendPostRequestAsync };
