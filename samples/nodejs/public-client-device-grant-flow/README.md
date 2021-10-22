# Device code grant flow

This is the flow used for [Device Authorization Grant](https://oauth.net/2/grant-types/device-code/)

## Prerequisite

Make sure you have read the [prerequisite-guide](../../README.md#prerequisite) before continuing.

Your application registration needs `Allow public client flows` enabled for this flow to work.


![Azure Portal screenshot](./allow_public_client_flow.png)

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

`$ AZURE_TENANT_ID=... COGNITE_PROJECT=... CLIENT_ID=...  node build/quickstart.js`
