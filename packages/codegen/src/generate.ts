// Copyright 2022 Cognite AS
import path from 'path';
import { promises as fs } from 'fs';
import { OpenApiSnapshotManager } from './snapshot';
import {
  PackageOption,
  ServiceOption,
  closestConfigDirectoryPath,
} from './utils';
import { CodeGen, passThroughFilter, pathFilterFromConfig } from './codegen';
import { ConfigManager, PackageConfig, ServiceConfig } from './configuration';

type GenerateOptions = PackageOption;

export async function generateTypes(options: GenerateOptions): Promise<void> {
  await generateForAllServices(options);
}

async function generateServiceTypes(
  options: PackageOption & ServiceOption
): Promise<string[]> {
  const directory = await closestConfigDirectoryPath(options);
  const config = new ConfigManager({
    directory: directory,
  });
  const configFile = (await config.read()) as ServiceConfig;

  const packageDirectory = await closestConfigDirectoryPath({
    package: options.package,
  });

  const snapshotMngr = new OpenApiSnapshotManager({
    directory: packageDirectory,
    path: configFile.snapshot?.path,
  });

  const gen = new CodeGen({
    autoNameInlinedRequest: configFile.inlinedSchemas.autoNameRequest,
    outputDir: directory,
    filter: {
      path: pathFilterFromConfig(configFile),
    },
  });

  try {
    const snapshot = await snapshotMngr.read();
    const generatedTypeNames = await gen.generateTypes(snapshot);
    return generatedTypeNames;
  } catch (error) {
    throw new Error(
      `Unable to generate types for service "${options.service}": ${error}`
    );
  }
}

async function generateForAllServices(options: PackageOption) {
  const directory = await closestConfigDirectoryPath(options);
  const serviceTypesRecord: Record<string, string[]> = {};

  const services = await listConfiguredServices(directory);
  for (const service of services) {
    serviceTypesRecord[service] = await generateServiceTypes({
      ...options,
      service: service,
    });
    console.info(`generated types for ${service}`);
  }

  // identify shared resources and use the package snapshot to generate them
  // this avoids that a local outdated snapshot may enforce outdated shared types
  const sharedTypes = await generateSharedTypes(serviceTypesRecord, directory);
  const { code } = createExportStatementForPackage(sharedTypes, []);
  const blacklist = [...sharedTypes];
  const exportStatements: string[] = [code];
  console.info(`generated ${sharedTypes.length} shared types for package`);

  for (const service of services) {
    const types = serviceTypesRecord[service];
    const { code, skipped } = createExportStatementForService(
      service,
      types,
      blacklist
    );
    exportStatements.push(code);
    blacklist.push(...types);
    console.info(`${service}: skipped exporting [${skipped.join(', ')}]`);
  }

  const exportFilePath = path.resolve(directory, 'exports.gen.ts');
  const fileContent = `// Copyright 2022 Cognite AS\n${exportStatements.join(
    '\n'
  )}`;

  try {
    await fs.writeFile(exportFilePath, fileContent);
  } catch (error) {
    throw new Error(
      `Unable to update import file for generated types: ${error}`
    );
  }
}

async function generateSharedTypes(
  serviceTypesRecord: Record<string, string[]>,
  packageDirectory: string
): Promise<string[]> {
  const types = Object.values(serviceTypesRecord).reduce(
    (acc, v) => acc.concat(v),
    []
  );

  // find shared types across services
  const sharedTypes: Set<string> = new Set();
  for (let i = 0; i < types.length - 1; i++) {
    const remain = types.slice(i + 1);
    const t = types[i];
    if (remain.includes(t)) {
      sharedTypes.add(t);
    }
  }

  const config = new ConfigManager({
    directory: packageDirectory,
  });
  const configFile = (await config.read()) as PackageConfig;

  const snapshotMngr = new OpenApiSnapshotManager({
    directory: packageDirectory,
    path: configFile.snapshot?.path,
  });
  const snapshot = await snapshotMngr.read();

  const gen = new CodeGen({
    outputDir: packageDirectory,
    autoNameInlinedRequest: false,
    filter: {
      path: passThroughFilter,
    },
  });

  const generatedTypeNames = await gen.generateTypesFromSchemas(
    snapshot.openapi,
    snapshot.components?.schemas,
    (schemaName) => sharedTypes.has(schemaName)
  );
  return generatedTypeNames;
}

function createExportStatement(
  fromDirectory: string,
  types: string[],
  blacklist: string[]
): { code: string; skipped: string[] } {
  const skipped = types.filter((t) => blacklist.includes(t));
  const typesFormat = types.filter((t) => !blacklist.includes(t)).join(',\n  ');
  const moduleName = path.parse(CodeGen.outputFileName).name;
  const code = `export {\n  ${typesFormat}\n} from '${fromDirectory}/${moduleName}';`;
  return {
    code: types.length > 0 ? code : '',
    skipped: skipped,
  };
}

function createExportStatementForService(
  service: string,
  types: string[],
  blacklist: string[]
): { code: string; skipped: string[] } {
  return createExportStatement(`./api/${service}`, types, blacklist);
}

function createExportStatementForPackage(
  types: string[],
  blacklist: string[]
): { code: string; skipped: string[] } {
  return createExportStatement(`.`, types, blacklist);
}

async function listConfiguredServices(directory: string): Promise<string[]> {
  const apiDirectory = path.resolve(directory, 'api');

  const results: string[] = [];
  const services = await fs.readdir(apiDirectory);
  for (const service of services) {
    const configFilePath = path.resolve(
      apiDirectory,
      service,
      ConfigManager.filename
    );
    try {
      await fs.stat(configFilePath);
      results.push(service);
    } catch (error) {
      // skip projects without a config file
    }
  }
  return results.sort();
}
