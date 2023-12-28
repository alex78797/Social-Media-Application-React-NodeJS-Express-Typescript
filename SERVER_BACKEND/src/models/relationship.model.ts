/**
 * The properties of a relationship
 */
export interface Relationship {
  user_id?: string;
  relationship_id: string;
  follower_user_id: string;
  followed_user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}
