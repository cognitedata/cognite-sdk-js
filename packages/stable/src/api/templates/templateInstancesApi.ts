// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import fromPairs from 'lodash/fromPairs';
import toPairs from 'lodash/toPairs';
import {
  ConstantResolver,
  type ExternalTemplateInstance,
  type FieldResolver,
  RawResolver,
  SyntheticTimeSeriesResolver,
  type TemplateInstance,
  type TemplateInstanceFilterQuery,
  type TemplateInstancePatch,
  ViewResolver,
} from '../../types';

export class TemplateInstancesApi extends BaseResourceAPI<TemplateInstance> {
  /**
   * [Create Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstances)
   *
   * ```js
   * const instances = [
   *   { externalId: 'Well_a', templateName: "Well", fieldResolvers: { name: "Underwater P23", pressure: "21_PT19" } },
   *   { externalId: 'Well_b', templateName: "Well", fieldResolvers: { name: "Underwater P01" } },
   * ];
   * const createdInstances = await client.templates.group("myGroup").version(1).create(instances);
   * ```
   */
  public create = (
    items: ExternalTemplateInstance[]
  ): Promise<TemplateInstance[]> => {
    return super
      .createEndpoint(TemplateInstanceCodec.encodeTemplateInstances(items))
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [Upsert Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesUpsert)
   *
   * ```js
   * const instances = [
   *   { externalId: "Well_a", templateName: "Well", fieldResolvers: { name: "Underwater P23", pressure: "21_PT19" } },
   *   { externalId: "Well_b", templateName: "Well", fieldResolvers: { name: "Underwater P01" } },
   * ];
   * const createdInstances = await client.templates.group("myGroup").version(1).upsert(instances);
   * ```
   */
  public upsert = (
    items: ExternalTemplateInstance[]
  ): Promise<TemplateInstance[]> => {
    return super
      .createEndpoint(
        TemplateInstanceCodec.encodeTemplateInstances(items),
        this.url('upsert')
      )
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [Update Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesUpdate)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).update( [{ update: {
   *   fieldResolvers: {
   *     set: {
   *       myStringField: "My Field"
   *     }
   *   }
   * }, externalId: 'someExtId' }] );
   * ```
   */
  public update = (changes: TemplateInstancePatch[]) => {
    return super
      .updateEndpoint(changes.map(TemplateInstanceCodec.encodePatch))
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [Retrieve Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesByids)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).retrieve([ { externalId: 'Well } ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super
      .retrieveEndpoint(ids, options || { ignoreUnknownIds: false })
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [List Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesList)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).list( { templateNames: ["Well"] } );
   * ```
   */
  public list = (
    query?: TemplateInstanceFilterQuery
  ): CursorAndAsyncIterator<TemplateInstance> => {
    return super.listEndpoint(async (scope) => {
      const res = await this.callListEndpointWithPost(scope);
      return {
        ...res,
        data: {
          ...res.data,
          items: TemplateInstanceCodec.decodeTemplateInstances(res.data.items),
        },
      };
    }, query);
  };

  /**
   * [Delete Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesDelete)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).delete([{ externalId: ["Well_a"] }]);
   * ```
   */
  public delete = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.deleteEndpoint(
      ids,
      options || {
        ignoreUnknownIds: false,
      }
    );
  };
}

// biome-ignore lint/complexity/noStaticOnlyClass: not worth changing
class TemplateInstanceCodec {
  static encodeTemplateInstances(
    templateInstances: ExternalTemplateInstance[]
  ): ExternalTemplateInstance[] {
    return templateInstances.map((item) => {
      return {
        ...item,
        fieldResolvers: TemplateInstanceCodec.encodeFieldResolvers(
          item.fieldResolvers
        ),
      };
    });
  }

  static encodePatch(patch: TemplateInstancePatch): TemplateInstancePatch {
    return {
      ...patch,
      update: {
        fieldResolvers: {
          add:
            'add' in patch.update.fieldResolvers
              ? TemplateInstanceCodec.encodeFieldResolvers(
                  patch.update.fieldResolvers.add
                )
              : // biome-ignore lint/style/noNonNullAssertion: couldn't find correct type definition.
                undefined!,
          remove:
            'remove' in patch.update.fieldResolvers
              ? patch.update.fieldResolvers.remove
              : // biome-ignore lint/style/noNonNullAssertion: couldn't find correct type definition.
                undefined!,
          set:
            'set' in patch.update.fieldResolvers
              ? TemplateInstanceCodec.encodeFieldResolvers(
                  patch.update.fieldResolvers.set
                )
              : // biome-ignore lint/style/noNonNullAssertion: couldn't find correct type definition.
                undefined!,
        },
      },
    };
  }

  static encodeFieldResolvers(
    fieldResolvers: {
      [K in string]: FieldResolver | object;
    }
  ): { [K in string]: FieldResolver } {
    const mappedResolvers = toPairs(fieldResolvers).map(
      ([name, fieldResolver]) => {
        if (
          fieldResolver !== undefined &&
          !TemplateInstanceCodec.isFieldResolver(fieldResolver)
        ) {
          // Auto-wrap objects, numbers etc. as ConstantResolver.
          return [name, new ConstantResolver(fieldResolver)];
        }
        return [name, fieldResolver];
      }
    );

    return fromPairs(mappedResolvers);
  }

  static decodeTemplateInstances(
    templateInstances: TemplateInstance[]
  ): TemplateInstance[] {
    return templateInstances.map((item) => {
      return {
        ...item,
        fieldResolvers: TemplateInstanceCodec.decodeFieldResolvers(
          item.fieldResolvers
        ),
      };
    });
  }

  static decodeFieldResolvers(
    fieldResolvers: {
      [K in string]: FieldResolver | object;
    }
  ): { [K in string]: FieldResolver | object } {
    const mappedResolvers = toPairs(fieldResolvers).map(
      ([name, fieldResolver]) => {
        return [
          name,
          // biome-ignore lint/suspicious/noExplicitAny: couldn't find correct type definition.
          TemplateInstanceCodec.decodeFieldResolver(fieldResolver as any),
        ];
      }
    );

    return fromPairs(mappedResolvers);
  }

  // biome-ignore lint/suspicious/noExplicitAny: couldn't find correct type definition.
  static decodeFieldResolver(fieldResolver: any): FieldResolver | object {
    switch (fieldResolver.type) {
      case 'constant':
        return fieldResolver.value;
      case 'raw':
        return new RawResolver(
          fieldResolver.dbName,
          fieldResolver.tableName,
          fieldResolver.rowKey,
          fieldResolver.columnName
        );
      case 'syntheticTimeSeries':
        return new SyntheticTimeSeriesResolver(
          fieldResolver.expression,
          fieldResolver.name,
          fieldResolver.metadata,
          fieldResolver.description,
          fieldResolver.isStep,
          fieldResolver.isString,
          fieldResolver.unit
        );
      case 'view':
        return new ViewResolver(fieldResolver.externalId, fieldResolver.input);
      default:
        throw new Error('Unknown field resolver type');
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: couldn't find correct type definition.
  static isFieldResolver(fieldResolver: any) {
    return (
      fieldResolver.type === 'constant' ||
      fieldResolver.type === 'raw' ||
      fieldResolver.type === 'syntheticTimeSeries' ||
      fieldResolver.type === 'view'
    );
  }
}
