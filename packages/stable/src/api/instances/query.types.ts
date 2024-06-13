import {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  QueryRequest,
} from './types.gen';

type SELECT = 'select';
type WITH = 'with';
type LIMIT = 'limit';
type NODES = 'nodes';
type EDGES = 'edges';
type PROPERTIES = 'properties';
type SOURCES = 'sources';
type SOURCE = 'source';
type SPACE = 'space';
type EXTERNALID = 'externalId';
type VERSION = 'version';
type ALLPROPERTIES = '*';

type InstanceType<T extends QueryRequest, K extends keyof T[SELECT]> = Exclude<
  keyof T[WITH][K],
  LIMIT
> extends NODES
  ? Omit<NodeDefinition, PROPERTIES>
  : Exclude<keyof T[WITH][K], LIMIT> extends EDGES
  ? Omit<EdgeDefinition, PROPERTIES>
  : Omit<NodeOrEdge, PROPERTIES>;

type TypedSourceProperty<
  Q extends NonNullable<
    QueryRequest[SELECT][keyof QueryRequest[SELECT]][SOURCES]
  >[number],
  L extends SelectSourceWithParams = SelectSourceWithParams
> = Extract<L[number], Pick<Q, SOURCE>>[PROPERTIES];

export type SelectSourceWithParams = Array<{
  source: {
    type: string;
    space: string;
    externalId: string;
    version: string;
  };
  properties: Record<string, any>;
}>;

export type QueryResult<
  TQueryRequest extends QueryRequest,
  TSelectSourceWithParams extends SelectSourceWithParams = SelectSourceWithParams
> = {
  items: {
    [SELECT_KEY in keyof TQueryRequest[SELECT]]: Array<
      InstanceType<TQueryRequest, SELECT_KEY> & {
        properties: {
          [SELECT_SOURCE in NonNullable<
            TQueryRequest[SELECT][SELECT_KEY][SOURCES]
          >[number] as SELECT_SOURCE[SOURCE][SPACE]]: {
            [SELECT_SOURCE_VAR in SELECT_SOURCE as `${SELECT_SOURCE_VAR[SOURCE][EXTERNALID]}/${SELECT_SOURCE_VAR[SOURCE][VERSION]}`]: SELECT_SOURCE_VAR[PROPERTIES][0] extends ALLPROPERTIES
              ? Record<string, unknown>
              : {
                  [SELECT_SOURCE_PROPERTY in SELECT_SOURCE_VAR[PROPERTIES][number]]: TypedSourceProperty<
                    SELECT_SOURCE_VAR,
                    TSelectSourceWithParams
                  >[SELECT_SOURCE_PROPERTY] extends never
                    ? unknown
                    : TypedSourceProperty<
                        SELECT_SOURCE_VAR,
                        TSelectSourceWithParams
                      >[SELECT_SOURCE_PROPERTY];
                };
          };
        };
      }
    >;
  };
  nextCursor?: Partial<{
    [SELECT_SOURCE_KEY in keyof TQueryRequest[SELECT]]: string;
  }>;
};
