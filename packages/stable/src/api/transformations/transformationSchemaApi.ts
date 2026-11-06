// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  TransformationConflictMode,
  TransformationDestination,
  TransformationSchemaColumn,
} from './types';

export class TransformationSchemaAPI extends BaseResourceAPI<TransformationSchemaColumn> {
  /**
   * [Get the schema of resource type](https://api-docs.cognite.com/20230101/tag/Schema/operation/getTransformationSchema)
   *
   * Returns the columns a transformation query must produce to write to the destination.
   * Sequence rows destinations use
   * [Get the schema of a sequence](https://api-docs.cognite.com/20230101/tag/Schema/operation/getTransformationSequenceRowSchema),
   * and data model destinations (`nodes`, `edges` and `instances`) use
   * [Get Instance schema](https://api-docs.cognite.com/20230101/tag/Schema/operation/getFlexibleDataModelInstanceSchema).
   *
   * ```js
   * const columns = await client.transformations.schema.retrieve(
   *   { type: 'assets' },
   *   'upsert'
   * );
   * ```
   */
  public retrieve = async (
    destination: TransformationDestination,
    conflictMode?: TransformationConflictMode
  ): Promise<TransformationSchemaColumn[]> => {
    const isInstances =
      destination.type === 'nodes' ||
      destination.type === 'edges' ||
      destination.type === 'instances';
    const path = this.url(isInstances ? 'instances' : destination.type);
    const response = await this.get<{ items?: TransformationSchemaColumn[] }>(
      path,
      { params: { conflictMode, ...destinationParams(destination) } }
    );
    return this.addToMapAndReturn(response.data.items ?? [], response);
  };
}

function destinationParams(destination: TransformationDestination) {
  switch (destination.type) {
    case 'sequence_rows':
      return { externalId: destination.externalId };
    case 'nodes':
    case 'edges':
      return {
        viewSpace: destination.view?.space,
        viewExternalId: destination.view?.externalId,
        viewVersion: destination.view?.version,
        instanceType: destination.type,
        withInstanceSpace: destination.instanceSpace !== undefined,
        isConnectionDefinition:
          destination.type === 'edges'
            ? destination.view === undefined
            : undefined,
      };
    case 'instances':
      return {
        dataModelSpace: destination.dataModel.space,
        dataModelExternalId: destination.dataModel.externalId,
        dataModelVersion: destination.dataModel.version,
        type: destination.dataModel.destinationType,
        relationshipFromType:
          destination.dataModel.destinationRelationshipFromType,
      };
    default:
      return {};
  }
}
