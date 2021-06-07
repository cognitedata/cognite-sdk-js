// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';

import { DocumentId, DocumentPreviewTemporaryLink } from '../../types';
import Any = jasmine.Any;

export class PreviewAPI extends BaseResourceAPI<Any> {
  public document = (
    id: DocumentId,
    accepts: acceptsType = 'image/png',
    page: number = 0
  ): Promise<Any> => {
    return this.documentEndpoint<Any>(id, accepts, page);
  };

  public temporaryLink = (
    documentId: DocumentId
  ): Promise<DocumentPreviewTemporaryLink> => {
    return this.temporaryLinkEndpoint<DocumentPreviewTemporaryLink>(documentId);
  };

  private async documentEndpoint<ResponseType>(
    id: DocumentId,
    accepts: acceptsType = 'image/png',
    page: number = 0
  ): Promise<ResponseType> {
    const response = await this.get<ResponseType>(this.url(), {
      params: {
        documentId: id,
        page: page,
      },
      headers: {
        accept: accepts,
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
