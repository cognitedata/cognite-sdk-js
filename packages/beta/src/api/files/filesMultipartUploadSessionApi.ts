import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { FileContent, FileInfo } from '@cognite/sdk/src/types';
import {
  MultiPartFileChunkResponse,
  MultiPartFileUploadResponse,
} from '../../types';
import { UploadAlreadyFinishedError } from './errors';

export class FilesMultipartUploadSessionAPI extends BaseResourceAPI<FileInfo> {
  public multiPartFileUploadResponse: MultiPartFileUploadResponse;
  private uploadedUrls: boolean[];
  private finished: boolean;

  constructor(
    ...args: [string, CDFHttpClient, MetadataMap, MultiPartFileUploadResponse]
  ) {
    super(args[0], args[1], args[2]);
    [, , , this.multiPartFileUploadResponse] = args;

    this.uploadedUrls = this.multiPartFileUploadResponse.uploadUrls.map(
      (_) => false
    );
    this.finished = false;
  }

  public async uploadPart(
    partNumber: number,
    fileContent: FileContent
  ): Promise<void | MultiPartFileChunkResponse> {
    const hasFileContent = fileContent != null;
    if (!hasFileContent) {
      throw Error('you are uploading an empty content');
    }
    if (
      partNumber < 0 ||
      partNumber >= this.multiPartFileUploadResponse.uploadUrls.length
    ) {
      throw Error('part number is greater than the number of parts');
    }
    if (this.canCompleteUpload()) {
      await this.completeMultiPartUpload();
      return;
    }
    if (this.alreadyUploadedPart(partNumber)) {
      return;
    }
    if (this.multiPartFileUploadResponse.uploadUrls[partNumber] === null) {
      throw Error('part number is not valid');
    }
    if (fileContent != null) {
      const response = await this.put(
        this.multiPartFileUploadResponse.uploadUrls[partNumber],
        {
          data: fileContent,
        }
      );

      if (response.status === 200 || response.status === 201) {
        this.uploadedUrls[partNumber] = true;
        if (this.canCompleteUpload()) {
          await this.completeMultiPartUpload();
        }
        return { partNumber, status: 'COMPLETED' };
      } else {
        return { partNumber, status: 'FAILED' };
      }
    }
  }

  private alreadyUploadedPart(partNumber: number) {
    return this.uploadedUrls[partNumber];
  }

  private canCompleteUpload() {
    return (
      this.uploadedUrls.length !== 0 && this.getNotCompletedParts().length === 0
    );
  }

  private async completeMultiPartUpload() {
    if (this.finished) {
      throw new UploadAlreadyFinishedError();
    }
    if (!this.canCompleteUpload()) {
      return;
    }

    const path = this.url('completemultipartupload');
    const requestBody = {
      id: this.multiPartFileUploadResponse.id,
      uploadId: this.multiPartFileUploadResponse.uploadId,
    };

    const response = await this.post<Response>(path, {
      data: requestBody,
    });
    if (response.status !== 200) {
      throw Error('upload cannot be completed');
    }
    this.finished = true;
  }
  public getNotCompletedParts(): number[] {
    return this.uploadedUrls.reduce((acc, curr, index) => {
      if (curr === false) {
        acc.push(index);
      }
      return acc;
    }, [] as number[]);
  }
  public getMultiPartFileUploadId() {
    return this.multiPartFileUploadResponse.uploadId;
  }
  public getFinished() {
    return this.finished;
  }
}
