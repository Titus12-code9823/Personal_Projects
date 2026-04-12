import { apiClient } from './apiClient';
import { Song, SongCreatePayload } from '../types/music';

const BASE_PATH = '/api/v1/songs';

export const fetchSongs = () =>
  apiClient.get<Song[]>(BASE_PATH, { auth: true });

export const searchSongs = (query: string, field: 'title' | 'artist' = 'title') =>
  apiClient.get<Song[]>(`${BASE_PATH}/search?${field}=${encodeURIComponent(query)}`, {
    auth: true
  });

export const createSong = (payload: SongCreatePayload) =>
  apiClient.post<Song>(BASE_PATH, payload, { auth: true });

