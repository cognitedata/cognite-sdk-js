import { Sequence, SequencesAPI } from '@cognite/sdk';
import { SequenceRow } from 'stable/dist/src/api/sequences/sequenceRow';
import { Survey, SearchSurveys } from '../model/Survey';

export class Surveys extends SequencesAPI {
  /**
   * Maps from sequence array to a survey array.
   * Contains lazy getter for rows
   *
   * @param sequences
   */
  private mapToSurvey = (sequences: Sequence[]): Survey[] => {
    return sequences.map(sequence => {
      return <Survey>{
        id: sequence.id,
        name: sequence.name,
        description: sequence.description,
        metadata: sequence.metadata,
        rows: async (limit: number = 100): Promise<SequenceRow[]> => {
          return this.retrieveRows({
            externalId:
              sequence.externalId != undefined ? sequence.externalId : '',
          }).autoPagingToArray({ limit: limit });
        },
      };
    });
  };

  /**
   * List all trajectories for a particular assetId (wellbore)
   * and returns a list of surveys
   *
   * @param assetId
   */
  listTrajectories = async (
    assetId: number,
    customFilter?: SearchSurveys
  ): Promise<Survey[]> => {
    if (customFilter) {
      return await customFilter(assetId);
    }

    const definiteSurveys = await this.search({
      filter: {
        assetIds: [assetId],
        metadata: { type: 'DefinitiveSurvey', PHASE: 'ACTUAL' },
      },
    });

    const surveys = await this.search({
      filter: {
        assetIds: [assetId],
        metadata: { type: 'Survey', PHASE: 'ACTUAL' },
      },
    });

    return this.mapToSurvey([...surveys, ...definiteSurveys]);
  };
}
