// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import fetch from 'cross-fetch';
import { OpenApiDocument } from './openapi';
import { PathOption, VersionOption } from './utils';

/**
 * VersionFileManagerOptions options for configure the version file.
 */
export type OpenApiSnapshotManagerOptions = Partial<VersionOption> &
  Partial<PathOption> & {
    directory?: string;
  };

export type ServiceOpenApiOptions = {
  path: string;
  filename?: string;
};

/**
 * OpenApiSnapshotManager handles creating and updating a service or package snapshot.
 */
export class OpenApiSnapshotManager {
  public static readonly filename = '.cognite-api-snapshot';
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

    const localSpec = await fs.readFile(path, 'utf-8');
    return JSON.parse(localSpec) as OpenApiDocument;
  };

  private createUrl = (): string => {
    if (this.options.version == null) {
      throw new Error('Cognite API version was not configured');
    }
    return `https://storage.googleapis.com/cognitedata-api-docs/dist/${this.options.version}.json`;
  };

  public downloadFromURL = async (url?: string): Promise<OpenApiDocument> => {
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

  public delete = async (): Promise<void> => {
    try {
      await fs.unlink(this.path);
    } catch (error) {
      throw new Error(`Unable to delete snapshot: ${error}`);
    }
  };
}
