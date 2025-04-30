interface Grooming {
    id: string;
    subcategory_id: string;
    inclusions: Inclusion[]; 
    description: string;
    created_at: Date;
    updated_at?: Date;
}

type Inclusion = {
    title: string;
    svg: string;
};

export { Grooming, Inclusion }; 
