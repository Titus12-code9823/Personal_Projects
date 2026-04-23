export interface Comment {
  id: number;
  postId: number;
  userId: number;
  text: string;
  imageUrl: string | null;
  voteCount: number;
  liked?: boolean;
  createdAt: string;
  updatedAt: string;
}
