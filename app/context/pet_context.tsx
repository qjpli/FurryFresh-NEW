import React, { createContext, useContext, useEffect, useState } from "react";
import Pets from "../interfaces/pets";
import { useSession } from "./sessions_context";
import supabase from "../utils/supabase";

interface PetContextType {
    pets: Pets[];
    loading: boolean;
    error: string | null;
    fetchPets: () => void;
    addToPetContext: (item: Pets) => void;
    updatePetContext: (item: Pets) => void;
}

interface PetProviderProps {
    children: React.ReactNode;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<PetProviderProps> = ({ children }) => {
    const { session } = useSession();
    const [pets, setPets] = useState<Pets[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPets = async () => {
        if (!session?.user.id) {
            setError('User not logged in.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('pets')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;

            setPets(data as Pets[]);

        } catch (err) {
            setError('Failed to fetch pet data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToPetContext = (item: Pets) => {
        setPets((prevPets) => [...prevPets, item]);
    };

    const updatePetContext = (updatedItem: Pets) => {
        setPets((prevPets) =>
            prevPets.map((item) =>
                item.id === updatedItem.id
                    ? updatedItem
                    : item
            )
        );
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchPets();
        }
    }, [session]);

    return (
        <PetContext.Provider value={{ pets, loading, error, fetchPets, addToPetContext, updatePetContext }}>
            {children}
        </PetContext.Provider>
    );
}

export const usePet = (): PetContextType => {
    const context = useContext(PetContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
