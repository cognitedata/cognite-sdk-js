// Copyright 2019 Cognite AS

/** @hidden */
// export function listenForNonSuccessStatusCode(
//   axiosInstance: AxiosInstance,
//   status: number,
//   handler: (error: AxiosError, retry: () => void) => Promise<void>
// ) {
//   axiosInstance.interceptors.response.use(
//     response => response,
//     (error: AxiosError) => {
//       const response = (error.response as AxiosResponse) || {};
//       if (response.status === status) {
//         const retry = () => {
//           return rawRequest(axiosInstance, error.config);
//         };
//         return handler(error, retry);
//       }
//       return Promise.reject(error);
//     }
//   );
// }
