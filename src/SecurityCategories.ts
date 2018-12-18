// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';

export interface Securitycategory {
  name: string;
  id: number;
}

interface SecuritycategoryResponse {
  data: {
    items: Securitycategory[];
  };
}

interface SecuritycategoriesWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: Securitycategory[];
}

interface SecuritycategoriesWithCursorResponse {
  data: SecuritycategoriesWithCursor;
}

interface SecuritycategoryListParams {
  sort?: string;
  cursor?: string;
  limit?: number;
}

/**
 * @hidden
 */
const securityCategoriesUrl = (): string =>
  `${apiUrl(0.5)}/${projectUrl()}/securitycategories`;

export class SecurityCategories {
  public static async create(names: string[]): Promise<Securitycategory[]> {
    const body = {
      items: names.map(name => ({ name })),
    };
    const url = securityCategoriesUrl();
    const result = (await rawPost(url, { data: body })) as AxiosResponse<
      SecuritycategoryResponse
    >;
    return result.data.data.items;
  }

  public static async delete(ids: number[]): Promise<void> {
    const body = {
      items: ids,
    };
    const url = `${securityCategoriesUrl()}/delete`;
    await rawPost(url, { data: body });
  }

  public static async list(
    params?: SecuritycategoryListParams
  ): Promise<SecuritycategoriesWithCursor> {
    const url = securityCategoriesUrl();
    const result = (await rawGet(url, { params })) as AxiosResponse<
      SecuritycategoriesWithCursorResponse
    >;
    return result.data.data;
  }
}
