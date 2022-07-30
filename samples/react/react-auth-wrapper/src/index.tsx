import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: "https://login.microsoftonline.com/b7484399-37aa-4c28-9a37-a32f24c0621f",
  client_id: "acde2561-3209-4e26-a7c4-66bb84c77047",
  redirect_uri: "http://localhost:3001/callback",
  scope: "https://greenfield.cognitedata.com/.default",
  metadata: {
      'token_endpoint': "https://login.microsoftonline.com/b7484399-37aa-4c28-9a37-a32f24c0621f/oauth2/v2.0/token",
      'authorization_endpoint': "https://login.microsoftonline.com/b7484399-37aa-4c28-9a37-a32f24c0621f/oauth2/v2.0/authorize",
  }
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
