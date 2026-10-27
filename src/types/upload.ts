export type UploadStatus = "checking" | "ready" | "duplicate" | "invalid" | "uploading" | "done" | "error";
export type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  hash?: string;
  status: UploadStatus;
  error?: string;
  duplicateOf?: 'album' | 'selection';
};