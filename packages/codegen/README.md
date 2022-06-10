# Code generation

> Generate TypeScript types from the Cognite OpenAPI document.

The current version aims to focus only on types, and does not generate
any SDK code for endpoints or tests.

Types are written to `types.gen.ts` for each service (e.g. `documents`)
and automatically exported. Only services configured via a `codegen.json`
file is processed, and will generate types for its given configuration.

## OpenAPI document snapshot

In order to have build reproducability we keep a copy of the OpenAPI document
in this repository (named `.cognite-openapi-snapshot.json`). To generate new types
it will need to be updated to the latest available. E.g.:

```bash
yarn codegen fetch-latest --package=stable
```

In the future this can be automated so changes to the OpenAPI document is
frequently made automatically available via SDK updates.

## Generate updated types

After updating the OpenAPI document snapshot types must be updated. E.g:

```bash
yarn codegen generate-types --package=stable
```

## Overriding the OpenAPI document

It is possible to override the OpenAPI document used to generate
types by specifying a path to the document instead of the API version.

The `codegen.json` file must be changed to contain:

```json
{
  "snapshot": {
    "path": "path/to/openapi-doc.json"
  }
}
```

This can be used to test changes to the OpenAPI document while working
on evolving it, or to lock a service to an older OpenAPI document should
it block other updates.

## Configuring type generation for a service

```bash
yarn codegen configure --package stable --service my-service
```

This will generate a `codegen.json` file for the given service
so types will be created on next run.

The types extracted are based on the paths in the OpenAPI document
that matches the name of the service. It is currently not possible
to select individually paths other than this.
