# Code generation

> Generate TypeScript types from the Cognite OpenAPI document.

The current version aims to focus only on types, and does not generate
any SDK code for endpoints or tests.

Types are written to `types.gen.ts` for each service (e.g. `documents`)
and automatically exported. Only services configured via a `codegen.json`
file is processed, and will generate types for its given configuration.

## Things to be aware of

1. **Date based fields will be a numeric type**. This can be solved through AST manipulation, and may be fixed in the future.
2. **Changes like renaming component definition in the service-contract/openapi spec, will cause a breaking change in the cognite-sdk-js**. Essentially names are copied from the openapi spec. Treat your openapi spec with a strict fashion to avoid unnecessary breaking changes in the cognite-sdk-js. e.g. renaming your MyBadlyNamedResponse to something more suitable, will result in a breaking change and is discouraged.

## OpenAPI document snapshot

In order to have build reproducability we keep a copy of the OpenAPI document
in this repository (named `.cognite-openapi-snapshot.json`). To generate new types
it will need to be updated to the latest available. E.g.:

```console
yarn codegen fetch-latest --package=stable
```

In the future this can be automated so changes to the OpenAPI document is
frequently made automatically available via SDK updates.

## Generate updated types

After updating the OpenAPI document snapshot types must be updated. E.g:

```console
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

This can be used to test local changes to the OpenAPI document, or to 
lock a service to an older OpenAPI document should the latest version
cause issues.

## Enable a service for type generation

> Code generation must first be enable for a package

```console
yarn codegen enable --package stable --service my-service
```

This will generate a `codegen.json` file for the given service
so types will be created on next run.

The types extracted are based on the paths in the OpenAPI document
that matches the name of the service. It is currently not possible
to select individually paths other than this.

You may have to remove existing types to avoid conflicts.

## Disable a service for type generation

```console
yarn codegen disable --package stable --service my-service
```

This will will cleanup files within the service folder. Note that you
must re-generate types afterwards to cleanup export statements.
