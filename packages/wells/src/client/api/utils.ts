import { CogniteGeospatialClient } from '@cognite/geospatial-sdk-js';
import { Constants } from '@cognite/sdk-core';
//import CogniteClient from '../cogniteClient';

export const geospatialClient = CogniteGeospatialClient({
  project: process.env.COGNITE_WELLS_PROJECT as string,
  api_key: process.env.COGNITE_WELLS_CREDENTIALS as string,
  api_url: Constants.BASE_URL,
});
