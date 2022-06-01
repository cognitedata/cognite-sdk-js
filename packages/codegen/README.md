# Codegen

Generate typescript types/interfaces from the Cognite open api contract json types. 

The current version aims to generate the simplest representations. Endpoints and tests may require some unique or opinionated logic and are therefore not currently covered.

## Flow

 1. Evaluate the relevant lockfile.
 2. Generate relevant types/interfaces.
 3. Parse the generated content into an AST tree and apply any given pre-processing steps.
 4. Convert the AST tree to types/interfaces and write the data to a file.

See codegen.ts#main for high level understanding of the flow.

## Concepts

### Versionfile
A lockfile holds the current open api contract which typescript definition are derived from. As the open api contracts frequently change, it's important to "lock" our generated definition to a open api version to make builds reproducable. This also helps debugging faulty code generating behavior, as the open api version can be shared.

### .codegen.json file
The .codegen.json file is responsible for storing a version of the open api specification and configuration that can be used when generating ts types.



.......
wip
.......

# ways to interact with a versionfile

> previously known as "lockfile"

## when using a versionfile

1. create a new versionfile from a completed and compiled openapi spec
1.1 from a public url
1.2 from a local file

2. Filter out irrelevant endpoints

3. Name implicit types (often just responses / requests with inlined types)

4. Create a dependency tree or type relation (consistently deduplicate types)


## when missing a service file for a specific service

> same as running for a set of endpoints


## when missing a service for an entire package

> same as running for a set of endpoints


## when running for a set of endpoints
...


# versionfile
A versionfile is a list of relevant endpoints and a copy of the open api contracts. It's used to generate a types.gen.ts which
mirrors all json schematics (explicit and implicit types) in the open api spec. The file is named ".cognite-api-version" and should
never be edited manually. If you need to manually edit it, you probably found a bug or a new requirement. Treat it as such.

A versionfile is unique per package. A versionfile at the package level (say sdk, or sdk-playground) must always represent the latest
open api schematics. Endpoints defined here should idealy be auto-updated. The types are in a shared generated files called
types.gen.ts, which can be found at "./packages/$pkg/src/types.gen.ts".

A versionfile defined in a service specific folder (eg. sdk-playground/documents) requires manual attention. The versionfile is
specified in their respective folder, eg: "./packages/$pkg/src/documents/.cognite-api-version", and will create
a "types.gen.ts" file in the same scope ... Note that you must
also update "./packages/$pkg/types.ts" to import any exported types/interfaces.


Note that using both the package global and service folder specific versionfile is disabled to avoid conflicts during auto-updates.


## content

```json
{
  "endpoints": [
    "endpoint1:METHOD",
  ],
  "version": {...}
}
```