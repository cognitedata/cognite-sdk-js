// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { File, Files, instance } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const files: File[] = [
  {
    id: 4802447032736442,
    fileName: 'random-filename.fbx',
    uploaded: false,
    createdTime: 1540276762033,
    lastUpdatedTime: 1540276762033,
  },
  {
    id: 2907113611785632,
    fileName: 'random-filename.fbx',
    directory: 'abc/tmp/',
    source: 'pdms',
    sourceId: 'pdms-secret-id',
    fileType: 'cad',
    assetIds: [71583811274669, 8014486409920710],
    uploaded: false,
    createdTime: 1540276882734,
    lastUpdatedTime: 1540276882734,
  },
];

const requestFiles: Partial<File>[] = [
  {
    fileName: 'random-filename.fbx',
  },
  {
    fileName: 'random-filename.fbx',
    directory: 'abc/tmp/',
    source: 'pdms',
    sourceId: 'pdms-secret-id',
    fileType: 'cad',
    assetIds: [71583811274669, 8014486409920710],
  },
];

describe('Files', () => {
  test('upload file', async () => {
    mock.onPost(/\/files\/initupload$/, requestFiles[1]).reply(config => {
      if (config.params.resumable !== true) {
        return [404];
      }
      if (config.headers['X-Upload-Content-Type'] !== 'application/js') {
        return [404];
      }
      if (config.headers.Origin !== 'localhost') {
        return [404];
      }
      return [
        200,
        {
          data: {
            fileId: 12345,
            uploadURL: 'abc/def',
          },
        },
      ];
    });
    const result = await Files.upload(requestFiles[1], {
      contentType: 'application/js',
      origin: 'localhost',
      resumable: true,
    });
    expect(result).toEqual({
      fileId: 12345,
      uploadURL: 'abc/def',
    });
  });

  test('download file', async () => {
    const reg = new RegExp(`/files/12345/downloadlink$`);
    mock.onGet(reg).reply(200, {
      data: 'abc/def',
    });
    const result = await Files.download(12345);
    expect(result).toEqual('abc/def');
  });

  test('retrieve file metadata', async () => {
    mock.onGet(/\/files\/12345$/).reply(200, {
      data: {
        items: [files[1]],
      },
    });
    const result = await Files.retrieveMetadata(12345);
    expect(result).toEqual(files[1]);
  });

  test('retrieve multiple file metadata', async () => {
    mock
      .onPost(/\/files\/byids$/, {
        items: files.map(item => item.id),
      })
      .reply(200, {
        data: {
          items: files,
        },
      });
    const result = await Files.retrieveMultipleMetadata(
      files.map(item => item.id)
    );
    expect(result).toEqual(files);
  });

  test('update file metadata', async () => {
    const reg = new RegExp(`/files/${files[0].id}/update$`);

    const changes = {
      fileName: {
        set: 'new-filename',
      },
      fileType: {
        setNull: true,
      },
    };
    mock.onPost(reg, changes).reply(200, {
      data: {
        items: [
          {
            ...files[0],
            fileName: changes.fileName.set,
          },
        ],
      },
    });
    const result = await Files.updateMetadata(files[0].id, changes);
    expect(result).toEqual({
      ...files[0],
      fileName: changes.fileName.set,
    });
  });

  test('update multiple file metadata', async () => {
    const changes = [
      {
        id: files[1].id,
        fileName: {
          set: 'new-filename',
        },
      },
      {
        id: files[0].id,
        fileType: {
          setNull: true,
        },
      },
    ];
    const reg = new RegExp(`/files/update$`);
    mock
      .onPost(reg, {
        items: changes,
      })
      .reply(200, {});
    await Files.updateMultipleMetadata(changes);
  });

  test('delete files', async () => {
    mock
      .onPost(/\/files\/delete$/, {
        items: [123, 456],
      })
      .reply(200, {
        data: {
          deleted: [123],
          failed: [456],
        },
      });
    const { failed, deleted } = await Files.delete([123, 456]);
    expect(deleted).toEqual([123]);
    expect(failed).toEqual([456]);
  });

  test('list files', async () => {
    const params = {
      assetId: 12345,
      isUploaded: true,
      sort: 'DESC',
      cursor: 'abc',
    };
    mock.onGet(/\/files$/, { params }).reply(200, {
      data: {
        previousCursor: 'prevCrs',
        nextCursor: 'nxtCrs',
        items: [files[1]],
      },
    });
    const result = await Files.list(params);
    expect(result).toEqual({
      previousCursor: 'prevCrs',
      nextCursor: 'nxtCrs',
      items: [files[1]],
    });
  });

  test('search files', async () => {
    const params = {
      name: 'filename.pdf',
      assetIds: [123, 456],
      offset: 10,
    };
    mock
      .onGet(/\/files\/search$/, {
        params,
      })
      .reply(200, {
        data: {
          items: [files[1]],
        },
      });
    const result = await Files.search(params);
    expect(result).toEqual({ items: [files[1]] });
  });

  test('replace file metadata', async () => {
    mock
      .onPost(/\/files$/, {
        items: [files[1]],
      })
      .reply(200, {});
    await Files.replaceMetadata([files[1]]);
  });
});
