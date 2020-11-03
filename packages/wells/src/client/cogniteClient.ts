// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { version } from '../../package.json';
import { Wells } from './api/wells';
import { Wellbores } from './api/wellbores';
import { accessApi } from '@cognite/sdk-core';
import { Surveys } from './api/surveys';

export default class CogniteClient extends CogniteClientStable {
  private wellsSDK?: Wells;
  private wellboresSDK?: Wellbores;
  private surveysSDK?: Surveys;

  protected initAPIs() {
    super.initAPIs();

    // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/assets
    this.wellsSDK = this.apiFactory(Wells, 'assets');
    this.wellboresSDK = this.apiFactory(Wellbores, 'assets');

    // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/sequences
    this.surveysSDK = this.apiFactory(Surveys, 'sequences');

    /* We want to hide the dependency injection from the users
     of the SDK. This allows surveys endpoints being accessed on the
     wellbores object using 'this'. This also ensures
     a Singleton pattern with only one CogniteClient being 
     instanciated and we reuse that connection even when
     surveys endpoints are called within the wellbores class */
    this.wellboresSDK.surveysSdk = this.surveysSDK;
  }

  get wells(): Wells {
    return accessApi(this.wellsSDK);
  }

  get wellbores(): Wellbores {
    return accessApi(this.wellboresSDK);
  }

  get surveys(): Surveys {
    return accessApi(this.surveysSDK);
  }

  protected get version() {
    return `wells/${version}`;
  }
}
