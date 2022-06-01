// Copyright 2020 Cognite AS
import path from 'path';
import { promises as fs } from 'fs';
import { OpenApiDocument } from './openapi';
import { VersionFileManager } from './versionfile';
import {
  FromPathOption,
  PackageOption,
  ServiceOption,
  versionFileDirectoryPath,
  VersionOption,
} from './utils';
import { CodeGen, PassThroughFilter, ServiceNameFilter } from './codegen';
import {
  ConfigScopeOption,
  ConfigurationManager,
  ConfigurationOptions,
} from './configuration';

type VersionFileOptions = PackageOption & Partial<ServiceOption>;
type ConfigFileOptions = PackageOption & ServiceOption;
type ConfigFileUpdateOptions = PackageOption &
  ServiceOption &
  VersionOption &
  Partial<ConfigScopeOption>;

export class VersionFileCommand {
  public create = async (
    options: VersionFileOptions &
      Partial<VersionOption> &
      Partial<FromPathOption>
  ) => {
    const directory = await versionFileDirectoryPath(options);
    const vfm = new VersionFileManager({ directory: directory, ...options });
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
    const vfm = new VersionFileManager({ directory: directory, ...options });
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
    const vfm = new VersionFileManager({ directory: directory });
    const versionfileExists = await vfm.exists();
    if (!versionfileExists) {
      throw new Error(`Versionfile does not exist`);
    }

    await vfm.delete();
  };

  private updateFile = async (
    vfm: VersionFileManager,
    options: Partial<FromPathOption>
  ): Promise<void> => {
    const download = async (): Promise<OpenApiDocument> => {
      if (typeof options['from-path'] !== 'undefined') {
        return await vfm.downloadFromPath({ path: options['from-path'] });
      }
      return await vfm.downloadFromURL();
    };

    const document = await download();
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
    const config = new ConfigurationManager({
      directory: directory,
    });
    const configFile = await config.read();

    const packageDirectory = await versionFileDirectoryPath({
      package: options.package,
    });
    const vfm = new VersionFileManager({
      directory: configFile.scope == 'local' ? directory : packageDirectory,
    });

    const versionFile = await vfm.read();
    const pathFilter =
      typeof configFile.filter?.serviceName !== 'undefined'
        ? ServiceNameFilter(configFile.filter.serviceName)
        : PassThroughFilter;
    const gen = new CodeGen(versionFile, {
      ...configFile,
      outputDir: directory,
      filter: {
        path: pathFilter,
      },
    });

    try {
      const generatedTypeNames = await gen.generateTypes();
      return generatedTypeNames;
    } catch (error) {
      throw new Error('Unable to generate types: ' + error);
    }
  };

  private generateForAllServices = async (options: PackageOption) => {
    const directory = await versionFileDirectoryPath(options);
    const results: Record<string, string[]> = {};

    const services = await this.listConfiguredServices(directory);
    for (const service of services) {
      results[service] = await this.generateForSingleService({
        ...options,
        service: service,
      });
      console.info(`generated types for ${service}`);
    }

    const exportFilePath = path.resolve(directory, CodeGen.outputFileName);

    const blacklist: string[] = [];
    const fileContent = Object.keys(results)
      .map((service) => {
        const types = results[service];
        this.createExportStatementForService(service, types, blacklist);
        blacklist.push(...types);
      })
      .join('\n');

    try {
      await fs.writeFile(exportFilePath, fileContent);
    } catch (error) {
      throw new Error(
        'unable to update import file for generated types: ' + error
      );
    }
  };

  private createExportStatementForService = (
    service: string,
    types: string[],
    blacklist: string[]
  ): string => {
    const blackListedTypes = types
      .filter((t) => blacklist.includes(t))
      .join(', ');
    const typesFormat = types.filter((t) => !blacklist.includes(t)).join(', ');
    console.info(`skipped exporting types: [${blackListedTypes}]`);
    return `export { ${typesFormat} } from './api/${service}';`;
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
        ConfigurationManager.filename
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
    const config = new ConfigurationManager({
      directory: directory,
    });
    if (await config.exists()) {
      throw new Error(
        `Config already exists - did nothing (did you mean "update"?)`
      );
    }

    await this.update(options);
  };

  public update = async (options: ConfigFileUpdateOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigurationManager({
      directory: directory,
    });

    const defaultConfig: ConfigurationOptions = {
      version: options.version,
      service: options.service,
      scope: typeof options.scope === 'undefined' ? 'local' : options.scope,
      autoNameInlinedRequest: true,
      filter: {
        serviceName: options.service,
      },
    };

    try {
      await config.write(defaultConfig);
    } catch (error) {
      throw new Error('Config file does not exist - did nothing');
    }
  };

  public delete = async (options: ConfigFileOptions) => {
    const directory = await versionFileDirectoryPath(options);
    const config = new ConfigurationManager({
      directory: directory,
    });

    try {
      await config.delete();
    } catch (error) {
      throw new Error('Config file does not exist - did nothing');
    }
  };
}
