# Codegen

Generate typescript types/interfaces from the Cognite open api contract. Only json files supported. 

The current version aims to generate the simplest representations. Endpoints and tests may require some unique or opinionated logic and are therefore not currently covered.

## Flow

To run code generation for a package the script behaves as follows:

 1. Identify any services with a config file.
 2. Evaluate the relevant lockfile for identified services.
 3. Generate relevant types/interfaces.
 4. Write types to a types.gen.ts file.
 5. Create an export statement for each service, that avoids exporting existing types.
 6. Write export statements to a types.gen.ts file at the package level.

See codegen.ts#main for high level understanding of the flow.

## Concepts

### Versionfile
A versionfile (named .cognite-api-version) holds a copy of the open api contract. Given Cognite api contracts do not have versioning, we need to store a copy to understand what version was used at a specific point in time. As the open api contracts frequently change, it's important to "lock" our generated definition to a open api version to make builds reproducable. This also helps debugging faulty code generating behavior, as the open api version can be shared.

A versionfile can be either considered service local or package global, this scope can be configured in the .codegen.json file. A global versionfile should aim to stay up to date, consequently any linked services will update their types as well.

### .codegen.json file
The .codegen.json file is the configuration file. Each service has their own which is read before generating types for the respective services. Any feature toggles can be added here to give users some extra costumization and flexibility if they have issues generating types.
