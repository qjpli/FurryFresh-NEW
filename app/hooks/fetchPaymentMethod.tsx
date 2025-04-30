type PaymentMethod = {
    id: string;
    icon?: string;
    name: string;
    isAllowed: boolean;
    isAvailable: boolean;
};

const paymentMethodsPetCare: PaymentMethod[] = [
    {
        id: 'Pay-on-service',
        icon: 'pay-on-service',
        name: 'Pay on Service',
        isAllowed: true,
        isAvailable: true,
    },
    {
        id: 'PayPal',
        icon: 'paypal',
        name: 'PayPal',
        isAllowed: true,
        isAvailable: true,
    },

];

const paymentMethodsPetSupplies: PaymentMethod[] = [
    {
        id: 'Cash-on-delivery',
        icon: 'pay-on-service',
        name: 'Cash on delivery',
        isAllowed: true,
        isAvailable: true,
    },
    {
        id: 'PayPal',
        icon: 'paypal',
        name: 'PayPal',
        isAllowed: true,
        isAvailable: true,
    },

];

const getPaymentMethodPetCareById = (id: string): PaymentMethod | null => {
    const found = paymentMethodsPetCare.find(method => method.id === id);
    return found ?? null;
};

const getPaymentMethodPetSuppliesById = (id: string): PaymentMethod | null => {
    const found = paymentMethodsPetSupplies.find(method => method.id === id);
    return found ?? null;
};

export { PaymentMethod as PaymentMethod, paymentMethodsPetCare, paymentMethodsPetSupplies, getPaymentMethodPetCareById, getPaymentMethodPetSuppliesById };
