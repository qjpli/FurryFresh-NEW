interface Cart {
    id?: string;
    user_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at?: Date;
    updated_at?: Date;
}

export default Cart;