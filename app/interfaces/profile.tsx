interface Profile {
    id: string;
    updated_at: string | null;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    birthday: string | null;
    sex: string | null;
    avatar_url: string | null;
    website: string | null;
    bio: string | null;
    address: string | null;
    contact_num: string | null;
    is_verified: boolean;
    is_phone_ver: boolean;
    last_login: string | null;
    last_activity: string | null;
    user_role: string | null;
    pet_types: string | null;
}

export default Profile;