import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import Cart from '../interfaces/cart';
import Product from '../interfaces/product';
import { useSession } from './sessions_context';

interface CartContextType {
    carts: Cart[];
    cartProducts: Product[];
    loading: boolean;
    error: string | null;
    fetchCarts: () => void;
    addToCartContext: (item: Cart) => void;
    addToCartProductsContext: (item: Product) => void;
    updateCartContext: (updatedItem: Cart) => void;
    updateCartProductsContext: (updatedItem: Product) => void;
    clearCart: () => void;
}

interface CartProviderProps {
    children: React.ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { session } = useSession();
    const [carts, setCarts] = useState<Cart[]>([]);
    const [cartProducts, setCartProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCarts = async () => {
        if (!session?.user?.id) {
            setError('User not logged in.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: cartData, error: cartError } = await supabase
                .from('carts')
                .select('*')
                .eq('user_id', session.user.id);

            if (cartError) throw cartError;

            const carts = cartData as Cart[];
            setCarts(carts);

            const productIds = carts.map((item) => item.product_id);

            if (productIds.length > 0) {
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIds);

                if (productsError) throw productsError;

                const parsed = productsData?.map((item) => ({
                    ...item,
                    created_at: new Date(item.created_at),
                    updated_at: item.updated_at ? new Date(item.updated_at) : undefined,
                })) as Product[];

                setCartProducts(parsed);
            } else {
                setCartProducts([]);
            }
        } catch (err) {
            setError('Failed to fetch cart or product data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCartContext = (item: Cart) => {
        setCarts((prevCarts) => [...prevCarts, item]);
    };

    const addToCartProductsContext = (item: Product) => {
        setCartProducts((prevCartProds) => [...prevCartProds, item]);
    };

    const updateCartContext = (updatedItem: Cart) => {
        setCarts((prevCarts) =>
            prevCarts.map((item) =>
                item.product_id === updatedItem.product_id
                    ? { ...item, quantity: updatedItem.quantity, price: updatedItem.price }
                    : item
            )
        );
    };

    const updateCartProductsContext = (updatedProduct: Product) => {
        setCartProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.id === updatedProduct.id
                    ? { ...product, ...updatedProduct }
                    : product
            )
        );
    };

    const clearCart = () => {
        setCarts([]);
        setCartProducts([]);
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchCarts();
        }
    }, [session]);

    return (
        <CartContext.Provider
            value={{
                carts,
                cartProducts,
                loading,
                error,
                fetchCarts,
                addToCartContext,
                addToCartProductsContext,
                updateCartContext,
                updateCartProductsContext,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
