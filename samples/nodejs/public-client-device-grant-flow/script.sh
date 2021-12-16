#!/bin/sh
# AZURE_TENANT_ID="267cfdd8-a207-4320-80f2-a4352b15048f" CLIENT_ID="4770c0f1-7bb6-43b5-8c37-94f2a9306757" COGNITE_PROJECT="platypus" node build/device_grant.js 

# AZURE_TENANT_ID="267cfdd8-a207-4320-80f2-a4352b15048f" CLIENT_ID="4770c0f1-7bb6-43b5-8c37-94f2a9306757" COGNITE_PROJECT="platypus" node build/device_grant_refresh.js 

AZURE_TENANT_ID="267cfdd8-a207-4320-80f2-a4352b15048f" CLIENT_ID="4770c0f1-7bb6-43b5-8c37-94f2a9306757" COGNITE_PROJECT="platypus" node build/device_grant_with_auto_refresh.js 
