// Copyright 2020 Cognite AS

import {
  Aggregate as AggregateStable,
  DatapointAggregate as DatapointAggregateStable,
  DatapointsMultiQuery as DataPointsMultiQueryStable,
  DatapointsQueryProperties as DatapointsQueryPropertiesStable,
  DoubleDatapoint as DoubleDatapointStable,
  DoubleDatapoints as DoubleDatapointsStable,
  Metadata,
  MetadataPatch,
  SinglePatchRequired,
  SinglePatchRequiredString,
  SinglePatchString,
  StringDatapoint as StringDatapointStable,
  StringDatapoints as StringDatapointsStable,
  Timestamp,
} from '@cognite/sdk';
import {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  InternalId,
} from '@cognite/sdk-core';

export * from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface IntIn {
  in: number[];
}

export interface IntEquals {
  equals: number;
}

export interface StringIn {
  in: string[];
}

export interface StringEquals {
  equals: string;
}

export interface EpochTimestampRange {
  max: number;
  min: number;
}

export interface ContainsAllIds {
  containsAll: CogniteInternalId[];
}

export interface ContainsAnyIds {
  containsAny: CogniteInternalId[];
}

export type MonitoringTaskModelExternalId = 'threshold' | 'double_threshold';

export const MonitoringTaskModelExternalId = {
  THRESHOLD: 'threshold' as const,
  DOUBLE_THRESHOLD: 'double_threshold' as const,
};

export interface MonitoringTaskThresholdModelCreateBase {
  externalId: MonitoringTaskModelExternalId;
}

export interface MonitoringTaskThresholdModelCreate
  extends MonitoringTaskThresholdModelCreateBase {
  externalId: 'threshold';
  timeseriesExternalId?: CogniteExternalId;
  timeseriesId?: CogniteInternalId;
  threshold: number;
  granularity?: string;
}

export interface MonitoringTaskDoubleThresholdModelCreate
  extends MonitoringTaskThresholdModelCreateBase {
  externalId: 'double_threshold';
  timeseriesExternalId?: CogniteExternalId;
  timeseriesId?: CogniteInternalId;
  lowerThreshold?: number;
  upperThreshold?: number;
  granularity?: string;
}

export interface MonitoringTaskThresholdModel {
  externalId: 'threshold';
  timeseriesId: CogniteInternalId;
  granularity?: string;
  threshold: number;
}

export interface MonitoringTaskDoubleThresholdModel {
  externalId: 'double_threshold';
  timeseriesId: CogniteInternalId;
  timeseriesExternalId?: CogniteExternalId;
  granularity?: string;
  lowerThreshold?: number;
  upperThreshold?: number;
}

export interface MonitoringTaskCreate {
  externalId: CogniteExternalId;
  name: string;
  channelId: CogniteInternalId;
  interval?: number;
  overlap?: number;
  model:
    | MonitoringTaskThresholdModelCreate
    | MonitoringTaskDoubleThresholdModelCreate;
  nonce: string;
  source?: string;
  sourceId?: string;
  alertContext?: {
    unsubscribeUrl: string;
    investigateUrl?: string;
    editUrl?: string;
  };
}

export interface MonitoringTask {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  name: string;
  channelId: CogniteInternalId;
  interval: number;
  overlap: number;
  model: MonitoringTaskThresholdModel | MonitoringTaskDoubleThresholdModel;
  source?: string;
  sourceId?: string;
}

export interface MonitoringTaskModelFilter {
  timeseriesId: CogniteInternalId;
}

export interface MonitoringTaskFilter {
  externalIds?: CogniteExternalId[];
  ids?: CogniteInternalId[];
  channelIds?: CogniteInternalId[];
  model?: MonitoringTaskModelFilter;
}

export interface MonitoringTaskFilterQuery extends FilterQuery {
  filter?: MonitoringTaskFilter;
}

export interface AlertFilter {
  channelIds?: CogniteInternalId[];
  channelExternalIds?: CogniteExternalId[];
}

export interface AlertFilterQuery extends FilterQuery {
  filter?: AlertFilter;
}

export interface AlertDeduplicationRuleCreate {
  mergeInterval?: string;
  activationInterval?: string;
}

export interface AlertRulesCreate {
  deduplication: AlertDeduplicationRuleCreate;
}

export interface AlertDeduplicationRule {
  mergeInterval?: string;
  activationInterval?: string;
}

export interface AlertRules {
  deduplication: AlertDeduplicationRule;
}

export interface AlertCreate {
  externalId?: CogniteExternalId;
  timestamp?: Timestamp;
  channelId?: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  source: string;
  value?: string;
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Metadata;
}

export interface Alert {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  timestamp: Timestamp;
  channelId: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  source: string;
  value?: string;
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Metadata;
  acknowledged: boolean;
  closed: boolean;
}

export interface ChannelCreate {
  externalId?: CogniteExternalId;
  parentExternalId?: CogniteExternalId;
  parentId?: CogniteInternalId;
  name: string;
  description?: string;
  metadata?: Metadata;
  alertRules?: AlertRulesCreate;
}

export interface Channel {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  parentExternalId?: CogniteExternalId;
  parentId?: CogniteInternalId;
  name: string;
  description?: string;
  metadata?: Metadata;
  alertRules?: AlertRules;
}

export interface ChannelFilter {
  ids?: CogniteInternalId[];
  externalIds?: CogniteExternalId[];
  parentIds?: CogniteInternalId[];
  metadata?: Metadata;
}

export interface ChannelFilterQuery extends FilterQuery {
  filter?: ChannelFilter;
}

export interface ChannelPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    parentId?: SinglePatchRequired<number>;
    metadata?: MetadataPatch;
  };
}

export interface ChannelChangeById extends ChannelPatch, InternalId {}

export interface ChannelChangeByExternalId extends ChannelPatch, ExternalId {}

export type ChannelChange = ChannelChangeById | ChannelChangeByExternalId;

export interface SubscriberCreate {
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriberFilter {
  externalIds?: CogniteExternalId[];
  ids?: CogniteInternalId[];
  metadata?: Metadata;
  email?: string;
}

export interface SubscriberFilterQuery extends FilterQuery {
  filter?: SubscriberFilter;
}

export interface Subscriber {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriberCreate {
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  email: string;
}

export interface SubscriptionCreate {
  externalId?: CogniteExternalId;
  channelId?: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  subscriberId?: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
  metadata?: Metadata;
}

export interface SubscriptionFilter {
  externalIds?: CogniteExternalId[];
  channelIds?: CogniteInternalId[];
  channelExternalIds?: CogniteExternalId[];
  subscriberIds?: CogniteInternalId[];
  subscriberExternalIds?: CogniteExternalId[];
  metadata?: Metadata;
}

export interface SubscriptionFilterQuery extends FilterQuery {
  filter?: SubscriptionFilter;
}

export interface SubscriptionDelete {
  externalId?: CogniteExternalId;
  channelExternalId?: CogniteExternalId;
  channelId?: CogniteInternalId;
  subscriberId?: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
}

export interface Subscription {
  externalId?: CogniteExternalId;
  channelId: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  subscriberId: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
  metadata?: Metadata;
}

export interface DatapointsMultiQuery
  extends Omit<DataPointsMultiQueryStable, 'items'> {
  items: DatapointsQuery[];
}

export type DatapointsQuery = DatapointsQueryId | DatapointsQueryExternalId;

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export type Aggregate = AggregateStable | 'countUncertain' | 'countBad';
export interface DatapointsQueryProperties
  extends Omit<DatapointsQueryPropertiesStable, 'aggregates'> {
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: Aggregate[];
  /**
   * denotes that the status of the data point should be included in the response.
   */
  includeStatus?: boolean;
  /**
   * returns data points marked with the uncertain status code.
   * The default behavior of the API is to treat them the same as bad data points and don't returned them.
   */
  treatUncertainAsBad?: boolean;
  /**
   * denotes that the API should return bad data points.
   * Because the API treats uncertain data points as bad by default,
   * this parameter includes both uncertain and bad data points.
   */
  ignoreBadDatapoints?: boolean;
}

export enum DatapointStatusCode {
  Good = 0,
  GoodCallAgain = 11075584,
  GoodCascade = 67698688,
  GoodCascadeInitializationAcknowledged = 67174400,
  GoodCascadeInitializationRequest = 67239936,
  GoodCascadeNotInvited = 67305472,
  GoodCascadeNotSelected = 67371008,
  GoodClamped = 3145728,
  GoodCommunicationEvent = 10944512,
  GoodCompletesAsynchronously = 3014656,
  GoodDataIgnored = 14221312,
  GoodDependentValueChanged = 14680064,
  GoodEdited = 14417920,
  GoodEdited_DependentValueChanged = 18219008,
  GoodEdited_DominantValueChanged = 18284544,
  GoodEdited_DominantValueChanged_DependentValueChanged = 18350080,
  GoodEntryInserted = 10616832,
  GoodEntryReplaced = 10682368,
  GoodFaultStateActive = 67567616,
  GoodInitiateFaultState = 67633152,
  GoodLocalOverride = 9830400,
  GoodMoreData = 10878976,
  GoodNoData = 10813440,
  GoodNonCriticalTimeout = 11141120,
  GoodOverload = 3080192,
  GoodPostActionFailed = 14483456,
  GoodResultsMayBeIncomplete = 12189696,
  GoodRetransmissionQueueNotSupported = 14614528,
  GoodShutdownEvent = 11010048,
  GoodSubscriptionTransferred = 2949120,
  Uncertain = 1073741824,
  UncertainConfigurationError = 1108279296,
  UncertainDataSubNormal = 1084489728,
  UncertainDependentValueChanged = 1088552960,
  UncertainDominantValueChanged = 1088290816,
  UncertainEngineeringUnitsExceeded = 1083441152,
  UncertainInitialValue = 1083310080,
  UncertainLastUsableValue = 1083179008,
  UncertainNoCommunicationLastUsableValue = 1083113472,
  UncertainNotAllNodesAvailable = 1086324736,
  UncertainReferenceNotDeleted = 1086062592,
  UncertainReferenceOutOfServer = 1080819712,
  UncertainSensorCalibration = 1107951616,
  UncertainSensorNotAccurate = 1083375616,
  UncertainSimulatedValue = 1107886080,
  UncertainSubNormal = 1083506688,
  UncertainSubstituteValue = 1083244544,
  UncertainTransducerInManual = 1107820544,
  Bad = 2147483648,
  BadAggregateConfigurationRejected = 2161770496,
  BadAggregateInvalidInputs = 2161508352,
  BadAggregateListMismatch = 2161377280,
  BadAggregateNotSupported = 2161442816,
  BadAlreadyExists = 2165637120,
  BadApplicationSignatureInvalid = 2153250816,
  BadArgumentsMissing = 2155216896,
  BadAttributeIdInvalid = 2150957056,
  BadBoundNotFound = 2161573888,
  BadBoundNotSupported = 2161639424,
  BadBrowseDirectionInvalid = 2152529920,
  BadBrowseNameDuplicated = 2153840640,
  BadBrowseNameInvalid = 2153775104,
  BadCertificateChainIncomplete = 2165112832,
  BadCertificateHostNameInvalid = 2148925440,
  BadCertificateInvalid = 2148663296,
  BadCertificateIssuerRevocationUnknown = 2149318656,
  BadCertificateIssuerRevoked = 2149449728,
  BadCertificateIssuerTimeInvalid = 2148859904,
  BadCertificateIssuerUseNotAllowed = 2149122048,
  BadCertificatePolicyCheckFailed = 2165571584,
  BadCertificateRevocationUnknown = 2149253120,
  BadCertificateRevoked = 2149384192,
  BadCertificateTimeInvalid = 2148794368,
  BadCertificateUntrusted = 2149187584,
  BadCertificateUriInvalid = 2148990976,
  BadCertificateUseNotAllowed = 2149056512,
  BadCommunicationError = 2147811328,
  BadConditionAlreadyDisabled = 2157445120,
  BadConditionAlreadyEnabled = 2160852992,
  BadConditionAlreadyShelved = 2161180672,
  BadConditionBranchAlreadyAcked = 2161049600,
  BadConditionBranchAlreadyConfirmed = 2161115136,
  BadConditionDisabled = 2157510656,
  BadConditionNotShelved = 2161246208,
  BadConfigurationError = 2156462080,
  BadConnectionClosed = 2158886912,
  BadConnectionRejected = 2158755840,
  BadContentFilterInvalid = 2152202240,
  BadContinuationPointInvalid = 2152333312,
  BadDataEncodingInvalid = 2151153664,
  BadDataEncodingUnsupported = 2151219200,
  BadDataLost = 2157772800,
  BadDataTypeIdUnknown = 2148597760,
  BadDataUnavailable = 2157838336,
  BadDeadbandFilterInvalid = 2156789760,
  BadDecodingError = 2147942400,
  BadDependentValueChanged = 2162360320,
  BadDeviceFailure = 2156593152,
  BadDialogNotActive = 2160918528,
  BadDialogResponseInvalid = 2160984064,
  BadDisconnect = 2158821376,
  BadDiscoveryUrlMissing = 2152792064,
  BadDominantValueChanged = 2162229248,
  BadDuplicateReferenceNotAllowed = 2154168320,
  BadEdited_OutOfRange = 2165899264,
  BadEdited_OutOfRange_DominantValueChanged = 2166095872,
  BadEdited_OutOfRange_DominantValueChanged_DependentValueChanged = 2166226944,
  BadEncodingError = 2147876864,
  BadEncodingLimitsExceeded = 2148007936,
  BadEndOfStream = 2159017984,
  BadEntryExists = 2157903872,
  BadEventFilterInvalid = 2152136704,
  BadEventIdUnknown = 2157576192,
  BadEventNotAcknowledgeable = 2159738880,
  BadExpectedStreamToBlock = 2159280128,
  BadFilterElementInvalid = 2160328704,
  BadFilterLiteralInvalid = 2160394240,
  BadFilterNotAllowed = 2152005632,
  BadFilterOperandCountMismatch = 2160263168,
  BadFilterOperandInvalid = 2152267776,
  BadFilterOperatorInvalid = 2160132096,
  BadFilterOperatorUnsupported = 2160197632,
  BadHistoryOperationInvalid = 2154889216,
  BadHistoryOperationUnsupported = 2154954752,
  BadIdentityChangeNotSupported = 2160459776,
  BadIdentityTokenInvalid = 2149580800,
  BadIdentityTokenRejected = 2149646336,
  BadIndexRangeInvalid = 2151022592,
  BadIndexRangeNoData = 2151088128,
  BadInitialValue_OutOfRange = 2165964800,
  BadInsufficientClientProfile = 2155610112,
  BadInternalError = 2147614720,
  BadInvalidArgument = 2158690304,
  BadInvalidSelfReference = 2154233856,
  BadInvalidState = 2158952448,
  BadInvalidTimestamp = 2149777408,
  BadInvalidTimestampArgument = 2159869952,
  BadLicenseExpired = 2165178368,
  BadLicenseLimitsExceeded = 2165243904,
  BadLicenseNotAvailable = 2165309440,
  BadMaxAgeInvalid = 2154823680,
  BadMaxConnectionsReached = 2159476736,
  BadMessageNotAvailable = 2155544576,
  BadMethodInvalid = 2155151360,
  BadMonitoredItemFilterInvalid = 2151874560,
  BadMonitoredItemFilterUnsupported = 2151940096,
  BadMonitoredItemIdInvalid = 2151809024,
  BadMonitoringModeInvalid = 2151743488,
  BadNoCommunication = 2150694912,
  BadNoContinuationPoints = 2152398848,
  BadNoData = 2157641728,
  BadNoDataAvailable = 2159083520,
  BadNoDeleteRights = 2154364928,
  BadNoEntryExists = 2157969408,
  BadNoMatch = 2154758144,
  BadNoSubscription = 2155413504,
  BadNoValidCertificates = 2153316352,
  BadNodeAttributesInvalid = 2153906176,
  BadNodeClassInvalid = 2153709568,
  BadNodeIdExists = 2153644032,
  BadNodeIdInvalid = 2150825984,
  BadNodeIdRejected = 2153578496,
  BadNodeIdUnknown = 2150891520,
  BadNodeNotInView = 2152595456,
  BadNonceInvalid = 2149842944,
  BadNotConnected = 2156527616,
  BadNotExecutable = 2165374976,
  BadNotFound = 2151546880,
  BadNotImplemented = 2151677952,
  BadNotReadable = 2151284736,
  BadNotSupported = 2151481344,
  BadNotTypeDefinition = 2160590848,
  BadNotWritable = 2151350272,
  BadNothingToDo = 2148466688,
  BadNumericOverflow = 2165440512,
  BadObjectDeleted = 2151612416,
  BadOperationAbandoned = 2159214592,
  BadOutOfMemory = 2147680256,
  BadOutOfRange = 2151415808,
  BadOutOfRange_DominantValueChanged = 2166030336,
  BadOutOfRange_DominantValueChanged_DependentValueChanged = 2166161408,
  BadOutOfService = 2156724224,
  BadParentNodeIdInvalid = 2153447424,
  BadProtocolVersionUnsupported = 2159935488,
  BadQueryTooComplex = 2154692608,
  BadReferenceLocalOnly = 2154299392,
  BadReferenceNotAllowed = 2153512960,
  BadReferenceTypeIdInvalid = 2152464384,
  BadRefreshInProgress = 2157379584,
  BadRequestCancelledByClient = 2150367232,
  BadRequestCancelledByRequest = 2153381888,
  BadRequestHeaderInvalid = 2150236160,
  BadRequestInterrupted = 2156134400,
  BadRequestNotAllowed = 2162425856,
  BadRequestNotComplete = 2165506048,
  BadRequestTimeout = 2156199936,
  BadRequestTooLarge = 2159542272,
  BadRequestTypeInvalid = 2152923136,
  BadResourceUnavailable = 2147745792,
  BadResponseTooLarge = 2159607808,
  BadSecureChannelClosed = 2156265472,
  BadSecureChannelIdInvalid = 2149711872,
  BadSecureChannelTokenUnknown = 2156331008,
  BadSecurityChecksFailed = 2148728832,
  BadSecurityModeInsufficient = 2162556928,
  BadSecurityModeRejected = 2152988672,
  BadSecurityPolicyRejected = 2153054208,
  BadSempahoreFileMissing = 2152857600,
  BadSensorFailure = 2156658688,
  BadSequenceNumberInvalid = 2156396544,
  BadSequenceNumberUnknown = 2155479040,
  BadServerHalted = 2148401152,
  BadServerIndexInvalid = 2154430464,
  BadServerNameMissing = 2152726528,
  BadServerNotConnected = 2148335616,
  BadServerUriInvalid = 2152660992,
  BadServiceUnsupported = 2148204544,
  BadSessionClosed = 2149974016,
  BadSessionIdInvalid = 2149908480,
  BadSessionNotActivated = 2150039552,
  BadShelvingTimeOutOfRange = 2161311744,
  BadShutdown = 2148270080,
  BadSourceNodeIdInvalid = 2154037248,
  BadStateNotActive = 2160001024,
  BadStructureMissing = 2152071168,
  BadSubscriptionIdInvalid = 2150105088,
  BadSyntaxError = 2159411200,
  BadTargetNodeIdInvalid = 2154102784,
  BadTcpEndpointUrlInvalid = 2156068864,
  BadTcpInternalError = 2156003328,
  BadTcpMessageTooLarge = 2155872256,
  BadTcpMessageTypeInvalid = 2155741184,
  BadTcpNotEnoughResources = 2155937792,
  BadTcpSecureChannelUnknown = 2155806720,
  BadTcpServerTooBusy = 2155675648,
  BadTicketInvalid = 2166358016,
  BadTicketRequired = 2166292480,
  BadTimeout = 2148139008,
  BadTimestampNotSupported = 2158034944,
  BadTimestampsToReturnInvalid = 2150301696,
  BadTooManyArguments = 2162491392,
  BadTooManyMatches = 2154627072,
  BadTooManyMonitoredItems = 2161836032,
  BadTooManyOperations = 2148532224,
  BadTooManyPublishRequests = 2155347968,
  BadTooManySessions = 2153119744,
  BadTooManySubscriptions = 2155282432,
  BadTypeDefinitionInvalid = 2153971712,
  BadTypeMismatch = 2155085824,
  BadUnexpectedError = 2147549184,
  BadUnknownResponse = 2148073472,
  BadUserAccessDenied = 2149515264,
  BadUserSignatureInvalid = 2153185280,
  BadViewIdUnknown = 2154496000,
  BadViewParameterMismatch = 2160721920,
  BadViewTimestampInvalid = 2160656384,
  BadViewVersionInvalid = 2160787456,
  BadWaitingForInitialData = 2150760448,
  BadWaitingForResponse = 2159149056,
  BadWouldBlock = 2159345664,
  BadWriteNotSupported = 2155020288,
}

export enum DatapointStatusCodeModifierFlag {
  StructureChanged = 32768,
  SemanticsChanged = 16384,
}

export enum DatapointStatusCodeLimitFlag {
  Constant = 768,
  High = 512,
  Low = 256,
}

export type DatapointStatusCodeStructureChanged = 32768;
export type DatapointStatusCodeSemanticsChanged = 16384;

// Will try to upgrade ts and convert this to a
// template literal
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
// export type DatapointStatusCodeSymbol = `${keyof typeof DatapointStatusCode}, ....`;

export interface DatapointStatus {
  code: number;
  symbol: string;
}

export interface DatapointAggregate extends DatapointAggregateStable {
  countUncertain?: number;
  countBad?: number;
}

export type Datapoints = StringDatapoints | DoubleDatapoints;

export interface DoubleDatapoints
  extends Omit<DoubleDatapointsStable, 'datapoints'> {
  datapoints: DoubleDatapoint[];
}

export interface StringDatapoints
  extends Omit<StringDatapointsStable, 'datapoints'> {
  datapoints: StringDatapoint[];
}

export interface DoubleDatapoint extends DoubleDatapointStable {
  status?: DatapointStatus;
}

export interface StringDatapoint extends StringDatapointStable {
  status?: DatapointStatus;
}
