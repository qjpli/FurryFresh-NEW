type DogSizeCategory = {
    size: 'Small' | 'Medium' | 'Big' | 'Extra-Big';
    start: number;
    end: number;
    addonPrice: number;
};

const dogSizes: DogSizeCategory[] = [
    { size: 'Small', start: 0, end: 9, addonPrice: 50 },
    { size: 'Medium', start: 10, end: 15, addonPrice: 100  },
    { size: 'Big', start: 16, end: 25, addonPrice: 200 },
    { size: 'Extra-Big', start: 25, end: Infinity, addonPrice: 300 },
];

const getSizeCategory = (value: number | undefined): DogSizeCategory | null => {
    if(!value) return null;

    const found = dogSizes.find(s => value >= s.start && value <= s.end);
    return found ?? null;
};

export { dogSizes, getSizeCategory };
