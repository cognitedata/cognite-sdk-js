import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ReactCogniteAuthProvider } from '@cognite/react-auth-wrapper';

const { REACT_APP_AUTHORITY } = process.env;
const { REACT_APP_CLIENT_ID } = process.env;
const { REACT_APP_REDIRECT_URL } = process.env;
const { REACT_APP_SCOPE } = process.env;
const { REACT_APP_TENANT } = process.env;

const oidcConfig = {
  authority: REACT_APP_AUTHORITY!,
  client_id: REACT_APP_CLIENT_ID!,
  redirect_uri: REACT_APP_REDIRECT_URL!,
  scope: REACT_APP_SCOPE!,
  metadata: {
      token_endpoint: `https://login.microsoftonline.com/${REACT_APP_TENANT!}/oauth2/v2.0/token`,
      authorization_endpoint: `https://login.microsoftonline.com/${REACT_APP_TENANT!}/oauth2/v2.0/authorize`,
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <ReactCogniteAuthProvider {...oidcConfig}>
      <App />
    </ReactCogniteAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
