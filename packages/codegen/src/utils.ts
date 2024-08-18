// Copyright 2022 Cognite AS

import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface PackageOption {
  package: string;
}

export interface ServiceOption {
  service: string;
}

export interface VersionOption {
  version: string;
}

export interface PathOption {
  path: string;
}

export interface DirectoryOption {
  directory: string;
}

export interface AutoNameInlinedRequestOption {
  autoNameInlinedRequest: boolean;
}

export interface PackageServiceOptions
  extends PackageOption,
    Partial<ServiceOption> {}

const createPath = (options: PackageServiceOptions): string => {
  const packagePath = path.resolve('./packages', options.package, 'src');

  if (options.service != null) {
    return path.resolve(packagePath, 'api', options.service);
  }
  return packagePath;
};

export const closestConfigDirectoryPath = async (
  options: PackageServiceOptions
): Promise<string> => {
  const directory = createPath(options);
  try {
    await fs.stat(directory);
    return directory;
  } catch (error) {
    throw new Error(`Path "${directory}" does not exist: ${error}`);
  }
};
