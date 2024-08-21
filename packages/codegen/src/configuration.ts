// Copyright 2022 Cognite AS
import { promises as fs } from 'node:fs';
import type {
  DirectoryOption,
  PackageOption,
  PathOption,
  ServiceOption,
  VersionOption,
} from './utils';
import { closestConfigDirectoryPath } from './utils';

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

/**
 * ServiceConfig is the config structure for any given service, for a package config see `PackageConfig`.
 *
 * @interface ServiceConfig
 * @member {SnapshotPath} snapshot overrides the package dedicated snapshot. This is helpful when you're working on the open api docs locally and want to see how openapi changes affects the generated types.
 *  Note that only json files are supported. Example:
 *  {
 *    "snapshot": {
 *      "path": "/home/anders/custom-openapi-file.json",
 *    }
 *  }
 * @member {string} service represents a service name, usually the same as the folder name.
 * @member {interface} inlinedSchemas holds some magical abilities to help ease generation. Such as auto naming inlined request types.
 * @member {interface} filter isolates service specific endpoint definitions. "serviceName" always adds the postfix "/api/{package}/projects/{project}", so you only have to specify your service name.
 *  Example for the documents service:
 *  {
 *    "filter": {
 *      "serviceName": "/documents"
 *    }
 *  }
 *
 *  In some cases, multiple services may share the same service name as a base. In this case you can specify a list of names to ignore:
 *  {
 *    "filter": {
 *      "serviceName": "/context",
 *      "ignore": [
 *        "/context/vision"
 *      ]
 *    }
 *  }
 */
export interface ServiceConfig {
  snapshot?: SnapshotPath;
  service: string;
  inlinedSchemas: {
    autoNameRequest: boolean;
  };
  filter: {
    serviceName?: string;
    ignore?: string[];
    relevantReferenceNames?: string[];
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
    snapshot: SnapshotVersion | SnapshotPath,
    legalKeys: string[],
    source: string
  ): Promise<void> => {
    const snapshotKeys = Object.keys(snapshot);
    if (snapshotKeys.length !== 1) {
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

    if (snapshotKeys[0] === 'path') {
      try {
        await fs.stat(snapshot.path || '');
      } catch (error) {
        throw new Error(`Invalid snapshot path: ${error}`);
      }
    }
  };

  protected validate = async (config: T): Promise<T> => {
    return config;
  };

  public configPath = (): string => {
    return this.path;
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
  public writeDefaultConfig = async (
    options: PackageOption & VersionOption
  ): Promise<void> => {
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
  public writeDefaultConfig = async (
    options: PackageOption & ServiceOption
  ): Promise<void> => {
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
    throw new Error('Config already exists - did nothing');
  }

  await mngr.writeDefaultConfig(options);
}

interface CleanupServiceOptions extends PackageOption, ServiceOption {}

export async function cleanupService(options: CleanupServiceOptions) {
  const directory = await closestConfigDirectoryPath(options);
  const option = { directory: directory };
  const mngr = new ServiceConfigManager(option);
  if (!(await mngr.exists())) {
    throw new Error(
      'Service is not configured for code generation - manual cleanup required'
    );
  }

  fs.unlink(mngr.configPath());
  console.info(
    `updated service - remember to regenerate package types: yarn codegen generate-types --package=${options.package} --service=${options.service}`
  );
}
