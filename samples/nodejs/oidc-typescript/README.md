# Client credentials auth flow

This is the flow used for [client credentials](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)

## Prerequisite

Make sure you have read the [prerequisite-guide](../README.md#prerequisite) before continuing.

## Install

Go to this folder in your terminal and run:

`$ npm install`

or with yarn:

`$ yarn`

## Build
`$ npm run tsc`

or with yarn

`$ yarn tsc`

## Run

`$ AZURE_TENANT_ID=... COGNITE_PROJECT=... CLIENT_ID=... CLIENT_SECRET=... node build/quickstart.js`
