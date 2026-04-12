export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  description: string;
  score: number;
  isModerator: boolean;
  isBlocked: boolean;
  createdAt: string;
}
