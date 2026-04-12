import { apiClient } from './apiClient';
import { Artist } from '../types/music';

const BASE_PATH = '/artists';

export const fetchArtists = () =>
  apiClient.get<Artist[]>(BASE_PATH, { auth: true });

