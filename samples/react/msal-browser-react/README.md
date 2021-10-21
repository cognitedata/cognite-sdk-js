# OIDC authenticated SPA using Azure Active Directory and msal.js

React app created with `create-react-app` and set up to use `msal.js` to authenticate the app with
Azure Active directory. Some environment variables have to be set before starting the app:

```bash
$ REACT_APP_CDF_PROJECT=... REACT_APP_AZURE_TENANT_ID=... REACT_APP_AZURE_APP_ID=... yarn start
```
