// Copyright 2022 Cognite AS
import { promises as fs } from 'node:fs';
import fetch from 'cross-fetch';
import { PackageConfigManager } from './configuration';
import type { OpenApiDocument } from './openapi';
import {
  type DirectoryOption,
  type PackageOption,
  type PathOption,
  type VersionOption,
  closestConfigDirectoryPath,
} from './utils';

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

const defaultFilename = '.cognite-openapi-snapshot.json';

/**
 * OpenApiSnapshotManager handles creating and updating a service or package snapshot.
 */
export class OpenApiSnapshotManager {
  private path: string;

  constructor(readonly options: OpenApiSnapshotManagerOptions) {
    if (options.directory == null && options.path == null) {
      throw new Error(
        'SnapshotManager must have either a "path" or "directory" specified',
      );
    }

    this.path =
      options.path != null
        ? options.path
        : `${options.directory}/${defaultFilename}`;
  }

  public downloadFromPath = async (
    options: ServiceOpenApiOptions,
  ): Promise<OpenApiDocument> => {
    const filename = options.filename || defaultFilename;
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
    try {
      const response = await fetch(url || this.createUrl());
      const json = await response.json();
      return json as OpenApiDocument;
    } catch (error) {
      throw new Error(`Unable to download OpenAPI contract: ${error}`);
    }
  };

  public write = async (openapi: OpenApiDocument): Promise<OpenApiDocument> => {
    const json = JSON.stringify(openapi, undefined, '  ');

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

export async function updateSnapshot(options: UpdateSnapshotOptions) {
  const directory = await closestConfigDirectoryPath(options);
  const config = new PackageConfigManager({ directory: directory });
  const configFile = await config.read();

  if (configFile.snapshot.version == null) {
    throw new Error('Can`t download snapshot when "version" was not defined');
  }

  const manager = new OpenApiSnapshotManager({
    directory: directory,
    version: configFile.snapshot.version,
  });

  const snapshot = await manager.downloadFromUrl();
  await manager.write(snapshot);
}
