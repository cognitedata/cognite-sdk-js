// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import {
  closestConfigDirectoryPath,
  DirectoryOption,
  PackageOption,
  PathOption,
  ServiceOption,
  VersionOption,
} from './utils';

/**
 * SnapshotPath allows you to work on a snapshot locally. Useful when you want to
 * see how changes to OpenAPI document affects the generated code without adjusting the official OpenAPI document.
 */
export interface SnapshotPath extends PathOption {
  version?: never;
}

/**
 * SnapshotVersion is used in production when generating code. Specify a API version (v1, playground, etc.)
 * to use when downloading and creating a OpenAPI document snapshot.
 */
export interface SnapshotVersion extends VersionOption {
  path?: never;
}

export interface PackageConfig {
  snapshot: SnapshotVersion | SnapshotPath;
}

export interface ServiceConfig {
  snapshot?: SnapshotPath;
  service: string;
  inlinedSchemas: {
    autoNameRequest: boolean;
  };
  filter: {
    serviceName?: string;
  };
}

type ConfigManagerOptions = DirectoryOption;

class ConfigManager<T> {
  public static readonly filename = 'codegen.json';
  private path: string;

  constructor(readonly options: ConfigManagerOptions) {
    this.path = `${options.directory}/${ConfigManager.filename}`;
  }

  public exists = async (): Promise<boolean> => {
    try {
      await fs.stat(this.path);
      return true;
    } catch (error) {
      return false;
    }
  };

  protected validateSnapshot = async (
    snapshot: any,
    legalKeys: string[],
    source: string
  ): Promise<void> => {
    const snapshotKeys = Object.keys(snapshot);
    if (snapshotKeys.length != 1) {
      throw new Error('Snapshot configuration must have exactly one setting');
    }

    if (!legalKeys.includes(snapshotKeys[0])) {
      const encapsulatedKeys = legalKeys.map((key) => `"${key}"`);
      throw new Error(
        `A ${source} config can only define ${encapsulatedKeys.join(
          ' or '
        )} within "snapshot". Got "${snapshotKeys[0]}" instead`
      );
    }

    if (snapshotKeys[0] == 'path') {
      try {
        await fs.stat(snapshot.path);
      } catch (error) {
        throw new Error(`Invalid snapshot path: ${error}`);
      }
    }
  };

  protected validate = async (config: T): Promise<T> => {
    return config;
  };

  public write = async (config: T): Promise<void> => {
    await this.validate(config);
    const json = JSON.stringify(config, null, 2);

    try {
      await fs.writeFile(this.path, json);
    } catch (error) {
      throw new Error(`Unable to save config: ${error}`);
    }
  };

  public read = async (): Promise<T> => {
    const json = await this.readFromJsonFile();
    const config = JSON.parse(json) as T;
    await this.validate(config);
    return config;
  };

  protected readFromJsonFile = async (): Promise<string> => {
    try {
      const json = await fs.readFile(this.path, 'utf-8');
      return json;
    } catch (error) {
      throw new Error(`Unable to load config: ${error}`);
    }
  };
}

export class PackageConfigManager extends ConfigManager<PackageConfig> {
  public writeDefaultConfig = async (options: any): Promise<void> => {
    const config = this.defaultConfig(options);
    await this.write(config);
  };

  protected validate = async (
    config: PackageConfig
  ): Promise<PackageConfig> => {
    await this.validateSnapshot(
      config.snapshot,
      ['version', 'path'],
      'package'
    );

    return config;
  };

  public defaultConfig = (
    options: PackageOption & VersionOption
  ): PackageConfig => {
    if (options.version == null) {
      throw new Error(
        '"Version" must be defined when creating a package config'
      );
    }

    return {
      snapshot: {
        version: options.version,
      },
    };
  };
}

export class ServiceConfigManager extends ConfigManager<ServiceConfig> {
  public writeDefaultConfig = async (options: any): Promise<void> => {
    const config = this.defaultConfig(options);
    await this.write(config);
  };

  protected validate = async (
    config: ServiceConfig
  ): Promise<ServiceConfig> => {
    if (config.service == null) {
      throw new Error('A service config must have "service" defined');
    }
    if (config.snapshot != null) {
      await this.validateSnapshot(config.snapshot, ['path'], 'service');
    }

    return config;
  };

  private defaultConfig = (
    options: PackageOption & ServiceOption
  ): ServiceConfig => {
    return {
      service: options.service,
      filter: {
        serviceName: options.service,
      },
      inlinedSchemas: {
        autoNameRequest: true,
      },
    };
  };
}

interface CreateConfigOptions
  extends PackageOption,
    Partial<ServiceOption>,
    Partial<VersionOption> {}

export async function createConfiguration(options: CreateConfigOptions) {
  const directory = await closestConfigDirectoryPath(options);
  const option = { directory: directory };
  const mngr =
    options.service == null
      ? new PackageConfigManager(option)
      : new ServiceConfigManager(option);
  if (await mngr.exists()) {
    throw new Error(`Config already exists - did nothing`);
  }

  await mngr.writeDefaultConfig(options);
}
