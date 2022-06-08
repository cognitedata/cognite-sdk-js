// Copyright 2022 Cognite AS
import path from 'path';
import { promises as fs } from 'fs';
import { OpenApiSnapshotManager } from './snapshot';
import {
  PackageOption,
  ServiceOption,
  versionFileDirectoryPath,
  VersionOption,
} from './utils';
import { CodeGen, passThroughFilter, pathFilterFromConfig } from './codegen';
import { ConfigManager, PackageConfig, ServiceConfig } from './configuration';

export type ConfigFileUpdateOptions = PackageOption & Partial<ServiceOption>;

export class SnapshotCommand {
  public update = async (options: PackageOption) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });
    const configFile = (await config.read()) as PackageConfig;

    const snapshot = new OpenApiSnapshotManager({
      directory: directory,
      version: configFile.snapshot.version,
    });

    if (typeof configFile.snapshot.version === 'undefined') {
      throw new Error('Can`t download snapshot when "version" was not defined');
    }

    const document = await snapshot.downloadFromURL();
    await snapshot.write(document);
  };

  public delete = async (options: PackageOption & Partial<ServiceOption>) => {
    const directory = await versionFileDirectoryPath(options);
    const vfm = new OpenApiSnapshotManager({
      directory: directory,
      version: '?',
    });
    const versionfileExists = await vfm.exists();
    if (!versionfileExists) {
      throw new Error(`snapshot does not exist`);
    }

    await vfm.delete();
  };
}

export class ConfigureCommand {
  public create = async (
    options: PackageOption & Partial<ServiceOption> & Partial<VersionOption>
  ) => {
    const directory = await versionFileDirectoryPath(options);
    const mngr = new ConfigManager({
      directory: directory,
    });
    if (await mngr.exists()) {
      throw new Error(`Config already exists - did nothing`);
    }

    const config = this.defaultConfig(options);
    await mngr.write(config);
  };

  public validate = async (options: PackageOption & Partial<ServiceOption>) => {
    const directory = await versionFileDirectoryPath(options);
    const mngr = new ConfigManager({
      directory: directory,
    });

    await mngr.read();
  };

  public delete = async (options: PackageOption & Partial<ServiceOption>) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });

    await config.delete();
  };

  private defaultConfig = (
    options: PackageOption & Partial<ServiceOption> & Partial<VersionOption>
  ): ServiceConfig | PackageConfig => {
    if (typeof options.service !== 'undefined') {
      return {
        service: options.service,
        filter: {
          serviceName: options.service,
        },
        inlinedSchemas: {
          autoNameRequest: true,
        },
      } as ServiceConfig;
    } else {
      if (typeof options.version === 'undefined') {
        throw new Error(
          '"version" must be defined when creating a package config'
        );
      }
      return {
        snapshot: {
          version: options.version,
        },
      } as PackageConfig;
    }
  };
}

export class CodeGenCommand {
  public generate = async (options: PackageOption & Partial<ServiceOption>) => {
    if (typeof options.service !== 'undefined') {
      await this.generateForSingleService({
        ...options,
        service: options.service,
      });
    } else {
      await this.generateForAllServices(options);
    }
  };

  private generateForSingleService = async (
    options: PackageOption & ServiceOption
  ): Promise<string[]> => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });
    const configFile = (await config.read()) as ServiceConfig;

    const packageDirectory = await versionFileDirectoryPath({
      package: options.package,
    });

    const vfm = new OpenApiSnapshotManager({
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
      const snapshot = await vfm.read();
      const generatedTypeNames = await gen.generateTypes(snapshot);
      return generatedTypeNames;
    } catch (error) {
      throw new Error(
        `unable to generate types for service "${options.service}": ${error}`
      );
    }
  };

  private generateForAllServices = async (options: PackageOption) => {
    const directory = await versionFileDirectoryPath(options);
    const serviceTypesRecord: Record<string, string[]> = {};

    const services = await this.listConfiguredServices(directory);
    for (const service of services) {
      serviceTypesRecord[service] = await this.generateForSingleService({
        ...options,
        service: service,
      });
      console.info(`generated types for ${service}`);
    }

    // identify shared resources and use the global versionfile to generate them
    // this aviods that a local outdated versionfile may enforce outdated shared types
    const sharedTypes = await this.generateSharedTypes(
      serviceTypesRecord,
      directory
    );
    const { code } = this.createExportStatementForPackage(sharedTypes, []);
    const blacklist = [...sharedTypes];
    const exportStatements: string[] = [code];
    console.info(`generated ${sharedTypes.length} shared types for package`);

    for (const service of services) {
      const types = serviceTypesRecord[service];
      const { code, skipped } = this.createExportStatementForService(
        service,
        types,
        blacklist
      );
      exportStatements.push(code);
      blacklist.push(...types);
      console.info(`${service}: skipped exporting [${skipped.join(', ')}]`);
    }

    const exportFilePath = path.resolve(directory, 'exports.gen.ts');
    const fileContent = exportStatements.join('\n');

    try {
      await fs.writeFile(exportFilePath, fileContent);
    } catch (error) {
      throw new Error(
        'unable to update import file for generated types: ' + error
      );
    }
  };

  private generateSharedTypes = async (
    serviceTypesRecord: Record<string, string[]>,
    packageDirectory: string
  ): Promise<string[]> => {
    const types = Object.values(serviceTypesRecord).reduce(
      (acc, v) => acc.concat(v),
      []
    );

    const sharedTypes: string[] = [];
    for (let i = 0; i < types.length - 1; i++) {
      const remain = types.slice(i + 1);
      const t = types[i];
      if (remain.includes(t)) {
        sharedTypes.push(t);
      }
    }

    const config = new ConfigManager({
      directory: packageDirectory,
    });
    const configFile = (await config.read()) as PackageConfig;

    const vfm = new OpenApiSnapshotManager({
      directory: packageDirectory,
      path: configFile.snapshot?.path,
    });
    const spec = await vfm.read();

    const gen = new CodeGen({
      outputDir: packageDirectory,
      autoNameInlinedRequest: false,
      filter: {
        path: passThroughFilter,
      },
    });

    const generatedTypeNames = await gen.generateTypesFromSchemas(
      spec.openapi,
      spec.components?.schemas,
      (schemaName) => sharedTypes.includes(schemaName)
    );
    return generatedTypeNames;
  };

  private createExportStatement = (
    fromDirectory: string,
    types: string[],
    blacklist: string[]
  ): { code: string; skipped: string[] } => {
    const skipped = types.filter((t) => blacklist.includes(t));
    const typesFormat = types
      .filter((t) => !blacklist.includes(t))
      .join(',\n  ');
    const moduleName = path.parse(CodeGen.outputFileName).name;
    const code = `export {\n  ${typesFormat}\n} from '${fromDirectory}/${moduleName}';`;
    return {
      code: types.length > 0 ? code : '',
      skipped: skipped,
    };
  };

  private createExportStatementForService = (
    service: string,
    types: string[],
    blacklist: string[]
  ): { code: string; skipped: string[] } => {
    return this.createExportStatement(`./api/${service}`, types, blacklist);
  };

  private createExportStatementForPackage = (
    types: string[],
    blacklist: string[]
  ): { code: string; skipped: string[] } => {
    return this.createExportStatement(`.`, types, blacklist);
  };

  private listConfiguredServices = async (
    directory: string
  ): Promise<string[]> => {
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
  };
}
