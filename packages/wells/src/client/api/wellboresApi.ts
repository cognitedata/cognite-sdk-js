import { accessApi, HttpError } from '@cognite/sdk-core';
import { Measurement, Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey, SurveyData } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';
import { SurveysAPI } from './surveysApi';
import { WellIds } from '../model/WellIds';
import { Sequence, SequenceData } from '../model/Sequence';
import { ConfigureAPI } from '../baseWellsClient';
import { Asset } from '@cognite/sdk';
import { CasingsAPI } from './casingsApi';

export class WellboresAPI extends ConfigureAPI {
  private _surveysSDK?: SurveysAPI;
  private _casings?: CasingsAPI;

  public set surveysSdk(sdk: SurveysAPI) {
    this._surveysSDK = sdk;
  }

  private get surveys(): SurveysAPI {
    return accessApi(this._surveysSDK);
  }

  public set casingsSdk(api: CasingsAPI) {
    this._casings = api;
  }

  private get casings(): CasingsAPI {
    if (this._casings === undefined) {
      throw new Error('Casings is undefined');
    }
    return this._casings;
  }

  private addLazyMethodsForWellbore = (wellbore: Wellbore): Wellbore => {
    return <Wellbore>{
      ...wellbore,
      trajectory: async (): Promise<Survey> => {
        return await this.surveys.getTrajectory(wellbore.id);
      },
      casings: async (): Promise<Sequence[]> => {
        return await this.getCasings(wellbore.id);
      },
      sourceAssets: async (source?: string): Promise<Asset[]> =>
        await this.getSources(wellbore.id, source),
    };
  };

  private getSources = async (
    wellboreId: number,
    source?: string
  ): Promise<Asset[]> => {
    let basePath = `/wellbores/${wellboreId}/sources`;
    if (source !== undefined) {
      basePath += '/' + source;
    }

    const path: string = this.getPath(basePath);

    return await this.client
      .asyncGet<Asset[]>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  private addLazyMethodsForMeasurement = (
    measurement: Measurement
  ): Measurement => {
    return <Measurement>{
      ...measurement,
      data: async (): Promise<SurveyData> =>
        await this.surveys.getData({ id: measurement.id }),
    };
  };

  public getById = async (id: number): Promise<Wellbore> => {
    const path: string = this.getPath(`/wellbores/${id}`);
    return await this.client
      .asyncGet<Wellbore>(path)
      .then(response => this.addLazyMethodsForWellbore(response.data))
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });
  };

  public getFromWell = async (wellId: number): Promise<Wellbore[]> => {
    const path: string = this.getPath(`/wells/${wellId}/wellbores`);
    try {
      const wellboreData = await this.client.asyncGet<Wellbore[]>(path);
      return wellboreData.data.map((wellbore: Wellbore) =>
        this.addLazyMethodsForWellbore(wellbore)
      );
    } catch (err) {
      throw new HttpError(err.status, err.data.error.message, {});
    }
  };

  public getFromWells = async (wellIds: number[]): Promise<Wellbore[]> => {
    const path: string = this.getPath(`/wellbores/bywellids`);
    const wellIdsToSearch: WellIds = { items: wellIds };
    try {
      const wellboreData = await this.client.asyncPost<Wellbore[]>(path, {
        data: wellIdsToSearch,
      });
      return wellboreData.data.map((wellbore: Wellbore) =>
        this.addLazyMethodsForWellbore(wellbore)
      );
    } catch (err) {
      throw new HttpError(err.status, err.data.error.message, {});
    }
  };

  public getMeasurement = async (
    wellboreId: number,
    measurementType: MeasurementType
  ): Promise<Measurement[]> => {
    const path: string = this.getPath(
      `/wellbores/${wellboreId}/measurements/${measurementType}`
    );

    const measurements = await this.client
      .asyncGet<Measurements>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.data.error.message, {});
      });

    return measurements.items.map((measurement: Measurement) =>
      this.addLazyMethodsForMeasurement(measurement)
    );
  };

  public getCasings = async (wellOrWellboreId: number): Promise<Sequence[]> => {
    return this.casings.getByWellOrWellboreId(wellOrWellboreId);
  };

  public getCasingsData = async (
    casingId: number,
    start?: number,
    end?: number,
    columns?: string[],
    cursor?: string,
    limit?: number
  ): Promise<SequenceData> => {
    return this.casings.getData(casingId, start, end, columns, cursor, limit);
  };
}
