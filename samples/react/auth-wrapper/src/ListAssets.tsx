import { Asset, CogniteClient } from '@cognite/sdk';
import React, { useState } from 'react';
import { useCogAuth } from '@cognite/react-auth-wrapper';
import { ReactAuthWrapperProvider, CogniteProjectService } from '@cognite/react-auth-wrapper';

const { REACT_APP_COGNITE_BASE_URL } = process.env;

function ListAssets() {
  const authContext: any = useCogAuth();

  const [assets, setAssets] = useState<Asset[]>([]);

  React.useEffect(() => {
    const cogniteProjectService = new CogniteProjectService();

    (async () => {
      try {
        /*
          we are using CogniteProjectService (from react-auth-wrapper package)
          to extract the projects the user can access using it's credentials
        */
        const projects = await cogniteProjectService.loadFromAuthContext(authContext);

        const cogniteClient = new CogniteClient({
          appId: "Authwrapper SDK samples",
          project: projects[0].projectUrlName,
          baseUrl: REACT_APP_COGNITE_BASE_URL,
          authentication: {
            provider: ReactAuthWrapperProvider,
            credentials: {
              method: 'pkce',
              authContext: authContext,
            }
          }
        });

        const response = await cogniteClient.assets.list();
        setAssets(response.items);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [authContext]);

  if (!assets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="App">
        {assets.map((asset, index) => {
          return <li key={index}>Assets here {asset.name}</li>;
        })}
      </div>
    </>
  );
}

export default ListAssets;
