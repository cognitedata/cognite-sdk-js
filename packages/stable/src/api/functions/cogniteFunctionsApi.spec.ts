// import { jest } from '@jest/globals';

// import { CogniteClient } from '@cognite/sdk';

// import { CogniteFunctionsAPI } from './cogniteFunctionsApi';
// import {
//   CogniteFunctionCallStatus,
//   CogniteFunctionResponse,
//   CogniteFunctionsFilter,
//   CreateSessionResponseDTO,
//   SessionDTO,
// } from './types';

// const cogniteSdkPostMock = jest.fn();
// const cogniteSdkGetMock = jest.fn();

// describe(CogniteFunctionsAPI.name + ' Test', () => {
//   let sdk: CogniteClient;
//   let cogniteFunctionsAPI: CogniteFunctionsAPI;

//   beforeEach(() => {
//     sdk = {
//       getBaseUrl: () => 'https://api.cognitedata.com',
//       project: 'test-project',
//       post: cogniteSdkPostMock,
//       get: cogniteSdkGetMock,
//     } as unknown as CogniteClient;
//     cogniteFunctionsAPI = new CogniteFunctionsAPI(sdk);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('call', () => {
//     it('should call the correct URL with the correct parameters', async () => {
//       const functionId = 'test-function-id';
//       const params = { key: 'value' };
//       const session = 'test-session';
//       const expectedUrl = `https://api.cognitedata.com/api/v1/projects/test-project/functions/${functionId}/call`;
//       const expectedResponse = {
//         status: 'Running',
//         id: 1,
//         startTime: 1726950221998,
//         functionId: 1,
//       } as CogniteFunctionCallStatus;

//       (sdk.post as jest.Mock).mockImplementation(() =>
//         Promise.resolve(expectedResponse)
//       );

//       const response = await cogniteFunctionsAPI.call(
//         functionId,
//         params,
//         session
//       );

//       expect(sdk.post).toHaveBeenCalledWith(expectedUrl, {
//         data: {
//           data: params,
//           nonce: session,
//         },
//       });
//       expect(response).toEqual(expectedResponse);
//     });
//   });

//   describe('callLogs', () => {
//     it('should retrieve function call logs by call id', async () => {
//       const functionId = 'test-function-id';
//       const runId = 'test-run-id';
//       const expectedUrl = `https://api.cognitedata.com/api/v1/projects/test-project/functions/${functionId}/calls/${runId}`;
//       const expectedResponse = {
//         status: 'Running',
//         id: 1,
//         startTime: 1726950221998,
//         functionId: 1,
//       } as CogniteFunctionCallStatus;

//       (sdk.get as jest.Mock).mockImplementation(() =>
//         Promise.resolve(expectedResponse)
//       );

//       const response = await cogniteFunctionsAPI.callLogs(functionId, runId);

//       expect(sdk.get).toHaveBeenCalledWith(expectedUrl);
//       expect(response).toEqual(expectedResponse);
//     });
//   });

//   describe('callResponse', () => {
//     it('should retrieve response from a function call', async () => {
//       const functionId = 'test-function-id';
//       const runId = 'test-run-id';
//       const expectedUrl = `https://api.cognitedata.com/api/v1/projects/test-project/functions/${functionId}/calls/${runId}/response`;

//       const expectedResponse = {
//         response: { key: 'value' },
//         callId: 1,
//         functionId: 1,
//       } as CogniteFunctionResponse;

//       (sdk.get as jest.Mock).mockImplementation(() =>
//         Promise.resolve(expectedResponse)
//       );

//       const response = await cogniteFunctionsAPI.callResponse(
//         functionId,
//         runId
//       );

//       expect(sdk.get).toHaveBeenCalledWith(expectedUrl);
//       expect(response).toEqual(expectedResponse);
//     });
//   });

//   describe('list', () => {
//     it('should list functions with the provided filter', async () => {
//       const filter = {
//         filter: { name: 'test-function' },
//       } as CogniteFunctionsFilter;
//       const expectedUrl = `https://api.cognitedata.com/api/v1/projects/test-project/functions/list`;
//       const expectedResponse = { items: [{ name: 'test-function' }] };

//       (sdk.post as jest.Mock).mockImplementation(() =>
//         Promise.resolve(expectedResponse)
//       );

//       const response = await cogniteFunctionsAPI.list(filter);

//       expect(sdk.post).toHaveBeenCalledWith(expectedUrl, { data: filter });
//       expect(response).toEqual(expectedResponse);
//     });
//   });

//   describe('createExecutionSessionToken', () => {
//     it('should create an execution session token', async () => {
//       const expectedUrl = `https://api.cognitedata.com/api/v1/projects/test-project/sessions`;
//       const expectedResponse = {
//         items: [
//           {
//             status: 'READY',
//             id: 1,
//             nonce: 'test-nonce',
//           } as CreateSessionResponseDTO,
//         ],
//       };

//       (sdk.post as jest.Mock).mockImplementation(() =>
//         Promise.resolve(expectedResponse)
//       );

//       const response = await cogniteFunctionsAPI.createExecutionSessionToken();

//       expect(sdk.post).toHaveBeenCalledWith(expectedUrl, {
//         data: {
//           items: [{ tokenExchange: true }],
//         },
//       });
//       expect(response).toEqual(expectedResponse);
//     });
//   });
// });
