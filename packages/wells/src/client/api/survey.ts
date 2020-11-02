import { Sequence, SequencesAPI } from '@cognite/sdk';

export class Surveys extends SequencesAPI {
  listTrajectories = async (assetId: number): Promise<Sequence[]> => {
    return await this.search({
      filter: {
        assetIds: [assetId],
        metadata: { type: 'DefinitiveSurvey', PHASE: 'ACTUAL' },
      },
    });
  };
}
