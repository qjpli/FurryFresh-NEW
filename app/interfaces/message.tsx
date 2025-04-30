import Pets from "./pets";

export interface Message {
  id: string;
  conversation_id: string;
  sender_pet_id: string;
  user_id: string;
  content: string;
  created_at: string;
  read_at?: string;

  sender_pet_profile: Pets,
}
