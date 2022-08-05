import { Asset, CogniteClient } from '@cognite/sdk';
import React, { useState } from 'react';
import { useCogAuth } from '@cognite/react-auth-wrapper';
import { ReactAuthWrapperProvider, CogniteProjectService } from '@cognite/react-auth-wrapper';

function ListAssets() {
  const authContext: any = useCogAuth();

  const [posts, setPosts] = useState<Asset[]>([]);

  React.useEffect(() => {
    const cogniteProjectService = new CogniteProjectService();

    (async () => {
      try {
        const projects = await cogniteProjectService.loadFromAuthContext(authContext);

        const cogniteClient = new CogniteClient({
          appId: "Authwrapper SDK samples",
          project: projects[0].projectUrlName,
          baseUrl: "https://greenfield.cognitedata.com",
          authentication: {
            provider: ReactAuthWrapperProvider,
            credentials: {
              method: 'pkce',
              authContext: authContext,
            }
          }
        });

        const response = await cogniteClient.assets.list();
        setPosts(response.items);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [authContext]);

  if (!posts) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="App">
        {posts.map((post, index) => {
          return <li key={index}>Assets here {post.name}</li>;
        })}
      </div>
    </>
  );
}

export default ListAssets;
