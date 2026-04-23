export interface CommentRequest {
  postId: number;
  text: string;
  imageUrl?: string | null;
}
