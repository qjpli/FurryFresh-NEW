export interface Payment {
    id: string;
    user_id: string;
    booking_id: string;
    order_id: string | null;
    ref_id: string;
    payment_method: PaymentMethod; // Assuming this references an enum or custom type 'Payment'
    amount: number;
    discount_applied: number;
    status: boolean;
    currency: string;
    metadata: any; // You can define this further if you have a known PayPal/GCash/etc. structure
    created_at: string; // ISO timestamp
    updated_at: string | null;
}

export type PaymentMethod = 'PayPal' | 'Pay-on-service';

export default Payment;
