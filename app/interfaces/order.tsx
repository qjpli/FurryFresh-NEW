export type DeliveryType = 'Pick-up' | 'Delivery';

export interface Order {
    id: string;
    user_id: string;
    note?: string;
    amount: number;
    delivery_type: DeliveryType;
    order_status: string;
}

export default Order;
