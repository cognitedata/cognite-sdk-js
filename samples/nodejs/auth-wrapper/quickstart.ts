import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import { CogniteClient } from '@cognite/sdk';

class MyProjectTest {
  protected client: CogniteClient;

  constructor() {
    this.client = new CogniteClient({
      appId: 'testing-app',
      project: process.env.COGNITE_OIDC_PROJECT!,
      baseUrl: process.env.COGNITE_BASE_URL,
      authentication: {
        provider: CogniteAuthWrapper,
        credentials: {
          method: 'client_credentials',
          authority: process.env.COGNITE_AUTHORITY,
          client_id: process.env.COGNITE_CLIENT_ID!,
          client_secret: process.env.COGNITE_CLIENT_SECRET!,
          grant_type: process.env.COGNITE_GRANT_TYPE!,
          scope: process.env.COGNITE_SCOPE!,
        },
      },
    });
  }

  async run() {
    console.log(await this.client.assets.list());
  }
}

export default new MyProjectTest().run();
