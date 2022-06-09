// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import { DirectoryOption } from './utils';

/**
 * SnapshotLocal allows you to work on a snapshot locally. Useful when you want to
 * see how changes to open api affects the generated code without adjusting the official open api document.
 */
export interface SnapshotLocal {
  // path define a local open api contact to use.
  path: string;
  version: never;
}

/**
 * SnapshotVersion is used in production when generating code. Specify a open api version to use
 * when downloading and creating a open api snapshot.
 */
export interface SnapshotVersion {
  // version open api version such as "v1", "playground", etc.
  version: string;
  path: never;
}

export interface PackageConfig {
  snapshot: SnapshotVersion | SnapshotLocal;
}

export interface ServiceConfig {
  snapshot?: SnapshotLocal;
  service: string;
  inlinedSchemas: {
    autoNameRequest: boolean;
  };
  filter: {
    serviceName?: string;
  };
}

const isServiceConfig = (config: any): config is ServiceConfig => {
  return 'service' in config;
};

export type ConfigManagerOptions = DirectoryOption;

export class ConfigManager {
  public static readonly filename = 'codegen.json';
  private path: string;

  constructor(readonly options: ConfigManagerOptions) {
    this.path = `${options.directory}/${ConfigManager.filename}`;
  }

  public exists = async (): Promise<boolean> => {
    try {
      await fs.access(this.path);
      return true;
    } catch (error) {
      return false;
    }
  };

  private validateSnapshot = async (
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

  public validatePackage = async (
    config: PackageConfig
  ): Promise<PackageConfig> => {
    await this.validateSnapshot(
      config.snapshot,
      ['version', 'path'],
      'package'
    );

    return config;
  };

  public validateService = async (
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

  public validate = async (
    json: string
  ): Promise<PackageConfig | ServiceConfig> => {
    const config = JSON.parse(json);

    try {
      if (isServiceConfig(config)) {
        return await this.validateService(config);
      } else {
        return await this.validatePackage(config);
      }
    } catch (error) {
      throw new Error(`Invalid config: ${error}`);
    }
  };

  public write = async (
    config: PackageConfig | ServiceConfig
  ): Promise<string> => {
    const json = JSON.stringify(config, null, 2);
    await this.validate(json);

    try {
      await fs.writeFile(this.path, json);
    } catch (error) {
      throw new Error(`Unable to save config: ${error}`);
    }
    return json;
  };

  public read = async (): Promise<PackageConfig | ServiceConfig> => {
    let json: string;
    try {
      json = await fs.readFile(this.path, 'utf-8');
    } catch (error) {
      throw new Error(`Unable to load config: ${error}`);
    }

    const config = await this.validate(json);
    return config;
  };

  public delete = async (): Promise<void> => {
    try {
      await fs.unlink(this.path);
    } catch (error) {
      throw new Error(`Unable to delete config: ${error}`);
    }
  };
}
