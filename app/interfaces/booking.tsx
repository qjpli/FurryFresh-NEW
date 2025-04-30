export interface Booking {
    id: string;
    grooming_id: string;
    user_id: string;
    pet_ids: string[]; // Assuming this is an array of UUIDs
    date: string; // Format: 'YYYY-MM-DD'
    time_start: string; // You could use a specific time format like 'HH:mm'
    note: string;
    status: string;
    amount?: number;
    discount_applied?: number;
    created_at: string; // ISO timestamp
    updated_at: string | null; // Nullable timestamp
}

export default Booking;
