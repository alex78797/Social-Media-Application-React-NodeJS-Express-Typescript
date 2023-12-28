/**
 * The properties of a User
 */
export interface User {
  user_id: string;
  user_name: string;
  email: string;
  user_password: string;
  real_name: string;
  roles: string[];
  refresh_tokens: string[];
  cover_picture: string;
  profile_picture: string;
  city: string;
  website: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}
