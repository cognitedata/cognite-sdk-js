import { Sequence, SequencesAPI } from '@cognite/sdk';
import { SequenceRow } from 'stable/src/api/sequences/sequenceRow';
import { Survey } from '../model/Survey';

export class Surveys extends SequencesAPI {
  /**
   *
   * @param sequences
   */
  private mapToSurvey = (sequences: Sequence[]): Survey[] => {
    return sequences.map(sequence => {
      return <Survey>{
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        assetId: sequence.assetId,
        externalId: sequence.externalId,
        metadata: sequence.metadata,
        rows: async (): Promise<SequenceRow[]> => {
          return this.retrieveRows({
            externalId:
              sequence.externalId != undefined ? sequence.externalId : '',
          }).autoPagingToArray({ limit: 100 });
        },
      };
    });
  };

  /**
   *
   * @param assetId
   */
  listTrajectories = async (assetId: number): Promise<Survey[]> => {
    const sequences = await this.search({
      filter: {
        assetIds: [assetId],
        metadata: { type: 'DefinitiveSurvey', PHASE: 'ACTUAL' },
      },
    });
    return this.mapToSurvey(sequences);
  };
}
