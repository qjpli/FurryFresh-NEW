export interface Voucher {
    id: string;
    code: string;
    type: 'Fixed' | 'Percent' | string;
    name: string;
    description: string;
    applies_to_categories: string[];
    max_discount: number | null;
    min_value: number | null;
    usage_limit: number | null;
    user_limit: number | null;
    valid_from: string;
    valid_to: string | null;
    is_first_time_user_only: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    amount: number;
}
