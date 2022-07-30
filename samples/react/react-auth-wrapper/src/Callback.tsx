import { TopBar } from '@cognite/cogs.js';
import { Asset, CogniteClient } from '@cognite/sdk';
import React, { useState } from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';
import ReactCogniteAuthWrapper from './wrapper/react-cog-auth-wrapper';

function Callback() {
  const authContext: AuthContextProps = useAuth();

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
      <TopBar>
        <TopBar.Left>
          <TopBar.Action text="Home" onClick={() => console.log("clicked")} />
          <TopBar.Action icon="Configure" />
        </TopBar.Left>
      </TopBar>
      {/* Hello {data } {token} {auth.user?.profile.sub}{" "} */}
      {/* <button onClick={() => void auth.removeUser()}>Log out</button> */}

      <div className="App">
        {posts.map((post, index) => {
          return <li key={index}>Assets here {post.name}</li>;
        })}
      </div>
    </>
  );
}

export default Callback;
