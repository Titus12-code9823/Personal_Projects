export interface Song {
  id: number;
  title: string;
  duration: number;
  s3Key?: string | null;
  albumId: number;
  albumTitle?: string | null;
  artistIds: number[];
  artistNames: string[];
}

export interface SongCreatePayload {
  title: string;
  duration: number;
  albumId: number;
  artistIds: number[];
  s3Key?: string;
}

export interface Artist {
  id: number;
  name: string;
  genre?: string;
  bio?: string;
}

