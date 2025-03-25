export interface AuthUser {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
  state: string;
  vote_banned: boolean;
  created_at: string;
  updated_at: string;
}