// Copyright 2026 Cognite AS

import type { CogniteExternalId } from '@cognite/sdk-core';
import type {
  SetField,
  SinglePatch,
  SinglePatchRequiredString,
  SinglePatchString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';
import type {
  HostedExtractorMetadata,
  HostedExtractorMetadataPatch,
} from './commonTypes';

// Authentication

export interface HostedExtractorSourceBasicAuthentication {
  type: 'basic';
  username: string;
}

export interface HostedExtractorSourceClientCredentialsAuthentication {
  type: 'clientCredentials';
  /**
   * Client ID of the service principal used by the extractor.
   */
  clientId: string;
  /**
   * URL to fetch authentication tokens from.
   */
  tokenUrl: string;
  /**
   * Audience passed as part of the token request. Some identity providers
   * reject token requests without it, unless a default audience is configured.
   */
  audience?: string;
  /**
   * Resource passed as part of the token request.
   */
  resource?: string;
  /**
   * A space separated list of scopes.
   */
  scopes?: string;
  /**
   * Default value for the OAuth 2.0 `expires_in` parameter. Required if the
   * identity provider does not return `expires_in`.
   */
  defaultExpiresIn?: number;
}

export interface HostedExtractorSourceHeaderAuthentication {
  type: 'header';
  /**
   * Name of the header that holds the authentication token.
   */
  key: string;
}

export interface HostedExtractorSourceQueryParamAuthentication {
  type: 'query';
  /**
   * Name of the query parameter that holds the authentication token.
   */
  key: string;
}

export interface HostedExtractorSourceScramSha256Authentication {
  type: 'scramSha256';
  username: string;
}

export interface HostedExtractorSourceScramSha512Authentication {
  type: 'scramSha512';
  username: string;
}

/**
 * Basic authentication for MQTT, Event Hub and Kafka sources. For Event Hub,
 * `username` is the shared access key name and `password` the key value.
 */
export interface HostedExtractorSourceBasicAuthenticationCreate
  extends HostedExtractorSourceBasicAuthentication {
  password?: string;
}

export interface HostedExtractorSourceRestBasicAuthenticationCreate
  extends HostedExtractorSourceBasicAuthentication {
  password: string;
}

export interface HostedExtractorSourceClientCredentialsAuthenticationCreate
  extends HostedExtractorSourceClientCredentialsAuthentication {
  /**
   * Client secret of the service principal used by the extractor.
   */
  clientSecret: string;
}

export interface HostedExtractorSourceHeaderAuthenticationCreate
  extends HostedExtractorSourceHeaderAuthentication {
  /**
   * The authentication token.
   */
  value: string;
}

export interface HostedExtractorSourceQueryParamAuthenticationCreate
  extends HostedExtractorSourceQueryParamAuthentication {
  /**
   * The authentication token.
   */
  value: string;
}

export interface HostedExtractorSourceScramSha256AuthenticationCreate
  extends HostedExtractorSourceScramSha256Authentication {
  password: string;
}

export interface HostedExtractorSourceScramSha512AuthenticationCreate
  extends HostedExtractorSourceScramSha512Authentication {
  password: string;
}

export type HostedExtractorSourceMqttAuthentication =
  HostedExtractorSourceBasicAuthentication;

export type HostedExtractorSourceMqttAuthenticationCreate =
  HostedExtractorSourceBasicAuthenticationCreate;

export type HostedExtractorSourceEventHubAuthentication =
  | HostedExtractorSourceBasicAuthentication
  | HostedExtractorSourceClientCredentialsAuthentication;

export type HostedExtractorSourceEventHubAuthenticationCreate =
  | HostedExtractorSourceBasicAuthenticationCreate
  | HostedExtractorSourceClientCredentialsAuthenticationCreate;

export type HostedExtractorSourceKafkaAuthentication =
  | HostedExtractorSourceBasicAuthentication
  | HostedExtractorSourceClientCredentialsAuthentication
  | HostedExtractorSourceScramSha256Authentication
  | HostedExtractorSourceScramSha512Authentication;

export type HostedExtractorSourceKafkaAuthenticationCreate =
  | HostedExtractorSourceBasicAuthenticationCreate
  | HostedExtractorSourceClientCredentialsAuthenticationCreate
  | HostedExtractorSourceScramSha256AuthenticationCreate
  | HostedExtractorSourceScramSha512AuthenticationCreate;

export type HostedExtractorSourceRestAuthentication =
  | HostedExtractorSourceBasicAuthentication
  | HostedExtractorSourceHeaderAuthentication
  | HostedExtractorSourceQueryParamAuthentication
  | HostedExtractorSourceClientCredentialsAuthentication;

export type HostedExtractorSourceRestAuthenticationCreate =
  | HostedExtractorSourceRestBasicAuthenticationCreate
  | HostedExtractorSourceHeaderAuthenticationCreate
  | HostedExtractorSourceQueryParamAuthenticationCreate
  | HostedExtractorSourceClientCredentialsAuthenticationCreate;

// Certificates

/**
 * Format of the `certificate` field.
 */
export type HostedExtractorSourceCertificateType = 'der' | 'pem';

/**
 * Details of an uploaded certificate. The certificate itself is not returned.
 */
export interface HostedExtractorSourceCertificateDetails {
  thumbprint: string;
  /**
   * When the certificate expires.
   */
  expiresAt: number;
}

/**
 * Custom certificate authority, to let the source use a self-signed certificate.
 */
export interface HostedExtractorSourceCaCertificate {
  type: HostedExtractorSourceCertificateType;
  /**
   * Base 64 encoded DER certificate, or a PEM certificate with headers.
   */
  certificate: string;
}

/**
 * Certificate the extractor uses to authenticate with the source.
 */
export interface HostedExtractorSourceAuthCertificate
  extends HostedExtractorSourceCaCertificate {
  /**
   * The key of the certificate.
   */
  key: string;
  /**
   * The password of the certificate key.
   */
  keyPassword?: string;
}

// Shared fields

export interface HostedExtractorSourceKafkaBroker {
  host: string;
  port: number;
}

export type HostedExtractorSourceRestScheme = 'http' | 'https';

interface HostedExtractorSourceCommon {
  externalId: CogniteExternalId;
  name?: string;
  description?: string;
  metadata?: HostedExtractorMetadata;
}

interface HostedExtractorSourceReadCommon extends HostedExtractorSourceCommon {
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

interface HostedExtractorSourceCertificates {
  caCertificate?: HostedExtractorSourceCertificateDetails;
  authCertificate?: HostedExtractorSourceCertificateDetails;
}

interface HostedExtractorSourceCertificatesCreate {
  caCertificate?: HostedExtractorSourceCaCertificate;
  authCertificate?: HostedExtractorSourceAuthCertificate;
}

interface HostedExtractorSourceMqttFields {
  /**
   * Host name or IP address of the MQTT broker.
   */
  host: string;
  /**
   * @default 1883
   */
  port?: number;
  useTls?: boolean;
}

interface HostedExtractorSourceEventHubFields {
  /**
   * Host name or IP address of the event hub consumer endpoint.
   */
  host: string;
  eventHubName: string;
  /**
   * The event hub consumer group. Microsoft recommends a distinct consumer
   * group for each application. If left out, the default consumer group is used.
   */
  consumerGroup?: string;
}

interface HostedExtractorSourceRestFields {
  host: string;
  /**
   * Port on the server. If left out, the default port of the `scheme` is used.
   */
  port?: number;
}

interface HostedExtractorSourceKafkaFields {
  /**
   * Redundant Kafka brokers to connect to. Between 1 and 8 brokers.
   */
  bootstrapBrokers: HostedExtractorSourceKafkaBroker[];
  useTls?: boolean;
}

// Read models

export interface HostedExtractorSourceMqtt3
  extends HostedExtractorSourceReadCommon,
    HostedExtractorSourceMqttFields,
    HostedExtractorSourceCertificates {
  type: 'mqtt3';
  authentication?: HostedExtractorSourceMqttAuthentication;
}

export interface HostedExtractorSourceMqtt5
  extends HostedExtractorSourceReadCommon,
    HostedExtractorSourceMqttFields,
    HostedExtractorSourceCertificates {
  type: 'mqtt5';
  authentication?: HostedExtractorSourceMqttAuthentication;
}

export interface HostedExtractorSourceEventHub
  extends HostedExtractorSourceReadCommon,
    HostedExtractorSourceEventHubFields {
  type: 'eventhub';
  /**
   * The key value is not returned.
   */
  authentication?: HostedExtractorSourceEventHubAuthentication;
}

export interface HostedExtractorSourceRest
  extends HostedExtractorSourceReadCommon,
    HostedExtractorSourceRestFields,
    HostedExtractorSourceCertificates {
  type: 'rest';
  scheme: HostedExtractorSourceRestScheme;
  authentication?: HostedExtractorSourceRestAuthentication;
}

export interface HostedExtractorSourceKafka
  extends HostedExtractorSourceReadCommon,
    HostedExtractorSourceKafkaFields,
    HostedExtractorSourceCertificates {
  type: 'kafka';
  authentication?: HostedExtractorSourceKafkaAuthentication;
}

export type HostedExtractorSource =
  | HostedExtractorSourceMqtt3
  | HostedExtractorSourceMqtt5
  | HostedExtractorSourceEventHub
  | HostedExtractorSourceRest
  | HostedExtractorSourceKafka;

export type HostedExtractorSourceType = HostedExtractorSource['type'];

// Create models

export interface HostedExtractorSourceMqtt3Create
  extends HostedExtractorSourceCommon,
    HostedExtractorSourceMqttFields,
    HostedExtractorSourceCertificatesCreate {
  type: 'mqtt3';
  authentication?: HostedExtractorSourceMqttAuthenticationCreate;
}

export interface HostedExtractorSourceMqtt5Create
  extends HostedExtractorSourceCommon,
    HostedExtractorSourceMqttFields,
    HostedExtractorSourceCertificatesCreate {
  type: 'mqtt5';
  authentication?: HostedExtractorSourceMqttAuthenticationCreate;
}

export interface HostedExtractorSourceEventHubCreate
  extends HostedExtractorSourceCommon,
    HostedExtractorSourceEventHubFields {
  type: 'eventhub';
  authentication?: HostedExtractorSourceEventHubAuthenticationCreate;
}

export interface HostedExtractorSourceRestCreate
  extends HostedExtractorSourceCommon,
    HostedExtractorSourceRestFields,
    HostedExtractorSourceCertificatesCreate {
  type: 'rest';
  /**
   * @default 'https'
   */
  scheme?: HostedExtractorSourceRestScheme;
  authentication?: HostedExtractorSourceRestAuthenticationCreate;
}

export interface HostedExtractorSourceKafkaCreate
  extends HostedExtractorSourceCommon,
    HostedExtractorSourceKafkaFields,
    HostedExtractorSourceCertificatesCreate {
  type: 'kafka';
  authentication?: HostedExtractorSourceKafkaAuthenticationCreate;
}

export type HostedExtractorSourceCreate =
  | HostedExtractorSourceMqtt3Create
  | HostedExtractorSourceMqtt5Create
  | HostedExtractorSourceEventHubCreate
  | HostedExtractorSourceRestCreate
  | HostedExtractorSourceKafkaCreate;

// Update models

interface HostedExtractorSourcePatchCommon {
  name?: SinglePatchString;
  description?: SinglePatchString;
  metadata?: HostedExtractorMetadataPatch;
}

interface HostedExtractorSourceCertificatesPatch {
  caCertificate?: SinglePatch<HostedExtractorSourceCaCertificate>;
  authCertificate?: SinglePatch<HostedExtractorSourceAuthCertificate>;
}

export interface HostedExtractorSourceMqttPatch
  extends HostedExtractorSourcePatchCommon,
    HostedExtractorSourceCertificatesPatch {
  host?: SinglePatchRequiredString;
  port?: SinglePatch<number>;
  authentication?: SinglePatch<HostedExtractorSourceMqttAuthenticationCreate>;
  useTls?: SetField<boolean>;
}

export interface HostedExtractorSourceEventHubPatch
  extends HostedExtractorSourcePatchCommon {
  host?: SinglePatchRequiredString;
  eventHubName?: SinglePatchRequiredString;
  authentication?: SetField<HostedExtractorSourceEventHubAuthenticationCreate>;
  consumerGroup?: SinglePatchString;
}

export interface HostedExtractorSourceRestPatch
  extends HostedExtractorSourcePatchCommon,
    HostedExtractorSourceCertificatesPatch {
  host?: SinglePatchRequiredString;
  scheme?: SetField<HostedExtractorSourceRestScheme>;
  port?: SinglePatch<number>;
  authentication?: SinglePatch<HostedExtractorSourceRestAuthenticationCreate>;
}

export interface HostedExtractorSourceKafkaPatch
  extends HostedExtractorSourcePatchCommon,
    HostedExtractorSourceCertificatesPatch {
  bootstrapBrokers?: SetField<HostedExtractorSourceKafkaBroker[]>;
  authentication?: SinglePatch<HostedExtractorSourceKafkaAuthenticationCreate>;
  useTls?: SetField<boolean>;
}

export interface HostedExtractorSourceMqtt3Change {
  type: 'mqtt3';
  externalId: CogniteExternalId;
  update: HostedExtractorSourceMqttPatch;
}

export interface HostedExtractorSourceMqtt5Change {
  type: 'mqtt5';
  externalId: CogniteExternalId;
  update: HostedExtractorSourceMqttPatch;
}

export interface HostedExtractorSourceEventHubChange {
  type: 'eventhub';
  externalId: CogniteExternalId;
  update: HostedExtractorSourceEventHubPatch;
}

export interface HostedExtractorSourceRestChange {
  type: 'rest';
  externalId: CogniteExternalId;
  update: HostedExtractorSourceRestPatch;
}

export interface HostedExtractorSourceKafkaChange {
  type: 'kafka';
  externalId: CogniteExternalId;
  update: HostedExtractorSourceKafkaPatch;
}

/**
 * An update to one source. `type` must match the type of the existing source.
 */
export type HostedExtractorSourceChange =
  | HostedExtractorSourceMqtt3Change
  | HostedExtractorSourceMqtt5Change
  | HostedExtractorSourceEventHubChange
  | HostedExtractorSourceRestChange
  | HostedExtractorSourceKafkaChange;
