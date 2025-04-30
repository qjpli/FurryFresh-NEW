interface Pets {
    id: string;
    user_id: string;
    name: string;
    pet_avatar?: string;
    bio?: string;
    pet_type: string;
    gender: string;
    weight?: number;
    is_playdate_allowed: boolean;
    breed: string;
    birthday: Date;
    size?: string;
    createdAt: Date;
    updatedAt?: Date;
    profiles?: PetOwnerProfile
}

interface PetOwnerProfile {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
}

export default Pets;