// Copyright 2022 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { HttpResponseType } from '@cognite/sdk-core';

import {
  CogniteInternalId,
  DocumentsPreviewTemporaryLinkResponse,
} from '../../types';

export class PreviewAPI extends BaseResourceAPI<any> {
  public documentAsPdf = (id: CogniteInternalId): Promise<ArrayBuffer> => {
    return this.pdfPreviewEndpoint<ArrayBuffer>(id);
  };

  /**
   * [Retrieve a image preview of a page from a document](https://docs.cognite.com/api/v1/#tag/Document-preview/operation/documentsPreviewImagePage)
   *
   * ```js
   * await client.documents.preview.documentAsImage(1, 1);
   * ```
   *
   * @param id
   * @param page
   * @returns
   */
  public documentAsImage = (
    id: CogniteInternalId,
    page: number
  ): Promise<ArrayBuffer> => {
    return this.imagePreviewEndpoint<ArrayBuffer>(id, page);
  };

  /**
   * [Retrieve a temporary link to a PDF preview of a document](https://docs.cognite.com/api/v1/#tag/Document-preview/operation/documentsPreviewPdfTemporaryLink)
   *
   * ```js
   * await client.documents.preview.pdfTemporaryLink(1);
   * ```
   *
   * @param id
   * @returns
   */
  public pdfTemporaryLink = (
    id: CogniteInternalId
  ): Promise<DocumentsPreviewTemporaryLinkResponse> => {
    return this.pdfTemporaryLinkEndpoint<DocumentsPreviewTemporaryLinkResponse>(
      id
    );
  };

  public pdfBuildPreviewURI = (id: CogniteInternalId): string => {
    return `${this.url()}${id.toString()}/preview/pdf`;
  };

  private async pdfPreviewEndpoint<ResponseType>(
    id: CogniteInternalId
  ): Promise<ResponseType> {
    const uri = this.pdfBuildPreviewURI(id);
    const response = await this.get<ResponseType>(uri, {
      responseType: HttpResponseType.ArrayBuffer,
      headers: {
        Accept: 'application/pdf',
      },
    });

    return response.data;
  }

  public imageBuildPreviewURI = (
    id: CogniteInternalId,
    page: number = 1
  ): string => {
    return `${this.url()}${id.toString()}/preview/image/pages/${page.toString()}`;
  };

  private async imagePreviewEndpoint<ResponseType>(
    id: CogniteInternalId,
    page: number = 1
  ): Promise<ResponseType> {
    const uri = this.imageBuildPreviewURI(id, page);
    const response = await this.get<ResponseType>(uri, {
      responseType: HttpResponseType.ArrayBuffer,
      headers: {
        Accept: 'image/png',
      },
    });

    return response.data;
  }

  public pdfBuildTemporaryLinkURI = (id: CogniteInternalId): string => {
    return `${this.url()}${id.toString()}/preview/pdf/temporarylink`;
  };

  private async pdfTemporaryLinkEndpoint<ResponseType>(
    id: CogniteInternalId
  ): Promise<ResponseType> {
    const uri = this.pdfBuildTemporaryLinkURI(id);
    const response = await this.get<ResponseType>(uri);

    return response.data;
  }
}
