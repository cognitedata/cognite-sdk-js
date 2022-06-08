// Copyright 2022 Cognite AS
import path from 'path';
import { promises as fs } from 'fs';
import { OpenApiSnapshotManager } from './snapshot';
import {
  FromPathOption,
  PackageOption,
  ServiceOption,
  SnapshotPathOption,
  SnapshotScopeOption,
  versionFileDirectoryPath,
  VersionOption,
} from './utils';
import { CodeGen, passThroughFilter, createServiceNameFilter } from './codegen';
import { ConfigManager, ConfigOptions } from './configuration';

type VersionFileOptions = PackageOption & Partial<ServiceOption>;
type ConfigFileOptions = PackageOption & ServiceOption;
export type ConfigFileUpdateOptions = PackageOption &
  ServiceOption &
  VersionOption &
  Partial<SnapshotScopeOption> &
  Partial<SnapshotPathOption>;

export class VersionFileCommand {
  public create = async (
    options: VersionFileOptions &
      Partial<VersionOption> &
      Partial<FromPathOption>
  ) => {
    const directory = await versionFileDirectoryPath(options);
    const vfm = new OpenApiSnapshotManager({
      directory: directory,
      ...options,
    });
    const versionfileExists = await vfm.exists();
    if (versionfileExists) {
      throw new Error(
        `Versionfile already exists - did nothing (did you mean "update"?)`
      );
    }

    await this.updateFile(vfm, options);
  };

  public update = async (
    options: VersionFileOptions &
      Partial<VersionOption> &
      Partial<FromPathOption>
  ) => {
    const directory = await versionFileDirectoryPath(options);
    const vfm = new OpenApiSnapshotManager({
      directory: directory,
      ...options,
    });
    const versionfileExists = await vfm.exists();
    if (!versionfileExists) {
      throw new Error(
        `Versionfile does not exist - did nothing (did you mean "create"?)`
      );
    }

    await vfm.delete();
    await this.updateFile(vfm, options);
  };

  public delete = async (options: VersionFileOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const vfm = new OpenApiSnapshotManager({ directory: directory });
    const versionfileExists = await vfm.exists();
    if (!versionfileExists) {
      throw new Error(`Versionfile does not exist`);
    }

    await vfm.delete();
  };

  private updateFile = async (
    vfm: OpenApiSnapshotManager,
    options: Partial<FromPathOption>
  ): Promise<void> => {
    const document =
      typeof options['from-path'] !== 'undefined'
        ? await vfm.downloadFromPath({ path: options['from-path'] })
        : await vfm.downloadFromURL();
    await vfm.write(document);
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
    const configFile = await config.read();

    const packageDirectory = await versionFileDirectoryPath({
      package: options.package,
    });
    const vfm = new OpenApiSnapshotManager({
      directory: configFile.scope == 'service' ? directory : packageDirectory,
    });

    const pathFilter =
      typeof configFile.filter?.serviceName !== 'undefined'
        ? createServiceNameFilter(configFile.filter.serviceName)
        : passThroughFilter;
    const gen = new CodeGen({
      ...configFile,
      outputDir: directory,
      filter: {
        path: pathFilter,
      },
    });

    try {
      const snapshot = await vfm.read();
      const generatedTypeNames = await gen.generateTypes(snapshot);
      return generatedTypeNames;
    } catch (error) {
      throw new Error('Unable to generate types: ' + error);
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

    const vfm = new OpenApiSnapshotManager({ directory: packageDirectory });
    const gen = new CodeGen({
      outputDir: packageDirectory,
      autoNameInlinedRequest: false,
      filter: {
        path: passThroughFilter,
      },
    });

    const spec = await vfm.read();
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
    return {
      code: `export {\n  ${typesFormat}\n} from '${fromDirectory}/${moduleName}';`,
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
    return results;
  };
}

export class ConfigureCommand {
  public create = async (options: ConfigFileUpdateOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });
    if (await config.exists()) {
      throw new Error(
        `Config already exists - did nothing (did you mean "update"?)`
      );
    }

    await config.write(this.defaultConfig(options));
  };

  public update = async (options: ConfigFileUpdateOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });

    try {
      const currentConfig = await config.read();
      const updatedConfig = {
        ...currentConfig,
        ...options,
      };
      await config.write(updatedConfig);
    } catch (error) {
      throw new Error('Config file does not exist - did nothing: ' + error);
    }
  };

  private defaultConfig = (options: ConfigFileUpdateOptions): ConfigOptions => {
    return {
      version: options.version,
      service: options.service,
      scope: typeof options.scope === 'undefined' ? 'service' : options.scope,
      autoNameInlinedRequest: true,
      filter: {
        serviceName: options.service,
      },
    };
  };

  public delete = async (options: ConfigFileOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigManager({
      directory: directory,
    });

    try {
      await config.delete();
    } catch (error) {
      throw new Error('Config file does not exist - did nothing');
    }
  };
}
