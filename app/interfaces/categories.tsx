interface Category {
    id: string;
    category: string;
    title: string;
    description?: string;
    is_active: boolean;
    created_at: Date;
    updated_at?: Date;
}

export default Category;