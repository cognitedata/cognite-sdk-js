// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';

export type ConfigurationOptions = {
  version: string;
  service: string;
  autoNameInlinedRequest: boolean;
  scope: string;
  filter?: {
    serviceName: string;
  };
};

export type ConfigurationManagerOptions = {
  directory: string;
};

export type ConfigScopeOption = { scope: string };

export class ConfigurationManager {
  public static readonly filename = '.codegen.json';
  private path: string;

  constructor(readonly options: ConfigurationManagerOptions) {
    this.path = `${options.directory}/${ConfigurationManager.filename}`;
  }

  public exists = async (): Promise<boolean> => {
    try {
      await fs.access(this.path);
      return true;
    } catch (error) {
      return false;
    }
  };

  public validate = (config: ConfigurationOptions): void => {
    if (!['local', 'global'].includes(config.scope)) {
      throw new Error('unknown scope specified');
    }
  };

  public write = async (
    config: ConfigurationOptions
  ): Promise<ConfigurationOptions> => {
    this.validate(config);
    const json = JSON.stringify(config, null, 2);

    await fs.writeFile(this.path, json, { flag: 'wx' });
    return config;
  };

  public read = async (): Promise<ConfigurationOptions> => {
    const data = await fs.readFile(this.path, 'utf-8');
    const config = JSON.parse(data) as ConfigurationOptions;
    this.validate(config);

    return config;
  };

  public delete = async (): Promise<void> => {
    await fs.unlink(this.path);
  };
}
