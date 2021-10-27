# OIDC authenticated SPA using Azure Active Directory and msal.js

React app created with `create-react-app` and set up to use `msal.js` to authenticate the app with
Azure Active directory. The application will ask for access to CDF on the initial login and also
silently try to list users in Active directory when starting. If the application do not have
permissions for this it will render a button to trigger a popup to concent to accessing the list of
users.

## Start application

The application needs two IDs to work, the id of the application in azure and the id of the azure
tenant where users are located.

```bash
REACT_APP_AZURE_TENANT_ID=cd0dddb2-9ef0-41f7-bde4-b65fa44fa2c3 REACT_APP_AZURE_APP_ID=1a466cb5-d1c2-4af3-82fa-a08fbfe84efd yarn start
```

An optional `REACT_APP_CLUSTER=cluster` can also be specified to change from the default api.
