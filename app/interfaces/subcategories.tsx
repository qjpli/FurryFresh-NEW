interface Subcategories {
    id: string;
    category_id: string;
    title: string;
    description?: string;
    svg_icon?: string;
    price?: number;
    created_at: Date;
    updated_at?: Date;
}

export default Subcategories;

