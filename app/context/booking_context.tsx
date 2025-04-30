import React, { createContext, useContext, useEffect, useState } from "react";
import { Booking } from "../interfaces/booking";
import { useSession } from "./sessions_context";
import supabase from "../utils/supabase";

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => void;
  addToBookingContext: (booking: Booking) => void;
  updateBookingContext: (updatedBooking: Booking) => void;
}

interface BookingProviderProps {
  children: React.ReactNode;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!session?.user.id) {
      setError("User not logged in.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setBookings(data as Booking[]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  const addToBookingContext = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const updateBookingContext = (updatedBooking: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  return (
    <BookingContext.Provider
      value={{ bookings, loading, error, fetchBookings, addToBookingContext, updateBookingContext }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
