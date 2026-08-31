# Datapoints protobuf bindings

Protocol buffer definitions for datapoints insert and list responses live in the separate repository **[cognitedata/protobuf-files](https://github.com/cognitedata/protobuf-files)** (`v1/timeseries/`):

- `data_points.proto`
- `data_point_insertion_request.proto`
- `data_point_list_response.proto`

Generated JavaScript and TypeScript declarations live in [`generated/`](./generated/).

## Regenerate bindings

```bash
PROTO_DIR=/absolute/path/to/protobuf-files/v1/timeseries yarn workspace @cognite/sdk generate:proto
```

The generator uses `protobufjs-cli` (`pbjs` / `pbts`), listed as a devDependency of `@cognite/sdk`.
