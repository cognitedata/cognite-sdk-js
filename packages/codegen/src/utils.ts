// Copyright 2022 Cognite AS
import path from 'path';
import { promises as fs } from 'fs';

export type FromPathOption = {
  'from-path': string;
};

export type PackageOption = {
  package: string;
};

export type ServiceOption = {
  service: string;
};

export type VersionOption = {
  version: string;
};

export type SnapshotScopeOption = {
  scope: 'service' | 'package' | 'path';
};

export type PathOption = {
  path: string;
};

export type DirectoryOption = {
  directory: string;
};

export type AutoNameInlinedRequestOption = {
  autoNameInlinedRequest: boolean;
};

const createPath = (
  options: PackageOption & Partial<ServiceOption>
): string => {
  const packagePath = path.resolve('./packages', options.package, 'src');

  if (typeof options.service !== 'undefined') {
    return path.resolve(packagePath, 'api', options.service);
  }
  return packagePath;
};

export const versionFileDirectoryPath = async (
  options: PackageOption & Partial<ServiceOption>
): Promise<string> => {
  const directory = createPath(options);
  try {
    await fs.stat(directory);
    return directory;
  } catch (error) {
    throw new Error(`Path "${directory}" does not exist: ${error}`);
  }
};

const sortJsonKeys = (json: any): any => {
  return Object.keys(json)
    .sort()
    .reduce((acc, key) => {
      const value =
        typeof json[key] === 'object' && !json[key]
          ? sortJsonKeys(json[key])
          : json[key];
      return Object.assign(acc, { [key]: value });
    }, {});
};

export const sortOpenApiJson = (json: string): string => {
  const spec = JSON.parse(json);
  const sorted = sortJsonKeys(spec);
  return JSON.stringify(sorted);
};
