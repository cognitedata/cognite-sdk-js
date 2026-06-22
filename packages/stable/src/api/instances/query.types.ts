import type {
  EdgeDefinition,
  NodeDefinition,
  NodeOrEdge,
  QueryRequest,
  RawPropertyValueV3,
  TypeInformationOuter,
  ViewReference,
} from './types.gen';

export type SelectSourceWithParams = Array<{
  source: ViewReference;
  properties: Record<string, RawPropertyValueV3>;
}>;

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

export type QueryResult<
  TQueryRequest extends QueryRequest,
  TSelectSourceWithParams extends
    SelectSourceWithParams = SelectSourceWithParams,
> = {
  items: {
    [SelectKey in keyof TQueryRequest[SELECT]]: Array<
      Prettify<
        DmsInstanceType<TQueryRequest, SelectKey> & {
          properties: {
            [SelectSource in NonNullable<
              NonNullable<TQueryRequest[SELECT][SelectKey]>[SOURCES]
            >[number] as SelectSource[SOURCE][SPACE]]: {
              [SelectSourceVar in SelectSource as `${SelectSourceVar[SOURCE][EXTERNALID]}/${SelectSourceVar[SOURCE][VERSION]}`]: SelectSourceVar[PROPERTIES][0] extends ALLPROPERTIES
                ? Record<string, RawPropertyValueV3>
                : {
                    [SELECT_SOURCE_PROPERTY in SelectSourceVar[PROPERTIES][number]]: TypedSourceProperty<
                      SelectSourceVar,
                      TSelectSourceWithParams
                    >[SELECT_SOURCE_PROPERTY] extends never
                      ? RawPropertyValueV3
                      : TypedSourceProperty<
                          SelectSourceVar,
                          TSelectSourceWithParams
                        >[SELECT_SOURCE_PROPERTY];
                  };
            };
          };
        }
      >
    >;
  };
  nextCursor: Prettify<
    ConcreteValues<{
      [SelectKey in keyof TQueryRequest[SELECT]]?: string;
    }>
  >;
  typing?: Record<string, TypeInformationOuter>;
};

type DmsInstanceType<
  TQueryRequest extends QueryRequest,
  SelectKey extends keyof TQueryRequest[SELECT],
> = Exclude<keyof TQueryRequest[WITH][SelectKey], LIMIT> extends NODES
  ? Omit<NodeDefinition, PROPERTIES>
  : Exclude<keyof TQueryRequest[WITH][SelectKey], LIMIT> extends EDGES
    ? Omit<EdgeDefinition, PROPERTIES>
  : Omit<NodeOrEdge, PROPERTIES>;

type TypedSourceProperty<
  SelectSource extends NonNullable<
    QueryRequest[SELECT][keyof QueryRequest[SELECT]][SOURCES]
  >[number],
  TypedSelectSourcePropertyMap extends
    SelectSourceWithParams = SelectSourceWithParams,
> = Extract<
  TypedSelectSourcePropertyMap[number],
  Pick<SelectSource, SOURCE>
>[PROPERTIES];

type ConcreteValues<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
