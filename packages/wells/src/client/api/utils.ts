import { CogniteGeospatialClient } from '@cognite/geospatial-sdk-js';
import { Constants } from '@cognite/sdk-core';

export const geospatialClient = CogniteGeospatialClient({
  project: process.env.COGNITE_WELLS_PROJECT as string,
  api_key: process.env.COGNITE_WELLS_CREDENTIALS as string,
  api_url: Constants.BASE_URL,
});

export enum SpatialRelationshipNameDTO {
  Within = 'within',
  WithinDistance = 'withinDistance',
  WithinCompletely = 'withinCompletely',
  Intersect = 'intersect',
  Within3d = 'within3d',
  WithinDistance3d = 'withinDistance3d',
  WithinCompletely3d = 'withinCompletely3d',
  Intersect3d = 'intersect3d',
}
