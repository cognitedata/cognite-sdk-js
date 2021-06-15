// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { HttpResponseType } from '@cognite/sdk-core';

import { DocumentId, DocumentPreviewTemporaryLink } from '../../types';
import Any = jasmine.Any;

export class PreviewAPI extends BaseResourceAPI<Any> {
  public document = (
    id: DocumentId,
    accepts: acceptsType = 'image/png',
    page: number = 0
  ): Promise<ArrayBuffer> => {
    return this.previewEndpoint<ArrayBuffer>(id, accepts, page);
  };

  public documentAsPdf = (id: DocumentId): Promise<Any> => {
    return this.previewEndpoint<Any>(id, 'application/pdf');
  };

  public documentAsImage = (id: DocumentId, page: number = 0): Promise<Any> => {
    return this.previewEndpoint<Any>(id, 'image/png', page);
  };

  public temporaryLink = (
    documentId: DocumentId
  ): Promise<DocumentPreviewTemporaryLink> => {
    return this.temporaryLinkEndpoint<DocumentPreviewTemporaryLink>(documentId);
  };

  public buildPreviewURI = (
    id: DocumentId,
    accepts: acceptsType = 'image/png',
    page: number = 0
  ): string => {
    let uri = `${this.url()}?documentId=${id.toString()}`;
    if (accepts == 'image/png') {
      uri += `&page=${page.toString()}`;
    }

    return uri;
  };

  private async previewEndpoint<ResponseType>(
    id: DocumentId,
    accepts: acceptsType = 'image/png',
    page: number = 0
  ): Promise<ResponseType> {
    const uri = this.buildPreviewURI(id, accepts, page);
    const response = await this.get<ResponseType>(uri, {
      responseType: HttpResponseType.ArrayBuffer,
      headers: {
        accepts: accepts,
      },
    });

    return response.data;
  }

  private async temporaryLinkEndpoint<ResponseType>(
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

export type acceptsType = 'application/pdf' | 'image/png';
