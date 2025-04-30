import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import { useSession } from './sessions_context';
import Order from '../interfaces/order';
import OrderItem from '../interfaces/order_item';

interface OrderContextType {
    orders: Order[];
    orderItems: OrderItem[];
    loading: boolean;
    error: string | null;
    fetchOrders: () => void;
    addOrderContext: (order: Order) => void;
    addOrderItemContext: (item: OrderItem) => void;
    updateOrderContext: (updatedOrder: Order) => void;
    updateOrderItemContext: (updatedItem: OrderItem) => void;
    createOrder: (order: Omit<Order, 'id'>) => Promise<void>;
    createOrderItem: (item: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

interface OrderProviderProps {
    children: React.ReactNode;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const { session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        if (!session?.user?.id) {
            setError('User not logged in.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id);

            if (ordersError) throw ordersError;

            const fetchedOrders = ordersData as Order[];
            setOrders(fetchedOrders);

            const orderIds = fetchedOrders.map(order => order.id);

            if (orderIds.length > 0) {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .in('order_id', orderIds);

                if (itemsError) throw itemsError;

                setOrderItems(itemsData as OrderItem[]);
            } else {
                setOrderItems([]);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to fetch orders or order items.');
        } finally {
            setLoading(false);
        }
    };

    const addOrderContext = (order: Order) => {
        setOrders(prev => [...prev, order]);
    };

    const addOrderItemContext = (item: OrderItem) => {
        setOrderItems(prev => [...prev, item]);
    };

    const updateOrderContext = (updatedOrder: Order) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
            )
        );
    };

    const updateOrderItemContext = (updatedItem: OrderItem) => {
        setOrderItems(prev =>
            prev.map(item =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            )
        );
    };

    const createOrder = async (order: Omit<Order, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert(order)
                .select()
                .single();

            if (error) throw error;

            addOrderContext(data as Order);
        } catch (err) {
            console.error('Failed to create order:', err);
            setError('Failed to create order.');
        }
    };

    const createOrderItem = async (item: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .insert(item)
                .select()
                .single();

            if (error) throw error;

            addOrderItemContext(data as OrderItem);
        } catch (err) {
            console.error('Failed to create order item:', err);
            setError('Failed to create order item.');
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
        }
    }, [session?.user?.id]);

    // Debugging: show state changes
    useEffect(() => {
        console.log('Orders updated:', orders);
    }, [orders]);

    useEffect(() => {
        console.log('Order items updated:', orderItems);
    }, [orderItems]);

    return (
        <OrderContext.Provider
            value={{
                orders,
                orderItems,
                loading,
                error,
                fetchOrders,
                addOrderContext,
                addOrderItemContext,
                updateOrderContext,
                updateOrderItemContext,
                createOrder,
                createOrderItem
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
