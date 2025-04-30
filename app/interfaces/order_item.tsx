export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    item_amount: number;
    created_at: string; 
    updated_at: string | null;
}

export default OrderItem;
