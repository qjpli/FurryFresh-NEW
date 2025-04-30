import Pets from "./pets";
import Profile from "./profile";

export interface Conversation {
    id: string;
    pet_1_id: string;
    pet_2_id: string;
    created_at: string;
    updated_at: string;

    pet_1_profile: Pets,
    pet_2_profile: Pets
  }
  