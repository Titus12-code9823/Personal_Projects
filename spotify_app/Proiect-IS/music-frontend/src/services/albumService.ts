import api from './api';

export interface Album {
    id: number;
    title: string;
    releaseDate?: string;
    coverArtS3Key?: string;
}

const API_URL = '/api/v1/albums';

export const getAllAlbums = async (): Promise<Album[]> => {
    const response = await api.get<Album[]>(API_URL);
    return response.data;
};

export const getAlbum = async (id: number): Promise<Album> => {
    const response = await api.get<Album>(`${API_URL}/${id}`);
    return response.data;
};

export interface CreateAlbumRequest {
    title: string;
    releaseYear: number;
    artistId: number;
    coverArtS3Key?: string;
}

export const createAlbum = async (data: CreateAlbumRequest): Promise<Album> => {
    const response = await api.post<Album>(`${API_URL}/finalize`, data);
    return response.data;
};
