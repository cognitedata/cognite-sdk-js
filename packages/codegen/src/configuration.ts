// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import {
  AutoNameInlinedRequestOption,
  DirectoryOption,
  ServiceOption,
  SnapshotScopeOption,
  VersionOption,
} from './utils';

export type ConfigOptions = VersionOption &
  ServiceOption &
  SnapshotScopeOption &
  AutoNameInlinedRequestOption & {
    filter?: {
      serviceName: string;
    };
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

  public validate = (config: ConfigOptions): void => {
    if (!['service', 'package'].includes(config.scope)) {
      throw new Error('unknown scope specified');
    }
  };

  public write = async (config: ConfigOptions): Promise<ConfigOptions> => {
    this.validate(config);
    const json = JSON.stringify(config, null, 2);

    await fs.writeFile(this.path, json);
    return config;
  };

  public read = async (): Promise<ConfigOptions> => {
    const data = await fs.readFile(this.path, 'utf-8');
    const config = JSON.parse(data) as ConfigOptions;
    this.validate(config);

    return config;
  };

  public delete = async (): Promise<void> => {
    await fs.unlink(this.path);
  };
}
