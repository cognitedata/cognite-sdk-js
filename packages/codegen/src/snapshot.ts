// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import fetch from 'cross-fetch';
import { OpenApiDocument } from './openapi';
import { VersionOption } from './utils';

/**
 * VersionFileManagerOptions options for configure the version file.
 */
export type OpenApiSnapshotManagerOptions = {
  directory: string;
} & Partial<VersionOption>;

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
    this.path = `${options.directory}/${OpenApiSnapshotManager.filename}`;
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
    if (typeof this.options.version === 'undefined') {
      throw new Error('Cognite API version was not configured');
    }
    return `https://storage.googleapis.com/cognitedata-api-docs/dist/${this.options.version}.json`;
  };

  public downloadFromURL = async (url?: string): Promise<OpenApiDocument> => {
    url = url || this.createUrl();

    const response = await fetch(url);
    const json = await response.json();
    return json as OpenApiDocument;
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

    await fs.writeFile(this.path, json);
    return openapi;
  };

  public read = async (): Promise<OpenApiDocument> => {
    const data = await fs.readFile(this.path, 'utf-8');
    return JSON.parse(data) as OpenApiDocument;
  };

  public delete = async (): Promise<void> => {
    await fs.unlink(this.path);
  };
}
