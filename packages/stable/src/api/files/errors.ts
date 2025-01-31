export class UploadAlreadyFinishedError extends Error {
  constructor() {
    super('Upload has already finished');
  }
}
