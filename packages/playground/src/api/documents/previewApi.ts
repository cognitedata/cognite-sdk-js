// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { HttpResponseType } from '@cognite/sdk-core';

import type {
  DocumentId,
  DocumentsTemporaryPreviewLinkResponse,
} from '../../types';

export class PreviewAPI extends BaseResourceAPI<unknown> {
  public documentAsPdf = (id: DocumentId): Promise<ArrayBuffer> => {
    return this.#previewEndpoint<ArrayBuffer>(id, 'application/pdf');
  };

  public documentAsImage = (
    id: DocumentId,
    page: number
  ): Promise<ArrayBuffer> => {
    return this.#previewEndpoint<ArrayBuffer>(id, 'image/png', page);
  };

  public temporaryLink = (
    documentId: DocumentId
  ): Promise<DocumentsTemporaryPreviewLinkResponse> => {
    return this.#temporaryLinkEndpoint<DocumentsTemporaryPreviewLinkResponse>(
      documentId
    );
  };

  public buildPreviewURI = (
    id: DocumentId,
    accept: AcceptType,
    page = 0
  ): string => {
    let uri = `${this.url()}?documentId=${id.toString()}`;
    if (accept === 'image/png') {
      uri += `&page=${page.toString()}`;
    }

    return uri;
  };

  async #previewEndpoint<ResponseType>(
    id: DocumentId,
    accept: AcceptType,
    page = 0
  ): Promise<ResponseType> {
    const uri = this.buildPreviewURI(id, accept, page);
    const response = await this.get<ResponseType>(uri, {
      responseType: HttpResponseType.ArrayBuffer,
      headers: {
        Accept: accept,
      },
    });

    return response.data;
  }

  async #temporaryLinkEndpoint<ResponseType>(
    documentId: DocumentId
  ): Promise<ResponseType> {
    const response = await this.get<ResponseType>(this.url('temporaryLink'), {
      params: {
        documentId: documentId,
      },
    });
    return response.data;
  }
}

export type AcceptType = 'application/pdf' | 'image/png';
