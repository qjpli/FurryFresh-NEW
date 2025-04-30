interface Product {
    id: string;
    subcategory_id: string;
    name: string;
    description?: string;
    price: number;
    allow_stocks: boolean;
    stocks?: number;
    product_images?: string[];
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
}

export default Product;