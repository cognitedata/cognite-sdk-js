# Codegen

Generate typescript types/interfaces from the Cognite open api contract. Only json files supported.

The current version aims to generate the simplest representations. Endpoints and tests may require some unique or opinionated logic and are therefore not currently covered.

## Flow

To run code generation for a package the script behaves as follows:

 1. Identify any services with a config file.
 2. Evaluate the relevant open api snapshot for identified services.
 3. Generate relevant types/interfaces.
 4. Write types to a `types.gen.ts` file.
 5. Create an export statement for each service, that avoids exporting existing types.
 6. Write export statements to a `types.gen.ts` file at the package level.

## Concepts

### Snapshot

A open api snapshot (named `.cognite-api-snapshot`) holds a copy of the open api contract. Given Cognite api contracts do not have versioning, we need to store a copy to understand what version was used at a specific point in time - hence snapshot. As the open api contracts frequently change, it's important to "lock" our generated definition to a open api version to have reproducable builds. This also helps debugging faulty code generating behavior, as the source version can be shared.

A service may specify their own snapshot if the package snapshot causes troubles.

### Config file `codegen.json`

The `codegen.json` file is the configuration file. Each service has their own which is read before generating types for the respective services. Any feature toggles can be added here to give users some extra costumization and flexibility if they have issues generating types.
