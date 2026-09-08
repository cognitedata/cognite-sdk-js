// Copyright 2026 Cognite AS

import type { CogniteExternalId, FilterQuery } from '@cognite/sdk-core';

export enum ExtractorType {
  GLOBAL = 'global',
  COMMUNITY = 'community',
  UNRELEASED = 'unreleased',
  HOSTED = 'hosted',
}

export type ExtractorTypeValue = `${ExtractorType}`;

export enum ItemType {
  GLOBAL = 'global',
  COMMUNITY = 'community',
  UNRELEASED = 'unreleased',
}

export type ItemTypeValue = `${ItemType}`;

export enum ArtifactPlatform {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  DOCS = 'docs',
  ALL = 'all',
}

export type ArtifactPlatformValue = `${ArtifactPlatform}`;

export enum LinkType {
  GENERIC = 'generic',
  EXTERNAL_DOCUMENTATION = 'externalDocumentation',
}

export type LinkTypeValue = `${LinkType}`;

export interface Link {
  name: string;
  type: LinkTypeValue;
  url: string;
}

export interface Extractor {
  externalId: CogniteExternalId;
  name: string;
  description: string;
  type: ExtractorTypeValue;
  documentation?: string;
  imageUrl?: string;
  latestVersion?: string;
  links?: Link[];
  tags?: string[];
}

export interface Artifact {
  name: string;
  link: string;
  platform: ArtifactPlatformValue;
  displayName?: string;
}

export interface Changelog {
  added?: string[];
  changed?: string[];
  deprecated?: string[];
  fixed?: string[];
  removed?: string[];
  security?: string[];
}

export interface Release {
  externalId: CogniteExternalId;
  version: string;
  artifacts: Artifact[];
  changelog?: Changelog;
  createdTime?: Date;
  description?: string;
}

export interface ReleaseId {
  externalId: CogniteExternalId;
  version: string;
}

export interface SourceSystem {
  externalId: CogniteExternalId;
  name: string;
  description: string;
  type: ItemTypeValue;
  documentation?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface Solution {
  externalId: CogniteExternalId;
  name: string;
  sourceSystemExternalId: string;
  documentation?: string;
  type?: ItemTypeValue;
  extractorExternalId?: string;
}

export interface ExtractorReleasesListQuery extends FilterQuery {
  externalId?: string;
}

export type ExtractorSchema = Record<string, unknown>;
