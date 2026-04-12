import api from './api';

export interface UploadRequest {
  filename: string;
  contentType: string;
  prefix?: string;
}

export interface UploadResponse {
  s3Key: string;
  uploadUrl: string;
}

const API_URL = '/api/v1/media';

export const getUploadUrl = async (file: File, prefix = 'music'): Promise<UploadResponse> => {
  const response = await api.post<UploadResponse>(`${API_URL}/upload-url`, {
    filename: file.name,
    contentType: file.type || 'audio/mpeg',
    prefix,
  });
  return response.data;
};

export const uploadToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'audio/mpeg',
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
};
