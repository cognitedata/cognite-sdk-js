import { Asset, CogniteClient } from '@cognite/sdk';
import React, { useState } from 'react';
import { useCogAuth } from './core/authentication/useCogAuth';
import ReactCogniteAuthWrapper from './core/authentication/wrapper/ReactCogniteAuthWrapper';

function Callback() {
  const authContext: any = useCogAuth();

  const [posts, setPosts] = useState<Asset[]>([]);

  React.useEffect(() => {
    const cogniteClient = new CogniteClient({
      appId: "Authwrapper SDK samples",
      project: "sdkcognite",
      baseUrl: "https://greenfield.cognitedata.com",
      authentication: {
        provider: ReactCogniteAuthWrapper,
        credentials: {
          method: 'pkce',
          authContext: authContext,
        }
      }
    });

    (async () => {
      try {
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

export default Callback;
