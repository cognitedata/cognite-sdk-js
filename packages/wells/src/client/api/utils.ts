import CogniteWellsClient from '../CogniteWellsClient';
import { Cluster } from '../model/Cluster';

export function createWellsClient(
  appId: string,
  cluster: Cluster = Cluster.API
): CogniteWellsClient {
  return new CogniteWellsClient(
    {
      appId: appId,
    },
    cluster
  );
}
