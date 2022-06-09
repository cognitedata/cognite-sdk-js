// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import fetch from 'cross-fetch';
import { OpenApiDocument } from './openapi';
import {
  closestConfigDirectoryPath,
  DirectoryOption,
  PackageOption,
  PathOption,
  VersionOption,
} from './utils';
import { ConfigManager, PackageConfig } from './configuration';

/**
 * OpenApiSnapshotManagerOptions options for the snapshot.
 */
interface OpenApiSnapshotManagerOptions
  extends Partial<PathOption>,
    Partial<DirectoryOption>,
    Partial<VersionOption> {}

interface ServiceOpenApiOptions extends PathOption {
  filename?: string;
}

/**
 * OpenApiSnapshotManager handles creating and updating a service or package snapshot.
 */
export class OpenApiSnapshotManager {
  public static readonly filename = 'cognite-openapi-snapshot.json';
  private path: string;

  constructor(readonly options: OpenApiSnapshotManagerOptions) {
    if (options.directory == null && options.path == null) {
      throw new Error(
        'SnapshotManager must have either a "path" or "directory" specified'
      );
    }

    this.path =
      options.path != null
        ? options.path
        : `${options.directory}/${OpenApiSnapshotManager.filename}`;
  }

  public downloadFromPath = async (
    options: ServiceOpenApiOptions
  ): Promise<OpenApiDocument> => {
    const filename = options.filename || OpenApiSnapshotManager.filename;
    const path = `${options.path}/${filename}`.replace('//', '/');

    const doc = await fs.readFile(path, 'utf-8');
    return JSON.parse(doc) as OpenApiDocument;
  };

  private createUrl = (): string => {
    if (this.options.version == null) {
      throw new Error('Cognite API version was not configured');
    }
    return `https://storage.googleapis.com/cognitedata-api-docs/dist/${this.options.version}.json`;
  };

  public downloadFromUrl = async (url?: string): Promise<OpenApiDocument> => {
    url = url || this.createUrl();

    try {
      const response = await fetch(url);
      const json = await response.json();
      return json as OpenApiDocument;
    } catch (error) {
      throw new Error(`Unable to download open api contract: ${error}`);
    }
  };

  public exists = async (): Promise<boolean> => {
    try {
      await fs.access(this.path);
      return true;
    } catch (error) {
      return false;
    }
  };

  public write = async (openapi: OpenApiDocument): Promise<OpenApiDocument> => {
    const json = JSON.stringify(openapi);

    try {
      await fs.writeFile(this.path, json);
      return openapi;
    } catch (error) {
      throw new Error(`Unable to save snapshot: ${error}`);
    }
  };

  public read = async (): Promise<OpenApiDocument> => {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data) as OpenApiDocument;
    } catch (error) {
      throw new Error(`Unable to load snapshot: ${error}`);
    }
  };
}

type UpdateSnapshotOptions = PackageOption;

export async function updateSnapshot(
  options: UpdateSnapshotOptions
): Promise<void> {
  const directory = await closestConfigDirectoryPath(options);
  const config = new ConfigManager({
    directory: directory,
  });
  const configFile = (await config.read()) as PackageConfig;

  const snapshot = new OpenApiSnapshotManager({
    directory: directory,
    version: configFile.snapshot.version,
  });

  if (configFile.snapshot.version == null) {
    throw new Error('Can`t download snapshot when "version" was not defined');
  }

  const document = await snapshot.downloadFromUrl();
  await snapshot.write(document);
}
